/**
 * File: crypto.ts
 * Purpose: Encryption helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */

import type { CryptoEnvelope, DeriveKeyResult, LoreCrystal } from './types';
import { CrystalCacheCryptoUnavailableError } from './errors';

const PBKDF2_ITERATIONS = 100_000;
const AES_KEY_BITS = 256;
const IV_LENGTH_BYTES = 12;

function ensureCrypto(): Crypto {
	if (typeof crypto === 'undefined' || !crypto.subtle) {
		throw new CrystalCacheCryptoUnavailableError();
	}
	return crypto;
}

function normalizeSecret(
	secret: ArrayBuffer | Uint8Array | string
): Uint8Array {
	if (typeof secret === 'string') {
		return new TextEncoder().encode(secret);
	}
	if (secret instanceof ArrayBuffer) {
		return new Uint8Array(secret);
	}
	return secret;
}

export async function deriveEncryptionKey(
	secret: ArrayBuffer | Uint8Array | string,
	salt: Uint8Array,
	forcePlaintext: boolean
): Promise<DeriveKeyResult> {
	if (forcePlaintext) {
		return { key: null, mode: 'plaintext' };
	}
	const cryptoApi = ensureCrypto();
	const normalizedSecret = normalizeSecret(secret);
	const secretBuffer = new Uint8Array(normalizedSecret);
	const keyMaterial = await cryptoApi.subtle.importKey(
		'raw',
		secretBuffer,
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);
	const saltBuffer = new Uint8Array(salt);
	const key = await cryptoApi.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBuffer,
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: AES_KEY_BITS },
		false,
		['encrypt', 'decrypt']
	);
	return { key, mode: 'encrypted' };
}

export function generateSalt(): Uint8Array {
	const cryptoApi = ensureCrypto();
	const salt = new Uint8Array(32);
	cryptoApi.getRandomValues(salt);
	return salt;
}

export async function encryptCrystal(
	payload: LoreCrystal,
	key: CryptoKey
): Promise<CryptoEnvelope> {
	const cryptoApi = ensureCrypto();
	const iv = new Uint8Array(IV_LENGTH_BYTES);
	cryptoApi.getRandomValues(iv);
	const plaintextBytes = new TextEncoder().encode(JSON.stringify(payload));
	const ciphertext = await cryptoApi.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		plaintextBytes
	);
	return { ciphertext, iv: iv.buffer.slice(0) };
}

export async function decryptCrystal(
	envelope: CryptoEnvelope,
	key: CryptoKey
): Promise<LoreCrystal> {
	const cryptoApi = ensureCrypto();
	const ivBytes = new Uint8Array(envelope.iv);
	const plaintextBuffer = await cryptoApi.subtle.decrypt(
		{ name: 'AES-GCM', iv: ivBytes },
		key,
		envelope.ciphertext
	);
	const text = new TextDecoder().decode(plaintextBuffer);
	return JSON.parse(text) as LoreCrystal;
}
