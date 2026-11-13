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
	// console.log(e.data);

	const message = e.data;

	if (message.type === "CONSOLE_OUTPUT") {
		const output = message.args
			.map((val) => {
				if (typeof val === "object") {
					return JSON.stringify(val);
				}

				return String(val);
			})
			.join(" ");

		// codeOutput.textContent += output + "\n";
		// codeOutput.textContent += `[${message.method.toUpperCase()}] ${output}\n`;

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
