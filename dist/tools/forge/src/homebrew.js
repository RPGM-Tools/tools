import { generateObject, jsonSchema } from "ai";
import slugify from "slugify";
import { err, ok } from "neverthrow";
function typeString(type) {
    switch (type) {
        case "number": return type;
        case "boolean": return type;
        case "short": return "two sentences";
        case "long": return "three paragraphs";
    }
}
function prompt(options) {
    return [
        `Generate a(n) {${options.schema.name}} in json format.`,
        ...options.language ? [`Generate everything in the {${options.language}} language`] : [],
        options.schema.custom_name ? `The name of the thing being generated is {${options.schema.custom_name}}`
            : `Generate the name for the {${options.schema.name}}`,
        options.system ? `Make sure your {${options.schema.name}} is compatible with {${options.system}} (a TTRPG system)`
            : `Make sure your {${options.schema.name}} isn't tied to a specific system (e.g. Dungeons & Dragons or Pathfinder)`,
        options.genre ? `Create the ${options.schema.name} in the {${options.genre}} genre` : "",
        "Fields:\n",
        options.schema.fields
            .map(f => `"${f.name}": (${typeString(f.type)}) = ${f.value === undefined || f.value === false ? "{generate}" : `"${f.value}"`}`)
            .join("\n")
    ].join("\n");
}
export function generateHomebrew(options) {
    return this.queue.generate(async () => generateObject({
        model: this.tools.ai.languageModel(this.settings.ai.modelOverrides.homebrew || this.settings.ai.model),
        output: 'object',
        mode: 'json',
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
        schema: jsonSchema({
            type: 'object',
            title: options.schema.name,
            additionalProperties: false,
            properties: {
                name: {
                    title: 'Name',
                    type: 'string',
                    description: "The name of the thing being generated" + (options.schema.custom_name ? `, already specified: "${options.schema.custom_name}"` : ""),
                },
                flavor_text: {
                    title: "Flavor Text",
                    description: "A short hint/flavor/subtitle to display below the title",
                    type: "string"
                },
                fields: {
                    title: "Fields",
                    description: "The various fields to generate content for",
                    additionalProperties: false,
                    properties: Object.entries(options.schema.fields)
                        .reduce((obj, [, field]) => {
                        obj[slugify(field.name, { lower: true })] = {
                            "title": field.name,
                            "description": field.description,
                            "type": field.type === "short" || field.type === "long" ? "string" : field.type,
                        };
                        return obj;
                    }, {}),
                    type: "object",
                    required: options.schema.fields.map(f => slugify(f.name, { lower: true }))
                }
            },
            required: ['name', 'flavor_text', 'fields']
        })
    }).then(({ object }) => {
        const output = {
            name: options.schema.name,
            custom_name: object.name,
            flavor_text: object.flavor_text,
            fields: []
        };
        // Regenerate the fields by matching the names
        for (const field of options.schema.fields) {
            for (const [k, v] of Object.entries(object.fields)) {
                if (slugify(field.name, { lower: true }) === k) {
                    // Type casting to make TS happy
                    output.fields.push({
                        ...field,
                        type: field.type,
                        value: v
                    });
                }
            }
        }
        return ok(output);
    }, e => err(e instanceof Error ? e : new Error('Failed to generate homebrew.'))));
}
const DEV_PROMPT = `You are QUILLFORGE, an automated description-forge for elements of fictional worlds.

Respond ONLY if the user’s message clearly requests a description for a fictional subject (e.g. “I would like a description for a(n) ...” or similar phrasing).

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
