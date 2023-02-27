import { noop, on_destroy, unstore } from "@sveu/shared"

import { support } from "../support"
import type { IntersectionObserverOptions } from "../utils"

/**
 * Wrapper for the IntersectionObserver API.
 *
 * @param target - The target element to observe.
 *
 * @param fn - The function to call when the target element is intersecting.
 *
 * @param options - The options to pass to the IntersectionObserver.
 * - `root` - The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `margin` - A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections. Defaults to `"0px"`.
 * - `threshold` - Either a single number or an array of numbers between 0.0 and 1. Defaults to `0.1`.
 *
 * @returns
 * - `supported` - Whether the IntersectionObserver API is supported.
 * - `stop` - Stop the IntersectionObserver.
 *
 */
export function intersection_observer(
	target: HTMLElement | SVGElement | null | undefined,
	fn: IntersectionObserverCallback,
	options: IntersectionObserverOptions = {}
) {
	const { root, margin = "0px", threshold = 0.1 } = options

	const supported = support("IntersectionObserver", "window")

	let stop = noop

	if (unstore(supported)) {
		if (!target) return

		stop()

		const observer = new IntersectionObserver(fn, {
			root,
			rootMargin: margin,
			threshold,
		})

		observer.observe(target)

		stop = () => {
			observer?.unobserve(target)
			observer?.disconnect()
		}
	}

	on_destroy(stop)

	return {
		supported,
		stop,
	}
}
