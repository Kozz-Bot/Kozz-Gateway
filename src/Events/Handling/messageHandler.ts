import { MessageReceived, SendMessagePayload } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createMessagePayload } from 'src/Payload/Creation/MessageReply';

export const message = (socket: Socket) => (message: MessageReceived) => {
	if (message.body === '!ping') {
		socket.emit('reply_message', createMessagePayload(message));
	}
};
