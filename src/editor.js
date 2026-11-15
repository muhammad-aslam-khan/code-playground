import { basicSetup } from "https://esm.sh/codemirror";
// import { EditorView, keymap } from "https://esm.sh/@codemirror/view"; // For handling 'keydown' events

// Languages support
import { html } from "https://esm.sh/@codemirror/lang-html";
import { css } from "https://esm.sh/@codemirror/lang-css";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript";

// Code formatting
import { Compartment } from "https://esm.sh/@codemirror/state";
import { indentUnit } from "https://esm.sh/@codemirror/language";
import { closeBrackets } from "https://esm.sh/@codemirror/autocomplete";
import { bracketMatching } from "https://esm.sh/@codemirror/language";
import {
	EditorView,
	keymap,
	highlightActiveLine,
	highlightActiveLineGutter,
	drawSelection,
} from "https://esm.sh/@codemirror/view";

// Internal project imports
import { projectFiles } from "./project.js";

const languageCompartment = new Compartment();

const runBtn = document.getElementById("run-btn");

export const editor = new EditorView({
	// doc: projectFiles["index.html"].content,
	doc: "",
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
		languageCompartment.of(html()),

		indentUnit.of("    "),
		closeBrackets(),
		bracketMatching(),
		EditorView.lineWrapping,
		highlightActiveLine(),
		highlightActiveLineGutter(),
		drawSelection(),

		EditorView.theme({
			"&": {
				height: "100%",
				fontSize: "12px",
			},

			".cm-scroller": {
				overflow: "auto",
				fontFamily:
					"'JetBrains Mono', Consolas, 'Courier New', monospace",
			},

			/*
			".cm-gutters": {
				backgroundColor: "#f5f5f5",
				color: "#888",
				border: "none",
			},

			".cm-activeLineGutter": {
				backgroundColor: "#e5edf5",
			},

			".cm-activeLine": {
				backgroundColor: "#f0f5fa",
			},

			".cm-selectionBackground": {
				backgroundColor: "#b9d7f5",
			},

			"&.cm-focused .cm-selectionBackground": {
				backgroundColor: "#b9d7f5",
			},

			"&.cm-focused .cm-activeLine": {
				backgroundColor: "transparent",
			},
			*/
		}),
	],
	parent: document.querySelector("#code-editor"),
});

export function setEditorLanguage(filePath) {
	let language;

	if (filePath.endsWith(".html")) {
		language = html();
	} else if (filePath.endsWith(".css")) {
		language = css();
	} else if (filePath.endsWith(".js")) {
		language = javascript();
	} else {
		language = [];
	}

	editor.dispatch({
		effects: languageCompartment.reconfigure(language),
	});
}
