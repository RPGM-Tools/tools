/**
 * File: json-patch.ts
 * Purpose: Lightweight JSON Patch helper tuned for the CrystalCache module.
 * Updated: 2025-10-07
 */
import type { JsonValue, JsonPatchOperation } from "./types";
export declare function applyJsonPatch<T extends JsonValue>(document: T, operations: JsonPatchOperation[]): T;
