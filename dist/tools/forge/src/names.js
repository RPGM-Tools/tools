import { err, errAsync, ok } from 'neverthrow';
import { generateText } from 'ai';
import { generateOfflineNames } from './offline-names';
import { generateAdjectiveNames } from './adjective-names';
function prompt(options) {
    let prompt = '';
    prompt += `Generate ${options.quantity} name(s) for a {${options.type}} in the {${options.genre}} genre.\n`;
    if (options.language) {
        prompt += `Generate in the {${options.language}} language.`;
    }
    return prompt;
}
export function generateNames(options) {
    const provider = this.settings.get('namesModel')?.provider;
    if (provider === 'offline') {
        return generateOfflineNames(options);
    }
    if (provider === 'adjective') {
        return generateAdjectiveNames(options);
    }
    const namesModel = this.settings.get('namesModel');
    if (!namesModel)
        return errAsync(new Error('No names model configured.'));
    const model = this.tools.textAiFromModel.call(this.tools, namesModel);
    if (model.isErr())
        return errAsync(model.error);
    return this.queue.generate(async () => {
        return generateText({
            model: model.value,
            maxRetries: 0,
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
        }).then(({ text }) => Promise.resolve(text
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)).then(names => names.length ? ok({ names }) : err(new Error('Failed to generate names.'))), e => err(e instanceof Error ? e : new Error('Failed to generate names.')));
    });
}
const DEV_PROMPT = `
You are NAMESMITH, a deterministic naming micro-service for fantasy settings.

When complying, follow EVERY rule below:

1. Carefully extract these parameters from the user prompt (these are always present unless otherwise noted):
   • quantity: the exact number of unique names to generate.
   • type: the subject or entity to be named (e.g. “goblin”, “dwarf barbarian”, “dragon clan”, “elven city”, “magical artifact”).
   • genre: the genre of the setting (e.g. “high fantasy”, “sci-fi”, “prehistoric”).
   • language: (optional; if specified, bias names to be pronounceable in the target language).

2. Output **exactly** the number of names specified by quantity (no more, no fewer).

3. Output one name per line, and nothing else.
   • Do NOT include bullets, numbering, additional punctuation, formatting, or blank lines.

4. Each generated name must adhere to the following rules:
   a. Clearly reflect the requested genre (e.g. “high fantasy” should sound fantastical; “sci-fi” should evoke futurism).
   b. Suit the specified type or subject (e.g. if type = “dragon clan”, names should feel like clan names).
   c. If a language is provided, ensure names are pronounceable in that language.
   d. Avoid any real-world trademarks, copyrighted names, or profanity.
   e. Be unique from one another within this response.
   f. Only use apostrophes (’) or hyphens (–) as internal punctuation; no other special characters.
   g. NOT repeat the type/subject at the end unless explicitly instructed.
   h. Each name must be as original and distinct as possible from well-known fantasy and real-world names, and from common prior responses. Favor unexpected combinations, rare syllables, or surprising motifs. Creativity and novelty are prioritized.
   i. In each response, strive to avoid names that have appeared in previous outputs for similar prompts—even if not explicitly tracked. Prioritize creative novelty and avoid safe, obvious, or overused choices.

6. Respond in plain UTF-8 text; do NOT apologize, explain, or add any commentary—just the names, one per line.
`;
