/**
 * File: index.ts
 * Purpose: CrystalCache implementation for tools/shared, providing local IndexedDB storage and sync scaffolding.
 * Updated: 2025-10-07
 */
import { configureCrystalCache, createInMemoryCacheSettings, registerCrystalCacheSettings, resolveConfiguration } from "./config";
import { applyJsonPatch } from "./json-patch";
import { decryptCrystal, deriveEncryptionKey, encryptCrystal, generateSalt } from "./crypto";
import { addMutationRecord, deleteCrystalRecord, getCrystalRecord, listCrystalRecords, listMutationRecords, openCacheDatabase, putCrystalRecord, readMetadata, upsertMetadata } from "./db";
import { validateLoreCrystal } from "./validation";
import { base64ToBytes, bytesToBase64, deepClone, safeRandomId } from "./utils";
import { CrystalCacheCryptoUnavailableError, CrystalCacheLockedError, CrystalCacheValidationError } from "./errors";
const DEVICE_SALT_KEY = "deviceSalt";
const SCHEMA_VERSION_KEY = "schemaVersion";
const CURRENT_SCHEMA_VERSION = 1;
function decidePlaintextMode(auth, config, options) {
    const plaintextEligible = config.plaintextAllowed && !auth.publicDevice;
    const forcePlaintext = plaintextEligible && (auth.plaintextDebug === true || options?.plaintextFallback === true);
    return {
        allowPlaintext: plaintextEligible,
        forcePlaintext
    };
}
async function ensureDeviceSalt(db) {
    const cachedSalt = await readMetadata(db, DEVICE_SALT_KEY);
    if (typeof cachedSalt === "string" && cachedSalt.length > 0) {
        return base64ToBytes(cachedSalt);
    }
    const salt = generateSalt();
    await upsertMetadata(db, DEVICE_SALT_KEY, bytesToBase64(salt));
    return salt;
}
async function ensureSchemaVersion(db) {
    const current = await readMetadata(db, SCHEMA_VERSION_KEY);
    if (typeof current !== "number" || current !== CURRENT_SCHEMA_VERSION) {
        await upsertMetadata(db, SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    }
}
function ensureUnlocked(state) {
    if (state.locked) {
        throw new CrystalCacheLockedError();
    }
}
function scheduleIdleLock(state, lock) {
    if (state.config.idleTimeoutMs <= 0) {
        return;
    }
    if (state.idleTimer) {
        clearTimeout(state.idleTimer);
    }
    state.idleTimer = setTimeout(() => {
        void lock("idle-timeout");
    }, state.config.idleTimeoutMs);
}
function attachLifecycleHooks(state, lock) {
    if (typeof window === "undefined") {
        return;
    }
    const onBeforeUnload = () => {
        void lock("beforeunload");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    state.detachHooks.push(() => window.removeEventListener("beforeunload", onBeforeUnload));
}
async function deriveStatefulKey(state, options) {
    const { allowPlaintext, forcePlaintext } = decidePlaintextMode(state.auth, state.config, options);
    const salt = await ensureDeviceSalt(state.db);
    try {
        return await deriveEncryptionKey(state.auth.encryptionSecret, salt, forcePlaintext);
    }
    catch (error) {
        if (!forcePlaintext && allowPlaintext && error instanceof CrystalCacheCryptoUnavailableError) {
            state.config.logger.warn("Web Crypto unavailable, downgrading CrystalCache to plaintext mode.", {
                userId: state.auth.userId,
                deviceId: state.auth.deviceId
            });
            return { key: null, mode: "plaintext" };
        }
        throw error;
    }
}
async function materializeCrystal(record, state) {
    if (record.mode === "plaintext" || state.mode === "plaintext" || !state.key) {
        if (!record.plaintext) {
            throw new CrystalCacheValidationError("Plaintext record missing payload.", []);
        }
        return deepClone(record.plaintext);
    }
    if (!record.ciphertext || !record.iv || !state.key) {
        throw new CrystalCacheValidationError("Encrypted record missing cipher material.", []);
    }
    const envelope = {
        ciphertext: record.ciphertext,
        iv: record.iv
    };
    const decrypted = await decryptCrystal(envelope, state.key);
    return deepClone(decrypted);
}
async function persistCrystal(state, payload, existing) {
    const validation = validateLoreCrystal(payload);
    if (!validation.valid) {
        throw new CrystalCacheValidationError("Lore Crystal failed validation.", validation.issues);
    }
    const nowRecord = {
        id: payload.id,
        createdAt: existing?.createdAt ?? payload.created_at,
        updatedAt: payload.updated_at,
        mode: state.mode
    };
    if (state.mode === "plaintext" || !state.key) {
        nowRecord.plaintext = deepClone(payload);
    }
    else {
        const envelope = await encryptCrystal(payload, state.key);
        nowRecord.ciphertext = envelope.ciphertext;
        nowRecord.iv = envelope.iv;
    }
    await putCrystalRecord(state.db, nowRecord);
}
async function queueMutationRecord(state, input) {
    const mutationId = safeRandomId("mutation");
    const record = {
        mutationId,
        crystalId: input.crystalId,
        operations: deepClone(input.operations),
        createdAt: new Date().toISOString(),
        userId: state.auth.userId,
        deviceId: state.auth.deviceId,
        note: input.note,
        state: "queued"
    };
    await addMutationRecord(state.db, record);
    return mutationId;
}
function recordAccess(state, lock) {
    scheduleIdleLock(state, lock);
}
function detachHooks(state) {
    while (state.detachHooks.length > 0) {
        const detach = state.detachHooks.pop();
        if (detach) {
            detach();
        }
    }
}
async function createCrystalCache(authContext, options) {
    const db = await openCacheDatabase();
    await ensureSchemaVersion(db);
    const config = resolveConfiguration(options);
    const state = {
        db,
        config,
        auth: authContext,
        key: null,
        mode: "encrypted",
        locked: false,
        idleTimer: null,
        detachHooks: []
    };
    const deriveResult = await deriveStatefulKey(state, options);
    state.key = deriveResult.key;
    state.mode = deriveResult.mode;
    const lock = async (reason) => {
        if (state.locked) {
            return;
        }
        state.config.logger.log("CrystalCache locked.", {
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
    const unlock = async (freshAuth) => {
        state.auth = freshAuth;
        const result = await deriveStatefulKey(state, options);
        state.key = result.key;
        state.mode = result.mode;
        state.locked = false;
        recordAccess(state, (reason) => {
            void lock(reason);
        });
    };
    attachLifecycleHooks(state, (reason) => {
        void lock(reason);
    });
    recordAccess(state, (reason) => {
        void lock(reason);
    });
    const api = {
        async get(id) {
            ensureUnlocked(state);
            const record = await getCrystalRecord(state.db, id);
            recordAccess(state, (reason) => {
                void lock(reason);
            });
            if (!record) {
                return null;
            }
            return materializeCrystal(record, state);
        },
        async list() {
            ensureUnlocked(state);
            const records = await listCrystalRecords(state.db);
            recordAccess(state, (reason) => {
                void lock(reason);
            });
            const crystals = await Promise.all(records.map((record) => materializeCrystal(record, state)));
            return crystals.sort((a, b) => {
                if (a.updated_at === b.updated_at) {
                    return 0;
                }
                return a.updated_at > b.updated_at ? -1 : 1;
            });
        },
        async put(crystal) {
            ensureUnlocked(state);
            const existing = await getCrystalRecord(state.db, crystal.id);
            await persistCrystal(state, crystal, existing);
            recordAccess(state, (reason) => {
                void lock(reason);
            });
        },
        async patch(id, operations) {
            ensureUnlocked(state);
            const record = await getCrystalRecord(state.db, id);
            if (!record) {
                throw new CrystalCacheValidationError(`Lore Crystal ${id} not found for patch.`, []);
            }
            const current = await materializeCrystal(record, state);
            const updated = applyJsonPatch(current, operations);
            updated.updated_at = new Date().toISOString();
            await persistCrystal(state, updated, record);
            await queueMutationRecord(state, { crystalId: id, operations });
            recordAccess(state, (reason) => {
                void lock(reason);
            });
            return updated;
        },
        async delete(id) {
            ensureUnlocked(state);
            await deleteCrystalRecord(state.db, id);
            await queueMutationRecord(state, {
                crystalId: id,
                operations: [{ op: "remove", path: "" }]
            });
            recordAccess(state, (reason) => {
                void lock(reason);
            });
        },
        async queueMutation(input) {
            ensureUnlocked(state);
            const id = await queueMutationRecord(state, input);
            recordAccess(state, (reason) => {
                void lock(reason);
            });
            return id;
        },
        async flushMutations() {
            ensureUnlocked(state);
            const mutations = await listMutationRecords(state.db);
            state.config.logger.log("CrystalCache flush stub invoked.", {
                queued: mutations.length,
                userId: state.auth.userId,
                deviceId: state.auth.deviceId
            });
            recordAccess(state, (reason) => {
                void lock(reason);
            });
            return mutations;
        },
        async getDiagnostics() {
            const [crystals, mutations] = await Promise.all([
                listCrystalRecords(state.db),
                listMutationRecords(state.db)
            ]);
            let lastUpdatedAt = null;
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
        async lock(reason) {
            await lock(reason ?? "manual");
        },
        async unlock(freshAuth) {
            await unlock(freshAuth);
        },
        async close() {
            await lock("close");
            detachHooks(state);
            state.db.close();
        },
        isLocked() {
            return state.locked;
        }
    };
    return api;
}
export async function openCrystalCache(authContext, options) {
    return createCrystalCache(authContext, options);
}
export { configureCrystalCache, createInMemoryCacheSettings, registerCrystalCacheSettings };
export { CrystalCacheLockedError, CrystalCacheValidationError, CrystalCacheCryptoUnavailableError };
