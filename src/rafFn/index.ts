import {
	browser,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"
import type { Fn, Pauseable } from "@sveu/shared"

import type { RafFnOptions } from "../utils"

/**
 * Call function on every `requestAnimationFrame` with controls.
 *
 * @param fn - Function to call on every `requestAnimationFrame`
 *
 * @param options - Options
 * - `immediate` - Start the requestAnimationFrame loop immediately on creation
 *
 * @example
 * ```ts
 * const { pause, resume, active } = rafFn(() => {
 * 	// do something
 * })
 * ```
 *
 * @returns Pauseable object.
 * - `pause` - Pause the requestAnimationFrame loop
 * - `resume` - Resume the requestAnimationFrame loop
 * - `active` - Readable store of the active state
 */
export function rafFn(fn: Fn, options: RafFnOptions = {}): Pauseable {
	const { immediate = true } = options

	const active = toWritable(false)

	let raf_id: null | number = null

	function loop() {
		if (!unstore(active) || !browser) return

		fn()
		raf_id = window.requestAnimationFrame(loop)
	}

	function resume() {
		if (!unstore(active) && browser) {
			active.set(true)
			loop()
		}
	}

	function pause() {
		active.set(false)
		if (raf_id != null && window) {
			window.cancelAnimationFrame(raf_id)
			raf_id = null
		}
	}

	if (immediate) resume()

	on_destroy(pause)

	return {
		pause,
		resume,
		active: toReadable(active),
	}
}
