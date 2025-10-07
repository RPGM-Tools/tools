/**
 * File: utils.ts
 * Purpose: Shared helpers for the CrystalCache module.
 * Updated: 2025-10-07
 */
export function deepClone(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
export function bytesToBase64(bytes) {
    if (typeof btoa === "function") {
        let binary = "";
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }
    if (typeof Buffer !== "undefined") {
        return Buffer.from(bytes).toString("base64");
    }
    throw new Error("Base64 encoding not supported in this environment");
}
export function base64ToBytes(encoded) {
    if (typeof atob === "function") {
        const binary = atob(encoded);
        const output = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
            output[i] = binary.charCodeAt(i);
        }
        return output;
    }
    if (typeof Buffer !== "undefined") {
        const nodeBuffer = Buffer.from(encoded, "base64");
        const buffer = nodeBuffer.buffer;
        return new Uint8Array(buffer, nodeBuffer.byteOffset, nodeBuffer.byteLength);
    }
    throw new Error("Base64 decoding not supported in this environment");
}
export function safeRandomId(prefix) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    const random = Math.random().toString(16).slice(2, 10);
    const timestamp = Date.now().toString(16);
    return `${prefix}-${timestamp}-${random}`;
}
