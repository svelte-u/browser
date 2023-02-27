import { to_writable } from "@sveu/shared"

import { raf_fn } from "../raf_fn"
import type { FpsOptions } from "../utils"

/**
 * Reactive FPS (frames per second)
 *
 * @param options - Options
 * - `every` - Calculate the FPS on every x frames. Default: `10`
 *
 * @returns Readable store
 */
export function fps(options: FpsOptions = {}) {
	const { subscribe, set } = to_writable(0)

	if (typeof performance === "undefined") return { subscribe }

	const every = options?.every ?? 10

	let last = performance.now()

	let ticks = 0

	raf_fn(() => {
		ticks += 1

		if (ticks >= every) {
			const now = performance.now()

			const diff = now - last

			set(Math.round(1000 / (diff / ticks)))

			last = now

			ticks = 0
		}
	})

	return { subscribe }
}
