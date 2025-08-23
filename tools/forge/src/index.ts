import type OpenAI from 'openai';

import { RpgmModule } from '../../../shared/src/module';

import { generateNames } from './names';
import { ForgeQueue } from './queue';

export { listModels } from './names';

export type ForgeOptions = {
	openAI: OpenAI
	maxConcurrency?: number
} & ModuleOptions;

export class Forge extends RpgmModule<'forge'> {
	override id = 'forge' as const;

	openAI: OpenAI;
	queue: ForgeQueue;

	constructor(options: ForgeOptions) {
		super(options);
		this.openAI = options.openAI;
		this.queue = new ForgeQueue(options.maxConcurrency);
	}

	generateNames = generateNames.bind(this);
}
