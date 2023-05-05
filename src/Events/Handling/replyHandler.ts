import { SendMessagePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getBoundary } from 'src/Boundaries';

export const reply_with_text =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;
		boundary.socket.emit('reply_with_text', sendMessagePayload);
	};
