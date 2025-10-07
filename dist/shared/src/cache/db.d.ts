/**
 * File: db.ts
 * Purpose: IndexedDB persistence helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */
import type { CrystalCacheMutationRecord, CrystalRecord, JsonValue } from "./types";
export declare function openCacheDatabase(): Promise<IDBDatabase>;
export declare function getCrystalRecord(db: IDBDatabase, id: string): Promise<CrystalRecord | undefined>;
export declare function putCrystalRecord(db: IDBDatabase, record: CrystalRecord): Promise<void>;
export declare function deleteCrystalRecord(db: IDBDatabase, id: string): Promise<void>;
export declare function listCrystalRecords(db: IDBDatabase): Promise<CrystalRecord[]>;
export declare function addMutationRecord(db: IDBDatabase, record: CrystalCacheMutationRecord): Promise<void>;
export declare function listMutationRecords(db: IDBDatabase): Promise<CrystalCacheMutationRecord[]>;
export declare function upsertMetadata(db: IDBDatabase, key: string, value: JsonValue): Promise<void>;
export declare function readMetadata<T extends JsonValue>(db: IDBDatabase, key: string): Promise<T | undefined>;
