const mainDivider = document.querySelector("#main-divider");
const workspace = document.querySelector("#workspace");

const explorerDivider = document.querySelector("#explorer-divider");
const fileExplorer = document.querySelector("#file-explorer");

const previewConsoleDivider = document.querySelector(
	"#preview-console-divider",
);
const previewPanel = document.querySelector("#preview-panel");
const rightPanel = document.querySelector("#right-panel");

const toggleExplorerBtn = document.querySelector("#toggle-explorer-btn");

const toggleEditorBtn = document.querySelector("#toggle-workspace-btn");
const leftPanel = document.querySelector("#left-panel");

const togglePreviewBtn = document.querySelector("#toggle-preview-btn");

const toggleConsoleBtn = document.querySelector("#toggle-console-btn");
const consolePanel = document.querySelector("#console-panel");

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

	document.querySelector("#left-panel").style.width = `${newWidth}px`;
});

explorerDivider.addEventListener("pointerdown", (e) => {
	explorerDivider.setPointerCapture(e.pointerId);
});

explorerDivider.addEventListener("pointermove", (e) => {
	if (!explorerDivider.hasPointerCapture(e.pointerId)) return;

	const leftPanelRect = document
		.querySelector("#left-panel")
		.getBoundingClientRect();

	const minWidth = 150;
	const maxWidth = leftPanelRect.width - 300;

	const newWidth = Math.min(
		Math.max(e.clientX - leftPanelRect.left, minWidth),
		maxWidth,
	);

	fileExplorer.style.width = `${newWidth}px`;
});

previewConsoleDivider.addEventListener("pointerdown", (e) => {
	previewConsoleDivider.setPointerCapture(e.pointerId);
});

previewConsoleDivider.addEventListener("pointermove", (e) => {
	if (!previewConsoleDivider.hasPointerCapture(e.pointerId)) return;

	const rect = rightPanel.getBoundingClientRect();

	const minHeight = 100;
	const maxHeight = rect.height - 100;

	const newHeight = Math.min(
		Math.max(e.clientY - rect.top, minHeight),
		maxHeight,
	);

	previewPanel.style.flex = "none";
	previewPanel.style.height = `${newHeight}px`;
});

toggleExplorerBtn.addEventListener("click", () => {
	const isHidden = fileExplorer.classList.toggle("hidden");

	explorerDivider.classList.toggle("hidden", isHidden);

	toggleExplorerBtn.textContent = isHidden
		? "Show Explorer"
		: "Hide Explorer";
});

toggleEditorBtn.addEventListener("click", () => {
	const isHidden = leftPanel.classList.toggle("hidden");

	mainDivider.classList.toggle("hidden", isHidden);
	toggleExplorerBtn.hidden = isHidden;

	toggleEditorBtn.textContent = isHidden
		? "Show Workspace"
		: "Hide Workspace";
});

togglePreviewBtn.addEventListener("click", () => {
	const isHidden = previewPanel.classList.toggle("hidden");

	previewConsoleDivider.classList.toggle("hidden", isHidden);

	togglePreviewBtn.textContent = isHidden ? "Show Preview" : "Hide Preview";

	const bothHidden =
		previewPanel.classList.contains("hidden") &&
		consolePanel.classList.contains("hidden");

	rightPanel.classList.toggle("hidden", bothHidden);
	mainDivider.classList.toggle("hidden", bothHidden);
});

toggleConsoleBtn.addEventListener("click", () => {
	const isHidden = consolePanel.classList.toggle("hidden");

	previewConsoleDivider.classList.toggle("hidden", isHidden);

	toggleConsoleBtn.textContent = isHidden ? "Show Console" : "Hide Console";

	const bothHidden =
		previewPanel.classList.contains("hidden") &&
		consolePanel.classList.contains("hidden");

	rightPanel.classList.toggle("hidden", bothHidden);
	mainDivider.classList.toggle("hidden", bothHidden);
});
