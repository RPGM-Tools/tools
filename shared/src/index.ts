import { RPGMLogger } from '#/logger';

export { RpgmTools } from '#/tools';
export type { RpgmModule } from '#/module';

export type ModuleOptions = {
	logger: {
		show: typeof RPGMLogger.prototype.show
	},
	settings: {
		load: () => object | null
		save: (data: object) => void
	}
};

export type TODO = never;
