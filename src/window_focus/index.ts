import { browser, to_readable, to_writable } from "@sveu/shared"

import { on } from "../event_listener"

/**
 * Reactively track window focus with `window.onfocus` and `window.onblur`.
 *
 * @returns A readable store with the current window focus state.
 */
export function window_focus() {
	if (!browser) return to_readable(false)

	const { set, subscribe } = to_writable(window.document.hasFocus())

	on(window, "blur", () => set(false))

	on(window, "focus", () => set(true))

	return { subscribe }
}
