/**
 * File: types.ts
 * Purpose: Shared type definitions for the CrystalCache module in tools/shared.
 * Updated: 2025-10-07
 */

import type { RpgmLogger } from '../logger';
import type { SettingsMap } from '../settings';

export type CrystalCacheLogger = Pick<RpgmLogger, 'log' | 'warn' | 'error'>;

export interface CacheSettings {
	idleTimeoutMs: number;
	plaintextAllowed: boolean;
}

export interface CrystalCacheAuthContext {
	userId: string;
	deviceId: string;
	encryptionSecret: ArrayBuffer | Uint8Array | string;
	publicDevice?: boolean;
	plaintextDebug?: boolean;
}

export interface CrystalCacheOptions {
	idleTimeoutMs?: number;
	plaintextFallback?: boolean;
	logger?: CrystalCacheLogger;
}

export interface CrystalCacheConfigurationOptions {
	idleTimeoutMs?: number;
	plaintextAllowed?: boolean;
	logger?: CrystalCacheLogger;
	settingsMap?: SettingsMap<CacheSettings>;
}

export interface JsonObject {
	[key: string]: JsonValue;
}

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonObject
	| JsonValue[];

export interface LoreCrystal extends JsonObject {
	id: string;
	created_at: string;
	updated_at: string;
}

export interface CrystalCacheDiagnostics {
	crystalCount: number;
	pendingMutations: number;
	lastUpdatedAt: string | null;
	schemaVersion: number;
	locked: boolean;
}

export interface CrystalCacheMutationInput {
	crystalId: string;
	operations: JsonPatchOperation[];
	note?: string;
}

export interface CrystalCacheMutationRecord {
	mutationId: string;
	crystalId: string;
	operations: JsonPatchOperation[];
	createdAt: string;
	userId: string;
	deviceId: string;
	note?: string;
	state: 'queued' | 'sent';
}

export interface ValidationIssue {
	path: string;
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	issues: ValidationIssue[];
}

export interface CacheConfiguration {
	idleTimeoutMs: number;
	plaintextAllowed: boolean;
	logger: CrystalCacheLogger;
}

export interface CrystalCache {
	get(id: string): Promise<LoreCrystal | null>;
	list(): Promise<LoreCrystal[]>;
	put(crystal: LoreCrystal): Promise<void>;
	patch(id: string, operations: JsonPatchOperation[]): Promise<LoreCrystal>;
	delete(id: string): Promise<void>;
	queueMutation(input: CrystalCacheMutationInput): Promise<string>;
	flushMutations(): Promise<CrystalCacheMutationRecord[]>;
	getDiagnostics(): Promise<CrystalCacheDiagnostics>;
	lock(reason?: string): Promise<void>;
	unlock(authContext: CrystalCacheAuthContext): Promise<void>;
	close(): Promise<void>;
	isLocked(): boolean;
}

export interface CrystalRecord {
	id: string;
	ciphertext?: ArrayBuffer;
	iv?: ArrayBuffer;
	plaintext?: LoreCrystal;
	createdAt: string;
	updatedAt: string;
	mode: 'encrypted' | 'plaintext';
}

export interface MetadataRecord {
	key: string;
	value: JsonValue;
}

export interface CryptoEnvelope {
	ciphertext: ArrayBuffer;
	iv: ArrayBuffer;
}

export interface DeriveKeyResult {
	key: CryptoKey | null;
	mode: 'encrypted' | 'plaintext';
}

export interface LifecycleHooks {
	attach(): void;
	release(): void;
}

export interface JsonPatchOperation {
	op: 'add' | 'remove' | 'replace' | 'test';
	path: string;
	value?: JsonValue;
}
