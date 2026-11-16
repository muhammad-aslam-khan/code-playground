import { basicSetup } from "https://esm.sh/codemirror";
// import { EditorView, keymap } from "https://esm.sh/@codemirror/view"; // For handling 'keydown' events

// Languages support
import { html } from "https://esm.sh/@codemirror/lang-html";
import { css } from "https://esm.sh/@codemirror/lang-css";
import {
	javascript,
	javascriptLanguage,
} from "https://esm.sh/@codemirror/lang-javascript";

// Code formatting
import { Compartment } from "https://esm.sh/@codemirror/state";
import { indentUnit } from "https://esm.sh/@codemirror/language";
import {
	closeBrackets,
	autocompletion,
} from "https://esm.sh/@codemirror/autocomplete";
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

// Auto completion features for JS editor
const browserApiCompletions = {
	document: [
		"querySelector",
		"querySelectorAll",
		"getElementById",
		"getElementsByClassName",
		"getElementsByTagName",
		"createElement",
		"createTextNode",
		"createDocumentFragment",
		"addEventListener",
		"removeEventListener",
		"body",
		"head",
		"documentElement",
		"title",
		"URL",
		"readyState",
	],

	window: [
		"alert",
		"confirm",
		"prompt",
		"setTimeout",
		"clearTimeout",
		"setInterval",
		"clearInterval",
		"localStorage",
		"sessionStorage",
		"location",
		"history",
		"navigator",
		"innerWidth",
		"innerHeight",
		"addEventListener",
	],

	console: [
		"log",
		"warn",
		"error",
		"info",
		"debug",
		"table",
		"clear",
		"group",
		"groupEnd",
		"time",
		"timeEnd",
		"trace",
		"assert",
	],

	Math: [
		"round",
		"floor",
		"ceil",
		"random",
		"max",
		"min",
		"abs",
		"sqrt",
		"pow",
		"PI",
		"E",
	],

	JSON: ["parse", "stringify"],

	Array: ["isArray", "from", "of"],

	String: ["fromCharCode", "fromCodePoint"],

	Promise: ["resolve", "reject", "all", "allSettled", "race", "any"],
};

function browserCompletion(context) {
	const beforeCursor = context.state.doc.sliceString(0, context.pos);

	// Suggestions after an object and dot
	const memberMatch = beforeCursor.match(
		/(?:^|[^\w$])(document|window|console|Math|JSON|Array|String|Promise)\.(\w*)$/,
	);

	if (memberMatch) {
		const objectName = memberMatch[1];
		const typedText = memberMatch[2];

		const from = context.pos - typedText.length;

		const options = browserApiCompletions[objectName]
			.filter((item) => item.startsWith(typedText))
			.map((item) => ({
				label: item,
				type: "property",
			}));

		return {
			from,
			options,
			validFor: /^\w*$/,
		};
	}

	// Suggestions for global object names
	const globalMatch = context.matchBefore(/[\w$]+/);

	if (!globalMatch) return null;

	const globalObjects = Object.keys(browserApiCompletions);

	return {
		from: globalMatch.from,
		options: globalObjects.map((item) => ({
			label: item,
			type: "variable",
		})),
		validFor: /^[\w$]*$/,
	};
}

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

		javascriptLanguage.data.of({
			autocomplete: browserCompletion,
		}),

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
