import {
	browser,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"
import type { BroadcastChannelOptions } from "../utils"

/**
 * Reactive BroadcastChannel
 *
 * @param options - The options for the BroadcastChannel.
 * - `name` - The name of the channel. default: `default`
 *
 * @example
 * ```ts
 * const { supported, channel, data, post, close, error, closed } = broadcastChannel()
 * ```
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
export function broadcastChannel(options: BroadcastChannelOptions = {}) {
	const { name = "default" } = options

	const supported = support("BroadcastChannel", "window")

	const closed = toWritable(false)

	const channel = toWritable<BroadcastChannel | undefined>(undefined)

	const data = toWritable<unknown>(undefined)

	const error = toWritable<Event | null>(null)

	/**
	 * Send data to the channel.
	 *
	 * @param data - The data to send to the channel.
	 *
	 * @example
	 * ```ts
	 * post({ hello: "world" })
	 * ```
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
		channel: toReadable(channel),
		closed: toReadable(closed),
		data: toReadable(data),
		error: toReadable(error),
		supported,
		close,
		post,
	}
}
