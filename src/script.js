const editor = document.getElementById("code-editor");
const runBtn = document.getElementById("run-btn");
const clrConsoleBtn = document.getElementById("clr-console-btn");
const clrEditorBtn = document.getElementById("clr-editor-btn");

const iframe = document.querySelector("iframe");

const sMsgBtn = document.getElementById("sMsgBtn");
const codeOutput = document.getElementById("code-output");

runBtn.addEventListener("click", () => {
	codeOutput.textContent = "";

	const userCode = editor.value;

	// First, check JavaScript syntax
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

	iframe.contentWindow.postMessage(
		{
			type: "RUN_CODE",
			code: userCode,
		},
		"*",
	);
});

window.addEventListener("message", (e) => {
	if (e.source !== iframe.contentWindow) return;

	const message = e.data;
	// console.log(message.args);

	// Formatting the received data depending upon which type have been received
	if (message.type === "CONSOLE_OUTPUT") {
		const output = message.args.map((val) => formatValue(val)).join(" ");

		const outputLine = document.createElement("div");

		outputLine.classList.add("console-line", message.method);
		outputLine.textContent = output;

		codeOutput.appendChild(outputLine);
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
	}
});

editor.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.key === "Enter") {
		e.preventDefault(); // This prevents the browser's default Ctrl+Enter behavior, if any.
		runBtn.click();
	}
});

clrConsoleBtn.addEventListener("click", () => {
	codeOutput.textContent = "";
});

clrEditorBtn.addEventListener("click", () => {
	editor.value = "";
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
	} else if (typeof val === "object" && val !== null) {
		return `{${Object.entries(val)
			.map(([key, value]) => `${key}: ${formatValue(value)}`)
			.join(", ")}}`;
	} else {
		return String(val);
	}
}
