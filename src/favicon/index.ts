import { is_string, watchable } from "@sveu/shared"

import type { FaviconOptions } from "../utils"

/**
 * Reactive favicon.
 *
 * @param icon - The icon to use.
 *
 * @param options - Options to use:
 * - `base_url` - The base url to prepend to the favicon.
 * - `rel` - The rel attribute of the favicon.
 *
 * @returns A watchable store of the favicon.
 */
export function favicon(
	icon?: string | null | undefined,
	options: FaviconOptions = {}
) {
	const { base_url = "/", rel = "icon" } = options

	function apply_icon(icon: string) {
		document?.head
			.querySelectorAll<HTMLLinkElement>(`link[rel*="${rel}"]`)
			.forEach((el) => (el.href = `${base_url}${icon}`))
	}

	const favicon = watchable(icon, (o, n) => {
		if (!!n && is_string(n) && o !== n) apply_icon(n)
	})

	return favicon
}
