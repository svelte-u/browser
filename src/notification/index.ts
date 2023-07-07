import {
	createEventHook,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"
import type { EventHook } from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"
import type { WebNotificationOptions } from "../utils"

/**
 * Reactive notification
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/notification
 * @param options - options
 *
 * @example
 * ```ts
 * const { supported, notify, show, close, onClick, onShow, onError, onClose } = notification()
 * ```
 *
 * @returns
 * - `supported` - Whether the browser supports the Notification API.
 * - `notify` - The notification instance.
 * - `show` - Show the notification.
 * - `close` - Close the notification.
 * - `onClick` - The click event.
 * - `onShow` - The show event.
 * - `onError` - The error event.
 * - `onClose` - The close event.
 */
export function notification(options: WebNotificationOptions = {}) {
	const supported = support("Notification", "window")

	const notification = toWritable<Notification | null>(null)

	const on_click: EventHook = createEventHook<Event>()

	const on_show: EventHook = createEventHook<Event>()

	const on_error: EventHook = createEventHook<Event>()

	const on_close: EventHook = createEventHook<Event>()

	async function request_permission() {
		if (!unstore(supported)) return

		if (
			"permission" in Notification &&
			Notification.permission !== "denied"
		)
			await Notification.requestPermission()
	}

	function close() {
		const n = unstore(notification)

		if (n) n.close()

		notification.set(null)
	}

	/**
	 * Show the notification.
	 *
	 * @param overrides - Overrides the default options.
	 *
	 * @returns The notification instance.
	 */
	async function show(overrides?: WebNotificationOptions) {
		if (!unstore(supported)) return

		await request_permission()

		const _options = Object.assign({}, options, overrides)

		notification.set(new Notification(_options.title || "", _options))

		const n = unstore(notification)

		if (n) {
			n.onclick = (event: Event) => on_click.trigger(event)

			n.onshow = (event: Event) => on_show.trigger(event)

			n.onerror = (event: Event) => on_error.trigger(event)

			n.onclose = (event: Event) => on_close.trigger(event)

			return n
		}
	}

	if (unstore(supported)) {
		request_permission()

		on(document, "visibilitychange", (e: Event) => {
			e.preventDefault()

			if (document.visibilityState === "visible") close()
		})
	}

	on_destroy(close)

	return {
		supported,
		notify: toReadable(notification),
		show,
		close,
		onClick: on_click.on,
		onShow: on_show.on,
		onError: on_error.on,
		onClose: on_close.on,
	}
}
