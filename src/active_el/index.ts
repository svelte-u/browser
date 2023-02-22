import { browser, to_writable } from "@sveu/shared"

import { on } from "../event_listener"

/**
 * Reactive `document.activeElement`
 *
 * @returns A readable store with the current active element.
 */
export function active_el<T extends HTMLElement>() {
	const { set, subscribe } = to_writable<T | null>(
		(document?.activeElement as T) || null
	)

	function handler() {
		set((document?.activeElement as T) || null)
	}

	if (browser) {
		on(
			window,
			"blur",
			(event) => {
				if (event.relatedTarget !== null) return

				handler()
			},
			true
		)

		on(window, "focus", handler, true)
	}

	return { subscribe }
}
