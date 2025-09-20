## @rpgm/tools – AI Assistant Implementation Guide

Purpose: Shared TypeScript library consumed by Foundry modules and Nexicore. Provides provider abstraction, generated OpenAPI client, and core module base classes. Keep edits additive and consistent with existing export surface.

1. Build & Outputs
	Scripts: `pnpm build` = clean (rimraf) + `tsc -b` + `tsc-alias`. Generated dist mirrors source path. Never import from `src` in downstream apps—always from published export paths.
2. Public Exports
	Defined in package.json `exports`: root (shared), `./client` (OpenAPI client), `./forge`, `./vault`. When adding a new domain export create matching `dist/<domain>/src/index.js` structure.
3. OpenAPI Client Generation
	Run `pnpm openapi` with env `OPENAPI_INPUT=<spec URL or path>`. Generation target: `shared/src/client/` (files: client.gen.ts, sdk.gen.ts, types.gen.ts). NEVER hand edit generated files—extend via wrappers colocated outside `client/`.
4. Provider Architecture
	`shared/src/tools.ts`: `AbstractTools` manages text providers. Built-in providers list in `PROVIDERS`; DIY providers in `DIY_PROVIDERS` (openai-compatible by default). To add a new provider implement `create({ apiKey, baseURL, name })` returning a ProviderV2; optional `fetchModels` for dynamic model list.
5. Model Slugs
	Internal text model union `RpgmModels` currently: names, descriptions, homebrew. Keep slugs stable; coordinate any additions with Nexicore completion endpoint mapping before merging.
6. Structured Output Support
	Monkey patch at bottom of tools.ts forces `supportsStructuredOutputs = true` on OpenAICompatibleChatLanguageModel. Reuse; do not introduce parallel patch logic.
7. Logger Pattern
	`shared/src/logger.ts` exposes chainable logger: `logger.visible.styled('...').log('Message');`. For user-visible messages call `visible` so the optional UI hook can surface it. Avoid adding console formatting patterns outside this utility.
8. Module Abstractions
	`shared/src/module.ts` defines `AbstractRpgmModule` and `AbstractTools` to standardize settings retrieval and saving. New module types should extend these rather than reinventing persistence or logging.
9. Settings Access
	Use the generic `SettingsMap` interface for strongly typed `get/set` operations instead of direct object mutation. This keeps downstream modules consistent.
10. Error Handling
	Prefer returning `neverthrow` Result (`ok/err`) where user-facing operations may fail (see `textAiFromModel`). Maintain this pattern instead of throwing raw errors in new helper functions.
11. Adding A New Export Surface
	Steps: (a) create path src/domain-name/index.ts (b) re-export public symbols (c) add build artifacts path guard if necessary (d) append to package.json exports map (e) document usage in consumer repo PR.
12. Dependency Discipline
	Keep runtime deps minimal (ai sdk, slugify). Heavy or optional tooling belongs in devDependencies. Avoid adding framework-specific code here—this package must stay environment-agnostic (Node + browser where possible).
13. Versioning & Downstream Sync
	If changing public types consumed in Foundry or Nexicore, propose a DR (see loremaster) if it alters domain terminology; otherwise bump version and note migration instructions in commit body.
14. Safe Change Checklist
	Does it alter a public export? Update exports map + mention in PR. New provider? Add mapping + doc comment. New model slug? Coordinate Nexicore mapping first. Generated client touched? Regenerate, don’t patch manually.

Respond to prompts with concrete file references (e.g., tools/shared/src/tools.ts) and existing patterns; avoid speculative refactors.