import { Forge } from ".";
export type Homebrew = {
    name: string;
    custom_name: string;
    flavor_text: string;
    fields: HomebrewField[];
};
export type HomebrewSchema = {
    name: string;
    custom_name?: string;
    fields: HomebrewField[];
};
export type HomebrewOptions = {
    genre: string;
    system: string;
    language: string;
    schema: HomebrewSchema;
};
type HomebrewField = {
    name: string;
    description: string;
} & ({
    type: "short" | "long";
    value?: string;
} | {
    type: "boolean";
    value?: boolean;
} | {
    type: "number";
    value?: number;
});
export declare function generateHomebrew(this: Forge, options: HomebrewOptions): import("neverthrow").ResultAsync<Homebrew, Error>;
export {};
