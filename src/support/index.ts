import type { Readable } from "svelte/store"

import { browser, to_writable } from "@sveu/shared"

/**
 * Check if a feature is supported in the current browser.
 *
 * @param feature - The feature to check for.
 *
 * @param from - The object to check for the feature in.
 *
 * @returns A readable store with the result.
 *
 */
export function support(
	feature: string,
	from: "navigator" | "window" | "document" | "performance" = "navigator"
): Readable<boolean> {
	const { subscribe, set } = to_writable(false)

	if (browser) {
		const _from =
			from === "navigator"
				? navigator
				: from === "window"
				? window
				: from === "document"
				? document
				: performance

		set(_from && feature in _from)
	}

	return { subscribe }
}
