import { unstore } from "@sveu/shared"

import { beforeEach, describe, expect, it, vitest } from "vitest"

import { urlQuery } from "."

describe("urlQuery", () => {
	it("should be defined", () => {
		expect(urlQuery).toBeDefined()
	})

	const base_url = "https://svelte-u.vercel.app/"

	Object.defineProperty(window, "location", {
		value: new URL(base_url),
		writable: true,
	})

	const mock_replace_state = vitest.fn()

	beforeEach(() => {
		vitest.clearAllMocks()

		window.location.search = ""

		window.location.hash = ""

		window.history.replaceState = mock_replace_state
	})

	const mock_popstate = (search: string, hash: string) => {
		window.location.search = search

		window.location.hash = hash

		window.dispatchEvent(
			new PopStateEvent("popstate", {
				state: {
					...window.location,
					search,
					hash,
				},
			})
		)
	}

	;(["history", "hash", "hash-query"] as const).forEach((mode) => {
		describe(`${mode} mode`, () => {
			it("return initial query", async () => {
				if (mode === "hash") window.location.hash = "#/test/?foo=bar"
				else if (mode === "hash-query")
					window.location.hash = "#foo=bar"
				else window.location.search = "?foo=bar"

				const query = urlQuery(mode)

				expect(unstore(query).foo).toBe("bar")
			})

			it("return fallback", async () => {
				const fallback = { foo: "bar" }

				const query1 = urlQuery(mode, { fallback })

				const query2 = urlQuery(mode, { fallback })

				expect(unstore(query1).foo).toBe("bar")

				expect(unstore(query2).foo).toBe("bar")
			})

			it("update query on poststate event", async () => {
				const query = urlQuery(mode)

				expect(unstore(query).foo).toBeUndefined()

				switch (mode) {
					case "hash":
						mock_popstate("", "#/test/?foo=bar")
						break
					case "hash-query":
						mock_popstate("", "#foo=bar")
						break
					case "history":
						mock_popstate("?foo=bar", "")
				}

				expect(unstore(query).foo).toBe("bar")

				switch (mode) {
					case "hash":
						mock_popstate("", "#/test/?foo=bar1&foo=bar2")
						break
					case "hash-query":
						mock_popstate("", "#foo=bar1&foo=bar2")
						break
					case "history":
						mock_popstate("?foo=bar1&foo=bar2", "")
				}

				expect(unstore(query).foo).toEqual(["bar1", "bar2"])

				switch (mode) {
					case "hash":
						mock_popstate("", "#/test/?foo=")
						break
					case "hash-query":
						mock_popstate("", "#foo=")
						break
					case "history":
						mock_popstate("?foo=", "")
				}

				expect(unstore(query).foo).toBe("")
			})

			it("stop poststate event", async () => {
				const query = urlQuery(mode, { write: false })

				expect(unstore(query).foo).toBeUndefined()

				switch (mode) {
					case "hash":
						mock_popstate("", "#/test/?foo=bar")
						break
					case "hash-query":
						mock_popstate("", "#foo=bar")
						break
					case "history":
						mock_popstate("?foo=bar", "")
				}

				expect(unstore(query).foo).toBeUndefined()
			})

			it("generic url search query", () => {
				interface CustomUrlQuery extends Record<string, any> {
					custom_foo: number | undefined
				}

				const query = urlQuery<CustomUrlQuery>(mode)

				expect(unstore(query).custom_foo).toBeUndefined()

				unstore(query).custom_foo = 42

				expect(unstore(query).custom_foo).toEqual(42)
			})

			it("should remove null & falsy", async () => {
				const query = urlQuery(mode, {
					removeNullish: true,
					removeFalsy: true,
					fallback: {
						foo: "bar",
						bar: "foo",
					} as { foo: string | null; bar: string | boolean },
				})

				unstore(query).foo = null

				unstore(query).bar = false

				expect(unstore(query)).toEqual({ foo: null, bar: false })
			})
		})
	})

	it("hash url without query", () => {
		window.location.hash = "#/test/"

		const query = urlQuery("hash")

		expect(unstore(query)).toEqual({})

		const new_hash = "#/change/?foo=bar"

		window.location.hash = new_hash

		expect(window.location.hash).toBe(new_hash)
	})
})
