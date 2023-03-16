import { browser, to_readable, to_writable } from "@sveu/shared"

import { on } from "../event_listener"

/**
 * Reactive window scroll.
 *
 * @returns
 * - `x`: A readable store with the current window scroll x position.
 * - `y`: A readable store with the current window scroll y position.
 */
export function window_scroll() {
	if (!browser) return { x: to_readable(0), y: to_readable(0) }

	const x = to_writable(window.scrollX)

	const y = to_writable(window.scrollY)

	on(
		window,
		"scroll",
		() => {
			x.set(window.scrollX)
			y.set(window.scrollY)
		},
		{
			capture: false,
			passive: true,
		}
	)

	return { x: to_readable(x), y: to_readable(y) }
}
