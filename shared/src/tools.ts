import { AbstractRpgmModule, IRpgmModule } from '#/module';
import { RpgmLogger } from '#/logger';
import { ProviderV2 } from '@ai-sdk/provider';
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel, OpenAICompatibleProvider } from '@ai-sdk/openai-compatible';
import { err, ok } from 'neverthrow';
import { client } from './client/client.gen';
import { getApiListProducts, getApiPolyhedrium, getApiUserInfo } from './client';

export namespace AbstractTools {
  export interface Settings extends AbstractRpgmModule.ModuleSettings {
    textProviders: TextProvider[],
  }
}

export type RpgmModels = 'rpgm-names' | 'rpgm-descriptions' | 'rpgm-homebrew';

type Options = {
  name: string
  baseURL: string
  apiKey: string
}

export type TextModel = Model<'text'>

export type Model<T extends string> = {
  type: T,
  /** The ID of the provider that provides the model */
  provider: string,
  slug: RpgmModels | (string & {})
}

interface ProviderDef {
  name: string
  classIcon: string
  create(this: AbstractTools, options: Options): ProviderV2
  fetchModels?: (options: Pick<Options, 'apiKey' | 'baseURL'>) => Promise<string[]>
}

export const DIY_PROVIDERS: Record<string, ProviderDef> = {
  'openai-compatible': {
    name: 'OpenAI Compatible',
    classIcon: 'fa-solid fa-sparkles',
    create({ apiKey, baseURL, name }) { return createOpenAICompatible({ apiKey, baseURL, name }); },
    fetchModels: ({ apiKey, baseURL }) => fetch(new URL('models', baseURL += baseURL.endsWith('/') ? '' : '/'), {
      headers: { Authorization: `Bearer ${apiKey}` }
    }).then(res => res.json()).then(r => r.data.map((m: any) => m.id))
  }
} as const;

export const PROVIDERS: Record<string, ProviderDef> = {
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
} as const;

export interface TextProvider {
  id: string
  name: string
  type: string
  baseURL: string
  apiKey: string
  textModels: string[]
}

export abstract class AbstractTools extends AbstractRpgmModule<AbstractTools.Settings> implements IRpgmModule<'rpgm-tools', AbstractTools.Settings> {
  DEFAULT_SETTINGS = {
    textProviders: [],
  };

  name = 'RPGM Tools';
  id = 'rpgm-tools' as const;
  icon = '🛠️';
  logger = RpgmLogger.fromModule(this);

  textAiFromModel(model: TextModel) {
    const { provider, slug } = model;
    if (provider === 'rpgm-tools') return ok(this.rpgmTextAi()(model.slug as any));
    const providerDef = this.settings.get('textProviders')?.find(p => p.id === provider);
    if (!providerDef) return err(new Error(`Unknown provider: ${provider}`));
    return ok(this.textAi(providerDef, slug));
  }

  textAi(provider: TextProvider, slug: string) {
    const { name, type, apiKey, baseURL } = provider;
    const p = PROVIDERS[type].create.call(this, { apiKey, baseURL, name });
    return p.languageModel(slug);
  }

  readonly client = client;

  getApiPolyhedrium = getApiPolyhedrium
  getApiUserInfo = getApiUserInfo
  getApiListProducts = getApiListProducts

  protected abstract get rpgmTextAiOptions(): { baseURL: string, apiKey: string }

  rpgmTextAi(): OpenAICompatibleProvider<RpgmModels, never, never, never> {
    const { baseURL, apiKey } = this.rpgmTextAiOptions;
    return createOpenAICompatible({
      name: 'rpgm',
      baseURL: new URL('/api/forge', baseURL).href,
      apiKey,
    });
  }

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.client.setConfig({
      auth: () => this.rpgmTextAiOptions.apiKey,
      baseUrl: this.rpgmTextAiOptions.baseURL
    });
  }
}

// Monkey patch OpenAICompatibleChatLanguageModel to support structured outputs
const doGenerateOld = OpenAICompatibleChatLanguageModel.prototype.doGenerate;
const doGenerateNew: typeof doGenerateOld = async function(this: OpenAICompatibleChatLanguageModel, ...args) {
  (this.supportsStructuredOutputs as boolean) = true;
  return doGenerateOld.apply(this, args);
}

OpenAICompatibleChatLanguageModel.prototype.doGenerate = doGenerateNew;
// --------------------------------------------------------------------
