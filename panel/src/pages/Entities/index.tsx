import { AppModel } from '@/App/behavior';
import { DataTable } from '@/components/DataTable';
import { useEntitiesBehavior } from './behavior';
import * as S from './styles';

export const EntitiesPage = ({ model }: { model: AppModel }) => {
	const view = useEntitiesBehavior({ model });

	return (
		<S.Stack>
			<S.Section>
				<S.Heading>Boundaries</S.Heading>
				<DataTable columns={view.boundaryColumns} rows={view.boundaries} />
			</S.Section>
			<S.Section>
				<S.Heading>Handlers</S.Heading>
				<DataTable columns={view.handlerColumns} rows={view.handlers} />
			</S.Section>
		</S.Stack>
	);
};
