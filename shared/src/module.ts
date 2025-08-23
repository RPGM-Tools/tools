import type { RPGMLogger } from './logger';

export abstract class RpgmModule<ID extends keyof ModulesMap> {
	abstract id: ID;

	constructor(options: ModuleOptions) {
		this.logger = options.logger;
	}

	modules: Partial<Omit<ModulesMap, ID>> = {};
	logger: RPGMLogger;

	init(modules: typeof this.modules) {
		this.modules = modules;
	}
}
