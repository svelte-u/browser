import type { Readable } from "svelte/store"

import type {
	AnyFn,
	ConfigurableEventFilter,
	IntervalFnOptions,
} from "@sveu/shared"

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

export type Breakpoints<K extends string = string> = Record<K, number | string>

export interface EyeDropperOpenOptions {
	/**
	 * The signal to abort the eye dropper.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 */
	signal?: AbortSignal
}

export interface EyeDropper {
	// eslint-disable-next-line @typescript-eslint/no-misused-new
	new (): EyeDropper

	open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>
	[Symbol.toStringTag]: "EyeDropper"
}

export interface EyeDropperOptions {
	/**
	 * Initial sRGBHex.
	 *
	 * @defaultValue ''
	 */
	initial?: string
}

export interface GeolocationOptions {
	/** Whether to enable high accuracy.
	 *
	 * @defaultValue true
	 */
	high?: boolean

	/** The maximum age of a cached position in seconds.
	 *
	 * @defaultValue 3
	 */
	max_age?: number

	/** The timeout in seconds.
	 *
	 * @defaultValue 27
	 */
	timeout?: number

	/**
	 * To start the geolocation immediately
	 *
	 * @defaultValue true
	 */
	immediate?: boolean
}

export interface ImageOptions {
	/** Address of the resource */
	src: string
	/** Images to use in different situations, e.g., high-resolution displays, small monitors, etc. */
	srcset?: string
	/** Image sizes for different page layouts */
	sizes?: string
}

export interface IntersectionObserverOptions {
	/**
	 * The Element or Document whose bounds are used as the bounding box when testing for intersection.
	 */
	root?: HTMLElement | SVGElement | undefined | null

	/**
	 * A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
	 *
	 * @defaultValue "0px"
	 */
	margin?: string

	/**
	 * Either a single number or an array of numbers between 0.0 and 1.
	 *
	 * @defaultValue 0.1
	 */
	threshold?: number | number[]
}

export interface Position {
	x: number
	y: number
}

export interface MouseOptions extends ConfigurableEventFilter {
	/**
	 * Mouse position based by page, client, or relative to previous position
	 *
	 * @defaultValue 'page'
	 */
	type?: "page" | "client" | "movement"

	/**
	 * Listen to `touchmove` events
	 *
	 * @defaultValue true
	 */
	touch?: boolean

	/**
	 * Reset to initial value when `touchend` event fired
	 *
	 * @defaultValue false
	 */
	reset_on_touch_ends?: boolean

	/**
	 * Initial values
	 */
	initial_value?: Position
}

export type MouseSourceType = "mouse" | "touch" | null

export interface WebNotificationOptions {
	/**
	 * The title read-only property of the Notification interface indicates
	 * the title of the notification
	 *
	 * @defaultValue ''
	 */
	title?: string
	/**
	 * The body string of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @defaultValue ''
	 */
	body?: string
	/**
	 * The text direction of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @defaultValue ''
	 */
	dir?: "auto" | "ltr" | "rtl"
	/**
	 * The language code of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @defaultValue DOMString
	 */
	lang?: string
	/**
	 * The ID of the notification(if any) as specified in the constructor's options
	 * parameter.
	 *
	 * @defaultValue ''
	 */
	tag?: string
	/**
	 * The URL of the image used as an icon of the notification as specified
	 * in the constructor's options parameter.
	 *
	 * @defaultValue ''
	 */
	icon?: string
	/**
	 * Specifies whether the user should be notified after a new notification
	 * replaces an old one.
	 *
	 * @defaultValue false
	 */
	renotify?: boolean
	/**
	 * A boolean value indicating that a notification should remain active until the
	 * user clicks or dismisses it, rather than closing automatically.
	 *
	 * @defaultValue false
	 */
	requireInteraction?: boolean
	/**
	 * The silent read-only property of the Notification interface specifies
	 * whether the notification should be silent, i.e., no sounds or vibrations
	 * should be issued, regardless of the device settings.
	 *
	 * @defaultValue false
	 */
	silent?: boolean
	/**
	 * Specifies a vibration pattern for devices with vibration hardware to emit.
	 * A vibration pattern, as specified in the Vibration API spec
	 *
	 * @see https://w3c.github.io/vibration/
	 */
	vibrate?: number[]
}
