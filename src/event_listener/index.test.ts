import type { Fn } from "@sveu/shared"

import { beforeEach, describe, expect, it, vitest } from "vitest"
import type { SpyInstance } from "vitest"

import { event_listener, on } from "."

describe("event_listener", () => {
	const options = { capture: true }

	let stop: Fn

	let target: HTMLDivElement

	let remove_spy: SpyInstance

	let add_spy: SpyInstance

	beforeEach(() => {
		target = document.createElement("div")
		remove_spy = vitest.spyOn(target, "removeEventListener")
		add_spy = vitest.spyOn(target, "addEventListener")
	})

	it("should be defined", () => {
		expect(event_listener).toBeDefined()

		expect(on).toBeDefined()
	})

	describe("given both none array", () => {
		const listener = vitest.fn()

		const event = "click"

		beforeEach(() => {
			listener.mockReset()

			stop = on(target, event, listener, options)
		})

		it("should add listener", () => {
			expect(add_spy).toBeCalledTimes(1)
		})

		it("should trigger listener", () => {
			expect(listener).not.toBeCalled()

			target.dispatchEvent(new MouseEvent(event))

			expect(listener).toBeCalledTimes(1)
		})

		it("should remove listener", () => {
			expect(remove_spy).not.toBeCalled()

			stop()

			expect(remove_spy).toBeCalledTimes(1)

			expect(remove_spy).toBeCalledWith(event, listener, options)
		})
	})

	describe("given array of events but single listener", () => {
		const listener = vitest.fn()

		const events = ["click", "scroll", "blur", "resize"]

		beforeEach(() => {
			listener.mockReset()

			stop = on(target, events, listener, options)
		})

		it("should add listener for all events", () => {
			events.forEach((event) =>
				expect(add_spy).toBeCalledWith(event, listener, options)
			)
		})

		it("should trigger listener with all events", () => {
			expect(listener).not.toBeCalled()

			events.forEach((event, index) => {
				target.dispatchEvent(new Event(event))

				expect(listener).toBeCalledTimes(index + 1)
			})
		})

		it("should remove listener with all events", () => {
			expect(remove_spy).not.toBeCalled()

			stop()

			expect(remove_spy).toBeCalledTimes(events.length)

			events.forEach((event) =>
				expect(remove_spy).toBeCalledWith(event, listener, options)
			)
		})
	})

	describe("given single event but array of listeners", () => {
		const listeners = [vitest.fn(), vitest.fn(), vitest.fn()]

		const event = "click"

		beforeEach(() => {
			listeners.forEach((listener) => listener.mockReset())

			stop = on(target, event, listeners, options)
		})

		it("should add all listeners", () => {
			listeners.forEach((listener) =>
				expect(add_spy).toBeCalledWith(event, listener, options)
			)
		})

		it("should call all listeners with single click event", () => {
			listeners.forEach((listener) => expect(listener).not.toBeCalled())

			target.dispatchEvent(new Event(event))

			listeners.forEach((listener) => expect(listener).toBeCalledTimes(1))
		})

		it("should remove listeners", () => {
			expect(remove_spy).not.toBeCalled()

			stop()

			expect(remove_spy).toBeCalledTimes(listeners.length)

			listeners.forEach((listener) =>
				expect(remove_spy).toBeCalledWith(event, listener, options)
			)
		})
	})

	describe("given both array of events and listeners", () => {
		const listeners = [vitest.fn(), vitest.fn(), vitest.fn()]

		const events = ["click", "scroll", "blur", "resize", "custom-event"]

		beforeEach(() => {
			listeners.forEach((listener) => listener.mockReset())

			stop = event_listener(target, events, listeners, options)
		})

		it("should add all listeners for all events", () => {
			listeners.forEach((listener) => {
				events.forEach((event) => {
					expect(add_spy).toBeCalledWith(event, listener, options)
				})
			})
		})

		it("should call all listeners with all events", () => {
			events.forEach((event, index) => {
				target.dispatchEvent(new Event(event))

				listeners.forEach((listener) =>
					expect(listener).toBeCalledTimes(index + 1)
				)
			})
		})

		it("should remove all listeners with all events", () => {
			stop()

			listeners.forEach((listener) => {
				events.forEach((event) => {
					expect(remove_spy).toBeCalledWith(event, listener, options)
				})
			})
		})
	})

	it("should not listen when target is invalid", async () => {
		const listener = vitest.fn()

		const event = "click"

		stop = on(null, event, listener, options)

		expect(listener).not.toBeCalled()

		target.dispatchEvent(new MouseEvent(event))

		expect(listener).not.toBeCalled()

		stop()
	})
})
