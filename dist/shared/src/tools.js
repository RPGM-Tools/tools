import { AbstractRpgmModule } from './module';
import { RpgmLogger } from './logger';
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
import { err, ok } from 'neverthrow';
export const DIY_PROVIDERS = {
    'openai-compatible': {
        name: 'OpenAI Compatible',
        classIcon: 'fa-solid fa-sparkles',
        create({ apiKey, baseURL, name }) { return createOpenAICompatible({ apiKey, baseURL, name }); },
        fetchModels: ({ apiKey, baseURL }) => fetch(new URL('models', baseURL), {
            headers: { Authorization: `Bearer ${apiKey}` }
        }).then(res => res.json()).then(r => r.data.map((m) => m.id))
    }
};
export const PROVIDERS = {
    'rpgm-tools': {
        name: 'RPGM Tools',
        classIcon: 'rp-dice',
        create() { return this.rpgmTextAi(); }
    },
    offline: {
        name: 'Offline',
        classIcon: 'fa-solid fa-wifi-slash',
        create() { return this.rpgmTextAi(); }
    },
    ...DIY_PROVIDERS
};
export class AbstractTools extends AbstractRpgmModule {
    DEFAULT_SETTINGS = {
        textProviders: [],
    };
    name = 'Rpgm Tools';
    id = 'rpgm-tools';
    icon = '🛠️';
    logger = RpgmLogger.fromModule(this);
    textAiFromModel(model) {
        const { provider, slug } = model;
        if (provider === 'rpgm-tools')
            return ok(this.rpgmTextAi()(model.slug));
        const providerDef = this.settings.get('textProviders')?.find(p => p.id === provider);
        if (!providerDef)
            return err(new Error(`Unknown provider: ${provider}`));
        return ok(this.textAi(providerDef, slug));
    }
    textAi(provider, slug) {
        const { name, type, apiKey, baseURL } = provider;
        const p = PROVIDERS[type].create.call(this, { apiKey, baseURL, name });
        return p.languageModel(slug);
    }
    rpgmTextAi() {
        const { baseURL, apiKey } = this.rpgmTextAiOptions;
        return createOpenAICompatible({
            name: 'rpgm',
            baseURL,
            apiKey,
        });
    }
}
// Monkey patch OpenAICompatibleChatLanguageModel to support structured outputs
const doGenerateOld = OpenAICompatibleChatLanguageModel.prototype.doGenerate;
const doGenerateNew = async function (...args) {
    this.supportsStructuredOutputs = true;
    return doGenerateOld.apply(this, args);
};
OpenAICompatibleChatLanguageModel.prototype.doGenerate = doGenerateNew;
// --------------------------------------------------------------------
