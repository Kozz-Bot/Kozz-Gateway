import { MessageReceived, SendMessagePayload, SendMediaPayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandler } from 'src/Handlers';
import { parse } from 'src/Parser';
import { getBoundary } from 'src/Boundaries';
import { createReactToMessagePayload } from 'src/Payload/Creation/ReactToMessage';
import { createMessagePayload } from 'src/Payload/Creation/MessageReply';
import { useProxy } from 'src/Proxies';

const assertBoundary = (message: MessageReceived) => {
	if (!message.boundaryId) {
		throw 'Tried to send a message Payload with no boundary ID';
	}
	if (!getBoundary(message.boundaryId)) {
		throw `The boundary ${message.boundaryId} is not registered`;
	}
};

export const message = (socket: Socket) => (message: MessageReceived) => {
	try {
		assertBoundary(message);

		useProxy(message);

		const command = parse(message.body);
		if (command.isError) {
			return;
		}
		const { module, method, immediateArg, namedArgs } = command.result;
		const handler = getHandler(module);

		if (!handler) return;

		if (message.contact.isBlocked) {
			return socket.emit(
				'reply_with_text',
				createMessagePayload(message, 'Você está bloqueado :)')
			);
		}

		if (!message.contact.hostAdded && !message.groupName) {
			return socket.emit(
				'reply_with_text',
				createMessagePayload(
					message,
					'Esse bot NÃO É pra usar no privado. Se você insistir eu vou te bloquear'
				)
			);
		}

		socket.emit('react_message', createReactToMessagePayload('✅', message));

		handler.socket.emit('command', {
			method,
			immediateArg,
			namedArgs,
			boundaryId: message.boundaryId || socket.id,
			message,
		});
	} catch (e) {
		console.warn(e);
	}
};

/**
 * Forwards the request to the provided handler
 * @param socket
 * @returns
 */
export const send_message =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;

		boundary.socket.emit('reply_with_text', sendMessagePayload);
	};

/**
 * Forwards the request to the provided handler
 * @param socket
 * @returns
 */
export const reply_with_text =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
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
		const boundary = getBoundary(sendMessagePayload.boundaryId);
		if (!boundary) return;

		boundary.socket.emit('reply_with_sticker', sendMessagePayload);
	};

/**
 * Forwards the request to the provided handler
 * @param socket
 * @returns
 */
export const reply_with_media =
	(_: Socket) => (sendMediaPayload: SendMediaPayload) => {
		const boundary = getBoundary(sendMediaPayload.boundaryId);
		if (!boundary) return;

		boundary.socket.emit('reply_with_media', sendMediaPayload);
	};
