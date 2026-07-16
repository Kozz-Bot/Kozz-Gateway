import { AppModel } from '@/App/behavior';
import { useResourcesBehavior } from './behavior';
import * as S from './styles';

export const ResourcesPage = ({ model }: { model: AppModel }) => {
	const view = useResourcesBehavior({ model });

	return (
		<S.Stack>
			<S.ResourceList>
				{view.resources.map(resource => (
					<S.Pill key={resource}>{resource}</S.Pill>
				))}
			</S.ResourceList>
			<view.DispatchForm
				fields={view.fields}
				initialJson={view.initialJson}
				onSubmit={view.submit}
				schema={view.schema}
			/>
			<S.Pre>{view.responseText}</S.Pre>
		</S.Stack>
	);
};
