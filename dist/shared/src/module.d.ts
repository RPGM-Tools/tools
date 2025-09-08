import { RpgmLogger } from './logger';
import type { AbstractTools } from './tools';
import type { AbstractForge } from '../../tools/forge';
import { SettingsMap } from './settings';
export type ModuleMap = {
    'rpgm-tools': typeof AbstractTools;
    'rpgm-forge': typeof AbstractForge;
};
type AbstractConstructor<T> = abstract new (...args: any[]) => T;
export declare namespace AbstractRpgmModule {
    type ModuleSettings = object;
}
export type RealizedRpgmModule<ID extends keyof ModuleMap = keyof ModuleMap, Settings extends AbstractRpgmModule.ModuleSettings = AbstractRpgmModule.ModuleSettings> = IRpgmModule<ID> & AbstractRpgmModule<Settings>;
export type RpgmModuleConstructor = AbstractConstructor<RealizedRpgmModule> & Omit<typeof AbstractRpgmModule, 'prototype'>;
export interface IRpgmModule<ID extends keyof ModuleMap = keyof ModuleMap, Settings extends AbstractRpgmModule.ModuleSettings = AbstractRpgmModule.ModuleSettings> {
    readonly id: ID;
    icon: string;
    name: string;
    logger: RpgmLogger;
    DEFAULT_SETTINGS: Settings;
}
export declare abstract class AbstractRpgmModule<Settings extends AbstractRpgmModule.ModuleSettings> {
    abstract readonly settings: SettingsMap<Settings>;
    protected abstract get tools(): AbstractTools;
    abstract save(data: Settings): void;
    abstract load(): Settings | null;
}
export {};
