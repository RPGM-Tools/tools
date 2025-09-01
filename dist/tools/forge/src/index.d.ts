import { RpgmLogger } from '../../../shared/src/logger';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { RpgmModule } from '../../../shared/src/module';
export { default as HomebrewSchemas } from './data/schemas.json';
export type * from './descriptions';
export type * from './homebrew';
export type * from './names';
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
export declare abstract class AbstractForge extends RpgmModule<'rpgm-forge', ForgeSettings> {
    static DEFAULT_SETTINGS: ForgeSettings;
    name: string;
    id: "rpgm-forge";
    icon: string;
    logger: RpgmLogger<never>;
    testModel(model: string): ResultAsync<boolean, Error>;
    queue: ForgeQueue;
    generateNames: (options: import("./names").NamesOptions) => ResultAsync<import("./names").Names, Error>;
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
