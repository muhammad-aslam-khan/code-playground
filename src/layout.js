const mainDivider = document.querySelector("#main-divider");
const workspace = document.querySelector("#workspace");

const explorerDivider = document.querySelector("#explorer-divider");
const fileExplorer = document.querySelector("#file-explorer");

const workspaceConsoleDivider = document.querySelector(
	"#workspace-console-divider",
);
const consolePanel = document.querySelector("#console-panel");

const previewPanel = document.querySelector("#preview-panel");
const rightPanel = document.querySelector("#right-panel");

const toggleExplorerBtn = document.querySelector("#toggle-explorer-btn");
const toggleEditorBtn = document.querySelector("#toggle-workspace-btn");
const leftPanel = document.querySelector("#left-panel");
const togglePreviewBtn = document.querySelector("#toggle-preview-btn");
const toggleConsoleBtn = document.querySelector("#toggle-console-btn");

// Update visibility of the editor/preview divider
function updateMainDivider() {
	const bothHidden =
		leftPanel.classList.contains("hidden") &&
		rightPanel.classList.contains("hidden");

	mainDivider.classList.toggle("hidden", bothHidden);
}

// Editor / Preview resizing
mainDivider.addEventListener("pointerdown", (e) => {
	mainDivider.setPointerCapture(e.pointerId);
});

mainDivider.addEventListener("pointermove", (e) => {
	if (!mainDivider.hasPointerCapture(e.pointerId)) return;

	const rect = workspace.getBoundingClientRect();

	const minWidth = 300;
	const maxWidth = rect.width - minWidth;

	const newWidth = Math.min(
		Math.max(e.clientX - rect.left, minWidth),
		maxWidth,
	);

	leftPanel.style.width = `${newWidth}px`;
});

// Explorer resizing
explorerDivider.addEventListener("pointerdown", (e) => {
	explorerDivider.setPointerCapture(e.pointerId);
});

explorerDivider.addEventListener("pointermove", (e) => {
	if (!explorerDivider.hasPointerCapture(e.pointerId)) return;

	const leftPanelRect = leftPanel.getBoundingClientRect();

	const minWidth = 150;
	const maxWidth = leftPanelRect.width - 300;

	const newWidth = Math.min(
		Math.max(e.clientX - leftPanelRect.left, minWidth),
		maxWidth,
	);

	fileExplorer.style.width = `${newWidth}px`;
});

// Workspace / Console resizing
workspaceConsoleDivider.addEventListener("pointerdown", (e) => {
	workspaceConsoleDivider.setPointerCapture(e.pointerId);
});

workspaceConsoleDivider.addEventListener("pointermove", (e) => {
	if (!workspaceConsoleDivider.hasPointerCapture(e.pointerId)) return;

	const bodyRect = document.body.getBoundingClientRect();
	const headerHeight = document.querySelector("#app-header").offsetHeight;
	const dividerHeight = workspaceConsoleDivider.offsetHeight;

	const minHeight = 100;
	const maxHeight =
		bodyRect.height - headerHeight - dividerHeight - minHeight;

	const newHeight = Math.min(
		Math.max(bodyRect.bottom - e.clientY, minHeight),
		maxHeight,
	);

	consolePanel.style.height = `${newHeight}px`;
});

// Show / Hide Explorer
toggleExplorerBtn.addEventListener("click", () => {
	const isHidden = fileExplorer.classList.toggle("hidden");

	explorerDivider.classList.toggle("hidden", isHidden);

	toggleExplorerBtn.textContent = isHidden
		? "Show Explorer"
		: "Hide Explorer";
});

// Show / Hide Editor Workspace
toggleEditorBtn.addEventListener("click", () => {
	const isHidden = leftPanel.classList.toggle("hidden");

	toggleExplorerBtn.hidden = isHidden;

	toggleEditorBtn.textContent = isHidden
		? "Show Workspace"
		: "Hide Workspace";

	updateMainDivider();
});

// Show / Hide Preview
togglePreviewBtn.addEventListener("click", () => {
	const isHidden = previewPanel.classList.toggle("hidden");

	rightPanel.classList.toggle("hidden", isHidden);

	togglePreviewBtn.textContent = isHidden ? "Show Preview" : "Hide Preview";

	updateMainDivider();
});

// Show / Hide Console
toggleConsoleBtn.addEventListener("click", () => {
	const isHidden = consolePanel.classList.toggle("hidden");

	workspaceConsoleDivider.classList.toggle("hidden", isHidden);

	toggleConsoleBtn.textContent = isHidden ? "Show Console" : "Hide Console";
});
