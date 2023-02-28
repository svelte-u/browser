import { browser, to_readable, to_writable } from "@sveu/shared"

import { on } from "../event_listener"
import type { WindowSizeOptions } from "../utils"

/**
 * Reactive window size.
 *
 * @param options - Options
 * - `initial_width` - The initial width of the window.
 * - `initial_height` - The initial height of the window.
 * - `orientation` - Whether to use the `orientationchange`.
 * - `scrollbar` - Whether the scrollbar should be included in the width and height.
 *
 * @returns
 * - `width`: A readable store with the current window width.
 * - `height`: A readable store with the current window height.
 */
export function window_size(options: WindowSizeOptions = {}) {
	const {
		initial_width = Infinity,
		initial_height = Infinity,
		orientation = true,
		scrollbar = true,
	} = options
	if (!browser) return { width: to_readable(0), height: to_readable(0) }

	const width = to_writable(initial_width)

	const height = to_writable(initial_height)

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
