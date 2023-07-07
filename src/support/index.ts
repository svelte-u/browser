import type { Readable } from "svelte/store"

import { browser, toWritable } from "@sveu/shared"

/**
 * Check if a feature is supported in the current browser.
 *
 * @param feature - The feature to check for.
 *
 * @param from - The object to check for the feature in.
 *
 * @example
 * ```ts
 * const supported = support("serviceWorker")
 * ```
 *
 * @example
 * ```ts
 * const supported = support("screen", "window")
 * ```
 *
 * @returns A readable store with the result.
 */
export function support(
	feature: string,
	from: "navigator" | "window" | "document" | "performance" = "navigator"
): Readable<boolean> {
	const { subscribe, set } = toWritable(false)

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
