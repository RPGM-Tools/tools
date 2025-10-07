/**
 * File: db.ts
 * Purpose: IndexedDB persistence helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */

import type {
	CrystalCacheMutationRecord,
	CrystalRecord,
	JsonValue,
	MetadataRecord
} from './types';

const DB_NAME = 'rpgm.lore';
const DB_VERSION = 1;
const CRYSTAL_STORE = 'crystals';
const MUTATION_STORE = 'mutations';
const METADATA_STORE = 'metadata';

function wrapRequest<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () =>
			reject(request.error ?? new Error('IndexedDB request failed'));
	});
}

export async function openCacheDatabase(): Promise<IDBDatabase> {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(CRYSTAL_STORE)) {
				db.createObjectStore(CRYSTAL_STORE, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(MUTATION_STORE)) {
				db.createObjectStore(MUTATION_STORE, { keyPath: 'mutationId' });
			}
			if (!db.objectStoreNames.contains(METADATA_STORE)) {
				db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () =>
			reject(request.error ?? new Error('Failed to open IndexedDB'));
	});
}

function transaction(
	db: IDBDatabase,
	storeNames: string[],
	mode: IDBTransactionMode
): IDBTransaction {
	return db.transaction(storeNames, mode);
}

export async function getCrystalRecord(
	db: IDBDatabase,
	id: string
): Promise<CrystalRecord | undefined> {
	const tx = transaction(db, [CRYSTAL_STORE], 'readonly');
	const store = tx.objectStore(CRYSTAL_STORE);
	const record = await wrapRequest<CrystalRecord | undefined>(store.get(id));
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () =>
			reject(tx.error ?? new Error('Crystal transaction failed'));
	});
	return record;
}

export async function putCrystalRecord(
	db: IDBDatabase,
	record: CrystalRecord
): Promise<void> {
	const tx = transaction(db, [CRYSTAL_STORE], 'readwrite');
	const store = tx.objectStore(CRYSTAL_STORE);
	store.put(record);
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Crystal write failed'));
	});
}

export async function deleteCrystalRecord(
	db: IDBDatabase,
	id: string
): Promise<void> {
	const tx = transaction(db, [CRYSTAL_STORE], 'readwrite');
	const store = tx.objectStore(CRYSTAL_STORE);
	store.delete(id);
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Crystal delete failed'));
	});
}

export async function listCrystalRecords(
	db: IDBDatabase
): Promise<CrystalRecord[]> {
	const tx = transaction(db, [CRYSTAL_STORE], 'readonly');
	const store = tx.objectStore(CRYSTAL_STORE);
	const records = await wrapRequest<CrystalRecord[]>(store.getAll());
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Crystal list failed'));
	});
	return records;
}

export async function addMutationRecord(
	db: IDBDatabase,
	record: CrystalCacheMutationRecord
): Promise<void> {
	const tx = transaction(db, [MUTATION_STORE], 'readwrite');
	const store = tx.objectStore(MUTATION_STORE);
	store.put(record);
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Mutation write failed'));
	});
}

export async function listMutationRecords(
	db: IDBDatabase
): Promise<CrystalCacheMutationRecord[]> {
	const tx = transaction(db, [MUTATION_STORE], 'readonly');
	const store = tx.objectStore(MUTATION_STORE);
	const records = await wrapRequest<CrystalCacheMutationRecord[]>(
		store.getAll()
	);
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Mutation list failed'));
	});
	return records;
}

export async function upsertMetadata(
	db: IDBDatabase,
	key: string,
	value: JsonValue
): Promise<void> {
	const tx = transaction(db, [METADATA_STORE], 'readwrite');
	const store = tx.objectStore(METADATA_STORE);
	store.put({ key, value } as MetadataRecord);
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Metadata write failed'));
	});
}

export async function readMetadata<T extends JsonValue>(
	db: IDBDatabase,
	key: string
): Promise<T | undefined> {
	const tx = transaction(db, [METADATA_STORE], 'readonly');
	const store = tx.objectStore(METADATA_STORE);
	const record = await wrapRequest<MetadataRecord | undefined>(store.get(key));
	await new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error('Metadata read failed'));
	});
	return record?.value as T | undefined;
}
