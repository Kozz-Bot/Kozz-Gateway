import { SendMessagePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getBoundary } from 'src/Boundaries';
import { getEntityBySocketId, normalizeNamespace } from 'src/Entities';

export const reply_with_text =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		const author = getEntityBySocketId(socket.id);
		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;
		if (
			author &&
			normalizeNamespace(author.namespace) !== normalizeNamespace(boundary.namespace)
		) {
			return;
		}
		boundary.socket.emit('reply_with_text', sendMessagePayload);
	};
