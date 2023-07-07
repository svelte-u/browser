import { beforeEach, describe, expect, it, vitest } from "vitest"

import { onKeyStroke } from "."
import type { KeyStrokeEvents } from "../utils"

describe("onKeyStroke", () => {
	let element: HTMLElement

	let spy: any

	beforeEach(() => {
		element = document.createElement("div")
		spy = vitest.fn()
	})

	function create_key_event(
		key: string,
		type: KeyStrokeEvents,
		repeat = false
	) {
		const ev = new KeyboardEvent(type, { key, repeat })

		element.dispatchEvent(ev)
	}

	it("listen to single key", () => {
		onKeyStroke("A", spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		expect(spy).toBeCalledTimes(1)
	})

	it("listen to multi keys", () => {
		onKeyStroke(["A", "B", "C"], spy, { target: element })

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

		onKeyStroke(filter, spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		expect(spy).toBeCalledTimes(1)
	})

	it("listen to all keys by boolean", () => {
		onKeyStroke(true, spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		create_key_event("D", "keydown")

		create_key_event("E", "keydown")

		expect(spy).toBeCalledTimes(5)
	})

	it("listen to all keys by constructor", () => {
		onKeyStroke(spy, { target: element })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("C", "keydown")

		create_key_event("D", "keydown")

		create_key_event("E", "keydown")

		expect(spy).toBeCalledTimes(5)
	})

	it("listen to keypress", () => {
		onKeyStroke("A", spy, { target: element, event: "keypress" })

		create_key_event("A", "keydown")

		create_key_event("B", "keydown")

		create_key_event("A", "keypress")

		create_key_event("B", "keypress")

		expect(spy).toBeCalledTimes(1)
	})
	it("ignore repeated events", () => {
		onKeyStroke("A", spy, { target: element, dedupe: true })

		create_key_event("A", "keydown", false)

		create_key_event("A", "keydown", true)

		create_key_event("A", "keydown", true)

		create_key_event("A", "keydown", true)

		expect(spy).toBeCalledTimes(1)
	})
})
