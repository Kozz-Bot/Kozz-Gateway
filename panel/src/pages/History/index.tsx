import { AppModel } from '@/App/behavior';
import { useHistoryBehavior } from './behavior';
import * as S from './styles';

export const HistoryPage = ({ model }: { model: AppModel }) => {
	const view = useHistoryBehavior({ model });

	return (
		<S.Stack>
			<view.HistoryList
				historyStore={view.historyStore}
				onFlush={view.onFlush}
			/>
		</S.Stack>
	);
};
