/*---------------------------------
This is our project data manager. It manages:
- Current project information.
- Project creation and loading.
- Adding and removing files.
- Adding and removing folders.
- Renaming files and folders.
- Saving project changes through storage.js.
---------------------------------*/

import { loadProject, saveProject } from "./storage.js";

// Default sample project
const defaultProjectFiles = {
	"index.html": {
		name: "index.html",
		type: "file",
		content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Playground</title>

    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/responsive.css">
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to Code Playground.</p>

    <script src="./js/utils.js"></script>
    <script src="./js/script.js"></script>
</body>
</html>`,
	},

	"css/style.css": {
		name: "style.css",
		type: "file",
		content: `body {
    margin: 0;
}`,
	},

	"css/responsive.css": {
		name: "responsive.css",
		type: "file",
		content: "",
	},

	"js/script.js": {
		name: "script.js",
		type: "file",
		content: `console.log("First message");
console.warn("Warning message");
console.error("Error message");`,
	},

	"js/utils.js": {
		name: "utils.js",
		type: "file",
		content: "",
	},
};

// Currently active project
export const projectFiles = {};

// Stores project folder paths, including empty folders
export const projectFolders = new Set(["css", "js"]);

// Stores project metadata
export const currentProject = {
	id: "default-project",
	name: "My First Project",
	createdAt: null,
	updatedAt: null,
};

// Initialize project from browser storage
export async function initializeProject() {
	try {
		const savedProject = await loadProject(currentProject.id);

		if (savedProject) {
			currentProject.name = savedProject.name;
			currentProject.createdAt = savedProject.createdAt;
			currentProject.updatedAt = savedProject.updatedAt;

			Object.assign(projectFiles, savedProject.files);

			// Restore saved folders
			projectFolders.clear();

			if (savedProject.folders) {
				savedProject.folders.forEach((folder) => {
					projectFolders.add(folder);
				});
			}

			// Recover parent folders from existing file paths
			Object.keys(projectFiles).forEach((filePath) => {
				const parts = filePath.split("/");

				parts.pop();

				let folderPath = "";

				parts.forEach((part) => {
					folderPath = folderPath ? `${folderPath}/${part}` : part;

					projectFolders.add(folderPath);
				});
			});
		} else {
			Object.assign(projectFiles, structuredClone(defaultProjectFiles));

			const now = new Date().toISOString();

			currentProject.createdAt = now;
			currentProject.updatedAt = now;

			await saveCurrentProject();
		}

		return true;
	} catch (error) {
		console.error("Project initialization failed:", error);
		throw error;
	}
}

// Save current project
export async function saveCurrentProject() {
	const now = new Date().toISOString();

	currentProject.updatedAt = now;

	await saveProject({
		...currentProject,
		files: projectFiles,
		folders: [...projectFolders],
	});
}

// Ensure all parent folders exist
function ensureParentFolders(folderPath) {
	if (!folderPath) return;

	const parts = folderPath.split("/");
	let currentPath = "";

	parts.forEach((part) => {
		currentPath = currentPath ? `${currentPath}/${part}` : part;

		projectFolders.add(currentPath);
	});
}

// Add a new file
export async function addFile(filePath) {
	if (projectFiles[filePath] || projectFolders.has(filePath)) {
		throw new Error("A file or folder with this name already exists.");
	}

	const parts = filePath.split("/");
	const fileName = parts.pop();
	const parentPath = parts.join("/");

	ensureParentFolders(parentPath);

	projectFiles[filePath] = {
		name: fileName,
		type: "file",
		content: "",
	};

	await saveCurrentProject();
}

// Add a new folder
export async function addFolder(folderPath) {
	if (projectFiles[folderPath] || projectFolders.has(folderPath)) {
		throw new Error("A file or folder with this name already exists.");
	}

	const parts = folderPath.split("/");
	const folderName = parts.pop();
	const parentPath = parts.join("/");

	ensureParentFolders(parentPath);

	projectFolders.add(folderPath);

	await saveCurrentProject();
}
/*---------------------------------
---------------------------------*/
