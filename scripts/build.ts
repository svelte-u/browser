import fs from "fs-extra"
import path from "path"

import { DIR_ROOT, DIR_SRC, list_functions, update_package_json } from "./utils"

async function run() {
	const functions = await list_functions(DIR_SRC)

	const modules = Object.keys(functions)

	const pkg_exports: Record<string, any> = {
		".": {
			import: "./index.js",
		},
	}

	const metadata: Record<string, any> = { total: 0, packages: {} }

	for (const module of modules) {
		const module_path = path.join(DIR_SRC, module === "index" ? "" : module)

		const module_functions = functions[module]

		metadata.total += module_functions.length

		const imports: string[] = []

		module_functions.map((f) => {
			imports.push(`export * from "./${f.name}"`)
		})

		await fs.writeFile(
			path.join(module_path, "index.ts"),
			`${imports.join("\n")}\n`
		)

		metadata.packages[module] = module_functions.map((f) => f.name)

		if (module !== "index") {
			pkg_exports[`./${module}`] = {
				import: `./${module}.js`,
			}
		}
	}

	await fs.writeFile(
		path.join(DIR_ROOT, "metadata.json"),
		JSON.stringify(metadata, null, 4)
	)

	await update_package_json(pkg_exports)
}

run()
