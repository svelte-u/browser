import { asyncState } from "@sveu/shared"
import type { AsyncStateOptions } from "@sveu/shared"

import type { ImageOptions } from "../utils"

async function load_image(options: ImageOptions): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()

		const {
			src,
			srcset,
			sizes,
			class: clazz,
			loading,
			crossOrigin,
			referrerPolicy,
		} = options

		img.src = src

		if (srcset) img.srcset = srcset

		if (sizes) img.sizes = sizes

		if (clazz) img.className = clazz

		if (loading) img.loading = loading

		if (crossOrigin) img.crossOrigin = crossOrigin

		if (referrerPolicy) img.referrerPolicy = referrerPolicy

		img.onload = () => resolve(img)

		img.onerror = reject
	})
}

/**
 * Reactive load an image in the browser, you can wait the result to display it or show a fallback.
 *
 * @param options
 * - `src` - Address of the resource.
 * - `srcset` - Images to use in different situations, e.g., high-resolution displays, small monitors, etc.
 * - `sizes` - Image sizes for different page layouts.
 * - `alt` - Alternative text.
 * - `class` - Image class
 * - `loading` - Image loading
 * - `crossOrigin` - Image crossOrigin
 * - `referrerPolicy` - Image referrerPolicy
 *
 * @param asyncStateOptions - see [Async state options](https://svelte-u.vercel.app/docs/shared/asyncState/#options)
 *
 * @example
 * ```ts
 * const { loading } = image({
 * 	src: "https://picsum.photos/200/300",
 * 	alt: "Random image",
 * })
 * ```
 *
 * @returns An async state. See [Async state](https://svelte-u.vercel.app/docs/shared/asyncState/#returns)
 */
export function image(
	options: ImageOptions,
	asyncStateOptions?: AsyncStateOptions
) {
	const state = asyncState<HTMLImageElement | undefined>(
		() => load_image(options),
		undefined,
		{
			resetOnExecute: true,
			...asyncStateOptions,
		}
	)

	state.execute(asyncStateOptions ? asyncStateOptions.delay : 0)

	return state
}
