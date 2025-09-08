export interface SettingsMap<T extends object> {
    get<K extends keyof T>(key: K): T[K] | null | undefined;
    set<K extends keyof T>(key: K, value: T[K]): this;
}
