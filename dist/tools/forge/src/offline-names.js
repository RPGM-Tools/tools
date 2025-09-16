import { ResultAsync } from 'neverthrow';
let DATA;
const INDEX = new Map();
const GLOBAL = { first: [], last: [] };
function pickXRandomWeighted(arr, count) {
    let total = 0;
    for (const name of arr)
        total += name.weight;
    const result = [];
    for (let i = 0; i < count; i++) {
        let random = Math.random() * total;
        let tries = 0;
        for (const name of arr) {
            random -= name.weight;
            if (random < name.weight) {
                if (result.some(n => n.text === name.text) && tries++ < 10)
                    continue;
                result.push(name);
                break;
            }
        }
    }
    return result;
}
export function generateOfflineNames(input) {
    return ResultAsync.fromPromise((async () => {
        let { type, quantity, gender, } = input;
        if (!DATA) {
            DATA = (await import('../../forge/data/names-list.json')).default;
            for (const name of DATA.names) {
                const bucket = INDEX.get(name.type)
                    ?? INDEX.set(name.type, { first: [], last: [] }).get(name.type);
                bucket[name.position].push(name);
                GLOBAL[name.position].push(name);
            }
        }
        type = type.toLowerCase();
        const typeList = INDEX.get(type)?.["first"] ?? [];
        let baseList = typeList && typeList.length ? typeList : GLOBAL["first"];
        if (gender) {
            const filtered = baseList.filter(n => n.gender === gender);
            if (filtered.length)
                baseList = filtered;
        }
        const result = pickXRandomWeighted(baseList, quantity);
        return {
            names: result.map(n => n.text),
        };
    })(), () => new Error("Offline data could not be loaded"));
}
