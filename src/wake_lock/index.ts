import { browser, to_readable, to_writable, unstore } from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"
import type {
	NavigatorWithWakeLock,
	WakeLockSentinel,
	WakeLockType,
} from "../utils"

/**
 * Reactive Screen Wake Lock API.
 *
 * @returns
 * - `supported` - Whether the Wake Lock API is supported.
 * - `active` - Whether the Wake Lock is active.
 * - `request` - Request a Wake Lock.
 * - `release` - Release the Wake Lock.
 */
export function wake_lock() {
	let _wake_lock: WakeLockSentinel | null

	const supported = support("wakeLock")

	const active = to_writable(false)

	async function on_visibility_change() {
		if (!unstore(supported) || !_wake_lock) return

		if (document.visibilityState === "visible")
			_wake_lock = await (
				navigator as NavigatorWithWakeLock
			).wakeLock.request("screen")

		active.set(!_wake_lock.released)
	}

	if (browser)
		on(document, "visibilitychange", on_visibility_change, {
			passive: true,
		})

	/**
	 * Request a Wake Lock.
	 *
	 * @param type - The type of Wake Lock to request. Defaults to "screen".
	 *
	 */
	async function request(type: WakeLockType) {
		if (!unstore(supported)) return

		_wake_lock = await (
			navigator as NavigatorWithWakeLock
		).wakeLock.request(type)

		active.set(!_wake_lock.released)
	}

	/** Release the Wake Lock. */
	async function release() {
		if (!unstore(supported) || !_wake_lock) return

		await _wake_lock.release()

		active.set(!_wake_lock.released)

		_wake_lock = null
	}

	return {
		supported,
		active: to_readable(active),
		request,
		release,
	}
}
