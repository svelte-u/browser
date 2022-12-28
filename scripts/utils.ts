import fs from "fs-extra"
import fg from "fast-glob"
import path from "path"

import { readdir } from "fs/promises"
import { fileURLToPath as file_url_to_path } from "url"

const current_path = path.dirname(file_url_to_path(import.meta.url))

export const DIR_ROOT = path.resolve(current_path, "../")
export const DIR_SRC = path.resolve(DIR_ROOT, "src")

/**
 *
 * @param {Record<string, any>[]} list the list of items to group.
 * @param {(item: Record<string, any>) => any} fn the function to group by.
 * @returns the grouped item.
 */
export function group(
	list: Record<string, any>[],
	fn: (item: Record<string, any>) => any
) {
	return list.reduce((acc, item) => {
		const id = fn(item)
		const groupList = acc[id] ?? []
		return { ...acc, [id]: [...groupList, item] }
	}, {}) satisfies Record<string, any>
}

interface ListFunctions {
	name: string
	path: string
	module: string
}

/**
 *
 * @param {string} dir The directory to search.
 * @param {string[]} files The files to search.
 * @returns {Submodule} The submodules.
 */
async function get_submodules(dir: string, files: string[]) {
	const submodules = []

	for (const file of files) {
		const filepath = path.join(dir, file)

		for await (const target of await readdir(filepath, {
			withFileTypes: true,
		})) {
			if (target.isDirectory()) {
				submodules.push({
					name: target.name,
					path: path.join(filepath, target.name, "index.ts"),
					module: file,
				})
			}
		}
	}
	return submodules satisfies ListFunctions[]
}

/**
 *
 * @param {string} dir path to directory.
 * @param {string[]} ignore list of directories to ignore.
 * @returns {Promise<Record<string, string[]>>} list of functions.
 */
export async function list_functions(dir: string, ignore: string[] = []) {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: dir,
		ignore: ["_*", "dist", "node_modules", ...ignore],
	})

	const submodules = group(await get_submodules(dir, files), (f) => f.module)

	files.sort()

	files = files.filter((r) => {
		return !Object.keys(submodules).includes(r)
	})

	const index: ListFunctions[] = []

	await Promise.all(
		files.map(async (name) => {
			const tsPath = path.join(DIR_SRC, name, "index.ts")

			index.push({
				name: name,
				path: tsPath,
				module: "index",
			})
		})
	)

	const functions = { ...submodules, index: [...index] }

	return functions as Record<string, ListFunctions[]>
}

export async function update_package_json(exports: Record<string, any>) {
	const package_json_path = path.join(DIR_ROOT, "package.json")

	const pkg = await fs.readJSON(package_json_path)

	pkg.exports = exports

	await fs.writeJSON(package_json_path, pkg, { spaces: 4 })
}

export async function clear() {
	const files = await fg(["*.js", "*.d.ts"], {
		cwd: DIR_ROOT,
		ignore: ["_*", "dist", "node_modules"],
	})

	for (const file of files) {
		const filepath = path.join(DIR_ROOT, file)
		await fs.remove(filepath)
	}
}
