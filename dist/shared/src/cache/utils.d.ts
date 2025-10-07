/**
 * File: utils.ts
 * Purpose: Shared helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */
import type { JsonValue } from "./types";
export declare function deepClone<T extends JsonValue | object>(value: T): T;
export declare function bytesToBase64(bytes: Uint8Array): string;
export declare function base64ToBytes(encoded: string): Uint8Array;
export declare function safeRandomId(prefix: string): string;
