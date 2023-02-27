import { on_destroy, unstore } from "@sveu/shared"

import { support } from "../support"

/**
 * Observes changes to the dimensions of an Element's content or the border-box
 *
 * @param target - The target element to observe.
 *
 * @param callback - The callback function to invoke when the dimensions of the target element change.
 *
 * @param options - The options object. See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe#parameters
 *
 * @returns
 * - `supported` - Whether the browser supports the ResizeObserver API.
 * - `cleanup` - A function to cleanup the observer.
 *
 */
export function resize_observer(
	target: HTMLElement | SVGElement | undefined | null,
	callback: ResizeObserverCallback,
	options: ResizeObserverOptions = {}
) {
	let observer: ResizeObserver | undefined

	const supported = support("ResizeObserver", "window")

	/** Cleanup the observer */
	function cleanup() {
		if (observer) {
			observer.disconnect()
			observer = undefined
		}
	}

	cleanup()

	if (unstore(supported) && target) {
		observer = new ResizeObserver(callback)

		observer?.observe(target, options)
	}

	on_destroy(cleanup)

	return {
		supported,
		cleanup,
	}
}
