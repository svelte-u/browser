import {
	createSingletonPromise,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"
import type {
	GeneralPermissionDescriptor,
	PermissionOptions,
	PermissionReturn,
	PermissionReturnWithControls,
} from "../utils"

/**
 * Reactive Permissions API.
 *
 * @param name - The name of the permission.
 *
 * @param options - Options.
 * - `controls` - Whether to return controls or not.
 *
 * @example
 * ```ts
 * const state = permission("geolocation")
 *
 * const { state, query } = permission("geolocation", { controls: true })
 * ```
 *
 * @returns A reactive permission state.
 * - `state` - The current permission state.
 * - `supported` - Whether the permission is supported or not.
 * - `query` - A function that returns a promise that resolves to the permission status.
 *
 */
export function permission(
	name: GeneralPermissionDescriptor["name"],
	options?: PermissionOptions<false>
): PermissionReturn
export function permission(
	name: GeneralPermissionDescriptor["name"],
	options: PermissionOptions<true>
): PermissionReturnWithControls
export function permission(
	name: GeneralPermissionDescriptor["name"],
	options: PermissionOptions<boolean> = {}
): PermissionReturn | PermissionReturnWithControls {
	const { controls = false } = options

	const supported = support("permissions")

	let permission_status: PermissionStatus | undefined

	const desc = { name } as PermissionDescriptor

	const state = toWritable<PermissionState | undefined>(undefined)

	const on_change = () => {
		if (permission_status) state.set(permission_status.state)
	}

	const query = createSingletonPromise(async () => {
		if (!unstore(supported)) return

		if (!permission_status) {
			try {
				permission_status = await navigator?.permissions.query(desc)

				on(permission_status, "change", on_change)

				on_change()
			} catch {
				state.set("prompt")
			}
		}

		return permission_status
	})

	query()

	if (controls) {
		return {
			state: toReadable<PermissionState | undefined>(state),
			supported,
			query,
		}
	} else return toReadable(state)
}
