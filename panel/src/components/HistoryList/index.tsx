import { HistoryEntry } from '@/lib/historyStore';
import { useHistoryListBehavior } from './behavior';
import * as S from './styles';

export const HistoryList = ({
	entries,
	onFlush,
}: {
	entries: HistoryEntry[];
	onFlush: () => void;
}) => {
	const view = useHistoryListBehavior({ entries, onFlush });

	return (
		<>
			<S.Toolbar>
				<S.Input
					onChange={event => view.setQuery(event.target.value)}
					placeholder="Search local history"
					value={view.query}
				/>
				<S.Button onClick={view.onFlush} type="button">
					Flush
				</S.Button>
			</S.Toolbar>
			<S.List>
				{view.filteredEntries.map(entry => (
					<S.Item key={entry.id}>
						<S.Meta>
							<span>{entry.type}</span>
							<span>{entry.createdLabel}</span>
						</S.Meta>
						<S.Title>{entry.title}</S.Title>
						<S.Pre>{entry.payloadText}</S.Pre>
					</S.Item>
				))}
			</S.List>
		</>
	);
};
