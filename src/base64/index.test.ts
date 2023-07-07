import { sleep, unstore } from "@sveu/shared"

import { describe, expect, it } from "vitest"

import { base64 } from "."

function decode(encoded: string) {
	const decodedStr = Buffer.from(encoded.split(",")[1], "base64").toString(
		"utf-8"
	)

	if (!decodedStr) return ""

	return JSON.parse(decodedStr)
}

describe("base64", () => {
	it("should work with record", async () => {
		const template = { test: 5 }

		const result = base64(template)

		await sleep(0.5)

		expect(decode(unstore(result))).toEqual(template)
	})

	it("should work with map and default serialize function", async () => {
		const map = new Map([["test", 1]])

		const result = base64(map)

		await sleep(0.5)

		expect(decode(unstore(result))).toEqual(Object.fromEntries(map))
	})

	it("should work with set", async () => {
		const set = new Set([1])

		const result = base64(set)

		await sleep(0.5)
		expect(decode(unstore(result))).toEqual(Array.from(set))
	})

	it("should work with array", async () => {
		const arr = [1, 2, 3]

		const result = base64(arr)

		await sleep(0.5)

		expect(decode(unstore(result))).toEqual(arr)
	})

	it("should work with custom serialize function", async () => {
		const arr = [1, 2, 3]

		const serializer = (arr: number[]) => {
			return JSON.stringify(arr.map((el) => el * 2))
		}

		const result = base64(arr, { serializer })

		await sleep(0.5)

		expect(decode(unstore(result))).toEqual(JSON.parse(serializer(arr)))
	})
})
