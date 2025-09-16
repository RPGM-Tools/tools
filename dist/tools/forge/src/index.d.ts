import { RpgmLogger } from '../../../shared/src/logger';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { IRpgmModule, AbstractRpgmModule } from '../../../shared/src/module';
import { TextModel, TextProvider } from '../../../shared/src/tools';
export { default as HomebrewSchemas } from './data/schemas.json';
export type * from './descriptions';
export type * from './homebrew';
export type * from './names';
export declare namespace AbstractForge {
    interface Settings extends AbstractRpgmModule.ModuleSettings {
        namesModel: TextModel;
        descriptionsModel: TextModel;
        homebrewModel: TextModel;
    }
}
export declare const RPGM_MODELS: {
    readonly names: {
        readonly type: "text";
        readonly provider: "rpgm-tools";
        readonly slug: "rpgm-names";
    };
    readonly offlineNames: {
        readonly type: "text";
        readonly provider: "offline";
        readonly slug: "rpgm-names-offline";
    };
    readonly descriptions: {
        readonly type: "text";
        readonly provider: "rpgm-tools";
        readonly slug: "rpgm-descriptions";
    };
    readonly homebrew: {
        readonly type: "text";
        readonly provider: "rpgm-tools";
        readonly slug: "rpgm-homebrew";
    };
};
export declare abstract class AbstractForge extends AbstractRpgmModule<AbstractForge.Settings> implements IRpgmModule<'rpgm-forge', AbstractForge.Settings> {
    DEFAULT_SETTINGS: {
        namesModel: {
            readonly type: "text";
            readonly provider: "rpgm-tools";
            readonly slug: "rpgm-names";
        };
        descriptionsModel: {
            readonly type: "text";
            readonly provider: "rpgm-tools";
            readonly slug: "rpgm-descriptions";
        };
        homebrewModel: {
            readonly type: "text";
            readonly provider: "rpgm-tools";
            readonly slug: "rpgm-homebrew";
        };
    };
    name: string;
    id: "rpgm-forge";
    icon: string;
    logger: RpgmLogger<never>;
    getApiForgeUsage: <ThrowOnError extends boolean = false>(options?: import("../../../shared/src/client").Options<import("../../../shared/src/client").GetApiForgeUsageData, ThrowOnError>) => import("../../../shared/src/client/client").RequestResult<import("../../../shared/src/client").GetApiForgeUsageResponses, unknown, ThrowOnError, "fields">;
    testTextModel(provider: TextProvider, model: string): ResultAsync<boolean, Error>;
    queue: ForgeQueue;
    get generateNames(): (options: import("./names").NamesOptions) => ResultAsync<import("./names").Names, Error>;
    get generateDescriptions(): (options: {
        name: string;
        type: string;
        genre: string;
        length: "short" | "medium" | "extensive";
        system: string;
        notes: string;
        language: string;
    }) => ResultAsync<import("./descriptions").Description, Error>;
    get generateHomebrew(): (options: import("./homebrew").HomebrewOptions) => ResultAsync<import("./homebrew").Homebrew, Error>;
}
