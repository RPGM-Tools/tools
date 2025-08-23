declare global {
	type Method = 'ai' | 'simple';
	type Gender = 'male' | 'female' | 'nonbinary' | 'any';

	type NamesOptions = {
		quantity: number
		method: Method
		type: string
		genre: string
		gender: Gender
		language: string
	};

	type Names = {
		names: string[]
	};
}

export { };
