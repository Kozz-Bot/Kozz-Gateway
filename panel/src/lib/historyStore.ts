export type HistoryEntry = {
	id: string;
	type: 'socket' | 'resource' | 'dispatch' | 'auth' | 'error';
	title: string;
	payload: unknown;
	createdAt: number;
};

type Listener = (entries: HistoryEntry[]) => void;

const DB_NAME = 'kozz-gw-panel';
const STORE_NAME = 'history';

const openDatabase = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

	const list = async () => {
		const db = await getDb();
		return new Promise<HistoryEntry[]>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const request = transaction.objectStore(STORE_NAME).getAll();
			request.onsuccess = () =>
				resolve(
					(request.result as HistoryEntry[]).sort(
						(a, b) => b.createdAt - a.createdAt
					)
				);
			request.onerror = () => reject(request.error);
		});
	};

	const notify = async () => {
		const entries = await list();
		listeners.forEach(listener => listener(entries));
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
		await notify();
	};

	const clear = async () => {
		const db = await getDb();
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const request = transaction.objectStore(STORE_NAME).clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
		await notify();
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
		list,
		subscribe,
	};
};
