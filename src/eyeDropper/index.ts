import { toReadable, toWritable, unstore } from "@sveu/shared"

import { support } from "../support"
import type {
	EyeDropper,
	EyeDropperOpenOptions,
	EyeDropperOptions,
} from "../utils"

/**
 * Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
 *
 * @param options - Options
 * - `fallback` - The fallback value
 *
 * @example
 * ```ts
 * const { supported, result, open } = eyeDropper()
 * ```
 *
 * @returns - The eye dropper
 * - `supported` - Whether the browser supports the EyeDropper API
 * - `result` - The sRGBHex of the selected color
 * - `open` - Open the eye dropper
 *
 */
export function eyeDropper(options: EyeDropperOptions = {}) {
	const { fallback = "" } = options

	const supported = support("EyeDropper", "window")

	const sRGBHex = toWritable(fallback)

	/**
	 * Open the eye dropper
	 *
	 * @param openOptions - see [EyeDropperOpenOptions](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper/open)
	 *
	 * @returns - the dropper result
	 */
	async function open(openOptions?: EyeDropperOpenOptions) {
		if (!unstore(supported)) return

		const eyeDropper: EyeDropper = new (window as any).EyeDropper()

		const result = await eyeDropper.open(openOptions)

		sRGBHex.set(result.sRGBHex)

		return result
	}

	return { supported, result: toReadable(sRGBHex), open }
}
