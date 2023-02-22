import {
	browser,
	on_destroy,
	to_readable,
	to_writable,
	unstore,
} from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"
import type { BroadcastChannelOptions } from "../utils"

/**
 * Reactive BroadcastChannel
 *
 * @param options - The options for the BroadcastChannel.
 * - `name` - The name of the channel. default: `default`
 *
 * @returns
 * - `supported` - Is the BroadcastChannel supported.
 * - `channel` - The BroadcastChannel instance.
 * - `data` - The data from the channel.
 * - `post` - Send data to the channel.
 * - `close` - Close the channel.
 * - `error` - The error from the channel.
 * - `closed` - Is the channel closed.
 */
export function broadcast_channel(options: BroadcastChannelOptions = {}) {
	const { name = "default" } = options

	const supported = support("BroadcastChannel", "window")

	const closed = to_writable(false)

	const channel = to_writable<BroadcastChannel | undefined>(undefined)

	const data = to_writable<unknown>(undefined)

	const error = to_writable<Event | null>(null)

	/**
	 * Send data to the channel.
	 *
	 * @param data - The data to send to the channel.
	 */
	function post(data: unknown) {
		unstore(channel)?.postMessage(data)
	}

	/** Close the channel. */
	function close() {
		unstore(channel)?.close()
		closed.set(true)
	}

	if (unstore(supported) && browser) {
		error.set(null)

		channel.set(new BroadcastChannel(name))

		on(
			unstore(channel),
			"message",
			(event: MessageEvent) => {
				data.set(event.data)
			},
			{ passive: true }
		)

		on(
			unstore(channel),
			"messageerror",
			(event: Event) => {
				error.set(event)
			},
			{ passive: true }
		)

		on(
			unstore(channel),
			"close",
			() => {
				closed.set(true)
			},
			{ passive: true }
		)
	}

	on_destroy(close)

	return {
		channel: to_readable(channel),
		closed: to_readable(closed),
		data: to_readable(data),
		error: to_readable(error),
		supported,
		close,
		post,
	}
}
