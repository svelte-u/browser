import {
	asyncState,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"

import { support } from "../support"

interface UserAgentData {
	mobile: boolean

	architecture: string

	model: string

	platform: string

	platformVersion: string

	bitness: string

	brands: UserAgentDataBrand[]
}

interface UserAgentDataBrand {
	name: string

	version: string
}

/**
 * Get user agent
 *
 * @remarks This function use the User-Agent Client Hints api. See https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
 *
 * @example
 * ```ts
 * const { supported, mobile, arch, model, platform, platformVersion, bitness, brands } = useragent()
 * ```
 * @returns
 * - `supported` - Whether the browser supports the User-Agent Client Hints api.
 * - `mobile` - Whether the device is a mobile device.
 * - `arch` - The architecture of the device.
 * - `model` - The model of the device.
 * - `platform` - The platform of the device.
 * - `platformVersion` - The platform version of the device.
 * - `bitness` - The bitness of the device.
 * - `brands` - The brands of the device.
 *
 */
export function useragent() {
	const mobile = toWritable(false)

	const arch = toWritable("")

	const model = toWritable("")

	const platform = toWritable("")

	const platformVersion = toWritable("")

	const bitness = toWritable("")

	const brands = toWritable<UserAgentDataBrand[]>([{ name: "", version: "" }])

	const supported = support("userAgentData")

	if (unstore(supported)) {
		const { state } = asyncState<UserAgentData>(
			// @ts-expect-error navigator.userAgentData is not supported in all browsers
			navigator.userAgentData.getHighEntropyValues([
				"architecture",
				"model",
				"platform",
				"platformVersion",
				"bitness",
			]),
			{
				mobile: false,
				architecture: "",
				model: "",
				platform: "",
				platformVersion: "",
				bitness: "",
				brands: [{ name: "", version: "" }],
			}
		)
		const unsubscribe = state.subscribe((v) => {
			if (!v) return

			mobile.set(v.mobile)

			arch.set(v.architecture)

			model.set(v.model)

			platform.set(v.platform)

			platformVersion.set(v.platformVersion)

			bitness.set(v.bitness)

			const _brands = v.brands.map((b: any) => {
				return {
					name: b.brand,
					version: b.version,
				}
			})

			brands.set(_brands)
		})

		on_destroy(unsubscribe)
	}

	return {
		supported,
		brands: toReadable(brands),
		mobile: toReadable(mobile),
		arch: toReadable(arch),
		model: toReadable(model),
		platform: toReadable(platform),
		platformVersion: toReadable(platformVersion),
		bitness: toReadable(bitness),
	}
}
