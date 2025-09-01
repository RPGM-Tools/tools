import { RpgmModule } from './module';
import { RPGMLogger } from './logger';
import { ModuleOptions } from '.';
type RpgmToolsSettings = {
    ai: {
        apiKey: string;
        baseURL: string;
    };
};
type ToolsOptions = ModuleOptions;
export declare class RpgmTools extends RpgmModule<'rpgm-tools', RpgmToolsSettings> {
    static DEFAULT_SETTINGS: RpgmToolsSettings;
    name: string;
    id: "rpgm-tools";
    icon: string;
    logger: RPGMLogger<never>;
    get ai(): import("@ai-sdk/openai-compatible").OpenAICompatibleProvider<string, string, string, string>;
    tools: this;
    constructor(options: ToolsOptions);
}
export {};
