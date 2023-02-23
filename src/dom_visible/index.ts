import type { Readable } from "svelte/store"

import { browser, to_writable } from "@sveu/shared"

import { on } from "../event_listener"

/**
 * Reactive `document.visibilityState`
 *
 * @returns A readable store with the current visibility state.
 */
export function dom_visible(): Readable<DocumentVisibilityState> {
	if (!browser) return to_writable("hidden")

	const { subscribe, set } = to_writable<DocumentVisibilityState>(
		document.visibilityState
	)

	function handler() {
		if (document) set(document.visibilityState)
	}

	on(document, "visibilitychange", handler, true)

	return { subscribe }
}
