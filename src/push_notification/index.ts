import { sleep, to_writable, unstore } from "@sveu/shared"

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
 * @param sw_url - The service worker url
 *
 * @param vapid - The vapid key
 *
 * @param options - The options
 * - `base64` - Either to convert the push object into a base64 string
 * - `user_visible_only` - Either to start subscribing, when the user is visible
 *
 * @returns The push subscription
 * - `result` - The push subscription
 * - `supported` - Either the push notification is supported
 *
 */
export function push(sw_url: string, vapid: base64, options: PushOptions = {}) {
	const { base64 = true, user_visible_only = true } = options

	const supported = support("serviceWorker")

	const result = to_writable<PushSubscription | string>("")

	async function init() {
		const register =
			(await navigator.serviceWorker.getRegistration(sw_url)) ??
			(await navigator.serviceWorker.register(sw_url))

		await sleep(100)

		const subscription =
			(await register.pushManager.getSubscription()) ??
			(await register.pushManager.subscribe({
				userVisibleOnly: user_visible_only,
				applicationServerKey: url_base64_to_uint8_array(vapid),
			}))

		if (base64) result.set(window?.btoa(JSON.stringify(subscription)))
		else result.set(subscription)
	}

	if (unstore(supported)) init()

	return { result, supported }
}
