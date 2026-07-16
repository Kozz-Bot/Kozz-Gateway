import { AppModel } from '@/App/behavior';
import { HistoryList } from '@/components/HistoryList';

export const useHistoryBehavior = ({ model }: { model: AppModel }) => ({
	HistoryList,
	historyStore: model.historyStore,
	onFlush: model.flushHistory,
});
