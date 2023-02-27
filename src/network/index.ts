import { browser, to_readable, to_writable, unstore } from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"
import type { NetworkEffectiveType, NetworkType } from "../utils"

/**
 * Reactive Network status.
 *
 * @returns
 * - `supported` - Whether the browser supports the Network Information API.
 * - `online` - Whether the device is online.
 * - `save_data` - Whether the device is in a "save data" mode.
 * - `offline_at` - The timestamp of when the device went offline.
 * - `online_at` - The timestamp of when the device went online.
 * - `downlink` - The effective bandwidth estimate in megabits per second, rounded to the nearest multiple of 25 kilobits per second.
 * - `downlink_max` - The maximum downlink speed of the underlying connection technology in megabits per second, rounded to the nearest multiple of 25 kilobits per second.
 * - `effective_type` - The effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g'.
 * - `rtt` - The estimated effective round-trip time of the current connection.
 * - `type` - The type of connection meaning one of 'bluetooth', 'cellular', 'ethernet', 'none', 'wifi', 'wimax', 'other', or 'unknown'.
 *
 */
export function network() {
	const supported = support("connection")

	const online = to_writable(true)

	const save_data = to_writable(false)

	const offline_at = to_writable<number | undefined>(undefined)

	const online_at = to_writable<number | undefined>(undefined)

	const downlink = to_writable<number | undefined>(undefined)

	const downlink_max = to_writable<number | undefined>(undefined)

	const rtt = to_writable<number | undefined>(undefined)

	const effective_type = to_writable<NetworkEffectiveType>(undefined)

	const type = to_writable<NetworkType>("unknown")

	function update_network_info() {
		online.set(navigator.onLine)

		offline_at.set(navigator.onLine ? undefined : Date.now())

		online_at.set(navigator.onLine ? Date.now() : undefined)

		if (unstore(supported)) {
			// @ts-expect-error navigator.connection is not supported in all browsers
			const connection = navigator.connection

			downlink.set(connection.downlink)

			downlink_max.set(connection.downlinkMax)

			effective_type.set(connection.effectiveType)

			rtt.set(connection.rtt)

			save_data.set(connection.saveData)

			type.set(connection.type)
		}
	}

	if (browser) {
		on(window, "offline", () => {
			online.set(false)

			offline_at.set(Date.now())
		})

		on(window, "online", () => {
			online.set(true)

			online_at.set(Date.now())
		})
	}

	if (unstore(supported))
		// @ts-expect-error navigator.connection is not supported in all browsers
		on(navigator.connection, "change", update_network_info, false)

	if (browser) update_network_info()

	return {
		supported,
		online: to_readable(online),
		save_data: to_readable(save_data),
		offline_at: to_readable(offline_at),
		online_at: to_readable(online_at),
		downlink: to_readable(downlink),
		downlink_max: to_readable(downlink_max),
		effective_type: to_readable(effective_type),
		rtt: to_readable(rtt),
		type: to_readable(type),
	}
}
