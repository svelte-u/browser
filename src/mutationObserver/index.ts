import { on_destroy, unstore } from "@sveu/shared"

import { support } from "../support"

/**
 * Watch for changes being made to the DOM tree.
 *
 * @param target - The target node on which to observe DOM mutations.
 *
 * @param fn - The function to call when a mutation occurs.
 *
 * @param options - [See MutationObserver Options](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe)
 *
 * @example
 * ```ts
 * const { supported, cleanup } = mutationObserver(document.body, () => {
 * 	console.log("DOM changed!")
 * })
 * ```
 *
 * @returns
 * - `supported` - Whether the browser supports the `MutationObserver` API.
 * - `cleanup` - A function to stop watching for changes.
 */
export function mutationObserver(
	target: HTMLElement | SVGElement | undefined | null,
	fn: MutationCallback,
	options: MutationObserverInit = {}
) {
	let observer: MutationObserver | undefined

	const supported = support("MutationObserver", "window")

	function cleanup() {
		if (observer) {
			observer.disconnect()
			observer = undefined
		}
	}

	if (unstore(supported) && target) {
		cleanup()

		observer = new MutationObserver(fn)

		observer.observe(target, options)
	}

	on_destroy(cleanup)

	return {
		supported,
		cleanup,
	}
}
