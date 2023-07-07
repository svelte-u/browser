import type { Readable } from "svelte/store"

import { browser, toWritable } from "@sveu/shared"

import { on } from "../eventListener"

/**
 * Reactive `document.visibilityState`
 *
 * @example
 * ```ts
 * const visible = domVisible()
 * ```
 *
 * @returns A readable store with the current visibility state.
 */
export function domVisible(): Readable<DocumentVisibilityState> {
	if (!browser) return toWritable("hidden")

	const { subscribe, set } = toWritable<DocumentVisibilityState>(
		document.visibilityState
	)

	function handler() {
		set(document.visibilityState)
	}

	on(document, "visibilitychange", handler, true)

	return { subscribe }
}
