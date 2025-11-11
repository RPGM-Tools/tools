/**
 * File: validation.ts
 * Purpose: Lore Crystal validation wired to the canonical JSON Schema via Ajv.
 * Updated: 2025-10-07
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schema/lorecrystal.schema.json';
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
export function validateLoreCrystal(payload) {
    const valid = validate(payload);
    if (valid) {
        return { valid: true, issues: [] };
    }
    const issues = (validate.errors ?? []).map((err) => ({
        path: err.instancePath || err.schemaPath,
        message: err.message ?? 'Validation error'
    }));
    return {
        valid: false,
        issues
    };
}
