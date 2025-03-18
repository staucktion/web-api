import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	{
		extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: "module",
		},

		rules: {
			semi: ["error", "always"],
			quotes: ["error", "double"],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					vars: "all",
					args: "after-used",
					varsIgnorePattern: "^_.",
					argsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
	},
]);
