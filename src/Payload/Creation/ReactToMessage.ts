import { MessageReceived, ReactToMessagePayload } from 'kozz-types';

export const createReactToMessagePayload = (
	emote: string,
	message: MessageReceived
): ReactToMessagePayload => {
	return {
		messageId: message.id,
		boundaryId: message.boundaryName,
		emote,
	};
};
