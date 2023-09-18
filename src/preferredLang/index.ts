import { browser, toReadable, toWritable } from "@sveu/shared"

import { on } from "../eventListener"

/**
 * Reactive Navigator Languages.
 *
 * @example
 * ```ts
 * const state = preferredLang()
 * ```
 *
 * @returns Readable Store
 */
export function preferredLang() {
	if (!browser) return toReadable(["en"])

	const navigator = window.navigator

	const { subscribe, set } = toWritable<readonly string[]>(
		navigator.languages
	)

	on(window, "languagechange", () => {
		set(navigator.languages)
	})

	return { subscribe }
}
