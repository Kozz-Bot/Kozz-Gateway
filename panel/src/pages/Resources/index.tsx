import { AppModel } from '@/App/behavior';
import { useResourcesBehavior } from './behavior';
import * as S from './styles';

export const ResourcesPage = ({ model }: { model: AppModel }) => {
	const view = useResourcesBehavior({ model });

	return (
		<S.Stack>
			<S.Grid>
				<S.Panel>
					<S.Field>
						<span>Entity Type</span>
						<S.Select
							onChange={event =>
								view.setType(event.target.value as 'Gateway' | 'Boundary' | 'Handler')
							}
							value={view.entityType}
						>
							<option value="Gateway">Gateway</option>
							<option value="Boundary">Boundary</option>
							<option value="Handler">Module</option>
						</S.Select>
					</S.Field>

					<S.Field>
						<span>Entity</span>
						<S.Select
							disabled={view.entityType === 'Gateway'}
							onChange={event => view.setEntityId(event.target.value)}
							value={view.entityId}
						>
							{view.entityOptions.length === 0 ? (
								<option value="">No entity connected</option>
							) : null}
							{view.entityOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</S.Select>
					</S.Field>

					<S.Field>
						<span>Resource</span>
						<S.Select
							onChange={event => view.setResource(event.target.value)}
							value={view.resourceName}
						>
							{view.resourceOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</S.Select>
					</S.Field>

					<S.Field hidden={!view.showCustomResource}>
						<span>Other Resource</span>
						<S.Input
							onChange={event => view.setCustomResourceName(event.target.value)}
							placeholder="resource_name"
							value={view.customResourceName}
						/>
					</S.Field>

					<S.Button disabled={!view.canSubmit} onClick={view.submit} type="button">
						Ask Resource
					</S.Button>
					<S.ErrorText>{view.paramsError}</S.ErrorText>
				</S.Panel>

				<S.Panel>
					<S.Field>
						<span>Parameters</span>
						<view.CodeField value={view.paramsText} onChange={view.setParamsText} />
					</S.Field>
					<S.Field>
						<span>Request Payload</span>
						<S.Pre>{view.requestPayloadText}</S.Pre>
					</S.Field>
				</S.Panel>
			</S.Grid>

			<S.Pre>{view.responseText}</S.Pre>
		</S.Stack>
	);
};
