import { MessageReceived, SendMessagePayload } from 'kozz-types';

export const createMessagePayload = (
	message: MessageReceived
): SendMessagePayload => {
	return {
		body: 'pong',
		chatId: message.fromHostAccount ? message.to : message.from,
		platform: 'WA',
		timestamp: new Date().getTime(),
		quoteId: message.id,
		boundaryId: "AAA",
	};
};
