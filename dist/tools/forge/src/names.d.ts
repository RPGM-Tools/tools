import type { Forge } from '.';
type Method = 'ai' | 'simple';
type Gender = 'male' | 'female' | 'nonbinary' | 'any';
type NamesOptions = {
    quantity: number;
    method: Method;
    type: string;
    genre: string;
    gender: Gender;
    language: string;
};
export type Names = {
    names: string[];
};
export declare function generateNames(this: Forge, options: NamesOptions): import("neverthrow").ResultAsync<Names, Error>;
export {};
