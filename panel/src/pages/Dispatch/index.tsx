import { AppModel } from '@/App/behavior';
import { useDispatchBehavior } from './behavior';
import * as S from './styles';

export const DispatchPage = ({ model }: { model: AppModel }) => {
	const view = useDispatchBehavior({ model });

	return (
		<S.Stack>
			<S.Presets>
				{view.presets.map(preset => (
					<S.TemplateButton
						active={preset.active}
						key={preset.label}
						onClick={preset.onClick}
						type="button"
					>
						{preset.label}
					</S.TemplateButton>
				))}
			</S.Presets>
			<view.DispatchForm
				fields={view.fields}
				key={JSON.stringify(view.initialJson)}
				initialJson={view.initialJson}
				onSubmit={view.submit}
				schema={view.schema}
			/>
		</S.Stack>
	);
};
