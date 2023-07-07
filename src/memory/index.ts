import { intervalFn, toReadable, toWritable, unstore } from "@sveu/shared"

import { support } from "../support"
import { MemoryInfo, MemoryOptions, PerformanceMemory } from "../utils"

/**
 * Reactive Memory Info.
 *
 * @param options - Options to use:
 * - `interval` - The interval in seconds to check the memory.
 * - `IntervalFnOptions` - Options from `intervalfn`.
 *
 * @example
 * ```ts
 * const { supported, result } = memory()
 * ```
 *
 * @returns
 * - `supported` - If the browser supports the `memory` API.
 * - `result` - A readable store with the memory info.
 *
 */
export function memory(options: MemoryOptions = {}) {
	const _memory = toWritable<MemoryInfo | undefined>(undefined)

	const supported = support("memory", "performance")

	if (unstore(supported)) {
		const { interval = 1 } = options

		intervalFn(
			() => {
				_memory.set({
					jsHeapSizeLimit: (performance as PerformanceMemory).memory
						.jsHeapSizeLimit,
					totalJSHeapSize: (performance as PerformanceMemory).memory
						.totalJSHeapSize,
					usedJSHeapSize: (performance as PerformanceMemory).memory
						.usedJSHeapSize,
				})
			},
			interval,
			{
				immediate: options.immediate,
				immediateCallback: options.immediateCallback,
			}
		)
	}

	return { supported, result: toReadable(_memory) }
}
