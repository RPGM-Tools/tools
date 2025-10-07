/**
 * File: index.ts
 * Purpose: CrystalCache implementation for tools/shared, providing local IndexedDB storage and sync scaffolding.
 * Updated: 2025-10-07
 */
import type { CacheSettings, CrystalCache, CrystalCacheAuthContext, CrystalCacheConfigurationOptions, CrystalCacheDiagnostics, CrystalCacheLogger, CrystalCacheMutationInput, CrystalCacheMutationRecord, CrystalCacheOptions } from "./types";
import { configureCrystalCache, createInMemoryCacheSettings, registerCrystalCacheSettings } from "./config";
import { CrystalCacheCryptoUnavailableError, CrystalCacheLockedError, CrystalCacheValidationError } from "./errors";
export declare function openCrystalCache(authContext: CrystalCacheAuthContext, options?: CrystalCacheOptions): Promise<CrystalCache>;
export { configureCrystalCache, createInMemoryCacheSettings, registerCrystalCacheSettings };
export type { CacheSettings, CrystalCache, CrystalCacheAuthContext, CrystalCacheConfigurationOptions, CrystalCacheDiagnostics, CrystalCacheLogger, CrystalCacheMutationInput, CrystalCacheMutationRecord, CrystalCacheOptions };
export { CrystalCacheLockedError, CrystalCacheValidationError, CrystalCacheCryptoUnavailableError };
