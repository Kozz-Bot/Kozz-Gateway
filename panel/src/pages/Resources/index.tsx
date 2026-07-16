import { AppModel } from '@/App/behavior';
import { useResourcesBehavior } from './behavior';
import * as S from './styles';

export const ResourcesPage = ({ model }: { model: AppModel }) => {
	const view = useResourcesBehavior({ model });

	return (
		<S.Stack>
			<S.ResourceList>
				{view.resources.map(resource => (
					<S.TemplateButton
						active={resource.active}
						key={resource.label}
						onClick={resource.onClick}
						type="button"
					>
						{resource.label}
					</S.TemplateButton>
				))}
			</S.ResourceList>
			<view.DispatchForm
				fields={view.fields}
				key={view.selectedResource}
				initialJson={view.initialJson}
				onSubmit={view.submit}
				schema={view.schema}
			/>
			<S.Pre>{view.responseText}</S.Pre>
		</S.Stack>
	);
};
