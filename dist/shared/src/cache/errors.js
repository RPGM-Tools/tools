/**
 * File: errors.ts
 * Purpose: Custom error types surfaced by the CrystalCache module.
 * Updated: 2025-10-07
 */
export class CrystalCacheError extends Error {
    constructor(message) {
        super(message);
        this.name = "CrystalCacheError";
    }
}
export class CrystalCacheLockedError extends CrystalCacheError {
    constructor() {
        super("CrystalCache is locked. Call unlock() with fresh credentials before accessing data.");
        this.name = "CrystalCacheLockedError";
    }
}
export class CrystalCacheValidationError extends CrystalCacheError {
    issues;
    constructor(message, issues) {
        super(message);
        this.name = "CrystalCacheValidationError";
        this.issues = issues;
    }
}
export class CrystalCacheCryptoUnavailableError extends CrystalCacheError {
    constructor() {
        super("Web Crypto API is unavailable. Encryption mode cannot be enabled in this environment.");
        this.name = "CrystalCacheCryptoUnavailableError";
    }
}
