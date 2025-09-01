import { RpgmModule } from './module';
import { RpgmLogger } from './logger';
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
// Monkey patch OpenAICompatibleChatLanguageModel to support structured outputs
const doGenerateOld = OpenAICompatibleChatLanguageModel.prototype.doGenerate;
const doGenerateNew = async function (...args) {
    this.supportsStructuredOutputs = true;
    return doGenerateOld.apply(this, args);
};
OpenAICompatibleChatLanguageModel.prototype.doGenerate = doGenerateNew;
// --------------------------------------------------------------------
export class AbstractTools extends RpgmModule {
    static DEFAULT_SETTINGS = {
        ai: {
            apiKey: '',
            baseURL: ''
        }
    };
    name = 'Rpgm Tools';
    id = 'rpgm-tools';
    icon = '🛠️';
    logger = RpgmLogger.fromModule(this);
    get ai() {
        return createOpenAICompatible({
            name: 'custom',
            baseURL: this.settings.ai.baseURL,
            apiKey: this.settings.ai.apiKey,
            fetch: makecustomfetch(e => this.logger.error(e))
        });
    }
    tools = this;
}
function makecustomfetch(onerror) {
    return async (input, init) => {
        try {
            const res = await fetch(input, init);
            if (!res.ok) {
                // this is where you detect http-level errors
                const body = await res.json();
                throw new Error(body.error.message || res.statusText);
            }
            return res;
        }
        catch (err) {
            // network or low-level fetch error
            onerror(err);
            throw err;
        }
    };
}
