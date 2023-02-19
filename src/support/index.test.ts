import { unstore } from "@sveu/shared"

import { describe, expect, it } from "vitest"

import { support } from "."

describe("support", () => {
	it("should be defined", () => {
		expect(support).toBeDefined()
	})

	it("should return a readable store", () => {
		const supported = support("serviceWorker")

		expect(supported).toHaveProperty("subscribe")

		expect(unstore(supported)).toBe(false)
	})

	it("should check if activeElement is available", () => {
		const supported = support("activeElement", "document")

		expect(unstore(supported)).toBe(true)
	})

	it("should check if AbortController	is available", () => {
		const supported = support("AbortController", "window")

		expect(unstore(supported)).toBe(true)
	})
})
