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
