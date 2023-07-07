import { browser, toReadable, toWritable } from "@sveu/shared"

import { on } from "../eventListener"
import type { WindowSizeOptions } from "../utils"

/**
 * Reactive window size.
 *
 * @param options - Options
 * - `initialWidth` - The initial width of the window.
 * - `initialHeight` - The initial height of the window.
 * - `orientation` - Whether to use the `orientationchange`.
 * - `scrollbar` - Whether the scrollbar should be included in the width and height.
 *
 * @example
 * ```ts
 * const { width, height } = windowSize()
 * ```
 *
 * @example
 * ```ts
 * const { width, height } = windowSize({
 * 	initialWidth: 0,
 * 	initialHeight: 0,
 * 	orientation: true,
 * 	scrollbar: true,
 * })
 * ```
 *
 * @returns
 * - `width`: A readable store with the current window width.
 * - `height`: A readable store with the current window height.
 */
export function windowSize(options: WindowSizeOptions = {}) {
	const {
		initialWidth = Infinity,
		initialHeight = Infinity,
		orientation = true,
		scrollbar = true,
	} = options
	if (!browser) return { width: toReadable(0), height: toReadable(0) }

	const width = toWritable(initialWidth)

	const height = toWritable(initialHeight)

	const update = () => {
		if (scrollbar) {
			width.set(window.innerWidth)

			height.set(window.innerHeight)
		} else {
			width.set(window.document.documentElement.clientWidth)

			height.set(window.document.documentElement.clientHeight)
		}
	}

	update()

	on("resize", update, { passive: true })

	if (orientation) on("orientationchange", update, { passive: true })

	return { width, height }
}
