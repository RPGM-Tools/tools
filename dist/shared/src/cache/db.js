/**
 * File: db.ts
 * Purpose: IndexedDB persistence helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */
const DB_NAME = "rpgm.lore";
const DB_VERSION = 1;
const CRYSTAL_STORE = "crystals";
const MUTATION_STORE = "mutations";
const METADATA_STORE = "metadata";
function wrapRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
}
export async function openCacheDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(CRYSTAL_STORE)) {
                db.createObjectStore(CRYSTAL_STORE, { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains(MUTATION_STORE)) {
                db.createObjectStore(MUTATION_STORE, { keyPath: "mutationId" });
            }
            if (!db.objectStoreNames.contains(METADATA_STORE)) {
                db.createObjectStore(METADATA_STORE, { keyPath: "key" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    });
}
function transaction(db, storeNames, mode) {
    return db.transaction(storeNames, mode);
}
export async function getCrystalRecord(db, id) {
    const tx = transaction(db, [CRYSTAL_STORE], "readonly");
    const store = tx.objectStore(CRYSTAL_STORE);
    const record = await wrapRequest(store.get(id));
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Crystal transaction failed"));
    });
    return record;
}
export async function putCrystalRecord(db, record) {
    const tx = transaction(db, [CRYSTAL_STORE], "readwrite");
    const store = tx.objectStore(CRYSTAL_STORE);
    store.put(record);
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Crystal write failed"));
    });
}
export async function deleteCrystalRecord(db, id) {
    const tx = transaction(db, [CRYSTAL_STORE], "readwrite");
    const store = tx.objectStore(CRYSTAL_STORE);
    store.delete(id);
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Crystal delete failed"));
    });
}
export async function listCrystalRecords(db) {
    const tx = transaction(db, [CRYSTAL_STORE], "readonly");
    const store = tx.objectStore(CRYSTAL_STORE);
    const records = await wrapRequest(store.getAll());
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Crystal list failed"));
    });
    return records;
}
export async function addMutationRecord(db, record) {
    const tx = transaction(db, [MUTATION_STORE], "readwrite");
    const store = tx.objectStore(MUTATION_STORE);
    store.put(record);
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Mutation write failed"));
    });
}
export async function listMutationRecords(db) {
    const tx = transaction(db, [MUTATION_STORE], "readonly");
    const store = tx.objectStore(MUTATION_STORE);
    const records = await wrapRequest(store.getAll());
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Mutation list failed"));
    });
    return records;
}
export async function upsertMetadata(db, key, value) {
    const tx = transaction(db, [METADATA_STORE], "readwrite");
    const store = tx.objectStore(METADATA_STORE);
    store.put({ key, value });
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Metadata write failed"));
    });
}
export async function readMetadata(db, key) {
    const tx = transaction(db, [METADATA_STORE], "readonly");
    const store = tx.objectStore(METADATA_STORE);
    const record = await wrapRequest(store.get(key));
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Metadata read failed"));
    });
    return record?.value;
}
