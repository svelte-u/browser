import {
	create_singleton_promise,
	to_readable,
	to_writable,
	unstore,
} from "@sveu/shared"

import { on } from "../event_listener"
import { support } from "../support"
import type {
	GeneralPermissionDescriptor,
	PermissionOptions,
	PermissionReturn,
	PermissionReturnWithControls,
} from "../utils"

export function permission(
	permissionDesc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options?: PermissionOptions<false>
): PermissionReturn
export function permission(
	permissionDesc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options: PermissionOptions<true>
): PermissionReturnWithControls
export function permission(
	permission_desc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options: PermissionOptions<boolean> = {}
): PermissionReturn | PermissionReturnWithControls {
	const { controls = false } = options

	const supported = support("permissions")

	let permission_status: PermissionStatus | undefined

	const desc = { name: permission_desc } as PermissionDescriptor

	const state = to_writable<PermissionState | undefined>(undefined)

	const on_change = () => {
		if (permission_status) state.set(permission_status.state)
	}

	const query = create_singleton_promise(async () => {
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
			state: to_readable<PermissionState | undefined>(state),
			supported,
			query,
		}
	} else return to_readable(state)
}
