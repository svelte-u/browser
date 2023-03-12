/**
 * Create a function that dispatches a custom event.
 *
 * @param target - The element to dispatch the event on.
 *
 * @returns The function to dispatch the event.
 */
export function event_dispatcher(
	target: HTMLElement | SVGElement | null | undefined
) {
	/**
	 * Dispatch a custom event.
	 *
	 * @param name - The name of the event.
	 *
	 * @param value - The value to pass to the event.
	 *
	 */
	function dispatch<T>(name: string, value: T) {
		target?.dispatchEvent(new CustomEvent(name, { detail: value }))
	}

	return dispatch
}
