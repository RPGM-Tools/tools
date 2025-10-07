/**
 * File: crypto.ts
 * Purpose: Encryption helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */
import type { CryptoEnvelope, DeriveKeyResult, LoreCrystal } from "./types";
export declare function deriveEncryptionKey(secret: ArrayBuffer | Uint8Array | string, salt: Uint8Array, forcePlaintext: boolean): Promise<DeriveKeyResult>;
export declare function generateSalt(): Uint8Array;
export declare function encryptCrystal(payload: LoreCrystal, key: CryptoKey): Promise<CryptoEnvelope>;
export declare function decryptCrystal(envelope: CryptoEnvelope, key: CryptoKey): Promise<LoreCrystal>;
