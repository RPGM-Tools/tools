/**
 * File: config.ts
 * Purpose: Manage CrystalCache global configuration using shared logger and settings abstractions.
 * Updated: 2025-10-07
 */
import type { SettingsMap } from '../settings';
import type { CacheConfiguration, CacheSettings, CrystalCacheConfigurationOptions, CrystalCacheOptions } from './types';
export declare function registerCrystalCacheSettings(map: SettingsMap<CacheSettings>, defaults?: Partial<CacheSettings>): void;
export declare function createInMemoryCacheSettings(initial?: Partial<CacheSettings>): SettingsMap<CacheSettings>;
export declare function configureCrystalCache(options?: CrystalCacheConfigurationOptions): void;
export declare function resolveConfiguration(options?: CrystalCacheOptions): CacheConfiguration;
