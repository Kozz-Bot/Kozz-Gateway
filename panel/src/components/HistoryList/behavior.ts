import { useCallback, useEffect, useState } from 'react';
import { HistoryEntry, HistoryStore } from '@/lib/historyStore';
import { formatJson } from '@/lib/json';

const PAGE_SIZE = 50;

export const useHistoryListBehavior = ({
	historyStore,
	onFlush,
}: {
	historyStore: HistoryStore;
	onFlush: () => void;
}) => {
	const [query, setQuery] = useState('');
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const resetEntries = useCallback(async () => {
		setIsLoading(true);
		const nextEntries = await historyStore.listPage({
			limit: PAGE_SIZE,
			offset: 0,
			query,
		});
		setEntries(nextEntries);
		setHasMore(nextEntries.length === PAGE_SIZE);
		setIsLoading(false);
	}, [historyStore, query]);

	const loadMore = useCallback(async () => {
		if (isLoading) {
			return;
		}

		setIsLoading(true);
		const nextEntries = await historyStore.listPage({
			limit: PAGE_SIZE,
			offset: entries.length,
			query,
		});
		setEntries(current => [...current, ...nextEntries]);
		setHasMore(nextEntries.length === PAGE_SIZE);
		setIsLoading(false);
	}, [entries.length, historyStore, isLoading, query]);

	useEffect(() => {
		let active = true;
		const loadInitialPage = async () => {
			setIsLoading(true);
			const nextEntries = await historyStore.listPage({
				limit: PAGE_SIZE,
				offset: 0,
				query,
			});
			if (!active) {
				return;
			}
			setEntries(nextEntries);
			setHasMore(nextEntries.length === PAGE_SIZE);
			setIsLoading(false);
		};
		loadInitialPage();
		return () => {
			active = false;
		};
	}, [historyStore, query]);

	useEffect(() => {
		const unsubscribe = historyStore.subscribe(() => {
			resetEntries();
		});
		return unsubscribe;
	}, [historyStore, resetEntries]);

	const handleFlush = async () => {
		await onFlush();
		setEntries([]);
		setHasMore(false);
	};

	return {
		entries: entries.map(entry => ({
			...entry,
			createdLabel: new Date(entry.createdAt).toLocaleString(),
			payloadText: formatJson(entry.payload),
		})),
		hasMore,
		isLoading,
		loadMore,
		onFlush: handleFlush,
		query,
		setQuery,
	};
};
