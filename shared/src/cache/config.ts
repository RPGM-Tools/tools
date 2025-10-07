/**
 * File: config.ts
 * Purpose: Manage CrystalCache global configuration using shared logger and settings abstractions.
 * Updated: 2025-10-07
 */

import { RpgmLogger } from '../logger';
import type { SettingsMap } from '../settings';
import type {
	CacheConfiguration,
	CacheSettings,
	CrystalCacheConfigurationOptions,
	CrystalCacheLogger,
	CrystalCacheOptions
} from './types';

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const defaultSettings: CacheSettings = {
	idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
	plaintextAllowed: false
};

class InMemorySettingsMap implements SettingsMap<CacheSettings> {
	private readonly store = new Map<
		keyof CacheSettings,
		CacheSettings[keyof CacheSettings]
	>();

	constructor(initial: CacheSettings) {
		for (const key of Object.keys(initial) as Array<keyof CacheSettings>) {
			this.store.set(key, initial[key]);
		}
	}

	get<K extends keyof CacheSettings>(
		key: K
	): CacheSettings[K] | null | undefined {
		return this.store.has(key)
			? (this.store.get(key) as CacheSettings[K])
			: undefined;
	}

	set<K extends keyof CacheSettings>(key: K, value: CacheSettings[K]): this {
		this.store.set(key, value);
		return this;
	}
}

let settingsStore: SettingsMap<CacheSettings> = new InMemorySettingsMap(
	defaultSettings
);

let activeLogger: CrystalCacheLogger = new RpgmLogger('CrystalCache | ');

function seedDefaults(
	map: SettingsMap<CacheSettings>,
	overrides?: Partial<CacheSettings>
): void {
	const seed: CacheSettings = {
		...defaultSettings,
		...overrides
	};
	for (const key of Object.keys(seed) as Array<keyof CacheSettings>) {
		const current = map.get(key);
		if (current === null || current === undefined) {
			map.set(key, seed[key]);
		}
	}
}

export function registerCrystalCacheSettings(
	map: SettingsMap<CacheSettings>,
	defaults?: Partial<CacheSettings>
): void {
	settingsStore = map;
	seedDefaults(settingsStore, defaults);
}

export function createInMemoryCacheSettings(
	initial?: Partial<CacheSettings>
): SettingsMap<CacheSettings> {
	return new InMemorySettingsMap({
		...defaultSettings,
		...initial
	});
}

export function configureCrystalCache(
	options: CrystalCacheConfigurationOptions = {}
): void {
	if (options.settingsMap) {
		registerCrystalCacheSettings(options.settingsMap, {
			idleTimeoutMs: options.idleTimeoutMs,
			plaintextAllowed: options.plaintextAllowed
		});
	}
	if (typeof options.idleTimeoutMs === 'number') {
		settingsStore.set('idleTimeoutMs', options.idleTimeoutMs);
	}
	if (typeof options.plaintextAllowed === 'boolean') {
		settingsStore.set('plaintextAllowed', options.plaintextAllowed);
	}
	if (options.logger) {
		activeLogger = options.logger;
	}
}

export function resolveConfiguration(
	options?: CrystalCacheOptions
): CacheConfiguration {
	const idleSetting = settingsStore.get('idleTimeoutMs');
	const idleTimeoutMs =
		options?.idleTimeoutMs ?? idleSetting ?? defaultSettings.idleTimeoutMs;
	const plaintextSetting = settingsStore.get('plaintextAllowed');
	const plaintextAllowed =
		typeof plaintextSetting === 'boolean'
			? plaintextSetting
			: defaultSettings.plaintextAllowed;
	const logger = options?.logger ?? activeLogger;
	return {
		idleTimeoutMs,
		plaintextAllowed,
		logger
	};
}
