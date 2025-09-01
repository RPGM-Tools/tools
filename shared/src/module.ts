import { RpgmLogger } from '#/logger';
import { AbstractTools } from '#/tools';

export abstract class RpgmModule<ID extends string = string, Settings extends object = object> {
	abstract readonly id: ID;
	abstract icon: string;
	abstract name: string;

	abstract readonly settings: Settings;

	protected abstract tools: AbstractTools;

	abstract logger: RpgmLogger;

	abstract save(data: Settings): void
	abstract load(): Settings | null
}
