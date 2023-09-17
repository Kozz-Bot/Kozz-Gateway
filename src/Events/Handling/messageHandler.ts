import {
	MessageReceived,
	SendMessagePayload,
	SendMediaPayload,
	ReactToMessagePayload,
	EditMessagePayload,
	Command,
} from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandler } from 'src/Handlers';
import { parse } from 'src/Parser';
import { getBoundary, getBoundaryByName } from 'src/Boundaries';
import { createMessagePayload } from 'src/Payload/Creation/MessageReply';
import { useProxy } from 'src/Proxies';
import { getAllBoundaries } from './Getters';

const assertBoundary = (id: string) => {
	if (!getBoundary(id)) {
		throw `The boundary ${id} is not registered`;
	}
};

export const message = (socket: Socket) => (message: MessageReceived) => {
	try {
		const id = socket.id;
		assertBoundary(id);

		useProxy(message);

		const command = parse(message.body);
		if (command.isError) {
			return;
		}
		const { module, method, immediateArg, namedArgs, query } = command.result;
		const handler = getHandler(module);

		if (!handler) return;

		if (message.contact.isBlocked) {
			return socket.emit(
				'reply_with_text',
				createMessagePayload(message, 'Você está bloqueado :)')
			);
		}

		console.log('sending command');

		const commandPayload: Command = {
			method,
			immediateArg,
			namedArgs,
			boundaryId: socket.id,
			message,
			query,
			boundaryName: getBoundary(socket.id)!.name,
			taggedContacts: message.taggedContacts,
		};

		handler.socket.emit('command', commandPayload);
	} catch (e) {
		console.warn(e);
	}
};

const forwardsToBoundary = (eventName: string, payload: { boundaryId: string }) => {
	const boundaryData = getBoundary(payload.boundaryId);
	if (!boundaryData) return;

	boundaryData.socket.emit(eventName, payload);
};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const send_message =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
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
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		console.log('Reply');
		forwardsToBoundary('reply_with_text', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_sticker =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		forwardsToBoundary('reply_with_sticker', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_media =
	(socket: Socket) => (sendMediaPayload: SendMediaPayload) => {
		forwardsToBoundary('reply_with_media', sendMediaPayload);
	};

export const react_message =
	(socket: Socket) => (reactPayload: ReactToMessagePayload) => {
		forwardsToBoundary('react_message', reactPayload);
	};

export const edit_message =
	(socket: Socket) => (editMessagePayload: EditMessagePayload) => {
		forwardsToBoundary('edit_message', editMessagePayload);
	};
