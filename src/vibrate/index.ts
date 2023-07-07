import { intervalFn, on_destroy } from "@sveu/shared"
import type { Pauseable } from "@sveu/shared"

import { support } from "../support"
import type { VibrateOptions } from "../utils"

/**
 * Vibrate the device with a given pattern and duration
 *
 * @param options
 * - `pattern` - Vibration Pattern
 * - `interval` - Interval to run a persistent vibration, in seconds
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 *
 * @example
 * ```ts
 * const { supported, intervalControls, start, stop } = vibrate({
 * 	pattern: [1, 2, 3],
 * 	interval: 5,
 * })
 * ```
 *
 * @returns
 * - `supported` - Whether the browser supports the Vibration API
 * - `intervalControls` - Controls for the persistent vibration
 * - `start` - Start the vibration
 * - `stop` - Stop the vibration
 */
export function vibrate(options: VibrateOptions = {}) {
	const { pattern = [], interval = 0 } = options

	const supported = support("vibrate")

	let intervalControls: Pauseable | undefined

	/** Start the vibration */
	function start() {
		if (supported) {
			if (Array.isArray(pattern)) {
				const new_pattern = pattern.map((num) => num * 1000)
				navigator.vibrate(new_pattern)
			} else {
				navigator.vibrate(pattern * 1000)
			}
		}
	}

	/** Stop the vibration **/
	function stop() {
		if (supported) navigator.vibrate(0)
		intervalControls?.pause()
	}

	if (interval > 0) {
		intervalControls = intervalFn(start, interval, {
			immediate: false,
			immediateCallback: false,
		})
	}

	on_destroy(stop)

	return {
		supported,
		intervalControls,
		start,
		stop,
	}
}
