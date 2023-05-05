import { MessageReceived, ReactToMessagePayload } from 'kozz-types';

export const createReactToMessagePayload = (
	emote: string,
	message: MessageReceived
): ReactToMessagePayload => {
	return {
		messageBody: message.body,
		messageId: message.id,
		boundaryId: message.boundaryId,
		chatId: message.fromHostAccount ? message.to : message.from,
		emote,
		platform: 'WA',
		timestamp: new Date().getTime(),
		contact: message.contact,
	};
};
