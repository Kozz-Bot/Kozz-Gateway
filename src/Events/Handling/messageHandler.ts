import { MessageReceived, SendMessagePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandler } from 'src/Handlers';
import { parse } from 'src/Parser';
import { getBoundary } from 'src/Boundaries';
import { createReactToMessagePayload } from 'src/Payload/Creation/ReactToMessage';

export const message = (socket: Socket) => (message: MessageReceived) => {
	const command = parse(message.body);
	if (command.isError) {
		return;
	}
	const { module, method, immediateArg, namedArgs } = command.result;
	const handler = getHandler(module);

	if (!handler) return;

	socket.emit('react_message', createReactToMessagePayload('✅', message));

	handler.socket.emit('command', {
		method,
		immediateArg,
		namedArgs,
		boundaryId: message.boundaryId || socket.id,
		message,
	});
};

/**
 * Forwards the request to the provided handler
 * @param socket
 * @returns
 */
export const reply_with_text =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		console.log('Got reply with text request from handler');

		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;

		boundary.socket.emit('reply_with_text', sendMessagePayload);
	};

/**
 * Forwards the request to the provided handler
 * @param socket
 * @returns
 */
export const reply_with_sticker =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		console.log('Got reply with sticker request from handler');

		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;

		boundary.socket.emit('reply_with_sticker', sendMessagePayload);
	};
