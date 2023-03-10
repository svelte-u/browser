import { on_destroy, unstore } from "@sveu/shared"

import { support } from "../support"
import type { PerformanceObserverOptions } from "../utils"

/**
 * Observe performance metrics.
 *
 * @param fn - Callback function to be invoked when a performance entry is added to the performance entry buffer.

* @see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
 * @param options - Options for the observer.
 * - `immediate` - Start the observer immediate.
 *
 * @returns
 * - `supported` - Whether the browser supports the PerformanceObserver API.
 * - `start` - Start the observer.
 * - `stop` - Stop the observer.
 */
export function performance_observer(
	fn: PerformanceObserverCallback,
	options: PerformanceObserverOptions = {}
) {
	const { immediate = true, ...performance_options } = options

	const supported = support("PerformanceObserver", "window")

	let observer: PerformanceObserver | undefined

	function stop() {
		observer?.disconnect()
	}

	function start() {
		if (unstore(supported)) {
			stop()

			observer = new PerformanceObserver(fn)

			observer.observe(performance_options)
		}
	}

	on_destroy(stop)

	if (immediate) start()

	return {
		supported,
		start,
		stop,
	}
}
