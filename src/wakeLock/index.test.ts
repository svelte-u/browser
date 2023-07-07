import { sleep, unstore } from "@sveu/shared"

import { describe, expect, it } from "vitest"

import { wakeLock } from "."
import type { WakeLockSentinel } from "../utils"

describe("wakeLock", () => {
	it("active not changed if not supported", async () => {
		const { active, request, release } = wakeLock()

		expect(unstore(active)).toBeFalsy()

		await request("screen")

		expect(unstore(active)).toBeFalsy()

		await release()

		expect(unstore(active)).toBeFalsy()
	})

	it("active changed if supported", async () => {
		const create_wakeLock = () => {
			let _released = false

			return {
				get released() {
					return _released
				},

				release: () => {
					_released = true
					return Promise.resolve()
				},
			} as WakeLockSentinel
		}

		Object.defineProperty(navigator, "wakeLock", {
			value: { request: () => create_wakeLock() },
			writable: true,
		})
		const { active, request, release } = wakeLock()

		expect(unstore(active)).toBeFalsy()

		await request("screen")

		expect(unstore(active)).toBeTruthy()

		await release()

		expect(unstore(active)).toBeFalsy()
	})

	it("active changed if show other tabs or minimize window", async () => {
		const create_wakeLock = () => {
			let _released = false

			return {
				get released() {
					return _released
				},

				release: () => {
					_released = true
					return Promise.resolve()
				},
			} as WakeLockSentinel
		}

		Object.defineProperty(navigator, "wakeLock", {
			value: { request: () => create_wakeLock() },
			writable: true,
		})

		const { active, request } = wakeLock()

		expect(unstore(active)).toBeFalsy()

		await request("screen")

		await sleep(0.01)

		expect(unstore(active)).toBeTruthy()

		document.dispatchEvent(new window.Event("visibilitychange"))

		expect(unstore(active)).toBeTruthy()
	})
})
