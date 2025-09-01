import { RpgmModule } from './module';
import { RPGMLogger } from './logger';
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
// Monkey patch OpenAICompatibleChatLanguageModel to support structured outputs
const doGenerateOld = OpenAICompatibleChatLanguageModel.prototype.doGenerate;
const doGenerateNew = async function (...args) {
    this.supportsStructuredOutputs = true;
    return doGenerateOld.apply(this, args);
};
OpenAICompatibleChatLanguageModel.prototype.doGenerate = doGenerateNew;
// --------------------------------------------------------------------
export class RpgmTools extends RpgmModule {
    static DEFAULT_SETTINGS = {
        ai: {
            apiKey: '',
            baseURL: ''
        }
    };
    name = 'RPGM Tools';
    id = 'rpgm-tools';
    icon = '🛠️';
    logger;
    get ai() {
        return createOpenAICompatible({
            name: 'custom',
            baseURL: this.settings.ai.baseURL,
            apiKey: this.settings.ai.apiKey,
            fetch: makecustomfetch(e => this.logger.error(e))
        });
    }
    tools = this;
    constructor(options) {
        super(options, RpgmTools.DEFAULT_SETTINGS);
        this._settings.value = options.settings.load() ?? RpgmTools.DEFAULT_SETTINGS;
        this.logger = RPGMLogger.fromModule(this, options.logger.show);
        this.init();
    }
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
