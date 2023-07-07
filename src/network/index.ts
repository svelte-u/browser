import { browser, toReadable, toWritable, unstore } from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"
import type { NetworkEffectiveType, NetworkType } from "../utils"

/**
 * Reactive Network status.
 *
 * @example
 * ```ts
 * const { supported, online} = network()
 * ```
 *
 * @returns
 * - `supported` - Whether the browser supports the Network Information API.
 * - `online` - Whether the device is online.
 * - `saveData` - Whether the device is in a "save data" mode.
 * - `offlineAt` - The timestamp of when the device went offline.
 * - `onlineAt` - The timestamp of when the device went online.
 * - `downlink` - The effective bandwidth estimate in megabits per second, rounded to the nearest multiple of 25 kilobits per second.
 * - `downlinkMax` - The maximum downlink speed of the underlying connection technology in megabits per second, rounded to the nearest multiple of 25 kilobits per second.
 * - `effectiveType` - The effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g'.
 * - `rtt` - The estimated effective round-trip time of the current connection.
 * - `type` - The type of connection meaning one of 'bluetooth', 'cellular', 'ethernet', 'none', 'wifi', 'wimax', 'other', or 'unknown'.
 *
 */
export function network() {
	const supported = support("connection")

	const online = toWritable(true)

	const save_data = toWritable(false)

	const offline_at = toWritable<number | undefined>(undefined)

	const online_at = toWritable<number | undefined>(undefined)

	const downlink = toWritable<number | undefined>(undefined)

	const downlink_max = toWritable<number | undefined>(undefined)

	const rtt = toWritable<number | undefined>(undefined)

	const effective_type = toWritable<NetworkEffectiveType>(undefined)

	const type = toWritable<NetworkType>("unknown")

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
		on(window, "offline", update_network_info)

		on(window, "online", update_network_info)
	}

	if (unstore(supported))
		// @ts-expect-error navigator.connection is not supported in all browsers
		on(navigator.connection, "change", update_network_info, false)

	if (browser) update_network_info()

	return {
		supported,
		online: toReadable(online),
		saveData: toReadable(save_data),
		offlineAt: toReadable(offline_at),
		onlineAt: toReadable(online_at),
		downlink: toReadable(downlink),
		downlinkMax: toReadable(downlink_max),
		effectiveType: toReadable(effective_type),
		rtt: toReadable(rtt),
		type: toReadable(type),
	}
}
