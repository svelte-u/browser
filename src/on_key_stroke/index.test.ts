import { beforeEach, describe, expect, it, vitest } from "vitest"

import { on_key_stroke } from "."
import type { KeyStrokeEvents } from "../utils"

describe("on_key_stroke", () => {
	let element: HTMLElement

	let spy: any

	beforeEach(() => {
		element = document.createElement("div")
		spy = vitest.fn()
	})

	function create_key_event(key: string, type: KeyStrokeEvents) {
		const ev = new KeyboardEvent(type, { key })

		element.dispatchEvent(ev)
	}

	it("listen to single key", () => {
		on_key_stroke("A", spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		expect(spy).toBeCalledTimes(1)
	})

	it("listen to multi keys", () => {
		on_key_stroke(["A", "B", "C"], spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		create_key_event("D", "keydown")

		expect(spy).toBeCalledTimes(3)
	})

	it("use function filter", () => {
		const filter = (event: KeyboardEvent) => {
			return event.key === "A"
		}

		on_key_stroke(filter, spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		expect(spy).toBeCalledTimes(1)
	})

	it("listen to all keys by boolean", () => {
		on_key_stroke(true, spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		create_key_event("D", "keydown")

		create_key_event("E", "keydown")

		expect(spy).toBeCalledTimes(5)
	})

	it("listen to all keys by constructor", () => {
		on_key_stroke(spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		create_key_event("D", "keydown")

		create_key_event("E", "keydown")

		expect(spy).toBeCalledTimes(5)
	})

	it("listen to keypress", () => {
		on_key_stroke("A", spy, { target: element, event: "keypress" })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("A", "keypress")

		create_key_event("B", "keypress")

		expect(spy).toBeCalledTimes(1)
	})
})
