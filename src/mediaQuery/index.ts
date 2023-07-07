import { browser, toReadable, toWritable, unstore } from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"

/**
 * Reactive Media Query.
 *
 * @param query - Media Query
 *
 * @example
 * ```ts
 * const { subscribe } = mediaQuery("(min-width: 768px)")
 * ```
 *
 * @returns Readable Store
 *
 */
export function mediaQuery(query: string) {
	if (!browser) return toReadable(false)

	const supported = support("matchMedia", "window")

	if (!unstore(supported)) return toReadable(false)

	const { subscribe, set } = toWritable(false)

	const media_query: MediaQueryList | undefined = window.matchMedia(query)

	function handler(event: MediaQueryListEvent) {
		set(event.matches)
	}

	set(media_query.matches)

	on(media_query, "change", handler)

	return { subscribe }
}
