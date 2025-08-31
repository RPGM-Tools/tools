import { RpgmModule } from '#/module';
import { RPGMLogger } from '#/logger';
import { ModuleOptions } from '.';
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';

type RpgmToolsSettings = {
	ai: {
		apiKey: string
		baseURL: string
	}
}

type ToolsOptions = ModuleOptions;

// Monkey patch OpenAICompatibleChatLanguageModel to support structured outputs
const doGenerateOld = OpenAICompatibleChatLanguageModel.prototype.doGenerate;
const doGenerateNew: typeof doGenerateOld = async function(this: OpenAICompatibleChatLanguageModel, ...args) {
	(this.supportsStructuredOutputs as boolean) = true;
	return doGenerateOld.apply(this, args);
}

OpenAICompatibleChatLanguageModel.prototype.doGenerate = doGenerateNew;
// --------------------------------------------------------------------

export class RpgmTools extends RpgmModule<'rpgm-tools', RpgmToolsSettings> {
	static DEFAULT_SETTINGS: RpgmToolsSettings = {
		ai: {
			apiKey: '',
			baseURL: ''
		}
	};

	override name = 'RPGM Tools';
	override id = 'rpgm-tools' as const;
	override icon: string = '🛠️';
	override logger;

	get ai() {
		return createOpenAICompatible({
			name: 'custom',
			baseURL: this.settings.ai.baseURL,
			apiKey: this.settings.ai.apiKey,
			fetch: makecustomfetch(e => this.logger.error(e))
		})
	}

	override tools = this;

	constructor(options: ToolsOptions) {
		super(options, RpgmTools.DEFAULT_SETTINGS);
		this._settings.value = options.settings.load() as RpgmToolsSettings ?? RpgmTools.DEFAULT_SETTINGS;
		this.logger = RPGMLogger.fromModule(this, options.logger.show);
		this.init();
	}
}

function makecustomfetch(onerror: (err: any) => void): typeof fetch {
	return async (input: RequestInfo | URL, init?: RequestInit) => {
		try {
			const res = await fetch(input, init);
			if (!res.ok) {
				// this is where you detect http-level errors
				const body = await res.json();
				throw new Error(body.error.message || res.statusText)
			}
			return res;
		} catch (err) {
			// network or low-level fetch error
			onerror(err);
			throw err;
		}
	};
}
