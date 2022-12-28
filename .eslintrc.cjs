module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	plugins: ["@typescript-eslint", "eslint-plugin-tsdoc"],
	env: {
		browser: true,
		node: true,
	},
	rules: {
		camelcase: "off",
		"@typescript-eslint/no-explicit-any": "off",
		"tsdoc/syntax": "warn",
	},
}
