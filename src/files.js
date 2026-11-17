/*--------------------------------------------------
This module currently manages:
- Opening files.
- Closing files.
- Switching between editor tabs.
- Saving the active editor contents into projectFiles.
- Maintaining the active file path.
---------------------------------------------------*/

import { saveCurrentProject, projectFiles } from "./project.js";
import { editor, setEditorLanguage } from "./editor.js";

import { createEditorTab, removeEditorTab, getLastOpenTab } from "./tabs.js";

let activeFilePath = null;

// This allows other modules to access the currently selected file without directly accessing the variable.
export function getActiveFilePath() {
	return activeFilePath;
}

// Open a file
export function openFile(filePath) {
	// Validate file
	const selectedFile = projectFiles[filePath];

	if (!selectedFile) return;

	// Save the previously active file
	saveActiveFile();

	// Update active file
	activeFilePath = filePath;

	// Load content
	editor.dispatch({
		changes: {
			from: 0,
			to: editor.state.doc.length,
			insert: selectedFile.content,
		},
	});

	// Configure language
	setEditorLanguage(filePath);

	// Create or activate tab
	createEditorTab(filePath, selectedFile.name);

	// Update editor visibility
	document.getElementById("editor-welcome").classList.add("hidden");

	document.getElementById("code-editor").classList.remove("hidden");

	// Notify Explorer
	document.dispatchEvent(
		new CustomEvent("file-opened", {
			detail: { filePath },
		}),
	);
}

// Close a file
function closeFile(filePath) {
	const wasActive = filePath === activeFilePath;

	// Save content if closing the active file
	if (wasActive) {
		projectFiles[filePath].content = editor.state.doc.toString();
	}

	removeEditorTab(filePath);

	// No need to change editor if an inactive tab was closed
	if (!wasActive) return;

	// Activate another open tab if available
	const remainingTab = getLastOpenTab();

	if (remainingTab) {
		openFile(remainingTab.dataset.file);
		return;
	}

	// No files remain open
	activeFilePath = null;

	editor.dispatch({
		changes: {
			from: 0,
			to: editor.state.doc.length,
			insert: "",
		},
	});

	document.getElementById("editor-welcome").classList.remove("hidden");

	document.getElementById("code-editor").classList.add("hidden");

	document.dispatchEvent(new CustomEvent("file-closed-all"));
}

// Receive tab interactions
document.addEventListener("tab-open", (event) => {
	openFile(event.detail.filePath);
});

document.addEventListener("tab-close", (event) => {
	closeFile(event.detail.filePath);
});

export function saveActiveFile() {
	if (!activeFilePath) return;

	projectFiles[activeFilePath].content = editor.state.doc.toString();
}

let saveTimeout;
document.addEventListener("editor-content-changed", () => {
	saveActiveFile();

	clearTimeout(saveTimeout);

	saveTimeout = setTimeout(async () => {
		try {
			await saveCurrentProject();
		} catch (error) {
			console.error("Automatic save failed:", error);
		}
	}, 700);
});
