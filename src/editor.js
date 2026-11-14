import { basicSetup } from "https://esm.sh/codemirror";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript";

import { EditorView, keymap } from "https://esm.sh/@codemirror/view"; // For handling 'keydown' events

const runBtn = document.getElementById("run-btn");

export const editor = new EditorView({
	doc: `console.log("Hello World!");`,
	extensions: [
		keymap.of([
			{
				key: "Mod-Enter",
				run: () => {
					runBtn.click();
					return true;
				},
			},
		]),
		basicSetup,
		javascript(),
	],
	parent: document.querySelector("#code-editor"),
});
