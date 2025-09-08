import { AbstractRpgmModule, IRpgmModule } from './module';
import { RpgmLogger } from './logger';
import { ProviderV2 } from '@ai-sdk/provider';
import { OpenAICompatibleProvider } from '@ai-sdk/openai-compatible';
export declare namespace AbstractTools {
    interface Settings extends AbstractRpgmModule.ModuleSettings {
        textProviders: TextProvider[];
    }
}
export type RpgmModels = 'rpgm-names' | 'rpgm-descriptions' | 'rpgm-homebrew';
type Options = {
    name: string;
    baseURL: string;
    apiKey: string;
};
export type TextModel = Model<'text'>;
export type Model<T extends string> = {
    type: T;
    /** The ID of the provider that provides the model */
    provider: string;
    slug: RpgmModels | (string & {});
};
interface ProviderDef {
    name: string;
    classIcon: string;
    create(this: AbstractTools, options: Options): ProviderV2;
    fetchModels?: (options: Pick<Options, 'apiKey' | 'baseURL'>) => Promise<string[]>;
}
export declare const DIY_PROVIDERS: Record<string, ProviderDef>;
export declare const PROVIDERS: Record<string, ProviderDef>;
export type TextProvider = {
    id: string;
    name: string;
    type: string;
    baseURL: string;
    apiKey: string;
    textModels: string[];
};
export declare abstract class AbstractTools extends AbstractRpgmModule<AbstractTools.Settings> implements IRpgmModule<'rpgm-tools', AbstractTools.Settings> {
    DEFAULT_SETTINGS: {
        textProviders: never[];
    };
    name: string;
    id: "rpgm-tools";
    icon: string;
    logger: RpgmLogger<never>;
    textAiFromModel(model: TextModel): import("neverthrow").Ok<import("@ai-sdk/provider").LanguageModelV2, never> | import("neverthrow").Err<never, Error>;
    textAi(provider: TextProvider, slug: string): import("@ai-sdk/provider").LanguageModelV2;
    protected abstract get rpgmTextAiOptions(): {
        baseURL: string;
        apiKey: string;
    };
    rpgmTextAi(): OpenAICompatibleProvider<RpgmModels, never, never, never>;
}
export {};
