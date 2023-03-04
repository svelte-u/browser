import { browser, to_readable, to_writable, unstore } from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"

/**
 * Reactive Media Query.
 *
 * @param query - Media Query
 *
 * @returns Readable Store
 *
 */
export function media_query(query: string) {
	if (!browser) return to_readable(false)

	const supported = support("matchMedia", "window")

	if (!unstore(supported)) return to_readable(false)

	const { subscribe, set } = to_writable(false)

	const media_query: MediaQueryList | undefined = window.matchMedia(query)

	function handler(event: MediaQueryListEvent) {
		set(event.matches)
	}

	set(media_query.matches)

	on(media_query, "change", handler)

	return { subscribe }
}
