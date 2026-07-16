import { useMemo, useState } from 'react';
import { HistoryEntry } from '@/lib/historyStore';
import { formatJson } from '@/lib/json';

export const useHistoryListBehavior = ({
	entries,
	onFlush,
}: {
	entries: HistoryEntry[];
	onFlush: () => void;
}) => {
	const [query, setQuery] = useState('');
	const filteredEntries = useMemo(
		() =>
			entries.filter(entry =>
				`${entry.type} ${entry.title} ${formatJson(entry.payload)}`
					.toLowerCase()
					.includes(query.toLowerCase())
			),
		[entries, query]
	);

	return {
		filteredEntries: filteredEntries.map(entry => ({
			...entry,
			createdLabel: new Date(entry.createdAt).toLocaleString(),
			payloadText: formatJson(entry.payload),
		})),
		onFlush,
		query,
		setQuery,
	};
};
