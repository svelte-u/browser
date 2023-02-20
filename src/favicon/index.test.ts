import { unstore } from "@sveu/shared"

import { describe, expect, it } from "vitest"

import { favicon } from "."

describe("favicon", () => {
	it("should be defined", () => {
		expect(favicon).toBeDefined()
	})

	it("should work", () => {
		const icon = favicon()

		expect(unstore(icon)).toBeUndefined()

		icon.set("favicon.ico")

		expect(unstore(icon)).toBe("favicon.ico")
	})
})
