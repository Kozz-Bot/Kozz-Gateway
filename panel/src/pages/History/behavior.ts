import { AppModel } from '@/App/behavior';
import { HistoryList } from '@/components/HistoryList';

export const useHistoryBehavior = ({ model }: { model: AppModel }) => ({
	HistoryList,
	entries: model.history,
	onFlush: model.flushHistory,
});
