import { RpgmLogger } from '#/logger';

import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { IRpgmModule, AbstractRpgmModule } from '#/module';
import { generateDescriptions } from './descriptions';
import { generateHomebrew } from './homebrew';
import { generateNames } from './names';
import { generateText } from 'ai';
import { TextModel, TextProvider } from '#/tools';
import { getApiForgeUsage } from '#/client';
export { default as HomebrewSchemas } from './data/schemas.json';

export type * from './descriptions';
export type * from './homebrew';
export type * from './names';

export namespace AbstractForge {
	export interface Settings extends AbstractRpgmModule.ModuleSettings {
		namesModel: TextModel
		descriptionsModel: TextModel
		homebrewModel: TextModel
	}
}

export const RPGM_MODELS = {
	names: {
		type: 'text',
		provider: 'rpgm-tools',
		slug: 'rpgm-names'
	},
	offlineNames: {
		type: 'text',
		provider: 'offline',
		slug: 'rpgm-names-offline'
	},
	adjectiveNames: {
		type: 'text',
		provider: 'adjective',
		slug: 'rpgm-names-adjective'
	},
	descriptions: {
		type: 'text',
		provider: 'rpgm-tools',
		slug: 'rpgm-descriptions'
	},
	homebrew: {
		type: 'text',
		provider: 'rpgm-tools',
		slug: 'rpgm-homebrew'
	}
} as const satisfies Record<string, TextModel>;

export abstract class AbstractForge extends AbstractRpgmModule<AbstractForge.Settings> implements IRpgmModule<'rpgm-forge', AbstractForge.Settings> {
	DEFAULT_SETTINGS = {
		namesModel: RPGM_MODELS.names,
		descriptionsModel: RPGM_MODELS.descriptions,
		homebrewModel: RPGM_MODELS.homebrew,
	}

	name = 'Rpgm Forge';
	id = 'rpgm-forge' as const;
	icon = '🎲';
	logger = RpgmLogger.fromModule(this);

	getApiForgeUsage = getApiForgeUsage;

	testTextModel(provider: TextProvider, model: string) {
		const langModel = this.tools.textAi(provider, model);
		return ResultAsync.fromPromise((async () => {
			const { text } = await generateText({
				model: langModel,
				maxRetries: 0,
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

	get generateNames() { return generateNames.bind(this); }
	get generateDescriptions() { return generateDescriptions.bind(this); }
	get generateHomebrew() { return generateHomebrew.bind(this); }
}
