import { AppModel } from '@/App/behavior';
import { useProxiesBehavior } from './behavior';
import * as S from './styles';

export const ProxiesPage = ({ model }: { model: AppModel }) => {
	const view = useProxiesBehavior({ model });

	return (
		<S.Grid>
			<S.Panel>
				<S.Field>
					<span>Proxy</span>
					<S.Select
						onChange={event => view.setSelectedSource(event.target.value)}
						value={view.selectedSource}
					>
						{view.proxyOptions.map(proxy => (
							<option key={proxy.value} value={proxy.value}>
								{proxy.label}
							</option>
						))}
					</S.Select>
				</S.Field>
				<S.ProxyList>
					{view.proxyOptions.map(proxy => (
						<S.ProxyButton
							active={proxy.value === view.selectedSource}
							key={proxy.value}
							onClick={() => view.setSelectedSource(proxy.value)}
							type="button"
						>
							<strong>{proxy.label}</strong>
							<span>{proxy.destinationLabel}</span>
						</S.ProxyButton>
					))}
				</S.ProxyList>
				<S.SectionTitle>Destinations</S.SectionTitle>
				<S.Pre>{view.selectedSourceText}</S.Pre>
			</S.Panel>

			<S.Main>
				<S.Panel>
					<S.HeaderRow>
						<div>
							<S.Title>{view.selectedSource || 'No proxy selected'}</S.Title>
							<S.Subtitle>{view.status}</S.Subtitle>
						</div>
						<S.Button onClick={view.clearEvents} type="button">
							Clear Events
						</S.Button>
					</S.HeaderRow>
				</S.Panel>

				<S.Panel>
					<S.SectionTitle>Events</S.SectionTitle>
					<S.Timeline>
						{view.events.map(event => (
							<S.TimelineItem key={event.id}>
								<S.TimelineMeta>{event.meta}</S.TimelineMeta>
								<S.TimelineBody>{event.focus}</S.TimelineBody>
								<S.DetailsButton
									onClick={() => view.togglePayload(event.id)}
									type="button"
								>
									{event.expanded ? 'Hide JSON' : 'Show JSON'}
								</S.DetailsButton>
								{event.expanded ? <S.Pre>{event.payloadText}</S.Pre> : null}
							</S.TimelineItem>
						))}
					</S.Timeline>
				</S.Panel>
			</S.Main>
		</S.Grid>
	);
};
