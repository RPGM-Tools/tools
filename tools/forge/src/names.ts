/**
 * File: names.ts
 * Purpose: Build prompts and orchestrate name generation across online and offline providers.
 * Last Updated: 2025-11-10
 */
import { err, errAsync, ok } from 'neverthrow';
import type { AbstractForge } from '.';
import { generateText } from 'ai';
import { generateOfflineNames } from './offline-names';
import { generateAdjectiveNames } from './adjective-names';

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

type NamesData = {
	types: { id: string; text: string }[];
	names: {
		type: string;
		text: string;
		gender: Gender;
		weight: number;
		position: 'first' | 'last';
	}[];
};

let ADJECTIVES: string[] | null = null;
let NAMES_DATA: NamesData | null = null;

async function ensureDictionariesLoaded() {
	if (!ADJECTIVES) {
		ADJECTIVES = (await import('@rpgm/forge/data/adjectives-list.json')).default
			.adjectives as string[];
	}
	if (!NAMES_DATA) {
		NAMES_DATA = (await import('@rpgm/forge/data/names-list.json'))
			.default as NamesData;
	}
}

function pickRandomUnique<T>(source: T[], count: number) {
	if (!source.length || count <= 0) return [] as T[];
	const pool = [...source];
	const result: T[] = [];
	while (result.length < count && pool.length) {
		const index = Math.floor(Math.random() * pool.length);
		result.push(pool.splice(index, 1)[0]!);
	}
	return result;
}

function pickRandomAdjectives(count: number) {
	if (!ADJECTIVES?.length) return [] as string[];
	return pickRandomUnique(ADJECTIVES, Math.max(1, count));
}

function pickNameExamples(count: number) {
	if (!NAMES_DATA?.names?.length) return [] as { type: string; name: string }[];
	const comparable = NAMES_DATA.names.filter(n => n.position === 'first');
	if (!comparable.length) return [];
	const grouped = comparable.reduce<Record<string, string[]>>((acc, name) => {
		(acc[name.type] ||= []).push(name.text);
		return acc;
	}, {});
	const typeIds = Object.keys(grouped);
	const pickedTypes = pickRandomUnique(
		typeIds,
		Math.min(typeIds.length, Math.max(1, count))
	);
	return pickedTypes.map(type => {
		const pool = grouped[type]!;
		return { type, name: pool[Math.floor(Math.random() * pool.length)] };
	});
}

function buildSubjects(baseType: string, adjectives: string[]) {
	const safeBase = baseType.trim() || 'creature';
	if (!adjectives.length)
		return [{ adjective: null as string | null, subject: safeBase }];
	return adjectives.map(adj => ({
		adjective: adj,
		subject: `${adj} ${safeBase}`
	}));
}

function buildInstruction(
	options: NamesOptions,
	adjectives: string[],
	examples: { type: string; name: string }[]
) {
	const subjects = buildSubjects(options.type, adjectives);
	return {
		task: 'generate_names',
		quantity: options.quantity,
		genre: options.genre,
		language: options.language || null,
		gender: options.gender,
		subjects: subjects.map(({ adjective, subject }) => ({
			base: options.type,
			descriptor: adjective,
			subject
		})),
		examples: examples.map(example => ({
			type: example.type,
			name: example.name
		})),
		constraints: {
			outputLines: options.quantity,
			allowCharacters: ["'", '-'],
			disallowExamples: examples.map(e => e.name)
		}
	};
}

function buildUserMessage(
	options: NamesOptions,
	instruction: ReturnType<typeof buildInstruction>
) {
	const payload = JSON.stringify(instruction, null, 2);
	return `${payload}\n\nRespond with exactly ${options.quantity} unique name(s) in the same order as the subjects list. Output one name per line with no numbering, no bullets, and no additional commentary. Do not reuse example names or repeat the same leading word across different results.`;
}

export function generateNames(this: AbstractForge, options: NamesOptions) {
	const provider = this.settings.get('namesModel')?.provider;
	if (provider === 'offline') {
		return generateOfflineNames(options);
	}
	if (provider === 'adjective') {
		return generateAdjectiveNames(options);
	}
	const namesModel = this.settings.get('namesModel');
	if (!namesModel) return errAsync(new Error('No names model configured.'));
	const model = this.tools.textAiFromModel.call(this.tools, namesModel);
	if (model.isErr()) return errAsync(model.error);
	return this.queue.generate(async () => {
		await ensureDictionariesLoaded();
		const adjectives = pickRandomAdjectives(options.quantity);
		const examples = pickNameExamples(
			Math.min(4, Math.max(1, options.quantity))
		);
		const instruction = buildInstruction(options, adjectives, examples);
		const userMessage = buildUserMessage(options, instruction);
		return generateText({
			model: model.value,
			maxRetries: 0,
			temperature: 0.9,
			topP: 0.9,
			presencePenalty: 0.7,
			frequencyPenalty: 0.65,
			messages: [
				{
					role: 'system',
					content: DEV_PROMPT
				},
				{
					role: 'user',
					content: userMessage
				}
			]
		}).then(
			({ text }) =>
				Promise.resolve(
					text
						.split('\n')
						.map(s => s.trim())
						.filter(Boolean)
				).then(names =>
					names.length
						? ok({ names } as Names)
						: err(new Error('Failed to generate names.'))
				),
			e => err(e instanceof Error ? e : new Error('Failed to generate names.'))
		);
	});
}

const DEV_PROMPT = `You are NAMESMITH, an autonomous naming micro-service for tabletop roleplaying games.

Follow EVERY rule precisely:

1. The user supplies JSON instructions. Parse them literally. Fields include task, quantity, genre, language, gender, subjects (with descriptors), optional examples, and constraints.
   • Ignore any fields that are null or absent.
   • For each subject entry, create exactly one distinct name inspired by the descriptor + base.
   • Use the provided genre, language, and gender cues to shape phonetics and tone.

2. Output exactly \`constraints.outputLines\` names.
   • Preserve the order of \`subjects\`.
   • One name per line. No numbering, bullets, or blank lines.
   • Only ASCII letters plus apostrophes (') or hyphens (-) when needed.

3. Novelty requirements:
   • Do NOT reuse any name listed in \`constraints.disallowExamples\`.
   • Ensure each generated name has a different root or opening syllable from the others in this batch.
   • Avoid obvious conjunctions of the same base word with minor suffix changes.

4. The optional examples are inspiration only—never repeat them verbatim.

5. No apologies, explanations, or commentary. Output the names only.
`;
