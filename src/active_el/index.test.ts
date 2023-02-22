import { unstore } from "@sveu/shared"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { active_el } from "."

describe("active_el", () => {
	let shadowHost: HTMLElement

	let input: HTMLInputElement

	let shadowInput: HTMLInputElement

	let shadowRoot: ShadowRoot

	beforeEach(() => {
		shadowHost = document.createElement("div")

		shadowRoot = shadowHost.attachShadow({ mode: "open" })

		input = document.createElement("input")

		shadowInput = input.cloneNode() as HTMLInputElement

		shadowRoot.appendChild(shadowInput)

		document.body.appendChild(input)

		document.body.appendChild(shadowHost)
	})

	afterEach(() => {
		shadowHost.remove()
		input.remove()
	})

	it("should be defined", () => {
		expect(active_el).toBeDefined()
	})

	it("should initialize correctly", () => {
		const el = active_el()

		expect(unstore(el)).to.equal(document.body)
	})

	it("should initialize with already-active element", () => {
		input.focus()

		const el = active_el()

		expect(unstore(el)).to.equal(input)
	})

	it("should observe focus/blur events", () => {
		const el = active_el()

		input.focus()

		expect(unstore(el)).to.equal(input)

		input.blur()

		expect(unstore(el)).to.equal(document.body)
	})
})
