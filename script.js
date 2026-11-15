import { editor } from "./src/editor.js";
import { projectFiles } from "./src/project.js";
import "./src/layout.js";
import "./src/explorer.js";
import { updatePreview } from "./src/preview.js";
import { installConsoleBridge } from "./src/console-bridge.js";

// updatePreview(); // Renders the preview if we have code in our project when page loads
// console.log(projectFiles);

const executionMode = document.querySelector("#execution-mode");
const runBtn = document.querySelector("#run-btn");
const clrConsoleBtn = document.querySelector("#clr-console-btn");
const clrEditorBtn = document.querySelector("#clr-editor-btn");

const jsFrame = document.querySelector("#execution-frame"); // The iframe to run JS code only
const previewFrame = document.getElementById("preview-frame"); // The iframe of preview section
const codeOutput = document.getElementById("code-output");
const promiseOutputLines = new Map();

/******************************
// previewFrame: runs the complete HTML/CSS/JS project.
// jsFrame: remains available for the standalone JavaScript playground.
// console-bridge.js: provides the shared console serialization and messaging logic.
// Parent message listener: accepts messages from both frames.
// Current Run button: calls updatePreview() only.
******************************/

runBtn.addEventListener("click", () => {
	codeOutput.textContent = "";

	const userCode = editor.state.doc.toString();

	if (executionMode.value === "javascript") {
		// Check JavaScript syntax
		try {
			acorn.parse(userCode, {
				ecmaVersion: "latest",
				locations: true,
			});
		} catch (error) {
			const outputLine = document.createElement("div");
			outputLine.classList.add("console-line", "error");

			outputLine.textContent = `SyntaxError: ${error.message} (Line ${error.loc.line}, Column ${error.loc.column + 1})`;

			codeOutput.appendChild(outputLine);
			return;
		}

		// Execute standalone JavaScript
		jsFrame.contentWindow.postMessage(
			{
				type: "RUN_CODE",
				code: userCode,
			},
			"*",
		);
	} else if (executionMode.value === "project") {
		// Render the complete Web Project
		updatePreview();
	}
});

/*// runBtn.addEventListener("click", () => {
// 	codeOutput.textContent = "";

// 	updatePreview(); // Rendering the preview

// 	// // const userCode = editor.value;
// 	// const userCode = editor.state.doc.toString();

// 	// // First, check JavaScript syntax
// 	// try {
// 	// 	acorn.parse(userCode, {
// 	// 		ecmaVersion: "latest",
// 	// 		locations: true,
// 	// 	});
// 	// } catch (error) {
// 	// 	const outputLine = document.createElement("div");
// 	// 	outputLine.classList.add("console-line", "error");

// 	// 	outputLine.textContent = `SyntaxError: ${error.message} (Line ${error.loc.line}, Column ${error.loc.column + 1})`;
// 	// 	codeOutput.appendChild(outputLine);

// 	// 	return;
// 	// }

// 	// jsFrame.contentWindow.postMessage(
// 	// 	{
// 	// 		type: "RUN_CODE",
// 	// 		code: userCode,
// 	// 	},
// 	// 	"*",
// 	// );
// });
*/

// Our main web page (parent) message eventhandler
window.addEventListener("message", (e) => {
	// If message is not from either one of these iframes, return
	if (
		e.source !== jsFrame.contentWindow &&
		e.source !== previewFrame.contentWindow
	)
		return;

	const message = e.data;
	// console.log(message.args);

	// This let the JS-iframe install the bridge itself after it loads
	// and is ready. Meaning, This tells the parent to send the shared
	// bridge function only when the standalone JavaScript iframe
	// announces that it is ready.
	if (message.type === "IFRAME_READY") {
		if (e.source === jsFrame.contentWindow) {
			jsFrame.contentWindow.postMessage(
				{
					type: "INSTALL_CONSOLE_BRIDGE",
					code: installConsoleBridge.toString(),
				},
				"*",
			);
		}

		return;
	}

	// Formatting the received data depending upon which type have been received
	if (message.type === "CONSOLE_OUTPUT") {
		const output = message.args.map((val) => formatValue(val)).join(" ");

		const outputLine = document.createElement("div");

		outputLine.classList.add("console-line", message.method);
		outputLine.textContent = output;

		codeOutput.appendChild(outputLine);

		message.args.forEach((val) => {
			if (val && typeof val === "object" && val.type === "promise") {
				promiseOutputLines.set(val.id, outputLine);
			}
		});
	} else if (message.type === "EXECUTION_STATUS") {
		const statusLine = document.createElement("div");
		statusLine.classList.add("console-line");

		if (message.status === "success") {
			statusLine.textContent = "Code executed successfully!";
		} else if (message.status === "error") {
			statusLine.textContent = "Code execution failed!";
			statusLine.classList.add("error");
		}

		codeOutput.appendChild(statusLine);
	} else if (message.type === "PROMISE_UPDATE") {
		const outputLine = promiseOutputLines.get(message.id);

		if (outputLine) {
			const result = formatValue(message.value);
			outputLine.textContent = `Promise {<${message.status}>: ${result}}`;
			promiseOutputLines.delete(message.id);
		}
	}
});

/******************************
This cove structure below covers both possibilities:
- The iframe loads after the parent listener is ready.
- The iframe has already loaded before the parent listener is ready.
******************************/
function notifyJsFrame() {
	jsFrame.contentWindow.postMessage({ type: "PARENT_READY" }, "*");
}
jsFrame.addEventListener("load", notifyJsFrame);
notifyJsFrame(); // Also send once in case the iframe has already loaded.

clrEditorBtn.addEventListener("click", () => {
	editor.dispatch({
		changes: {
			from: 0,
			to: editor.state.doc.length,
			insert: "",
		},
	});
});

clrConsoleBtn.addEventListener("click", () => {
	codeOutput.textContent = "";
});

function formatValue(val) {
	if (val === null) {
		return "null";
	} else if (val instanceof Date) {
		return val.toString();
	} else if (val instanceof RegExp) {
		return `/${val.source}/${val.flags}`;
	} else if (typeof val === "function") {
		return `ƒ ${val.name}() { ... }`;
	} else if (Array.isArray(val)) {
		return `[${val.map((item) => formatValue(item)).join(", ")}]`;
	} else if (typeof val === "object" && val.type === "function") {
		return `ƒ ${val.name}() { ... }`;
	} else if (typeof val === "object" && val.type === "symbol") {
		return `Symbol(${val.description})`;
	} else if (typeof val === "object" && val.type === "map") {
		const mapEntries = val.entries
			.map(
				([key, value]) =>
					`${formatValue(key)} => ${formatValue(value)}`,
			)
			.join(", ");
		return `Map(${val.entries.length}) {${mapEntries}}`;
	} else if (typeof val === "object" && val.type === "set") {
		const setValues = val.values
			.map((value) => formatValue(value))
			.join(", ");
		return `Set(${val.values.length}) {${setValues}}`;
	} else if (typeof val === "object" && val.type === "error") {
		return `${val.name}: ${val.message}`;
	} else if (typeof val === "object" && val.type === "weakmap") {
		return "WeakMap {}";
	} else if (typeof val === "object" && val.type === "weakset") {
		return "WeakSet {}";
	} else if (val.type === "promise") {
		return "Promise {<pending>}";
	} else if (typeof val === "object" && val !== null) {
		return `{${Object.entries(val)
			.map(([key, value]) => `${key}: ${formatValue(value)}`)
			.join(", ")}}`;
	} else {
		return String(val);
	}
}

// Temp test code below

/* Run button work flow
			Run Button
				|
		Execution Mode
			/          \
JavaScript          Web Project
		|                   |
	Acorn             updatePreview()
		|                   |
	jsFrame             previewFrame
		\                   /
		Shared Console

----------------------*/
