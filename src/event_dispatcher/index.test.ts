import { beforeEach, describe, expect, it, vitest } from "vitest"
import type { SpyInstance } from "vitest"

import { event_dispatcher } from "../event_dispatcher"
import { on } from "../event_listener"

describe("event_dispatcher", () => {
	let target: HTMLDivElement

	let spy: SpyInstance

	beforeEach(() => {
		target = document.createElement("div")
		spy = vitest.spyOn(target, "dispatchEvent")
	})

	it("should be defined", () => {
		expect(event_dispatcher).toBeDefined()
	})

	it("should dispatch event", () => {
		const dispatch = event_dispatcher(target)

		expect(spy).not.toBeCalled()

		dispatch("click", "value")

		expect(spy).toBeCalledTimes(1)
	})

	it("should dispatch event and listen for click event", () => {
		const dispatch = event_dispatcher(target)

		expect(spy).not.toBeCalled()

		dispatch("click", "value")

		expect(spy).toBeCalledTimes(1)

		on(target, "click", (e: CustomEvent) => {
			expect(e.detail).toBe("value")
		})
	})
})
