/**
 * File: validation.ts
 * Purpose: Lore Crystal validation wired to the canonical JSON Schema via Ajv.
 * Updated: 2025-10-07
 */

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schema/lorecrystal.schema.json';
import type { LoreCrystal, ValidationIssue, ValidationResult } from './types';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate: ValidateFunction = ajv.compile(schema);

export function validateLoreCrystal(payload: LoreCrystal): ValidationResult {
	const valid = validate(payload);
	if (valid) {
		return { valid: true, issues: [] };
	}
	const issues: ValidationIssue[] = (validate.errors ?? []).map(
		(err: ErrorObject) => ({
			path: err.instancePath || err.schemaPath,
			message: err.message ?? 'Validation error'
		})
	);
	return {
		valid: false,
		issues
	};
}
