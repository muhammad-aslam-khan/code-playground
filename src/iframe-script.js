// console.log = (...args) => {
// 	window.parent.postMessage(
// 		{
// 			type: "CONSOLE_OUTPUT",
// 			method: "log",
// 			args: args,
// 		},
// 		"*",
// 	);
// };

window.addEventListener("message", (e) => {
	const message = e.data;

	if (message.type === "RUN_CODE") {
		try {
			const execute = new Function(message.code);
			execute();

			// console.log("Code Executed!");
		} catch (error) {
			console.error(error);
		}
	}
});

function sendConsoleMessage(method, args) {
	window.parent.postMessage(
		{
			type: "CONSOLE_OUTPUT",
			method: method,
			args: args,
		},
		"*",
	);
}

console.log = (...args) => sendConsoleMessage("log", args);
console.warn = (...args) => sendConsoleMessage("warn", args);
console.error = (...args) => sendConsoleMessage("error", args);
