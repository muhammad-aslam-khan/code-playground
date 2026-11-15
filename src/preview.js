import { projectFiles } from "./project.js";
import { saveActiveFile } from "./files.js";

import { installConsoleBridge } from "./console-bridge.js";

const previewFrame = document.getElementById("preview-frame");

// Convert a local reference into a project file path
function resolveProjectPath(reference, currentFilePath) {
	// Ignore external URLs and non-file references
	if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) {
		return null;
	}

	// Remove query strings and hash fragments
	const cleanPath = reference.split(/[?#]/)[0];

	// Start from the current HTML file's directory
	const basePath = cleanPath.startsWith("/")
		? []
		: currentFilePath.split("/").slice(0, -1);

	const parts = cleanPath.startsWith("/")
		? cleanPath.slice(1).split("/")
		: cleanPath.split("/");

	for (const part of parts) {
		if (!part || part === ".") continue;

		if (part === "..") {
			basePath.pop();
		} else {
			basePath.push(part);
		}
	}

	return basePath.join("/");
}

// Build and load the preview
export function updatePreview() {
	// Save the latest editor content
	saveActiveFile();

	const entryPath = "index.html";
	const html = projectFiles[entryPath].content;

	// Parse the HTML document
	const parser = new DOMParser();
	const previewDoc = parser.parseFromString(html, "text/html");

	// Install console interception before project scripts execute
	const bootstrapScript = previewDoc.createElement("script");
	bootstrapScript.textContent = `(${installConsoleBridge.toString()})();`;
	previewDoc.head.prepend(bootstrapScript);

	// Resolve CSS files
	previewDoc
		.querySelectorAll('link[rel="stylesheet"][href]')
		.forEach((link) => {
			const filePath = resolveProjectPath(
				link.getAttribute("href"),
				entryPath,
			);

			if (!filePath) return;

			const file = projectFiles[filePath];

			if (!file) {
				console.warn(`Preview: CSS file not found: ${filePath}`);
				link.remove();
				return;
			}

			const style = previewDoc.createElement("style");

			style.textContent = file.content;

			if (link.hasAttribute("media")) {
				style.setAttribute("media", link.getAttribute("media"));
			}

			link.replaceWith(style);
		});

	// Resolve JavaScript files
	previewDoc.querySelectorAll("script[src]").forEach((script) => {
		const filePath = resolveProjectPath(
			script.getAttribute("src"),
			entryPath,
		);

		if (!filePath) return;

		const file = projectFiles[filePath];

		if (!file) {
			console.warn(`Preview: JavaScript file not found: ${filePath}`);
			script.remove();
			return;
		}

		const inlineScript = previewDoc.createElement("script");

		// Preserve script attributes except external-file
		// loading attributes
		for (const attribute of script.attributes) {
			if (
				![
					"src",
					"async",
					"defer",
					"integrity",
					"crossorigin",
					"referrerpolicy",
				].includes(attribute.name.toLowerCase())
			) {
				inlineScript.setAttribute(attribute.name, attribute.value);
			}
		}

		inlineScript.textContent = file.content;

		script.replaceWith(inlineScript);
	});

	// Load the completed document
	previewFrame.srcdoc =
		"<!DOCTYPE html>\n" + previewDoc.documentElement.outerHTML;
}
