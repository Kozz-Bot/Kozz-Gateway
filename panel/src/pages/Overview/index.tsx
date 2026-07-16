import { AppModel } from '@/App/behavior';
import { StatGrid } from '@/components/StatGrid';
import { useOverviewBehavior } from './behavior';
import * as S from './styles';

export const OverviewPage = ({ model }: { model: AppModel }) => {
	const view = useOverviewBehavior({ model });

	return (
		<S.Stack>
			<S.SectionTitle>Runtime</S.SectionTitle>
			<StatGrid items={view.stats} />
		</S.Stack>
	);
};
