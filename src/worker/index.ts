import {
	browser,
	noop,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"

import { WebWorkerReturn, WorkerFn } from "../utils"

/**
 * Simple Web Workers registration and communication.
 *
 * @param url - URL of the worker
 *
 * @param options - [WorkerOptions](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker("worker.js")
 * ```
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker(() => new Worker("worker.js"))
 * ```
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker(new Worker("worker.js"))
 * ```
 *
 * @returns
 * - `data` - Data from the worker
 * - `error` - Error from the worker
 * - `wk` - Worker instance
 * - `post` - Function to send data to the worker
 * - `cleanup` - Function to terminate the worker
 */
export function worker<T>(
	url: string,
	options?: WorkerOptions
): WebWorkerReturn<T>
/**
 * Simple Web Workers registration and communication.
 *
 * @param worker - Worker function or Worker instance
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker("worker.js")
 * ```
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker(() => new Worker("worker.js"))
 * ```
 *
 * @example
 * ```ts
 * const { data, error, wk, post, cleanup } = worker(new Worker("worker.js"))
 * ```
 *
 * @returns
 * - `data` - Data from the worker
 * - `error` - Error from the worker
 * - `wk` - Worker instance
 * - `post` - Function to send data to the worker
 * - `cleanup` - Function to terminate the worker
 */
export function worker<T>(worker: Worker | WorkerFn): WebWorkerReturn<T>
export function worker<T>(
	arg: string | WorkerFn | Worker,
	options?: WorkerOptions
): WebWorkerReturn<T> {
	let unsubscribe: () => void = noop

	const data = toWritable<any>(null)

	const error = toWritable<any>(null)

	const wk = toWritable<Worker | undefined>(undefined)

	if (browser) {
		if (typeof arg === "string") wk.set(new Worker(arg, options))
		else if (typeof arg === "function") wk.set(arg())
		else wk.set(arg)

		unsubscribe = wk.subscribe((_worker) => {
			if (!_worker) return

			_worker.onmessage = (e: MessageEvent) => {
				data.set(e.data)
			}

			_worker.onerror = (e: ErrorEvent) => {
				error.set(e.error)
			}
		})
	}

	/**
	 * Send data to the worker
	 *
	 * @param value - Data to send
	 *
	 * @example
	 * ```ts
	 * post("Hello World!")
	 * ```
	 */
	function post<Y>(value: Y) {
		const _wk = unstore(wk)

		if (!_wk) return

		_wk.postMessage(value)
	}

	function cleanup() {
		unstore(wk)?.terminate()

		unsubscribe()
	}

	on_destroy(cleanup)

	return {
		data: toReadable(data),
		error: toReadable(error),
		wk: toReadable(wk),
		post,
		cleanup,
	}
}
