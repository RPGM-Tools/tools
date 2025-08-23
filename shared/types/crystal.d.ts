declare global {
	type UUID = string;
	type Glyph = string;

	type NamesCrystal = LoreCrystal<'names', { names: string[] }>;
	type RemoteCrystal<T extends string = string> = LoreCrystal<T, { url: string }>;
	type ImageCrystal = RemoteCrystal<'image'>;
	type VideoCrystal = RemoteCrystal<'video'>;

	type LoreCrystal<T extends string = string, TData extends object = object> = {
		id: UUID,
		type: T,

		title: string,
		description: string

		schema_version: number

		created_at: number
		modified_at?: number

		permissions: never

		glyph: Glyph

		tags: string[]

		data: TData
	};
}

export { };
