import { intervalfn, on_destroy } from "@sveu/shared"
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
 * @returns
 * - `supported` - Whether the browser supports the Vibration API
 * - `interval_controls` - Controls for the persistent vibration
 * - `start` - Start the vibration
 * - `stop` - Stop the vibration
 */
export function vibrate(options: VibrateOptions = {}) {
	const { pattern = [], interval = 0 } = options

	const supported = support("vibrate")

	let interval_controls: Pauseable | undefined

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
		interval_controls?.pause()
	}

	if (interval > 0) {
		interval_controls = intervalfn(start, interval, {
			immediate: false,
			immediate_callback: false,
		})
	}

	on_destroy(stop)

	return {
		supported,
		interval_controls,
		start,
		stop,
	}
}
