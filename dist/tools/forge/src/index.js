import { RpgmLogger } from '../../../shared/src/logger';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { RpgmModule } from '../../../shared/src/module';
import { generateDescriptions } from './descriptions';
import { generateHomebrew } from './homebrew';
import { generateNames } from './names';
import { generateText } from 'ai';
export { default as HomebrewSchemas } from './data/schemas.json';
export class AbstractForge extends RpgmModule {
    static DEFAULT_SETTINGS = {
        mode: 'rpgm',
        ai: {
            model: '',
            modelOverrides: {
                names: '',
                descriptions: '',
                homebrew: ''
            }
        }
    };
    name = 'Rpgm Forge';
    id = 'rpgm-forge';
    icon = '🎲';
    logger = RpgmLogger.fromModule(this);
    testModel(model) {
        return ResultAsync.fromPromise((async () => {
            const { text } = await generateText({
                model: this.tools.ai.languageModel(model),
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
    generateNames = generateNames.bind(this);
    generateDescriptions = generateDescriptions.bind(this);
    generateHomebrew = generateHomebrew.bind(this);
}
