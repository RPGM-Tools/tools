import { ResultAsync } from 'neverthrow';
let ADJECTIVES = null;
const RECENT = [];
const RECENT_LIMIT = 100;
async function ensureLoaded() {
    if (!ADJECTIVES) {
        // ADJECTIVES = (await import('@rpgm/forge/data/adjectives-list.json')).default.adjectives as string[];
    }
}
function pickUnique(count) {
    if (!ADJECTIVES)
        return [];
    const result = [];
    let attempts = 0;
    while (result.length < count && attempts < count * 25) {
        attempts++;
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        if (result.includes(adj))
            continue;
        if (RECENT.includes(adj) && Math.random() < 0.7)
            continue;
        result.push(adj);
    }
    for (const a of result) {
        RECENT.push(a);
        if (RECENT.length > RECENT_LIMIT)
            RECENT.shift();
    }
    return result;
}
export function generateAdjectiveNames(options) {
    return ResultAsync.fromPromise((async () => {
        await ensureLoaded();
        const base = (options.type || '').trim();
        if (!base)
            return { names: [] };
        const adjectives = pickUnique(options.quantity || 1);
        return { names: adjectives.map(a => `${a} ${base}`) };
    })(), () => new Error('Adjectives data could not be loaded'));
}
