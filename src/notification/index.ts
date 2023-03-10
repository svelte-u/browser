import {
	create_event_hook,
	on_destroy,
	to_readable,
	to_writable,
	unstore,
} from "@sveu/shared"
import type { EventHook } from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"
import type { WebNotificationOptions } from "../utils"

/**
 * Reactive notification
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/notification
 * @param options - options
 *
 * @returns
 * - `supported` - Whether the browser supports the Notification API.
 * - `notify` - The notification instance.
 * - `show` - Show the notification.
 * - `close` - Close the notification.
 * - `on_click` - The click event.
 * - `on_show` - The show event.
 * - `on_error` - The error event.
 * - `on_close` - The close event.
 */
export function notification(options: WebNotificationOptions = {}) {
	const supported = support("Notification", "window")

	const notification = to_writable<Notification | null>(null)

	const on_click: EventHook = create_event_hook<Event>()

	const on_show: EventHook = create_event_hook<Event>()

	const on_error: EventHook = create_event_hook<Event>()

	const on_close: EventHook = create_event_hook<Event>()

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

		if (n !== null) {
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
		notify: to_readable(notification),
		show,
		close,
		on_click: on_click.on,
		on_show: on_show.on,
		on_error: on_error.on,
		on_close: on_close.on,
	}
}
