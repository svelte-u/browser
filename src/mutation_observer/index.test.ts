import { sleep } from "@sveu/shared"
import type { Fn } from "@sveu/shared"

import { beforeEach, describe, expect, it, vitest } from "vitest"
import type { SpyInstance } from "vitest"

import { mutation_observer } from "."

describe("mutation_observer", () => {
	it("should be defined", () => {
		expect(mutation_observer).toBeDefined()
	})

	it("should work with attributes", async () => {
		const cb = vitest.fn()

		const target = document.createElement("div")

		target.setAttribute("id", "header")

		mutation_observer(target, cb, {
			attributes: true,
		})

		target.setAttribute("id", "footer")

		await sleep(0.01)

		expect(cb).toHaveBeenCalledTimes(1)

		target.setAttribute("id", "header")

		await sleep(0.01)

		expect(cb).toHaveBeenCalledTimes(2)

		const record = cb.mock.calls[0][0][0]

		expect(record).toBeInstanceOf(MutationRecord)

		expect(record.target).toBe(target)
	})

	it("should work with childList", async () => {
		const target = document.createElement("div")

		const cb = vitest.fn()

		mutation_observer(target, cb, {
			childList: true,
		})

		target.appendChild(document.createElement("div"))

		await sleep(0.01)

		expect(cb).toHaveBeenCalled()
	})

	it("should work with subtree", async () => {
		const target = document.createElement("div")
		const cb = vitest.fn()

		mutation_observer(target, cb, {
			subtree: true,
			childList: true,
		})

		const child = document.createElement("div")

		target.appendChild(child)
		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		child.appendChild(document.createElement("div"))
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(2)
	})

	it("should work with characterData", async () => {
		const target = document.createTextNode("123")
		const cb = vitest.fn()
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		mutation_observer(target, cb, {
			characterData: true,
		})
		target.data = "content"

		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		target.data = "footer"
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(2)
	})

	it("should work with attributeFilter", async () => {
		const target = document.createElement("div")
		const cb = vitest.fn()

		mutation_observer(target, cb, {
			attributes: true,
			attributeFilter: ["id"],
		})

		target.setAttribute("id", "footer")
		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		target.setAttribute("class", "footer")
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(1)
	})

	it("should work with attributeOldValue", async () => {
		const target = document.createElement("div")
		const cb = vitest.fn()

		mutation_observer(target, cb, {
			attributes: true,
			attributeOldValue: true,
		})

		target.setAttribute("id", "footer")
		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		const record = cb.mock.calls[0][0][0]
		expect(record.oldValue).toBe(null)

		target.setAttribute("id", "header")
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(2)

		const record2 = cb.mock.calls[1][0][0]
		expect(record2.oldValue).toBe("footer")
	})

	it("should work with characterDataOldValue", async () => {
		const target = document.createTextNode("123")
		const cb = vitest.fn()
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		mutation_observer(target, cb, {
			characterData: true,
			characterDataOldValue: true,
		})

		target.data = "content"
		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		const record = cb.mock.calls[0][0][0]
		expect(record.oldValue).toBe("123")

		target.data = "footer"
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(2)

		const record2 = cb.mock.calls[1][0][0]
		expect(record2.oldValue).toBe("content")
	})

	it("should work with stop", async () => {
		const target = document.createElement("div")
		const cb = vitest.fn()

		const { cleanup } = mutation_observer(target, cb, {
			attributes: true,
		})

		target.setAttribute("id", "footer")
		await sleep(0.01)
		expect(cb).toHaveBeenCalled()

		cleanup()

		target.setAttribute("id", "header")
		await sleep(0.01)
		expect(cb).toHaveBeenCalledTimes(1)
	})
})
