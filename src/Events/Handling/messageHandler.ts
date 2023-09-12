import {
	MessageReceived,
	SendMessagePayload,
	SendMediaPayload,
	ReactToMessagePayload,
	EditMessagePayload,
} from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandler } from 'src/Handlers';
import { parse } from 'src/Parser';
import { getBoundary } from 'src/Boundaries';
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

const forwardsToBoundary = (eventName: string, payload: { boundaryId: string }) => {
	const boundary = getBoundary(payload.boundaryId);
	if (!boundary) return;

	boundary.socket.emit(eventName, payload);
};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const send_message =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		if (sendMessagePayload.media) {
			forwardsToBoundary('send_message_with_media', sendMessagePayload);
		} else {
			forwardsToBoundary('send_message', sendMessagePayload);
		}
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_text =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		forwardsToBoundary('reply_with_text', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_sticker =
	(_: Socket) => (sendMessagePayload: SendMessagePayload) => {
		forwardsToBoundary('reply_with_sticker', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_media =
	(_: Socket) => (sendMediaPayload: SendMediaPayload) => {
		forwardsToBoundary('reply_with_media', sendMediaPayload);
	};

export const react_message =
	(_: Socket) => (reactPayload: ReactToMessagePayload) => {
		forwardsToBoundary('react_message', reactPayload);
	};

export const edit_message =
	(_: Socket) => (editMessagePayload: EditMessagePayload) => {
		forwardsToBoundary('edit_message', editMessagePayload);
	};
