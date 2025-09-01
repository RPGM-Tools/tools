import { Ref, UnwrapNestedRefs } from 'vue';
import type { ModuleOptions } from '.';
import { RPGMLogger } from './logger';
import { RpgmTools } from './tools';
export declare abstract class RpgmModule<ID extends string = string, Settings extends object = object> {
    protected options: ModuleOptions;
    abstract id: ID;
    abstract icon: string;
    abstract name: string;
    protected readonly _settings: Ref<Settings>;
    readonly settings: UnwrapNestedRefs<Settings>;
    abstract tools: RpgmTools;
    abstract logger: RPGMLogger;
    constructor(options: ModuleOptions, settings: Settings);
    protected init(): void;
}
