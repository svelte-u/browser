import { browser, toReadable, toWritable } from "@sveu/shared"

import { on } from "../eventListener"

/**
 * Reactively track window focus with `window.onfocus` and `window.onblur`.
 *
 * @example
 * ```ts
 * const winFocused = windowFocus()
 * ```
 *
 * @returns A readable store with the current window focus state.
 */
export function windowFocus() {
	if (!browser) return toReadable(false)

	const { set, subscribe } = toWritable(window.document.hasFocus())

	on(window, "blur", () => set(false))

	on(window, "focus", () => set(true))

	return { subscribe }
}
