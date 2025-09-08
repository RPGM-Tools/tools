import { RpgmLogger } from '../../../shared/src/logger';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { AbstractRpgmModule } from '../../../shared/src/module';
import { generateDescriptions } from './descriptions';
import { generateHomebrew } from './homebrew';
import { generateNames } from './names';
import { generateText } from 'ai';
export { default as HomebrewSchemas } from './data/schemas.json';
export const RPGM_MODELS = {
    names: {
        type: 'text',
        provider: 'rpgm-tools',
        slug: 'rpgm-names'
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
};
export class AbstractForge extends AbstractRpgmModule {
    DEFAULT_SETTINGS = {
        namesModel: RPGM_MODELS.names,
        descriptionsModel: RPGM_MODELS.descriptions,
        homebrewModel: RPGM_MODELS.homebrew,
    };
    name = 'Rpgm Forge';
    id = 'rpgm-forge';
    icon = '🎲';
    logger = RpgmLogger.fromModule(this);
    testTextModel(provider, model) {
        const langModel = this.tools.textAi(provider, model);
        return ResultAsync.fromPromise((async () => {
            const { text } = await generateText({
                model: langModel,
                messages: [
                    {
                        role: 'user',
                        content: 'This is a test. Respond with "STOP" to indicate success.'
                    }
                ]
            });
            return Boolean(text.includes('STOP'));
        })(), (e) => e instanceof Error ? e : new Error("Failed to test model."));
    }
    queue = new ForgeQueue(4);
    get generateNames() { return generateNames.bind(this); }
    get generateDescriptions() { return generateDescriptions.bind(this); }
    get generateHomebrew() { return generateHomebrew.bind(this); }
}
