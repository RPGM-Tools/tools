import type { RpgmModule } from "./module";
type Msg = unknown[];
type RPGMLogging<T extends keyof RPGMLogger<never>, K extends keyof RPGMLogger<never>> = Omit<RPGMLogger<T | K>, T | K>;
export declare class RPGMLogger<T extends keyof RPGMLogger<T> = never> {
    private _prefix;
    show: (method: 'log' | 'warn' | 'error', message: string) => void;
    constructor(_prefix: string | undefined, show: (method: 'log' | 'warn' | 'error', message: string) => void);
    static fromModule(mod: RpgmModule, show: typeof this.prototype.show): RPGMLogger<never>;
    private options;
    get visible(): RPGMLogging<T, "visible" | "debug">;
    styled(style: string): RPGMLogging<T, "styled">;
    prefixed(prefix: string): RPGMLogging<T, "prefixed">;
    log(...msgs: Msg): void;
    warn(...msgs: Msg): void;
    error(...msgs: Msg): void;
    debug(...msgs: Msg): void;
    private send;
    private _reset;
}
export {};
