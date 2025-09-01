import { RPGMLogger } from '../../../shared/src/logger';
import { ForgeQueue } from './queue';
import { ResultAsync } from 'neverthrow';
import { RpgmModule } from '../../../shared/src/module';
import { generateDescriptions } from './descriptions';
import { generateHomebrew } from './homebrew';
import { generateNames } from './names';
import { generateText } from 'ai';
export { default as HomebrewSchemas } from './data/schemas.json';
export class Forge extends RpgmModule {
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
    name = 'RPGM Forge';
    id = 'rpgm-forge';
    icon = '🎲';
    logger;
    tools;
    testModel(model) {
        this.settings;
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
    queue;
    constructor(options) {
        super(options, Forge.DEFAULT_SETTINGS);
        this._settings.value = options.settings.load() ?? Forge.DEFAULT_SETTINGS;
        this.queue = new ForgeQueue(options.maxConcurrency);
        this.logger = RPGMLogger.fromModule(this, options.logger.show);
        this.tools = options.singleton;
        this.init();
    }
    generateNames = generateNames.bind(this);
    generateDescriptions = generateDescriptions.bind(this);
    generateHomebrew = generateHomebrew.bind(this);
}
