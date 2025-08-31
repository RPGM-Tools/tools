import { RPGMLogger } from '#/logger';
import { RpgmTools, type ModuleOptions } from '#/index';

import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { RpgmModule } from '../../../shared/src/module';
import { generateDescriptions } from './descriptions';
import { generateHomebrew } from './homebrew';
import { generateNames } from './names';
import { generateText } from 'ai';
export { default as HomebrewSchemas } from './data/schemas.json';

export type * from './descriptions';
export type * from './homebrew';
export type * from './names';

export type ForgeOptions = {
	singleton: RpgmTools
	maxConcurrency?: number
} & ModuleOptions;

type ForgeSettings = {
	ai: {
		model: string
		modelOverrides: {
			names: string
			descriptions: string
			homebrew: string
		}
	}
}

export class Forge extends RpgmModule<'rpgm-forge', ForgeSettings> {
	static DEFAULT_SETTINGS: ForgeSettings = {
		ai: {
			model: '',
			modelOverrides: {
				names: '',
				descriptions: '',
				homebrew: ''
			}
		}
	}
	override name = 'RPGM Forge';

	override id = 'rpgm-forge' as const;
	override icon = '🎲';
	override logger;
	override tools: RpgmTools;

	testModel(model: string) {
		this.settings
		return ResultAsync.fromPromise((async () => {
			const { text } = await generateText({
				model: this.tools.ai.languageModel(model),
				messages: [
					{
						role: 'user',
						content: 'This is a test. Respond with "STOP" to indicate success.'
					}
				]
			})
			return Boolean(text.includes('STOP'));
		})(), (e) => e instanceof Error ? e : new Error("Failed to test model."));
	}

	queue: ForgeQueue;

	constructor(options: ForgeOptions) {
		super(options, Forge.DEFAULT_SETTINGS);
		this._settings.value = options.settings.load() as ForgeSettings ?? Forge.DEFAULT_SETTINGS;
		this.queue = new ForgeQueue(options.maxConcurrency);
		this.logger = RPGMLogger.fromModule(this, options.logger.show);
		this.tools = options.singleton;
		this.init();
	}

	generateNames = generateNames.bind(this);
	generateDescriptions = generateDescriptions.bind(this);
	generateHomebrew = generateHomebrew.bind(this);
}
