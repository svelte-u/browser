import type { Readable } from "svelte/store"

import type { AnyFn, IntervalFnOptions } from "@sveu/shared"

export interface MemoryInfo {
	/**
	 * The maximum size of the heap, in bytes, that is available to the context.
	 */
	jsHeapSizeLimit: number
	/**
	 *  The total allocated heap size, in bytes.
	 */
	totalJSHeapSize: number
	/**
	 * The currently active segment of JS heap, in bytes.
	 */
	usedJSHeapSize: number
}

export interface MemoryOptions extends IntervalFnOptions {
	/** The interval in seconds to check the memory. */
	interval?: number
}

export type PerformanceMemory = Performance & {
	memory: MemoryInfo
}

export interface FaviconOptions {
	/** The base url to prepend to the favicon. */
	base_url?: string

	/** The rel attribute of the favicon. */
	rel?: string
}

export interface InferEventTarget<Events> {
	addEventListener(event: Events, fn?: AnyFn, options?: any): any

	removeEventListener(event: Events, fn?: AnyFn, options?: any): any
}

export interface GeneralEventListener<E = Event> {
	(evt: E): void
}

export type ListAble<T> = T[] | T

export interface BroadcastChannelOptions {
	/**
	 * The name of the channel.
	 * @defaultValue "default"
	 */
	name?: string
}

export interface PushOptions {
	/**
	 * Convert the push object into a base64 string
	 *
	 * @defaultValue true
	 */
	base64?: boolean

	/**
	 * Start subscribing, when the user is visible
	 *
	 * @defaultValue true
	 */
	user_visible_only?: boolean
}

type DescriptorNamePolyfill =
	| "accelerometer"
	| "accessibility-events"
	| "ambient-light-sensor"
	| "background-sync"
	| "camera"
	| "clipboard-read"
	| "clipboard-write"
	| "gyroscope"
	| "magnetometer"
	| "microphone"
	| "notifications"
	| "payment-handler"
	| "persistent-storage"
	| "push"
	| "speaker"

export type GeneralPermissionDescriptor =
	| PermissionDescriptor
	| { name: DescriptorNamePolyfill }

export interface PermissionOptions<Controls extends boolean> {
	/**
	 * Expose more controls
	 *
	 * @defaultValue false
	 */
	controls?: Controls
}

export type PermissionReturn = Readable<PermissionState | undefined>

export interface PermissionReturnWithControls {
	/** The permission state. */
	state: PermissionReturn

	/** Whether the permission is supported. */
	supported: Readable<boolean>

	/** Query the permission state. */
	query: () => Promise<PermissionStatus | undefined>
}

export interface ClipboardOptions<Source> {
	/**
	 * Enabled reading for clipboard
	 *
	 * @defaultValue false
	 */
	read?: boolean

	/**
	 * Copy source
	 */
	source?: Source

	/**
	 * Seconds to reset state of `copied` ref
	 *
	 * @defaultValue 1.5
	 */
	copied_during?: number

	/**
	 * Whether fallback to document.execCommand('copy') if clipboard is undefined.
	 *
	 * @defaultValue false
	 */
	legacy?: boolean
}

export interface ClipboardReturn<Optional> {
	/** Returns whether the clipboard is supported. */
	supported: Readable<boolean>

	/** The text in the clipboard. */
	text: Readable<string>

	/** Whether the text is copied. */
	copied: Readable<boolean>

	/** A function to copy the text to the clipboard. */
	copy: Optional extends true
		? (text?: string) => Promise<void>
		: (text: string) => Promise<void>
}

export interface FileDialogOptions {
	/**
	 * Allowed multiple files selection.
	 *
	 * @defaultValue true
	 */
	multiple?: boolean

	/**
	 * Allowed file types.
	 *
	 * @defaultValue '*'
	 */
	accept?: string

	/**
	 * Select the input source for the capture file.
	 *
	 * @see [HTMLInputElement Capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
	 */
	capture?: string
}

export type NetworkType =
	| "bluetooth"
	| "cellular"
	| "ethernet"
	| "none"
	| "wifi"
	| "wimax"
	| "other"
	| "unknown"

export type NetworkEffectiveType = "slow-2g" | "2g" | "3g" | "4g" | undefined

export interface RafFnOptions {
	/**
	 * Start the requestAnimationFrame loop immediately on creation
	 *
	 * @defaultValue true
	 */
	immediate?: boolean
}

export interface FpsOptions {
	/**
	 * Calculate the FPS on every x frames.
	 * @defaultValue 10
	 */
	every?: number
}
