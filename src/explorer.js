import {
	projectFiles,
	projectFolders,
	currentProject,
	addFile,
	addFolder,
} from "./project.js";
import { openFile } from "./files.js";

const fileTree = document.querySelector("#file-tree");

// Currently selected folder (empty string means project root)
let selectedFolderPath = "";

// Highlight the selected folder
function updateSelectedFolder() {
	fileTree.querySelectorAll(".tree-item.folder").forEach((folder) => {
		const folderPath =
			folder.dataset.folder === "root" ? "" : folder.dataset.folder;

		folder.classList.toggle("selected", folderPath === selectedFolderPath);
	});
}

// Build a hierarchical tree from project file paths
function buildFileTree() {
	const root = {
		name: currentProject.name,
		type: "folder",
		children: {},
	};

	// Create a folder and its parent folders if necessary
	function ensureFolder(folderPath) {
		const parts = folderPath.split("/");
		let currentFolder = root;

		parts.forEach((part) => {
			if (!currentFolder.children[part]) {
				currentFolder.children[part] = {
					name: part,
					type: "folder",
					children: {},
				};
			}

			currentFolder = currentFolder.children[part];
		});
	}

	// Add all folders, including empty folders
	projectFolders.forEach((folderPath) => {
		ensureFolder(folderPath);
	});

	// Add files to their respective folders
	Object.entries(projectFiles).forEach(([filePath, fileData]) => {
		const parts = filePath.split("/");
		const fileName = parts.pop();

		const parentPath = parts.join("/");

		let parentFolder = root;

		if (parentPath) {
			ensureFolder(parentPath);

			parts.forEach((part) => {
				parentFolder = parentFolder.children[part];
			});
		}

		parentFolder.children[fileName] = {
			name: fileData.name,
			type: "file",
			path: filePath,
		};
	});

	return root;
}

// Create a file or folder element
function createTreeElement(item, path = "") {
	const itemElement = document.createElement("div");

	if (item.type === "file") {
		itemElement.className = "tree-item file";
		itemElement.dataset.file = item.path;

		const label = document.createElement("span");
		label.textContent = `📄 ${item.name}`;

		itemElement.appendChild(label);

		return itemElement;
	}

	// Folder
	itemElement.className = "tree-item folder";
	itemElement.dataset.folder = path || "root";

	const arrow = document.createElement("span");
	arrow.className = "folder-arrow";
	arrow.textContent = "▾";

	const label = document.createElement("span");
	label.textContent = item.name;

	itemElement.append(arrow, label);

	const contents = document.createElement("div");
	contents.className = "folder-contents";

	Object.entries(item.children).forEach(([name, child]) => {
		const childPath = path ? `${path}/${name}` : name;

		contents.appendChild(createTreeElement(child, childPath));
	});

	const container = document.createElement("div");
	container.append(itemElement, contents);

	return container;
}

// Render the Explorer
export function renderExplorer() {
	const tree = buildFileTree();

	fileTree.innerHTML = "";

	const projectRoot = document.createElement("div");
	projectRoot.className = "project-root";

	projectRoot.appendChild(createTreeElement(tree));

	fileTree.appendChild(projectRoot);
	updateSelectedFolder();
}

// Handle clicks using event delegation
fileTree.addEventListener("click", (event) => {
	const file = event.target.closest(".tree-item.file");

	if (file) {
		openFile(file.dataset.file);
		return;
	}

	const folder = event.target.closest(".tree-item.folder");
	if (folder) {
		// Select the clicked folder
		selectedFolderPath =
			folder.dataset.folder === "root" ? "" : folder.dataset.folder;

		updateSelectedFolder();

		// Expand or collapse the folder
		const contents = folder.nextElementSibling;
		const arrow = folder.querySelector(".folder-arrow");

		contents.classList.toggle("collapsed");
		arrow.classList.toggle("collapsed");
	}
});

// Update Explorer selection when a file opens
document.addEventListener("file-opened", (event) => {
	const filePath = event.detail.filePath;

	fileTree.querySelectorAll(".tree-item.file").forEach((item) => {
		item.classList.remove("active");
	});

	const selectedFile = Array.from(
		fileTree.querySelectorAll(".tree-item.file"),
	).find((item) => item.dataset.file === filePath);

	selectedFile?.classList.add("active");
});

// Clear Explorer selection when all tabs close
document.addEventListener("file-closed-all", () => {
	fileTree.querySelectorAll(".tree-item.file").forEach((item) => {
		item.classList.remove("active");
	});
});

// New File button
document.querySelector("#new-file-btn").addEventListener("click", async () => {
	const fileName = prompt("Enter the new file name:");

	if (fileName === null) return;

	const name = fileName.trim();

	if (!name || name.includes("/") || name === "." || name === "..") {
		alert("Please enter a valid file name.");
		return;
	}

	const filePath = selectedFolderPath
		? `${selectedFolderPath}/${name}`
		: name;

	try {
		await addFile(filePath);

		renderExplorer();
		openFile(filePath);
	} catch (error) {
		alert(error.message);
	}
});

// New Folder button
document
	.querySelector("#new-folder-btn")
	.addEventListener("click", async () => {
		const folderName = prompt("Enter the new folder name:");

		if (folderName === null) return;

		const name = folderName.trim();

		if (!name || name.includes("/") || name === "." || name === "..") {
			alert("Please enter a valid folder name.");
			return;
		}

		const folderPath = selectedFolderPath
			? `${selectedFolderPath}/${name}`
			: name;

		try {
			await addFolder(folderPath);

			// Select the newly created folder
			selectedFolderPath = folderPath;

			renderExplorer();
		} catch (error) {
			alert(error.message);
		}
	});

// Initial rendering
renderExplorer();
