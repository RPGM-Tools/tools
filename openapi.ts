import { createClient } from '@hey-api/openapi-ts';
import { config } from 'dotenv';

config({ quiet: true });

if (!process.env.OPENAPI_INPUT) {
	throw new Error('Missing required environment variable "OPENAPI_INPUT"');
}

createClient({
	input: process.env.OPENAPI_INPUT,
	output: {
		path: './shared/src/client'
	},
	plugins: [
		{
			name: '@hey-api/client-fetch',
			baseUrl: 'https://rpgm.tools'
		}
	]
});
