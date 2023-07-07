import { toReadable, toWritable, unstore } from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"

/**
 * Wrapper for around the ScreenOrientation API
 *
 * @example
 * ```ts
 * const { supported, orientation, angle, lock, unlock } = screenOrientation()
 * ```
 *
 * @returns
 * - `supported` - Whether the ScreenOrientation API is supported
 * - `orientation` - The current orientation of the device
 * - `angle` - The current angle of the device
 * - `lock` - Lock the orientation of the device
 * - `unlock` - Unlock the orientation of the device
 */
export function screenOrientation() {
	const supported_screen = support("screen", "window")

	const supported_orientation =
		unstore(supported_screen) && "orientation" in window.screen

	const supported = toReadable(
		unstore(supported_screen) && supported_orientation
	)

	const _screen_orientation = unstore(supported)
		? window?.screen?.orientation ?? ({} as ScreenOrientation)
		: ({} as ScreenOrientation)

	const orientation = toWritable<OrientationType>(
		_screen_orientation?.type ?? "unknown"
	)

	const angle = toWritable<number>(_screen_orientation?.angle ?? 0)

	if (unstore(supported)) {
		on(window, "orientationchange", () => {
			orientation.set(window?.screen?.orientation?.type)
			angle.set(window?.screen?.orientation?.angle)
		})
	}

	/**
	 * Lock the orientation of the device
	 *
	 * @param type - The type of orientation to lock into
	 *
	 */
	function lock(type: OrientationLockType) {
		if (!unstore(supported)) throw Error("The lock type is not supported")

		_screen_orientation?.lock(type)
	}

	/** Unlock the orientation of the device */
	function unlock() {
		if (unstore(supported)) _screen_orientation?.unlock()
	}

	return {
		supported,
		orientation: toReadable(orientation),
		angle: toReadable(angle),
		lock,
		unlock,
	}
}
