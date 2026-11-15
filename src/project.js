export const projectFiles = {
	"index.html": {
		name: "index.html",
		type: "file",
		content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAK Playground</title>

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
		content: "body {\n    margin: 0;\n}",
	},

	"css/responsive.css": {
		name: "responsive.css",
		type: "file",
		content: "",
	},

	"js/script.js": {
		name: "script.js",
		type: "file",
		content: `console.log("Hello from the project!");

console.warn("This is a warning!");

console.error("This is an error!");

console.log({
    name: "Code Playground",
    version: 1,
});

console.log(
    Promise.resolve("Promise completed!")
);`,
	},

	"js/utils.js": {
		name: "utils.js",
		type: "file",
		content: "",
	},
};
