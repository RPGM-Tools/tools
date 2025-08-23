import eslint from '@eslint/js';
import tslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import jsdoclint from "eslint-plugin-jsdoc";
import stylistic from "@stylistic/eslint-plugin";

export default tslint.config([
	{
		extends: [
			eslint.configs.recommended,
			...tslint.configs.recommended,
			jsdoclint.configs['flat/stylistic-typescript'],
			jsdoclint.configs['flat/contents-typescript'],
		],
		files: ["**/*.ts"],
		languageOptions: {
			ecmaVersion: 'latest',
			parserOptions: {
				project: "./tsconfig.json",
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				parser: tslint.parser
			},
		},
		plugins: {
			"simple-import-sort": simpleImportSort,
			"@stylistic": stylistic
		},
		rules: {
			"@stylistic/semi": "warn",
			"@stylistic/quotes": ["warn", "single"],
			"no-console": "error",
			"prefer-const": "error",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: 'with-single-extends' }],
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{
					fixStyle: "separate-type-imports"
				}
			],
			"simple-import-sort/imports": "warn",
			"simple-import-sort/exports": "warn",
			"jsdoc/require-hyphen-before-param-description": ["warn", "always"],
			"@typescript-eslint/no-unused-vars": ["error", {
				"args": "all",
				"argsIgnorePattern": "^_",
				"caughtErrors": "all",
				"caughtErrorsIgnorePattern": "^_",
				"destructuredArrayIgnorePattern": "^_",
				"varsIgnorePattern": "^_",
				"ignoreRestSiblings": true
			}],
		}
	},
]);
