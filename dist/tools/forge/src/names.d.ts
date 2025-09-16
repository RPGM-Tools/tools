import type { AbstractForge } from '.';
export type Gender = 'male' | 'female' | 'nonbinary' | 'any';
export type NamesOptions = {
    quantity: number;
    type: string;
    genre: string;
    gender: Gender;
    language: string;
};
export type Names = {
    names: string[];
};
export declare function generateNames(this: AbstractForge, options: NamesOptions): import("neverthrow").ResultAsync<Names, Error>;
