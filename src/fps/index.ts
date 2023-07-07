import { toWritable } from "@sveu/shared"

import { rafFn } from "../rafFn"
import type { FpsOptions } from "../utils"

/**
 * Reactive FPS (frames per second)
 *
 * @param options - Options
 * - `every` - Calculate the FPS on every x frames. Default: `10`
 *
 * @example
 * ```ts
 * const fps = fps()
 * ```
 *
 * @example
 * ```ts
 * const fps = fps({ every: 60 })
 * ```
 *
 * @returns Readable store
 */
export function fps(options: FpsOptions = {}) {
	const { subscribe, set } = toWritable(0)

	if (typeof performance === "undefined") return { subscribe }

	const every = options?.every ?? 10

	let last = performance.now()

	let ticks = 0

	rafFn(() => {
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
