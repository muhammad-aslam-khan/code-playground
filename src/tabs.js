const editorTabs = document.getElementById("editor-tabs");

// Create a tab or activate an existing one
export function createEditorTab(filePath, fileName) {
	let tab = editorTabs.querySelector(`[data-file="${filePath}"]`);

	if (!tab) {
		tab = document.createElement("div");
		tab.classList.add("editor-tab");
		tab.dataset.file = filePath;

		const tabName = document.createElement("span");
		tabName.textContent = fileName;

		const closeBtn = document.createElement("button");
		closeBtn.type = "button";
		closeBtn.classList.add("close-tab-btn");
		closeBtn.textContent = "×";
		closeBtn.title = "Close tab";

		tab.append(tabName, closeBtn);
		editorTabs.appendChild(tab);
	}

	activateTab(tab);
}

// Activate a tab
function activateTab(tab) {
	editorTabs.querySelectorAll(".editor-tab").forEach((item) => {
		item.classList.remove("active");
	});

	tab.classList.add("active");
}

// Remove a tab
export function removeEditorTab(filePath) {
	const tab = editorTabs.querySelector(`[data-file="${filePath}"]`);

	tab?.remove();
}

// Get the last remaining tab
export function getLastOpenTab() {
	return editorTabs.querySelector(".editor-tab:last-child");
}

// Handle tab interactions
editorTabs.addEventListener("click", (event) => {
	const closeBtn = event.target.closest(".close-tab-btn");

	if (closeBtn) {
		const tab = closeBtn.closest(".editor-tab");

		document.dispatchEvent(
			new CustomEvent("tab-close", {
				detail: { filePath: tab.dataset.file },
			}),
		);

		return;
	}

	const tab = event.target.closest(".editor-tab");

	if (!tab) return;

	document.dispatchEvent(
		new CustomEvent("tab-open", {
			detail: { filePath: tab.dataset.file },
		}),
	);
});
