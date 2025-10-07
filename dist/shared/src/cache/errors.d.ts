/**
 * File: errors.ts
 * Purpose: Custom error types surfaced by the CrystalCache module.
 * Updated: 2025-10-07
 */
export declare class CrystalCacheError extends Error {
    constructor(message: string);
}
export declare class CrystalCacheLockedError extends CrystalCacheError {
    constructor();
}
export declare class CrystalCacheValidationError extends CrystalCacheError {
    readonly issues: {
        path: string;
        message: string;
    }[];
    constructor(message: string, issues: {
        path: string;
        message: string;
    }[]);
}
export declare class CrystalCacheCryptoUnavailableError extends CrystalCacheError {
    constructor();
}
