import { RpgmModule } from './module';
import { RpgmLogger } from './logger';
type RpgmToolsSettings = {
    ai: {
        apiKey: string;
        baseURL: string;
    };
};
export declare abstract class AbstractTools extends RpgmModule<'rpgm-tools', RpgmToolsSettings> {
    static DEFAULT_SETTINGS: RpgmToolsSettings;
    name: string;
    id: "rpgm-tools";
    icon: string;
    logger: RpgmLogger<never>;
    get ai(): import("@ai-sdk/openai-compatible").OpenAICompatibleProvider<string, string, string, string>;
    tools: this;
}
export {};
