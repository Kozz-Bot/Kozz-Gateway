import { MessageReceived, SendMessagePayload } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import handlers, { getHandler } from 'src/Handlers';
import { parse } from 'src/Parser';
import { createMessagePayload } from 'src/Payload/Creation/MessageReply';

export const message = (socket: Socket) => (message: MessageReceived) => {
	const command = parse(message.body);
	if (command.isError) {
		return;
	}
	const { module, method, immediateArg, namedArgs } = command.result;
	const handler = getHandler(module);

	if (!handler) return;

	handler.socket.emit('command', {
		method,
		immediateArg,
		namedArgs,
		boundaryId: socket.id,
		message,
	});
};
