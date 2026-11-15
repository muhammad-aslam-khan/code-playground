/*---------------------------------------------------------------------------------------------
 * We have the shared console-bridge.js available in both execution environments:
 * - Web Project: previewFrame initializes the bridge through preview.js.
 * - JavaScript Playground: jsFrame initializes the bridge through its load event.
 * Both can send console messages to the same parent console, using the same serialization logic.
 *--------------------------------------------------------------------------------------------*/

export function installConsoleBridge() {
	function sendConsoleMessage(method, args) {
		window.parent.postMessage(
			{
				type: "CONSOLE_OUTPUT",
				method,
				args,
			},
			"*",
		);
	}

	function sendPromiseUpdate(id, status, value) {
		window.parent.postMessage(
			{
				type: "PROMISE_UPDATE",
				id,
				status,
				value: serializeValue(value),
			},
			"*",
		);
	}

	function serializeValue(val) {
		if (typeof val === "function") {
			return { type: "function", name: val.name };
		} else if (typeof val === "symbol") {
			return {
				type: "symbol",
				description: val.description,
			};
		} else if (Array.isArray(val)) {
			return val.map(serializeValue);
		} else if (val instanceof Date || val instanceof RegExp) {
			return val;
		} else if (val instanceof Map) {
			const entries = Array.from(val.entries()).map(([key, value]) => [
				serializeValue(key),
				serializeValue(value),
			]);

			return { type: "map", entries };
		} else if (val instanceof Set) {
			const values = Array.from(val.values()).map(serializeValue);

			return { type: "set", values };
		} else if (val instanceof Error) {
			return {
				type: "error",
				name: val.name,
				message: val.message,
				stack: val.stack,
			};
		} else if (val instanceof WeakMap) {
			return { type: "weakmap" };
		} else if (val instanceof WeakSet) {
			return { type: "weakset" };
		} else if (val instanceof Promise) {
			const promiseId = crypto.randomUUID();

			val.then(
				(value) => {
					sendPromiseUpdate(promiseId, "fulfilled", value);
				},
				(reason) => {
					sendPromiseUpdate(promiseId, "rejected", reason);
				},
			);

			return { type: "promise", id: promiseId };
		} else if (typeof val === "object" && val !== null) {
			const entries = Object.entries(val).map(([key, value]) => [
				key,
				serializeValue(value),
			]);

			return Object.fromEntries(entries);
		} else {
			return val;
		}
	}

	console.log = (...args) =>
		sendConsoleMessage("log", args.map(serializeValue));

	console.warn = (...args) =>
		sendConsoleMessage("warn", args.map(serializeValue));

	console.error = (...args) =>
		sendConsoleMessage("error", args.map(serializeValue));
}
