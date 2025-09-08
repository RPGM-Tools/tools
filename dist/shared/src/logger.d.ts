import type { IRpgmModule } from "./module";
type Msg = unknown[];
type RpgmLogging<T extends keyof RpgmLogger<never>, K extends keyof RpgmLogger<never>> = Omit<RpgmLogger<T | K>, T | K>;
export declare class RpgmLogger<T extends keyof RpgmLogger<T> = never> {
    private _prefix;
    options?: Partial<{
        show: (method: "log" | "warn" | "error", message: string) => void;
    }> | undefined;
    constructor(_prefix?: string, options?: Partial<{
        show: (method: "log" | "warn" | "error", message: string) => void;
    }> | undefined);
    static fromModule(mod: IRpgmModule, options?: RpgmLogger['options']): RpgmLogger<never>;
    private state;
    get visible(): RpgmLogging<T, "visible" | "debug">;
    styled(style: string): RpgmLogging<T, "styled">;
    prefixed(prefix: string): RpgmLogging<T, "prefixed">;
    log(...msgs: Msg): void;
    warn(...msgs: Msg): void;
    error(...msgs: Msg): void;
    debug(...msgs: Msg): void;
    private send;
    private _reset;
}
export {};
