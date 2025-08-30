import { Ref, ref, UnwrapNestedRefs, watch } from 'vue';
import type { ModuleOptions } from '.';
import { RPGMLogger } from '#/logger';
import { RpgmTools } from '#/tools';
import { toReactive } from '@vueuse/core';

export abstract class RpgmModule<ID extends string = string, Settings extends object = object> {
	abstract id: ID;
	abstract icon: string;
	abstract name: string;

	protected readonly _settings: Ref<Settings>;
	readonly settings: UnwrapNestedRefs<Settings>;

	abstract tools: RpgmTools;

	abstract logger: RPGMLogger;

	constructor(protected options: ModuleOptions, settings: Settings) {
		this._settings = ref(settings) as typeof this._settings;
		this.settings = toReactive(this._settings);
	}

	protected init() {
		watch(this.settings, (data) => {
			this.options.settings.save(data);
		}, { deep: true });
	}
}
