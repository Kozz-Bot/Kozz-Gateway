import { AppModel } from '@/App/behavior';
import { useModulesBehavior } from './behavior';
import * as S from './styles';

export const ModulesPage = ({ model }: { model: AppModel }) => {
	const view = useModulesBehavior({ model });

	return (
		<S.Grid>
			<S.Panel>
				<S.Field>
					<span>Module</span>
					<S.Select
						onChange={event => view.setModuleName(event.target.value)}
						value={view.moduleName}
					>
						{view.modules.map(module => (
							<option key={module.value} value={module.value}>
								{module.label}
							</option>
						))}
					</S.Select>
				</S.Field>

				<S.SectionTitle>Methods</S.SectionTitle>
				<S.MethodList>
					{view.methods.map(method => (
						<S.MethodButton
							key={method}
							onClick={() => view.useMethod(method)}
							type="button"
						>
							{method}
						</S.MethodButton>
					))}
				</S.MethodList>

				<S.SectionTitle>Details</S.SectionTitle>
				<S.Pre>{view.selectedModuleText}</S.Pre>
			</S.Panel>

			<S.Main>
				<S.Panel>
					<S.Field>
						<span>Command</span>
						<S.Textarea
							onChange={event => view.setCommandText(event.target.value)}
							placeholder="method arg --flag value"
							value={view.commandText}
						/>
					</S.Field>
					<S.ActionRow>
						<S.Button
							disabled={!view.canSend}
							onClick={view.sendCommand}
							type="button"
						>
							Send Command
						</S.Button>
						<S.Button onClick={view.clearTimeline} type="button">
							Clear Timeline
						</S.Button>
					</S.ActionRow>
					<S.Status>{view.status}</S.Status>
				</S.Panel>

				<S.Panel>
					<S.SectionTitle>Timeline</S.SectionTitle>
					<S.Timeline>
						{view.timeline.map(entry => (
							<S.TimelineItem key={entry.id} tone={entry.event}>
								<S.TimelineMeta>
									<span>{entry.event}</span>
									<span>{entry.time}</span>
								</S.TimelineMeta>
								<S.TimelineBody>{entry.body}</S.TimelineBody>
								<S.TimelineSubtitle>{entry.meta}</S.TimelineSubtitle>
								<S.DetailsButton
									onClick={() => view.togglePayload(entry.id)}
									type="button"
								>
									{entry.expanded ? 'Hide JSON' : 'Show JSON'}
								</S.DetailsButton>
								{entry.expanded ? <S.Pre>{entry.payloadText}</S.Pre> : null}
							</S.TimelineItem>
						))}
					</S.Timeline>
				</S.Panel>
			</S.Main>
		</S.Grid>
	);
};
