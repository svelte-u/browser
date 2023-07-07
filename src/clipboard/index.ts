import { timeoutFn, toReadable, toWritable, unstore } from "@sveu/shared"

import { on } from "../eventListener"
import { support } from "../support"
import type { ClipboardOptions, ClipboardReturn } from "../utils"

/**
 * Reactive Clipboard API.
 *
 * @param options - The options for the clipboard.
 * - `read` - Enabled reading for clipboard. default: `false`
 * - `source` - Copy source.
 * - `copiedDuring` - Seconds to reset state of `copied` ref. default: `1.5`
 * - `legacy` - Whether fallback to document.execCommand('copy') if clipboard is undefined. default: `false`
 *
 * @example
 * ```ts
 * const { supported, text, copied, copy } = clipboard()
 * ```
 *
 * @returns
 * - `supported` - Returns whether the clipboard is supported.
 * - `text` - The text in the clipboard.
 * - `copied` - Whether the text is copied.
 * - `copy` - A function to copy the text to the clipboard.
 */
export function clipboard(
	options?: ClipboardOptions<undefined>
): ClipboardReturn<false>
export function clipboard(
	options: ClipboardOptions<string>
): ClipboardReturn<true>
export function clipboard(
	options: ClipboardOptions<string | undefined> = {}
): ClipboardReturn<boolean> {
	const { read = false, source, copiedDuring = 1.5, legacy = false } = options

	const events = ["copy", "cut"]

	const clipboard_supported = support("clipboard")

	const supported = toReadable(clipboard_supported || legacy)

	const text = toWritable("")

	const copied = toWritable(false)

	const timeout = timeoutFn(() => copied.set(false), copiedDuring, {
		immediate: false,
	})

	/** Update text when clipboard changes. */
	async function update_text() {
		if (unstore(clipboard_supported)) {
			const value = (await navigator?.clipboard.readText()) ?? ""
			text.set(value)
		} else text.set(legacy_read())
	}

	if (unstore(supported) && read) {
		for (const event of events)
			on(event as keyof WindowEventMap, update_text)
	}

	/** Copy text to clipboard.
	 *
	 * @param value - The text to copy.
	 *
	 * @example
	 * ```ts
	 * copy("Hello World!")
	 *
	 * // or
	 *
	 * copy() // copy from source
	 * ```
	 *
	 */
	async function copy(value = source) {
		if (unstore(supported) && value != null) {
			if (unstore(clipboard_supported) && !legacy)
				await navigator?.clipboard.writeText(value)
			else legacy_copy(value)

			text.set(value)

			copied.set(true)

			timeout.resume()
		}
	}

	/**
	 * The legacy copy function.
	 *
	 * @param value - The text to copy.
	 */
	function legacy_copy(value: string) {
		const ta = document.createElement("textarea")
		ta.value = value ?? ""
		ta.style.position = "absolute"
		ta.style.opacity = "0"
		document.body.appendChild(ta)
		ta.select()
		document.execCommand("copy")
		ta.remove()
	}

	/** The legacy read function.
	 *
	 * @returns The text in the clipboard.
	 */
	function legacy_read() {
		return document?.getSelection?.()?.toString() ?? ""
	}

	return {
		supported,
		text: toReadable(text),
		copied: toReadable(copied),
		copy,
	}
}
