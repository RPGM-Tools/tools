import { RPGMLogger } from '../../../shared/src/logger';
import { RpgmTools, type ModuleOptions } from '../../../shared/src/index';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { RpgmModule } from '../../../shared/src/module';
export { default as HomebrewSchemas } from './data/schemas.json';
export type * from './descriptions';
export type * from './homebrew';
export type * from './names';
export type ForgeOptions = {
    singleton: RpgmTools;
    maxConcurrency?: number;
} & ModuleOptions;
type ForgeSettings = {
    mode: 'rpgm' | 'diy' | 'offline';
    ai: {
        model: string;
        modelOverrides: {
            names: string;
            descriptions: string;
            homebrew: string;
        };
    };
};
export declare class Forge extends RpgmModule<'rpgm-forge', ForgeSettings> {
    static DEFAULT_SETTINGS: ForgeSettings;
    name: string;
    id: "rpgm-forge";
    icon: string;
    logger: RPGMLogger<never>;
    tools: RpgmTools;
    testModel(model: string): ResultAsync<boolean, Error>;
    queue: ForgeQueue;
    constructor(options: ForgeOptions);
    generateNames: (options: {
        quantity: number;
        method: "ai" | "simple";
        type: string;
        genre: string;
        gender: "male" | "female" | "nonbinary" | "any";
        language: string;
    }) => ResultAsync<import("./names").Names, Error>;
    generateDescriptions: (options: {
        name: string;
        type: string;
        genre: string;
        length: "short" | "medium" | "extensive";
        system: string;
        notes: string;
        language: string;
    }) => ResultAsync<import("./descriptions").Description, Error>;
    generateHomebrew: (options: import("./homebrew").HomebrewOptions) => ResultAsync<import("./homebrew").Homebrew, Error>;
}
