import { AnyFn, browser, is_string, noop, on_destroy } from "@sveu/shared"
import type { Fn } from "@sveu/shared"

import { GeneralEventListener, InferEventTarget, ListAble } from "../utils"

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 1: Omitted Window target.
 *
 * @param event - The event name.
 *
 * @param listener - The event listener.
 *
 * @param options - The event listener options.
 *
 * @returns The cleanup function.
 */
export function event_listener<E extends keyof WindowEventMap>(
	event: ListAble<E>,
	listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @param target - The window target.
 *
 * @param event - The event name.
 *
 * @param listener - The event listener.
 *
 * @param options - The event listener options.
 *
 * @returns The cleanup function.
 */
export function event_listener<E extends keyof WindowEventMap>(
	target: Window,
	event: ListAble<E>,
	listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @param target - The document target.
 *
 * @param event - The event name.
 *
 * @param listener - The event listener.
 *
 * @param options - The event listener options.
 *
 * @returns The cleanup function.
 */
export function event_listener<E extends keyof DocumentEventMap>(
	target: Document,
	event: ListAble<E>,
	listener: (this: Document, ev: DocumentEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Custom event target with event type infer
 *
 * @param target - The event target.
 *
 * @param event - The event name.
 *
 * @param listener - The event listener.
 *
 * @param options - The event listener options.
 *
 * @returns The cleanup function.
 */
export function event_listener<Names extends string, EventType = Event>(
	target: InferEventTarget<Names>,
	event: ListAble<Names>,
	listener: ListAble<GeneralEventListener<EventType>>,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target fallback
 *
 * @param target - The event target.
 *
 * @param event - The event name.
 *
 * @param listener - The event listener.
 *
 * @param options - The event listener options.
 *
 * @returns The cleanup function.
 */
export function event_listener<EventType = Event>(
	target: EventTarget | null | undefined,
	event: ListAble<string>,
	listener: ListAble<GeneralEventListener<EventType>>,
	options?: boolean | AddEventListenerOptions
): Fn
export function event_listener(...args: any[]) {
	let target: EventTarget | undefined

	let events: ListAble<string>

	let listeners: ListAble<AnyFn>

	let options: boolean | AddEventListenerOptions | undefined

	if (is_string(args[0]) || Array.isArray(args[0])) {
		;[events, listeners, options] = args
		target = browser ? window : undefined
	} else {
		;[target, events, listeners, options] = args
	}

	if (!target) return noop

	if (!Array.isArray(events)) events = [events]

	if (!Array.isArray(listeners)) listeners = [listeners]

	const cleanups: AnyFn[] = []

	function cleanup() {
		cleanups.forEach((fn) => fn())
		cleanups.length = 0
	}

	function register(
		_target: any,
		event: string,
		listener: any,
		options: any
	) {
		_target.addEventListener(event, listener, options)
		return () => _target.removeEventListener(event, listener, options)
	}

	cleanup()

	cleanups.push(
		...(events as string[]).flatMap((event) => {
			return (listeners as AnyFn[]).map((listener) =>
				register(target, event, listener, options)
			)
		})
	)

	on_destroy(cleanup)

	return cleanup
}

// alias
export { event_listener as on }
