import { browser, createEventHook, toReadable, toWritable } from "@sveu/shared"
import { contains } from "@sveu/shared/dicts"

import type { FileDialogOptions } from "../utils"

const DEFAULT_OPTIONS: FileDialogOptions = {
	multiple: true,
	accept: "*",
	reset: false,
}

/**
 * Open file dialog with ease.
 *
 * @param options - Options
 * - `multiple` - Allowed multiple files selection.
 * - `accept` - Allowed file types.
 * - `capture` - Capture mode.
 *
 * @example
 * ```ts
 * const { files, accepted, rejected, open, reset, onChange } = fileDialog()
 * ```
 * @example
 * ```ts
 * const { files, accepted, rejected, open, reset, onChange } = fileDialog({
 * 	multiple: false,
 * 	accept: "image/*",
 * 	capture: "user",
 *  reset: true,
 * })
 * ```
 *
 * @returns
 * - `files` - The files selected.
 * - `accepted` - The files accepted.
 * - `rejected` - The files rejected.
 * - `open` - Open file dialog.
 * - `reset` - Reset file dialog.
 * - `onChange` - The event when the files change.
 */
export function fileDialog(options: FileDialogOptions = {}) {
	const files = toWritable<FileList | null>(null)

	const accepted = toWritable<File[] | null>(null)

	const rejected = toWritable<File[] | null>(null)

	const { on: onChange, trigger } = createEventHook()

	let input: HTMLInputElement | undefined

	if (browser) {
		input = document.createElement("input")
		input.type = "file"

		input.onchange = (event: Event) => {
			const result = event.target as HTMLInputElement

			files.set(result.files)

			trigger(files)

			if (result.accept && result.files && result.accept !== "*") {
				const _accepted = Array.from(result.files).filter((file) => {
					const regex = new RegExp(result.accept.replace(/\*/g, ".*"))
					return regex.test(file.type)
				})

				const _rejected = Array.from(result.files).filter((file) => {
					const regex = new RegExp(result.accept.replace(/\*/g, ".*"))
					return !regex.test(file.type)
				})

				accepted.set(_accepted)

				rejected.set(_rejected)
			}
		}
	}

	/**
	 * Open file dialog.
	 *
	 * @param localOptions - Override default options when opening.
	 *
	 */
	function open(localOptions?: Partial<FileDialogOptions>) {
		if (!input) return

		const _options = {
			...DEFAULT_OPTIONS,
			...options,
			...localOptions,
		}

		input.multiple = _options.multiple ?? true

		input.accept = _options.accept ?? "*"

		if (contains(_options, "capture"))
			input.capture = _options.capture ?? ""

		if (_options.reset) reset()

		input.click()
	}

	/** Reset file dialog. */
	function reset() {
		files.set(null)

		accepted.set(null)

		rejected.set(null)

		if (input) input.value = ""
	}

	return {
		files: toReadable(files),
		accepted: toReadable(accepted),
		rejected: toReadable(rejected),
		open,
		reset,
		onChange,
	}
}
