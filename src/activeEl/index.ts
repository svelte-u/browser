import { browser, toWritable } from "@sveu/shared"

import { on } from "../eventListener"

/**
 * Reactive `document.activeElement`
 *
 * @example
 * ```ts
 * const activeElement = activeEl()
 * $: console.log($activeElement)
 * ```
 *
 * @returns A readable store with the current active element.
 */
export function activeEl<T extends HTMLElement>() {
	const { set, subscribe } = toWritable<T | null>(
		browser ? (document?.activeElement as T) : null
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
