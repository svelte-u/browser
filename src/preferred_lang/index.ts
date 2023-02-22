import { to_readable, to_writable } from "@sveu/shared"

import { on } from "../event_listener"

/**
 * Reactive Navigator Languages.
 *
 * @returns Readable Store
 */
export function preferred_lang() {
	if (!window) return to_readable(["en"])

	const navigator = window.navigator

	const { subscribe, set } = to_writable<readonly string[]>(
		navigator.languages
	)

	on(window, "languagechange", () => {
		set(navigator.languages)
	})

	return { subscribe }
}
