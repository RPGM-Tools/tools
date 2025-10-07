/**
 * File: index.ts
 * Purpose: CrystalCache implementation for tools/shared, providing local IndexedDB storage and sync scaffolding.
 * Updated: 2025-10-07
 */

import type {
	CacheConfiguration,
	CacheSettings,
	CrystalCache,
	CrystalCacheAuthContext,
	CrystalCacheConfigurationOptions,
	CrystalCacheDiagnostics,
	CrystalCacheLogger,
	CrystalCacheMutationInput,
	CrystalCacheMutationRecord,
	CrystalCacheOptions,
	CrystalRecord,
	DeriveKeyResult,
	LoreCrystal
} from './types';
import {
	configureCrystalCache,
	createInMemoryCacheSettings,
	registerCrystalCacheSettings,
	resolveConfiguration
} from './config';
import { applyJsonPatch } from './json-patch';
import {
	decryptCrystal,
	deriveEncryptionKey,
	encryptCrystal,
	generateSalt
} from './crypto';
import {
	addMutationRecord,
	deleteCrystalRecord,
	getCrystalRecord,
	listCrystalRecords,
	listMutationRecords,
	openCacheDatabase,
	putCrystalRecord,
	readMetadata,
	upsertMetadata
} from './db';
import { validateLoreCrystal } from './validation';
import { base64ToBytes, bytesToBase64, deepClone, safeRandomId } from './utils';
import {
	CrystalCacheCryptoUnavailableError,
	CrystalCacheLockedError,
	CrystalCacheValidationError
} from './errors';

const DEVICE_SALT_KEY = 'deviceSalt';
const SCHEMA_VERSION_KEY = 'schemaVersion';
const CURRENT_SCHEMA_VERSION = 1;

interface CrystalCacheState {
	db: IDBDatabase;
	config: CacheConfiguration;
	auth: CrystalCacheAuthContext;
	key: CryptoKey | null;
	mode: 'encrypted' | 'plaintext';
	locked: boolean;
	idleTimer: ReturnType<typeof setTimeout> | null;
	detachHooks: Array<() => void>;
}

function decidePlaintextMode(
	auth: CrystalCacheAuthContext,
	config: CacheConfiguration,
	options?: CrystalCacheOptions
): { allowPlaintext: boolean; forcePlaintext: boolean } {
	const plaintextEligible = config.plaintextAllowed && !auth.publicDevice;
	const forcePlaintext =
		plaintextEligible &&
		(auth.plaintextDebug === true || options?.plaintextFallback === true);
	return {
		allowPlaintext: plaintextEligible,
		forcePlaintext
	};
}

async function ensureDeviceSalt(db: IDBDatabase): Promise<Uint8Array> {
	const cachedSalt = await readMetadata<string>(db, DEVICE_SALT_KEY);
	if (typeof cachedSalt === 'string' && cachedSalt.length > 0) {
		return base64ToBytes(cachedSalt);
	}
	const salt = generateSalt();
	await upsertMetadata(db, DEVICE_SALT_KEY, bytesToBase64(salt));
	return salt;
}

async function ensureSchemaVersion(db: IDBDatabase): Promise<void> {
	const current = await readMetadata<number>(db, SCHEMA_VERSION_KEY);
	if (typeof current !== 'number' || current !== CURRENT_SCHEMA_VERSION) {
		await upsertMetadata(db, SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
	}
}

function ensureUnlocked(state: CrystalCacheState): void {
	if (state.locked) {
		throw new CrystalCacheLockedError();
	}
}

function scheduleIdleLock(
	state: CrystalCacheState,
	lock: (reason: string) => void
): void {
	if (state.config.idleTimeoutMs <= 0) {
		return;
	}
	if (state.idleTimer) {
		clearTimeout(state.idleTimer);
	}
	state.idleTimer = setTimeout(() => {
		void lock('idle-timeout');
	}, state.config.idleTimeoutMs);
}

function attachLifecycleHooks(
	state: CrystalCacheState,
	lock: (reason: string) => void
): void {
	if (typeof window === 'undefined') {
		return;
	}
	const onBeforeUnload = () => {
		void lock('beforeunload');
	};
	window.addEventListener('beforeunload', onBeforeUnload);
	state.detachHooks.push(() =>
		window.removeEventListener('beforeunload', onBeforeUnload)
	);
}

async function deriveStatefulKey(
	state: CrystalCacheState,
	options: CrystalCacheOptions | undefined
): Promise<DeriveKeyResult> {
	const { allowPlaintext, forcePlaintext } = decidePlaintextMode(
		state.auth,
		state.config,
		options
	);
	const salt = await ensureDeviceSalt(state.db);
	try {
		return await deriveEncryptionKey(
			state.auth.encryptionSecret,
			salt,
			forcePlaintext
		);
	} catch (error) {
		if (
			!forcePlaintext &&
			allowPlaintext &&
			error instanceof CrystalCacheCryptoUnavailableError
		) {
			state.config.logger.warn(
				'Web Crypto unavailable, downgrading CrystalCache to plaintext mode.',
				{
					userId: state.auth.userId,
					deviceId: state.auth.deviceId
				}
			);
			return { key: null, mode: 'plaintext' };
		}
		throw error;
	}
}

async function materializeCrystal(
	record: CrystalRecord,
	state: CrystalCacheState
): Promise<LoreCrystal> {
	if (record.mode === 'plaintext' || state.mode === 'plaintext' || !state.key) {
		if (!record.plaintext) {
			throw new CrystalCacheValidationError(
				'Plaintext record missing payload.',
				[]
			);
		}
		return deepClone(record.plaintext);
	}
	if (!record.ciphertext || !record.iv || !state.key) {
		throw new CrystalCacheValidationError(
			'Encrypted record missing cipher material.',
			[]
		);
	}
	const envelope = {
		ciphertext: record.ciphertext,
		iv: record.iv
	};
	const decrypted = await decryptCrystal(envelope, state.key);
	return deepClone(decrypted);
}

async function persistCrystal(
	state: CrystalCacheState,
	payload: LoreCrystal,
	existing: CrystalRecord | undefined
): Promise<void> {
	const validation = validateLoreCrystal(payload);
	if (!validation.valid) {
		throw new CrystalCacheValidationError(
			'Lore Crystal failed validation.',
			validation.issues
		);
	}
	const nowRecord: CrystalRecord = {
		id: payload.id,
		createdAt: existing?.createdAt ?? payload.created_at,
		updatedAt: payload.updated_at,
		mode: state.mode
	};
	if (state.mode === 'plaintext' || !state.key) {
		nowRecord.plaintext = deepClone(payload);
	} else {
		const envelope = await encryptCrystal(payload, state.key);
		nowRecord.ciphertext = envelope.ciphertext;
		nowRecord.iv = envelope.iv;
	}
	await putCrystalRecord(state.db, nowRecord);
}

async function queueMutationRecord(
	state: CrystalCacheState,
	input: CrystalCacheMutationInput
): Promise<string> {
	const mutationId = safeRandomId('mutation');
	const record: CrystalCacheMutationRecord = {
		mutationId,
		crystalId: input.crystalId,
		operations: deepClone(input.operations),
		createdAt: new Date().toISOString(),
		userId: state.auth.userId,
		deviceId: state.auth.deviceId,
		note: input.note,
		state: 'queued'
	};
	await addMutationRecord(state.db, record);
	return mutationId;
}

function recordAccess(
	state: CrystalCacheState,
	lock: (reason: string) => void
): void {
	scheduleIdleLock(state, lock);
}

function detachHooks(state: CrystalCacheState): void {
	while (state.detachHooks.length > 0) {
		const detach = state.detachHooks.pop();
		if (detach) {
			detach();
		}
	}
}

async function createCrystalCache(
	authContext: CrystalCacheAuthContext,
	options?: CrystalCacheOptions
): Promise<CrystalCache> {
	const db = await openCacheDatabase();
	await ensureSchemaVersion(db);
	const config = resolveConfiguration(options);
	const state: CrystalCacheState = {
		db,
		config,
		auth: authContext,
		key: null,
		mode: 'encrypted',
		locked: false,
		idleTimer: null,
		detachHooks: []
	};

	const deriveResult = await deriveStatefulKey(state, options);
	state.key = deriveResult.key;
	state.mode = deriveResult.mode;

	const lock = async (reason: string): Promise<void> => {
		if (state.locked) {
			return;
		}
		state.config.logger.log('CrystalCache locked.', {
			reason,
			userId: state.auth.userId,
			deviceId: state.auth.deviceId
		});
		state.locked = true;
		if (state.idleTimer) {
			clearTimeout(state.idleTimer);
			state.idleTimer = null;
		}
		state.key = null;
	};

	const unlock = async (freshAuth: CrystalCacheAuthContext): Promise<void> => {
		state.auth = freshAuth;
		const result = await deriveStatefulKey(state, options);
		state.key = result.key;
		state.mode = result.mode;
		state.locked = false;
		recordAccess(state, reason => {
			void lock(reason);
		});
	};

	attachLifecycleHooks(state, reason => {
		void lock(reason);
	});
	recordAccess(state, reason => {
		void lock(reason);
	});

	const api: CrystalCache = {
		async get(id: string): Promise<LoreCrystal | null> {
			ensureUnlocked(state);
			const record = await getCrystalRecord(state.db, id);
			recordAccess(state, reason => {
				void lock(reason);
			});
			if (!record) {
				return null;
			}
			return materializeCrystal(record, state);
		},

		async list(): Promise<LoreCrystal[]> {
			ensureUnlocked(state);
			const records = await listCrystalRecords(state.db);
			recordAccess(state, reason => {
				void lock(reason);
			});
			const crystals = await Promise.all(
				records.map(record => materializeCrystal(record, state))
			);
			return crystals.sort((a, b) => {
				if (a.updated_at === b.updated_at) {
					return 0;
				}
				return a.updated_at > b.updated_at ? -1 : 1;
			});
		},

		async put(crystal: LoreCrystal): Promise<void> {
			ensureUnlocked(state);
			const existing = await getCrystalRecord(state.db, crystal.id);
			await persistCrystal(state, crystal, existing);
			recordAccess(state, reason => {
				void lock(reason);
			});
		},

		async patch(
			id: string,
			operations: CrystalCacheMutationInput['operations']
		): Promise<LoreCrystal> {
			ensureUnlocked(state);
			const record = await getCrystalRecord(state.db, id);
			if (!record) {
				throw new CrystalCacheValidationError(
					`Lore Crystal ${id} not found for patch.`,
					[]
				);
			}
			const current = await materializeCrystal(record, state);
			const updated = applyJsonPatch(
				current as LoreCrystal,
				operations
			) as LoreCrystal;
			updated.updated_at = new Date().toISOString();
			await persistCrystal(state, updated, record);
			await queueMutationRecord(state, { crystalId: id, operations });
			recordAccess(state, reason => {
				void lock(reason);
			});
			return updated;
		},

		async delete(id: string): Promise<void> {
			ensureUnlocked(state);
			await deleteCrystalRecord(state.db, id);
			await queueMutationRecord(state, {
				crystalId: id,
				operations: [{ op: 'remove', path: '' }]
			});
			recordAccess(state, reason => {
				void lock(reason);
			});
		},

		async queueMutation(input: CrystalCacheMutationInput): Promise<string> {
			ensureUnlocked(state);
			const id = await queueMutationRecord(state, input);
			recordAccess(state, reason => {
				void lock(reason);
			});
			return id;
		},

		async flushMutations(): Promise<CrystalCacheMutationRecord[]> {
			ensureUnlocked(state);
			const mutations = await listMutationRecords(state.db);
			state.config.logger.log('CrystalCache flush stub invoked.', {
				queued: mutations.length,
				userId: state.auth.userId,
				deviceId: state.auth.deviceId
			});
			recordAccess(state, reason => {
				void lock(reason);
			});
			return mutations;
		},

		async getDiagnostics(): Promise<CrystalCacheDiagnostics> {
			const [crystals, mutations] = await Promise.all([
				listCrystalRecords(state.db),
				listMutationRecords(state.db)
			]);
			let lastUpdatedAt: string | null = null;
			for (const record of crystals) {
				if (!lastUpdatedAt || record.updatedAt > lastUpdatedAt) {
					lastUpdatedAt = record.updatedAt;
				}
			}
			return {
				crystalCount: crystals.length,
				pendingMutations: mutations.length,
				lastUpdatedAt,
				schemaVersion: CURRENT_SCHEMA_VERSION,
				locked: state.locked
			};
		},

		async lock(reason?: string): Promise<void> {
			await lock(reason ?? 'manual');
		},

		async unlock(freshAuth: CrystalCacheAuthContext): Promise<void> {
			await unlock(freshAuth);
		},

		async close(): Promise<void> {
			await lock('close');
			detachHooks(state);
			state.db.close();
		},

		isLocked(): boolean {
			return state.locked;
		}
	};

	return api;
}

export async function openCrystalCache(
	authContext: CrystalCacheAuthContext,
	options?: CrystalCacheOptions
): Promise<CrystalCache> {
	return createCrystalCache(authContext, options);
}

export {
	configureCrystalCache,
	createInMemoryCacheSettings,
	registerCrystalCacheSettings
};

export type {
	CacheSettings,
	CrystalCache,
	CrystalCacheAuthContext,
	CrystalCacheConfigurationOptions,
	CrystalCacheDiagnostics,
	CrystalCacheLogger,
	CrystalCacheMutationInput,
	CrystalCacheMutationRecord,
	CrystalCacheOptions
};

export {
	CrystalCacheLockedError,
	CrystalCacheValidationError,
	CrystalCacheCryptoUnavailableError
};
