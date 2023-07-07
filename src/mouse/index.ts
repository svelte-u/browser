import { browser, toReadable, toWritable } from "@sveu/shared"

import { on } from "../eventListener"
import type {
	MouseOptions,
	MouseSourceType,
	UseMouseCoordType,
	UseMouseEventExtractor,
} from "../utils"

const builtin_extractors: Record<UseMouseCoordType, UseMouseEventExtractor> = {
	page: (event) => [event.pageX, event.pageY],
	client: (event) => [event.clientX, event.clientY],
	screen: (event) => [event.screenX, event.screenY],
	movement: (event) =>
		event instanceof Touch ? null : [event.movementX, event.movementY],
} as const

/**
 * Reactive mouse position.
 *
 * @param options - The options for the mouse.
 * - `type` - The type of the mouse position. Either `page` or `client` or `movement`, etc. Default is `page`.
 * - `touch` - Whether to listen to `touchmove` events. Default is `true`.
 * - `resetOnTouchEnds` - Whether to reset to the initial value when `touchend` event fired. Default is `false`.
 * - `fallback` - The fallback position when the browser doesn't support mouse events.
 * - `eventFilter` - The event filter.
 *
 * @example
 * ```ts
 * const { x, y, type } = mouse()
 * ```
 *
 * @returns
 * - `x` - The x position.
 * - `y` - The y position.
 * - `type` - The source type of the mouse position.
 *
 */
export function mouse(options: MouseOptions = {}) {
	const {
		type = "page",
		touch = true,
		resetOnTouchEnds = false,
		fallback = { x: 0, y: 0 },
		eventFilter,
	} = options

	const x = toWritable(fallback.x)

	const y = toWritable(fallback.y)

	const source_type = toWritable<MouseSourceType>(null)

	const extractor =
		typeof type === "function" ? type : builtin_extractors[type]

	function mouse_handler(event: MouseEvent) {
		const result = extractor(event)

		if (result) {
			x.set(result[0])

			y.set(result[1])

			source_type.set("mouse")
		}
	}

	function reset() {
		x.set(fallback.x)
		y.set(fallback.y)
	}

	function touch_handler(event: TouchEvent) {
		if (event.touches.length > 0) {
			const result = extractor(event.touches[0])

			if (result) {
				x.set(result[0])

				y.set(result[1])

				source_type.set("touch")
			}
		}
	}

	function mouse_handler_wrapper(event: MouseEvent) {
		return eventFilter === undefined
			? mouse_handler(event)
			: eventFilter(() => mouse_handler(event), {} as any)
	}

	function touch_handler_wrapper(event: TouchEvent) {
		return eventFilter === undefined
			? touch_handler(event)
			: eventFilter(() => touch_handler(event), {} as any)
	}

	if (browser) {
		on(window, "mousemove", mouse_handler_wrapper, {
			passive: true,
		})

		on(window, "dragover", mouse_handler_wrapper, {
			passive: true,
		})

		if (touch && type !== "movement") {
			on(window, "touchstart", touch_handler_wrapper, {
				passive: true,
			})

			on(window, "touchmove", touch_handler_wrapper, {
				passive: true,
			})

			if (resetOnTouchEnds)
				on(window, "touchend", reset, { passive: true })
		}
	}

	return {
		x: toReadable(x),
		y: toReadable(y),
		type: toReadable(source_type),
	}
}
