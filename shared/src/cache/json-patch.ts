/**
 * File: json-patch.ts
 * Purpose: Lightweight JSON Patch helper tuned for the CrystalCache module.
 * Updated: 2025-10-07
 */

import type { JsonObject, JsonValue, JsonPatchOperation } from './types';
import { CrystalCacheError } from './errors';

function toSegments(path: string): string[] {
	if (path === '') {
		return [];
	}
	if (!path.startsWith('/')) {
		throw new CrystalCacheError(`JSON Pointer must start with '/': ${path}`);
	}
	const parts = path.split('/');
	parts.shift();
	return parts.map(segment => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function clone<T>(value: T): T {
	if (typeof structuredClone === 'function') {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value)) as T;
}

function readPointer(root: JsonValue, segments: string[]): JsonValue {
	if (segments.length === 0) {
		return root;
	}
	let current: JsonValue = root;
	for (const segment of segments) {
		if (Array.isArray(current)) {
			const index = segment === '-' ? current.length : Number(segment);
			if (!Number.isInteger(index) || index < 0 || index >= current.length) {
				throw new CrystalCacheError(
					`JSON Pointer segment out of bounds: ${segment}`
				);
			}
			current = current[index] as JsonValue;
			continue;
		}
		if (
			typeof current === 'object' &&
			current !== null &&
			segment in (current as JsonObject)
		) {
			current = (current as JsonObject)[segment] as JsonValue;
			continue;
		}
		throw new CrystalCacheError(`JSON Pointer segment missing: ${segment}`);
	}
	return current;
}

function getContainer(
	root: JsonValue,
	segments: string[]
): { container: JsonValue; key: string | null } {
	if (segments.length === 0) {
		return { container: root, key: null };
	}
	const parentSegments = segments.slice(0, -1);
	const parent = readPointer(root, parentSegments);
	return { container: parent, key: segments[segments.length - 1] ?? null };
}

export function applyJsonPatch<T extends JsonValue>(
	document: T,
	operations: JsonPatchOperation[]
): T {
	let working: JsonValue = clone(document);
	for (const operation of operations) {
		const segments = toSegments(operation.path);
		if (operation.op === 'test') {
			const currentValue = readPointer(working, segments);
			const matches =
				JSON.stringify(currentValue) === JSON.stringify(operation.value);
			if (!matches) {
				throw new CrystalCacheError(
					`JSON Patch test operation failed at path ${operation.path}`
				);
			}
			continue;
		}
		if (operation.op === 'remove') {
			const { container, key } = getContainer(working, segments);
			if (key === null) {
				working = undefined as unknown as JsonValue;
			} else if (Array.isArray(container)) {
				const index = key === '-' ? container.length - 1 : Number(key);
				if (
					!Number.isInteger(index) ||
					index < 0 ||
					index >= container.length
				) {
					throw new CrystalCacheError(
						`JSON Patch remove index invalid at ${operation.path}`
					);
				}
				(container as JsonValue[]).splice(index, 1);
			} else if (
				typeof container === 'object' &&
				container !== null &&
				key in (container as JsonObject)
			) {
				delete (container as JsonObject)[key];
			} else {
				throw new CrystalCacheError(
					`JSON Patch remove target missing at ${operation.path}`
				);
			}
			continue;
		}
		if (operation.op === 'add' || operation.op === 'replace') {
			const { container, key } = getContainer(working, segments);
			const valueClone = clone(operation.value);
			if (key === null) {
				working = valueClone as JsonValue;
				continue;
			}
			if (Array.isArray(container)) {
				const index = key === '-' ? container.length : Number(key);
				if (!Number.isInteger(index) || index < 0 || index > container.length) {
					throw new CrystalCacheError(
						`JSON Patch array index invalid at ${operation.path}`
					);
				}
				if (operation.op === 'replace' && index === container.length) {
					throw new CrystalCacheError(
						`JSON Patch replace requires existing index at ${operation.path}`
					);
				}
				if (operation.op === 'replace') {
					(container as JsonValue[])[index] = valueClone as JsonValue;
				} else {
					(container as JsonValue[]).splice(index, 0, valueClone as JsonValue);
				}
				continue;
			}
			if (typeof container === 'object' && container !== null) {
				(container as JsonObject)[key] = valueClone as JsonValue;
				continue;
			}
			throw new CrystalCacheError(
				`JSON Patch cannot target non-container at ${operation.path}`
			);
		}
		throw new CrystalCacheError(
			`Unsupported JSON Patch operation: ${operation.op}`
		);
	}
	return working as T;
}
