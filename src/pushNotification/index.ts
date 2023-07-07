import { sleep, toReadable, toWritable, unstore } from "@sveu/shared"

import { support } from "../support"
import type { PushOptions } from "../utils"

type base64 = string

/**
 * Convert a base64 string to a Uint8Array
 *
 * @param base64 - The base64 string to convert
 *
 * @returns The converted Uint8Array
 */
function url_base64_to_uint8_array(base64: string) {
	const padding = "=".repeat((4 - (base64.length % 4)) % 4)

	const _base64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")

	const data = window.atob(_base64)

	const output = new Uint8Array(data.length)

	for (const [i, char] of data.split("").entries())
		output[i] = char.charCodeAt(0)

	return output
}

/**
 * Push notification API
 *
 * @param swUrl - The service worker url
 *
 * @param vapid - The vapid key
 *
 * @param options - The options
 * - `base64` - Either to convert the push object into a base64 string. Default: `true`
 * - `userVisibleOnly` - Either to start subscribing, when the user is visible. Default: `true`
 *
 * @example
 * ```ts
 * const { result, supported } = pushNotification("/sw.js", "vapid_key")
 * ```
 *
 * @example
 * ```ts
 * const { result, supported } = pushNotification("/sw.js", "vapid_key", {
 * 	base64: false,
 * 	userVisibleOnly: false,
 * })
 * ```
 *
 *
 * @returns The push subscription
 * - `result` - The push subscription
 * - `supported` - Either the push notification is supported
 *
 */
export function pushNotification(
	swUrl: string,
	vapid: base64,
	options: PushOptions = {}
) {
	const { base64 = true, userVisibleOnly = true } = options

	const supported = support("serviceWorker")

	const result = toWritable<PushSubscription | string>("")

	async function init() {
		const register =
			(await navigator.serviceWorker.getRegistration(swUrl)) ??
			(await navigator.serviceWorker.register(swUrl))

		await sleep(0.1)

		const subscription =
			(await register.pushManager.getSubscription()) ??
			(await register.pushManager.subscribe({
				userVisibleOnly: userVisibleOnly,
				applicationServerKey: url_base64_to_uint8_array(vapid),
			}))

		if (base64) result.set(window?.btoa(JSON.stringify(subscription)))
		else result.set(subscription)
	}

	if (unstore(supported)) init()

	return { result: toReadable(result), supported }
}
