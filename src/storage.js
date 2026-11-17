/*-------------------------------------------
This module will be responsible exclusively for IndexedDB operations.

Its responsibilities:
1. Open or create the database.
2. Create the required object store.
3. Load a saved project.
4. Save a project.
5. Delete a project.
6. Handle storage errors.
-------------------------------------------*/

const DATABASE_NAME = "CodePlaygroundDB";
const DATABASE_VERSION = 1;
const PROJECT_STORE = "projects";

let databasePromise;

export function openDatabase() {
	if (databasePromise) return databasePromise;

	databasePromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			if (!db.objectStoreNames.contains(PROJECT_STORE)) {
				db.createObjectStore(PROJECT_STORE, {
					keyPath: "id",
				});
			}
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = () => {
			databasePromise = null;
			reject(request.error);
		};
	});

	return databasePromise;
}

export async function saveProject(project) {
	const db = await openDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(PROJECT_STORE, "readwrite");

		transaction.objectStore(PROJECT_STORE).put(project);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

export async function loadProject(projectId) {
	const db = await openDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(PROJECT_STORE, "readonly");

		const request = transaction.objectStore(PROJECT_STORE).get(projectId);

		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}

export async function deleteProject(projectId) {
	const db = await openDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(PROJECT_STORE, "readwrite");

		transaction.objectStore(PROJECT_STORE).delete(projectId);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}
