import { RpgmLogger } from '#/logger';

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

type ForgeSettings = {
	mode: 'rpgm' | 'diy' | 'offline'
	ai: {
		model: string
		modelOverrides: {
			names: string
			descriptions: string
			homebrew: string
		}
	}
}

export abstract class AbstractForge extends RpgmModule<'rpgm-forge', ForgeSettings> {
	static DEFAULT_SETTINGS: ForgeSettings = {
		mode: 'rpgm',
		ai: {
			model: '',
			modelOverrides: {
				names: '',
				descriptions: '',
				homebrew: ''
			}
		}
	}
	override name = 'Rpgm Forge';

	override id = 'rpgm-forge' as const;
	override icon = '🎲';
	override logger = RpgmLogger.fromModule(this);

	testModel(model: string) {
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

	queue = new ForgeQueue(4);

	generateNames = generateNames.bind(this);
	generateDescriptions = generateDescriptions.bind(this);
	generateHomebrew = generateHomebrew.bind(this);
}
