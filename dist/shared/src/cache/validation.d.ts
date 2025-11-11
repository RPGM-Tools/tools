/**
 * File: validation.ts
 * Purpose: Lore Crystal validation wired to the canonical JSON Schema via Ajv.
 * Updated: 2025-10-07
 */
import type { LoreCrystal, ValidationResult } from './types';
export declare function validateLoreCrystal(payload: LoreCrystal): ValidationResult;
