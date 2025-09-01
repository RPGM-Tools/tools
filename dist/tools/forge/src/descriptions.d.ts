import type { AbstractForge } from ".";
type DescriptionsOptions = {
    name: string;
    type: string;
    genre: string;
    length: "short" | "medium" | "extensive";
    system: string;
    notes: string;
    language: string;
};
export type Description = {
    description: string;
};
export declare function generateDescriptions(this: AbstractForge, options: DescriptionsOptions): import("neverthrow").ResultAsync<Description, Error>;
export {};
