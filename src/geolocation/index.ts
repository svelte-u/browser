import {
	browser,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"

import { support } from "../support"
import type { GeolocationOptions } from "../utils"

/**
 * Reactive Geolocation API.
 *
 * @param options
 * - `high` Whether to enable high accuracy. Defaults to `true`.
 * - `maxAge` The maximum age of a cached position in seconds. Defaults to `3`.
 * - `timeout` The timeout in seconds. Defaults to `27`.
 * - `immediate` Whether to start watching the location immediately. Defaults to `true`.
 *
 * @example
 * ```ts
 * const { supported, coords, locatedAt, error, resume, pause } = geolocation()
 * ```
 *
 * @returns
 * - `supported` Whether the Geolocation API is supported.
 * - `coords` The current coordinates.
 * - `locatedAt` The timestamp of the last location update.
 * - `error` The last error.
 * - `resume` Resume watching the location.
 * - `pause` Pause watching the location.
 */
export function geolocation(options: GeolocationOptions = {}) {
	const { high = true, maxAge = 3, timeout = 27, immediate = true } = options

	const supported = support("geolocation")

	const locatedAt = toWritable<number | null>(null)

	const error = toWritable<GeolocationPositionError | null>(null)

	const coords = toWritable<GeolocationPosition["coords"]>({
		accuracy: 0,
		latitude: Infinity,
		longitude: Infinity,
		altitude: null,
		altitudeAccuracy: null,
		heading: null,
		speed: null,
	})

	function update(position: GeolocationPosition) {
		locatedAt.set(position.timestamp)

		coords.set({
			accuracy: position.coords.accuracy,
			altitude: position.coords.altitude,
			altitudeAccuracy: position.coords.altitudeAccuracy,
			heading: position.coords.heading,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			speed: position.coords.speed,
		})
		error.set(null)
	}

	let watcher: number | undefined

	/** Resume watching the location. */
	function resume() {
		if (unstore(supported)) {
			watcher = navigator?.geolocation.watchPosition(
				update,
				(err) => error.set(err),
				{
					enableHighAccuracy: high,
					maximumAge: maxAge * 1000,
					timeout: timeout * 1000,
				}
			)
		}
	}

	if (immediate) resume()

	/** Stop watching the location. */
	function pause() {
		if (watcher && browser) navigator.geolocation.clearWatch(watcher)
	}

	on_destroy(pause)

	return {
		supported,
		coords: toReadable(coords),
		locatedAt: toReadable(locatedAt),
		error: toReadable(error),
		resume,
		pause,
	}
}
