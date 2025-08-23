import type { RPGMLogger } from '#/logger';
import type { Forge } from '$rpgm/forge';
import type { Vault } from '$rpgm/vault';

declare global {
	type ModuleOptions = {
		logger: RPGMLogger
	};

	type TODO = never;
	type ValOrGetter<T> = T | (() => T);


	type ModulesMap = {
		'forge': Forge
		'vault': Vault
	};

	type InitializedModules = Partial<{
		[K in keyof ModulesMap]: ModulesMap[K]
	}>;

	type Test = {
		Foo: string
	};
}

export { };
