import { to_readable, to_writable, unstore } from "@sveu/shared"

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
 * - `initial` - Initial sRGBHex.
 *
 * @returns - The eye dropper
 * - `supported` - Whether the browser supports the EyeDropper API
 * - `sRGBHex` - The sRGBHex of the selected color
 * - `open` - Open the eye dropper
 *
 */
export function eye_dropper(options: EyeDropperOptions = {}) {
	const { initial = "" } = options

	const supported = support("EyeDropper", "window")

	const sRGBHex = to_writable(initial)

	/**
	 * Open the eye dropper
	 *
	 * @param open_options - see [EyeDropperOpenOptions](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper/open)
	 *
	 * @returns - the dropper result
	 */
	async function open(open_options?: EyeDropperOpenOptions) {
		if (!unstore(supported)) return

		const eyeDropper: EyeDropper = new (window as any).EyeDropper()

		const result = await eyeDropper.open(open_options)

		sRGBHex.set(result.sRGBHex)

		return result
	}

	return { supported, sRGBHex: to_readable(sRGBHex), open }
}
