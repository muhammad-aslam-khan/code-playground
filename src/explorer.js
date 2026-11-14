const folders = document.querySelectorAll("#file-tree .tree-item.folder");

folders.forEach((folder) => {
	folder.addEventListener("click", () => {
		const contents = folder.nextElementSibling;
		const arrow = folder.querySelector(".folder-arrow");

		contents.classList.toggle("collapsed");
		arrow.classList.toggle("collapsed");
	});
});

const files = document.querySelectorAll("#file-tree .tree-item.file");

files.forEach((file) => {
	file.addEventListener("click", () => {
		document
			.querySelectorAll("#file-tree .tree-item.file")
			.forEach((item) => item.classList.remove("active"));

		file.classList.add("active");

		console.log("Selected file:", file.dataset.file);
	});
});
