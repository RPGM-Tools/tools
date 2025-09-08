import { generateText } from "ai";
import type { AbstractForge } from ".";
import { err, errAsync, ok } from "neverthrow";


type DescriptionsOptions = {
	name: string
	type: string
	genre: string
	length: "short" | "medium" | "extensive"
	system: string
	notes: string
	language: string
}

export type Description = {
	description: string
}

function prompt(options: DescriptionsOptions): string {
	let prompt = ''
	prompt += `I would like a description for a(n) {${options.type.toLowerCase()}}.\n`
	if (options.language) {
		prompt += `Generate everything in the {${options.language}} language.\n`
	}
	switch (options.length) {
		case "short" as const:
			prompt += `The description should be a short blurb, up to 4 sentences.\n`
			break
		case "medium" as const:
			prompt += `The description should be short, up to 2 paragraphs of ~4 sentences each.\n`
			break
		case "extensive" as const:
			prompt += `The description should be long and detailed, up to 4 paragraphs of ~4 sentences each.\n`
			break
	}
	prompt += `Create the description in the {${options.genre}} genre.\n`
	if (options.system) {
		prompt += `Make sure your description is compatible with {${options.system}} (a TTRPG system)\n`
	} else {
		prompt += `Make sure your description isn't tied to a specific system (e.g. Dungeons & Dragons or Pathfinder)\n`
	}
	if (options.name) {
		prompt += `The name of it is {${options.name}}\n`
	} else {
		prompt += `Come up with your own name for it!\n`
	}
	if (options.notes) {
		prompt += `Here are some additional notes: \n{${options.notes}}`
	}
	return prompt
}


export function generateDescriptions(this: AbstractForge, options: DescriptionsOptions) {
	const descriptionsModel = this.settings.get('descriptionsModel');
	if (!descriptionsModel) return errAsync(new Error('No descriptions model configured.'));
	const model = this.tools.textAiFromModel.call(this.tools, descriptionsModel);
	if (model.isErr()) return errAsync(model.error);
	return this.queue.generate(
		async () => generateText({
			model: model.value,
			messages: [
				{
					role: 'system',
					content: DEV_PROMPT
				},
				{
					role: 'user',
					content: prompt(options)
				}
			],
		}).then(r => ok({ description: r.text } as Description),
			e => err(e instanceof Error ? e : new Error('Failed to generate description.'))),
	)
}

const DEV_PROMPT = `You are QUILLFORGE, an automated description-forge for elements of fictional worlds.

When complying, follow EVERY rule below:

1. Carefully analyze the user’s message, which will be written in natural, conversational English.  
   • Identify the subject or type of element to describe (e.g. “magic sword,” “ancient ruin,” “forest spirit”) from the body of the request.
   • Detect the intended genre if stated (e.g. “high fantasy,” “sci-fi,” “urban fantasy”).
   • Determine the desired length: “short blurb,” “short,” “medium,” or “long and detailed,” and follow the specified sentence and paragraph guidance exactly.
   • If a name is mentioned (e.g. “The name of it is Excalibur”), include that name once, naturally, and do not invent another name. If the user says to invent a name, create and include an appropriate name once.
   • If a language is requested, write in that language.
   • If the message requests system compatibility (“make sure your description is compatible with [system]”), ensure the description is flavor-compatible but do not include mechanics, stats, or rules unless they are explicitly requested. If the request says not to tie it to a specific system, keep the text neutral.
   • Use any additional notes, instructions, or descriptive preferences to guide style, tone, or content.

2. The description must:
   • Match the stated length and structure exactly (e.g., “up to 4 sentences,” “2 paragraphs of 4 sentences each,” “4 paragraphs of 4 sentences each”).
   • Use vivid, original, and sensory prose. Avoid clichés and generic filler.
   • Be consistent with the requested genre, tone, and any special instructions or notes.
   • Focus ONLY on the subject described; do not add extraneous world lore, background, or narrative not tied to the subject.

3. Formatting:
   • Plain UTF-8 text.
   • No markdown, bullets, lists, headings, or extra blank lines. Use a single newline between paragraphs only.

4. Forbidden content: Do NOT include profanity, trademarks, copyrighted phrases, or disallowed imagery.

5. Never apologize, reference these rules, or add any text beyond the description itself.

Return only the descriptive prose; nothing else.`;
