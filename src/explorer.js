import { openFile } from "./files.js";

// Folder expand/collapse
const folders = document.querySelectorAll("#file-tree .tree-item.folder");

folders.forEach((folder) => {
	folder.addEventListener("click", () => {
		const contents = folder.nextElementSibling;
		const arrow = folder.querySelector(".folder-arrow");

		contents.classList.toggle("collapsed");
		arrow.classList.toggle("collapsed");
	});
});

// File selection
const files = document.querySelectorAll("#file-tree .tree-item.file");

files.forEach((file) => {
	file.addEventListener("click", () => {
		openFile(file.dataset.file);
	});
});

// Update Explorer selection when a file opens
document.addEventListener("file-opened", (event) => {
	const filePath = event.detail.filePath;

	document.querySelectorAll("#file-tree .tree-item.file").forEach((item) => {
		item.classList.remove("active");
	});

	document
		.querySelector(`#file-tree .tree-item.file[data-file="${filePath}"]`)
		?.classList.add("active");
});

// Clear Explorer selection when all tabs close
document.addEventListener("file-closed-all", () => {
	document.querySelectorAll("#file-tree .tree-item.file").forEach((item) => {
		item.classList.remove("active");
	});
});
