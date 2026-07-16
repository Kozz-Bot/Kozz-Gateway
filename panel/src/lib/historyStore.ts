export type HistoryEntry = {
	id: string;
	type: 'socket' | 'resource' | 'dispatch' | 'auth' | 'error';
	title: string;
	payload: unknown;
	createdAt: number;
};

type Listener = () => void;

const DB_NAME = 'kozz-gw-panel';
const STORE_NAME = 'history';
const CREATED_AT_INDEX = 'createdAt';

const openDatabase = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 2);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				store.createIndex(CREATED_AT_INDEX, CREATED_AT_INDEX);
				return;
			}

			const store = request.transaction?.objectStore(STORE_NAME);
			if (store && !store.indexNames.contains(CREATED_AT_INDEX)) {
				store.createIndex(CREATED_AT_INDEX, CREATED_AT_INDEX);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

export const createHistoryStore = () => {
	const listeners = new Set<Listener>();
	let dbPromise: Promise<IDBDatabase> | undefined;

	const getDb = () => {
		if (!dbPromise) {
			dbPromise = openDatabase();
		}

		return dbPromise;
	};

	const count = async () => {
		const db = await getDb();
		return new Promise<number>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const request = transaction.objectStore(STORE_NAME).count();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	};

	const listPage = async ({
		limit,
		offset,
		query,
	}: {
		limit: number;
		offset: number;
		query?: string;
	}) => {
		const db = await getDb();
		const normalizedQuery = query?.trim().toLowerCase() || '';

		return new Promise<HistoryEntry[]>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const source = store.indexNames.contains(CREATED_AT_INDEX)
				? store.index(CREATED_AT_INDEX)
				: store;
			const request = source.openCursor(null, 'prev');
			const entries: HistoryEntry[] = [];
			let skipped = 0;

			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor || entries.length >= limit) {
					resolve(entries);
					return;
				}

				const entry = cursor.value as HistoryEntry;
				const matchesQuery =
					!normalizedQuery ||
					`${entry.type} ${entry.title} ${JSON.stringify(entry.payload)}`
						.toLowerCase()
						.includes(normalizedQuery);

				if (matchesQuery) {
					if (skipped < offset) {
						skipped += 1;
					} else {
						entries.push(entry);
					}
				}

				cursor.continue();
			};
			request.onerror = () => reject(request.error);
		});
	};

	const notify = () => {
		listeners.forEach(listener => listener());
	};

	const add = async (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
		const db = await getDb();
		const value: HistoryEntry = {
			...entry,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
		};

		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const request = transaction.objectStore(STORE_NAME).put(value);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
		notify();
	};

	const clear = async () => {
		const db = await getDb();
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const request = transaction.objectStore(STORE_NAME).clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
		notify();
	};

	const subscribe = (listener: Listener) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	return {
		add,
		clear,
		count,
		listPage,
		subscribe,
	};
};

export type HistoryStore = ReturnType<typeof createHistoryStore>;
