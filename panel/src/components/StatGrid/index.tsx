import { StatItem, useStatGridBehavior } from './behavior';
import * as S from './styles';

export const StatGrid = ({ items }: { items: StatItem[] }) => {
	const view = useStatGridBehavior({ items });

	return (
		<S.Grid>
			{view.items.map(item => (
				<S.Card key={item.label}>
					<S.Label>{item.label}</S.Label>
					<S.Value>{item.value}</S.Value>
					<S.Detail>{item.detail}</S.Detail>
				</S.Card>
			))}
		</S.Grid>
	);
};
