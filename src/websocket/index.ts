import {
	browser,
	intervalFn,
	isWs,
	on_destroy,
	toReadable,
	toWritable,
	unstore,
} from "@sveu/shared"
import type { Fn } from "@sveu/shared"

import { on } from "../eventListener"
import type { WebSocketOptions, WebSocketStatus } from "../utils"

const DEFAULT_PING_MESSAGE = "ping"

function resolve_nested_options<T>(options: T | true): T {
	if (options === true) return {} as T
	return options
}

/**
 * Reactive WebSocket client.
 *
 * @param url - The websocket url.
 *
 * @param options - The websocket options.
 * - `onConnected` - The callback to be called when the websocket is connected.
 * - `onDisconnected` - The callback to be called when the websocket is disconnected.
 * - `onError` - The callback to be called when the websocket has an error.
 * - `onMessage` - The callback to be called when the websocket receives a message.
 * - `immediate` - Whether to connect to the websocket immediately. Default to `true`.
 * - `autoClose` - Whether to close the websocket connection when the websocket is disconnected. Default to `true`.
 * - `protocols` - The protocols to be used for the websocket connection. Default to `[]`.
 * - `heartbeat` - The heartbeat options. default to `false`.
 * - `heartbeat.message` - The message to be sent to the server for the heartbeat. Default to `ping`.
 * - `heartbeat.interval` - The interval in second to send the heartbeat message. Default to `1`.
 * - `heartbeat.timeout` - The timeout in second to wait for the pong message. Default to `1`.
 * - `autoReconnect` - Whether to automatically reconnect to the websocket server when the connection is closed. Default to `true`.
 * - `autoReconnect.retries` - The number of retries to reconnect to the websocket server. Default to `-1`.
 * - `autoReconnect.delay` - The delay in second before reconnecting to the websocket server. Default to `1`.
 * - `autoReconnect.onFailed` - The callback to be called On maximum retry times reached.
 *
 * @example
 * ```ts
 * const { data, status, ws, close, open, send } = websocket("ws://localhost:3000", {
 * 	onConnected: () => console.log("connected"),
 * 	onDisconnected: () => console.log("disconnected"),
 * 	onError: (e) => console.log(e),
 * 	onMessage: (data) => console.log(data),
 * 	immediate: true,
 * 	autoClose: true,
 * 	protocols: [],
 * 	heartbeat: {
 * 		message: "ping",
 * 		interval: 1,
 * 		timeout: 1,
 * 	},
 * 	autoReconnect: {
 * 		retries: -1,
 * 		delay: 1,
 * 		onFailed: () => console.log("failed"),
 * 	},
 * })
 * ```
 *
 * @example
 * ```ts
 * const { data, status, ws, close, open, send } = websocket("ws://localhost:3000", {
 * 	onConnected: () => console.log("connected"),
 * 	onDisconnected: () => console.log("disconnected"),
 * 	onError: (e) => console.log(e),
 * 	onMessage: (data) => console.log(data),
 * 	immediate: true,
 * 	autoClose: true,
 * 	protocols: [],
 * 	heartbeat: true,
 * 	autoReconnect: true,
 * })
 * ```
 *
 * @returns
 * - `data`: The data received from the websocket server.
 * - `status`: The current websocket status, can be only one of: 'OPEN', 'CONNECTING', 'CLOSED'
 * - `ws`: WebSocket instance.
 * - `close`: Closes the websocket connection gracefully.
 * - `open`: Reopen the websocket connection. If there the current one is active, will close it before opening a new one.
 * - `send`: Sends data through the websocket connection.
 */
export function websocket<T>(url: string, options: WebSocketOptions = {}) {
	const {
		onConnected,
		onDisconnected,
		onError,
		onMessage,
		immediate = true,
		autoClose = true,
		protocols = [],
	} = options

	const data = toWritable<T | null>(null)

	const status = toWritable<WebSocketStatus>("CLOSED")

	const ws_store = toWritable<WebSocket | undefined>(undefined)

	let heartbeat_pause: Fn | undefined

	let heartbeat_resume: Fn | undefined

	let explicitly_closed = false

	let retried = 0

	let buffered_data: (string | ArrayBuffer | Blob)[] = []

	let pong_timeout_wait: ReturnType<typeof setTimeout> | undefined

	/**
	 * Close the websocket connection.
	 *
	 * @param code - The code of the close event. Default to `1000`. see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
	 *
	 * @param reason - The reason of the close event.
	 *
	 */
	function close(code = 1000, reason?: string) {
		if (!unstore(ws_store)) return

		explicitly_closed = true

		heartbeat_pause?.()

		unstore(ws_store)?.close(code, reason)
	}

	function _send_buffer() {
		if (
			buffered_data?.length &&
			unstore(ws_store) &&
			unstore(status) === "OPEN"
		) {
			for (const buffer of buffered_data) unstore(ws_store)?.send(buffer)

			buffered_data = []
		}
	}

	function reset_heartbeat() {
		clearTimeout(pong_timeout_wait)
		pong_timeout_wait = undefined
	}

	/**
	 * Send data to the websocket server.
	 *
	 * @param data - The data to send.
	 *
	 * @param buffer - Whether to buffer the data if the websocket is not connected. Default to `true`.
	 *
	 * @returns Whether the data is sent.
	 */
	function send(data: string | ArrayBuffer | Blob, buffer = true) {
		if (!unstore(ws_store) || unstore(status) !== "OPEN") {
			if (buffer) buffered_data = [...buffered_data, data]
			return false
		}

		_send_buffer()

		unstore(ws_store)?.send(data)

		return true
	}

	function _init() {
		if (explicitly_closed) return

		const ws = new WebSocket(url, protocols)

		ws_store.set(ws)

		status.set("CONNECTING")

		ws.onopen = () => {
			status.set("OPEN")

			onConnected?.(ws)

			heartbeat_resume?.()

			_send_buffer()
		}

		ws.onclose = (event: CloseEvent) => {
			status.set("CLOSED")

			ws_store.set(undefined)

			onDisconnected?.(ws, event)

			if (!explicitly_closed && options.autoReconnect) {
				const {
					retries = -1,
					delay = 1,
					onFailed,
				} = resolve_nested_options(options.autoReconnect)
				retried += 1

				if (
					typeof retries === "number" &&
					(retries < 0 || retried < retries)
				)
					setTimeout(_init, delay * 1000)
				else if (typeof retries === "function" && retries())
					setTimeout(_init, delay * 1000)
				else onFailed?.()
			}
		}

		ws.onerror = (event) => {
			onError?.(ws, event)
		}

		ws.onmessage = (event: MessageEvent<any>) => {
			if (options.heartbeat) {
				reset_heartbeat()
				const { message = DEFAULT_PING_MESSAGE } =
					resolve_nested_options(options.heartbeat)
				if (event.data === message) return
			}

			data.set(event.data)

			onMessage?.(ws, event)
		}
	}

	if (options.heartbeat) {
		const {
			message = DEFAULT_PING_MESSAGE,
			interval = 1,
			pongTimeout = 1,
		} = resolve_nested_options(options.heartbeat)

		const { pause, resume } = intervalFn(
			() => {
				send(message, false)
				pong_timeout_wait = setTimeout(() => {
					// auto-reconnect will be trigger with ws.onclose()
					close()
				}, pongTimeout * 1000)
			},
			interval,
			{ immediate: false }
		)

		heartbeat_pause = pause

		heartbeat_resume = resume
	}

	if (immediate && isWs) _init()

	if (autoClose) {
		if (browser) on(window, "beforeunload", () => close())

		on_destroy(close)
	}

	function open() {
		close()

		explicitly_closed = false

		retried = 0

		_init()
	}

	return {
		data: toReadable(data),
		status: toReadable(status),
		ws: toReadable(ws_store),
		close,
		send,
		open,
	}
}
