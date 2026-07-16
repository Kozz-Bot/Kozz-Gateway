import { z } from 'zod';
import { FieldSpec, useDispatchFormBehavior } from './behavior';
import * as S from './styles';

export const DispatchForm = ({
	fields,
	initialJson,
	schema,
	onSubmit,
}: {
	fields: FieldSpec[];
	initialJson: unknown;
	schema: z.ZodType;
	onSubmit: (value: unknown) => void;
}) => {
	const view = useDispatchFormBehavior({ fields, initialJson, schema, onSubmit });

	return (
		<S.Grid>
			<S.Panel>
				{view.fields.map(field => (
					<S.Field key={field.name}>
						<span>{field.label}</span>
						<S.Input
							onChange={event => field.onChange(event.target.value)}
							placeholder={field.placeholder}
							value={field.value}
						/>
					</S.Field>
				))}
				<S.Button onClick={view.submit} type="button">
					Dispatch
				</S.Button>
				<S.ErrorText>{view.error}</S.ErrorText>
			</S.Panel>
			<S.Panel>
				<view.CodeField value={view.jsonText} onChange={view.setJsonText} />
			</S.Panel>
		</S.Grid>
	);
};
