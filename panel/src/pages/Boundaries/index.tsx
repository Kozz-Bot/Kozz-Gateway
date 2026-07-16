import { AppModel } from '@/App/behavior';
import { useBoundariesBehavior } from './behavior';
import * as S from './styles';

export const BoundariesPage = ({ model }: { model: AppModel }) => {
	const view = useBoundariesBehavior({ model });

	return (
		<S.Grid>
			<S.Panel>
				<S.Field>
					<span>Boundary</span>
					<S.Select
						onChange={event => view.setBoundaryId(event.target.value)}
						value={view.boundaryId}
					>
						{view.boundaries.map(boundary => (
							<option key={boundary.value} value={boundary.value}>
								{boundary.label}
							</option>
						))}
					</S.Select>
				</S.Field>

				<S.Field>
					<span>Search Chats</span>
					<S.Input
						onChange={event => view.setChatSearch(event.target.value)}
						placeholder="Name, ID, group"
						value={view.chatSearch}
					/>
				</S.Field>

				<S.ChatList>
					{view.chatOptions.map(chat => (
						<S.ChatButton
							active={chat.id === view.chatId}
							key={chat.id}
							onClick={() => view.setChatId(chat.id)}
							type="button"
						>
							<strong>{chat.label}</strong>
							<span>{chat.subtitle}</span>
						</S.ChatButton>
					))}
				</S.ChatList>
			</S.Panel>

			<S.Main>
				<S.Panel>
					<S.HeaderRow>
						<div>
							<S.Title>{view.selectedChat?.label || 'No chat selected'}</S.Title>
							<S.Subtitle>{view.selectedChat?.subtitle || ''}</S.Subtitle>
						</div>
						{view.profilePicUrl ? (
							<S.Avatar src={view.profilePicUrl} alt="" />
						) : null}
					</S.HeaderRow>

					<S.Field>
						<span>Message</span>
						<S.Textarea
							onChange={event => view.setMessageBody(event.target.value)}
							placeholder="Type a message to dispatch to this chat"
							value={view.messageBody}
						/>
					</S.Field>
					<S.Button disabled={!view.canSend} onClick={view.sendMessage} type="button">
						Send Message
					</S.Button>
					<S.Status>{view.sendStatus}</S.Status>
				</S.Panel>

				<S.Panel>
					<S.SectionTitle>Chat Details</S.SectionTitle>
					<S.Pre>{view.detailsText}</S.Pre>
				</S.Panel>

				<S.Panel>
					<S.SectionTitle>Contact Info</S.SectionTitle>
					<S.Pre>{view.selectedContactText}</S.Pre>
				</S.Panel>

				<S.Panel>
					<S.SectionTitle>Group Info</S.SectionTitle>
					<S.Pre>{view.groupInfoText}</S.Pre>
				</S.Panel>
			</S.Main>
		</S.Grid>
	);
};
