import { browser, toReadable, toWritable } from "@sveu/shared"

import { on } from "../eventListener"

/**
 * Reactive window scroll.
 *
 * @example
 * ```ts
 * const { x, y } = windowScroll()
 * ```
 *
 * @returns
 * - `x`: A readable store with the current window scroll x position.
 * - `y`: A readable store with the current window scroll y position.
 */
export function windowScroll() {
	if (!browser) return { x: toReadable(0), y: toReadable(0) }

	const x = toWritable(window.scrollX)

	const y = toWritable(window.scrollY)

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

	return { x: toReadable(x), y: toReadable(y) }
}
