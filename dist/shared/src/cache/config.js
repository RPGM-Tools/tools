/**
 * File: config.ts
 * Purpose: Manage CrystalCache global configuration using shared logger and settings abstractions.
 * Updated: 2025-10-07
 */
import { RpgmLogger } from '../logger';
const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const defaultSettings = {
    idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    plaintextAllowed: false
};
class InMemorySettingsMap {
    store = new Map();
    constructor(initial) {
        for (const key of Object.keys(initial)) {
            this.store.set(key, initial[key]);
        }
    }
    get(key) {
        return this.store.has(key)
            ? this.store.get(key)
            : undefined;
    }
    set(key, value) {
        this.store.set(key, value);
        return this;
    }
}
let settingsStore = new InMemorySettingsMap(defaultSettings);
let activeLogger = new RpgmLogger('CrystalCache | ');
function seedDefaults(map, overrides) {
    const seed = {
        ...defaultSettings,
        ...overrides
    };
    for (const key of Object.keys(seed)) {
        const current = map.get(key);
        if (current === null || current === undefined) {
            map.set(key, seed[key]);
        }
    }
}
export function registerCrystalCacheSettings(map, defaults) {
    settingsStore = map;
    seedDefaults(settingsStore, defaults);
}
export function createInMemoryCacheSettings(initial) {
    return new InMemorySettingsMap({
        ...defaultSettings,
        ...initial
    });
}
export function configureCrystalCache(options = {}) {
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
export function resolveConfiguration(options) {
    const idleSetting = settingsStore.get('idleTimeoutMs');
    const idleTimeoutMs = options?.idleTimeoutMs ?? idleSetting ?? defaultSettings.idleTimeoutMs;
    const plaintextSetting = settingsStore.get('plaintextAllowed');
    const plaintextAllowed = typeof plaintextSetting === 'boolean'
        ? plaintextSetting
        : defaultSettings.plaintextAllowed;
    const logger = options?.logger ?? activeLogger;
    return {
        idleTimeoutMs,
        plaintextAllowed,
        logger
    };
}
