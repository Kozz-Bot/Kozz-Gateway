import { MessageReceived, SendMessagePayload } from 'kozz-types';

export const createMessagePayload = (
	message: MessageReceived,
	text: string
): SendMessagePayload => {
	return {
		body: text,
		chatId: message.fromHostAccount ? message.to : message.from,
		platform: 'WA',
		timestamp: new Date().getTime(),
		quoteId: message.id,
		boundaryId: 'AAA',
		contact: message.contact,
	};
};
