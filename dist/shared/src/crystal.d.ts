export type UUID = string;
export type Glyph = string;
export type NamesCrystal = LoreCrystal<'names', {
    names: string[];
}>;
export type RemoteCrystal<T extends string = string> = LoreCrystal<T, {
    url: string;
}>;
export type ImageCrystal = RemoteCrystal<'image'>;
export type VideoCrystal = RemoteCrystal<'video'>;
export type LoreCrystal<T extends string = string, TData extends object = object> = {
    id: UUID;
    type: T;
    title: string;
    description: string;
    schema_version: number;
    created_at: number;
    modified_at?: number;
    permissions: never;
    glyph: Glyph;
    tags: string[];
    data: TData;
};
