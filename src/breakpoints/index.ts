import type { Readable } from "svelte/store"

import { adjust_with_unit, type, unstore } from "@sveu/shared"

import { media_query } from "../media_query"
import type { Breakpoints } from "../utils"

/**
 * Reactively viewport breakpoints
 *
 * @param breakpoints - Key value pairs of breakpoints
 *
 * @returns
 * - `gt` - Checks if the viewport is greater than the breakpoint
 * - `gte` - Checks if the viewport is greater than or equal to the breakpoint
 * - `lt` - Checks if the viewport is smaller than the breakpoint
 * - `lte` - Checks if the viewport is smaller than or equal to the breakpoint
 * - `bn` - Checks if the viewport is between the two breakpoints
 * - `shortcuts` - Shortcut methods for each breakpoint
 */
export function breakpoints<K extends string>(breakpoints: Breakpoints<K>) {
	/**
	 * Get breakpoint value
	 *
	 * @param key - The breakpoint key
	 *
	 * @param delta - The delta value
	 *
	 * @returns The breakpoint value
	 */
	function get_value(key: K, delta?: number) {
		let value = breakpoints[key]

		if (delta != null) value = unstore(adjust_with_unit(value, delta))

		if (type(value) === "number") value = `${value}px`

		return value
	}

	/**
	 * Checks if the viewport is greater than or equal to the breakpoint
	 *
	 * @param key - The breakpoint key
	 *
	 * @returns Whether the breakpoint is greater than or equal to the breakpoint
	 */
	function gte(key: K) {
		return media_query(`(min-width: ${get_value(key)})`)
	}

	/**
	 * Checks if the viewport is greater than the breakpoint
	 *
	 * @param key - The breakpoint key
	 *
	 * @returns Whether the breakpoint is greater than the breakpoint
	 */
	function gt(key: K) {
		return media_query(`(min-width: ${get_value(key, 0.1)})`)
	}

	/**
	 * Checks if the viewport is smaller than or equal to the breakpoint
	 *
	 * @param key - The breakpoint key
	 *
	 * @returns Whether the breakpoint is smaller than or equal to the breakpoint
	 */
	function lte(key: K) {
		return media_query(`(max-width: ${get_value(key)})`)
	}

	/**
	 * Checks if the viewport is smaller than the breakpoint
	 *
	 * @param key - The breakpoint key
	 *
	 * @returns Whether the breakpoint is smaller than the breakpoint
	 */
	function lt(key: K) {
		return media_query(`(max-width: ${get_value(key, -0.1)})`)
	}

	/**
	 * Checks if the viewport is between the two breakpoints
	 *
	 * @param key - The breakpoint key
	 *
	 * @returns Whether the breakpoint is between the two breakpoints
	 */
	function bn(a: K, b: K) {
		return media_query(
			`(min-width: ${get_value(a)}) and (max-width: ${get_value(
				b,
				-0.1
			)})`
		)
	}

	const shortcut_methods = Object.keys(breakpoints).reduce((shortcuts, k) => {
		Object.defineProperty(shortcuts, k, {
			get: () => gte(k as K),
			enumerable: true,
			configurable: true,
		})
		return shortcuts
	}, {} as Record<K, Readable<boolean>>)

	return {
		gt,
		gte,
		lt,
		lte,
		bn,
		...shortcut_methods,
	}
}
