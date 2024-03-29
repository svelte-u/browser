import { browser, noop, unstore, watchable } from "@sveu/shared"
import type { Dict, Watchable } from "@sveu/shared"

import { on } from "../eventListener"
import type { UrlQueryOptions } from "../utils"

/**
 * Reactive URL query string
 *
 * @param mode - The mode to use for the URL query string
 * - `history` - Used when `history mode router` is used. Default
 * - `hash` - Used when `hash mode router` is used
 * - `hash-query` - Used when `history mode router` is used but , but want to use hash as query string
 *
 * @param options - The options to use for the URL query string
 * - `fallback` - The fallback value for the URL query string
 * - `removeNullish` - Whether to remove nullish values from the URL query string
 * - `removeFalsy` - Whether to remove falsy values from the URL query string
 * - `write` - Whether to write the URL query string to the URL
 * - `encode` - Whether to encode the URL query string
 *
 * @example
 * ```ts
 * const query = urlQuery()
 *
 * const query = urlQuery("hash")
 *
 * const query = urlQuery("hash-query")
 *
 * const query = urlQuery("history", {
 * 	fallback: {
 * 		foo: "bar",
 * 	},
 * 	removeNullish: true,
 * 	removeFalsy: true,
 * 	write: true,
 * 	encode: true,
 * })
 *
 * $query.foo = "barz"
 * ```
 *
 * @returns a watchable store
 */
export function urlQuery<T extends Dict>(
	mode: "history" | "hash" | "hash-query" = "history",
	options: UrlQueryOptions<T> = {}
): Watchable<T> {
	const {
		fallback = {} as T,
		removeNullish = true,
		removeFalsy = false,
		write: enable_write = true,
		encode = false,
	} = options

	if (!browser) return watchable<T>(fallback, noop)

	const state = watchable(fallback, (_, new_state) => {
		const queries = new URLSearchParams("")

		Object.keys(new_state).forEach((key) => {
			const item = new_state[key]

			if (Array.isArray(item) || typeof item === "object") {
				const serialized = JSON.stringify(item)

				queries.set(
					key,
					encode ? encodeURIComponent(serialized) : serialized
				)
			} else queries.set(key, item)

			if (removeFalsy && !item) queries.delete(key)

			if (removeNullish && item === null) queries.delete(key)
		})

		write(queries)
	})

	/**
	 * Get the raw query string from the URL
	 *
	 * @returns The raw query string
	 */
	function get_raw_query() {
		if (mode === "history") return window.location.search || ""
		else if (mode === "hash") {
			const hash = window.location.hash || ""

			const index = hash.indexOf("?")

			return index > 0 ? hash.slice(index) : ""
		} else return (window.location.hash || "").replace(/^#/, "")
	}

	/**
	 * Construct a query string from a `URLSearchParams` object
	 *
	 * @param query - The `URLSearchParams` object to construct the query string from
	 *
	 * @returns The constructed query string
	 */
	function construct_query(query: URLSearchParams) {
		const stringified = query.toString()

		if (mode === "history")
			return `${stringified ? `?${stringified}` : ""}${
				window.location.hash || ""
			}`
		if (mode === "hash-query")
			return `${window.location.search || ""}${
				stringified ? `#${stringified}` : ""
			}`

		const hash = window.location.hash || "#"

		const index = hash.indexOf("?")

		if (index > 0)
			return `${hash.slice(0, index)}${
				stringified ? `?${stringified}` : ""
			}`

		return `${hash}${stringified ? `?${stringified}` : ""}`
	}

	/**
	 * Read the query string from the URL
	 *
	 * @returns A `URLSearchParams` object containing the query string
	 */
	function read() {
		return new URLSearchParams(get_raw_query())
	}

	/**
	 * Update the state object with the query string
	 *
	 * @param queries - The `URLSearchParams` object to update the state with
	 *
	 */
	function update_state(queries: URLSearchParams) {
		const unused_keys = new Set(Object.keys(unstore(state)))

		for (const key of queries.keys()) {
			const query_for_key = queries.getAll(key)

			const _state = unstore(state) as Dict

			_state[key] =
				query_for_key.length > 1
					? query_for_key
					: queries.get(key) || ""
			unused_keys.delete(key)
		}

		Array.from(unused_keys).forEach((key) => delete unstore(state)[key])
	}

	/**
	 * Write the query string to the URL
	 *
	 * @param queries - The `URLSearchParams` object to write to the URL
	 *
	 * @param should_update - Whether to update the state object with the query string
	 *
	 */
	function write(queries: URLSearchParams, should_update?: boolean) {
		if (should_update) update_state(queries)

		window.history.replaceState(
			window.history.state,
			window.document.title,
			window.location.pathname + construct_query(queries)
		)
	}

	/** The event handler for when the URL changes */
	function on_changed() {
		if (!enable_write) return

		write(read(), true)
	}

	on(window, "popstate", on_changed, false)

	if (mode !== "history") on(window, "hashchange", on_changed, false)

	const initial = read()

	if (initial.keys().next().value) update_state(initial)
	else Object.assign(state, fallback)

	return state
}
