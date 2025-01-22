import {
	MessageReceived,
	SendMessagePayload,
	SendMediaPayload,
	ReactToMessagePayload,
	EditMessagePayload,
	Command,
	MessageReceivedByGateway,
	DeleteMessagePayload,
	NewMessage,
} from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandlerByName } from 'src/Handlers';
import { parse } from 'src/Parser';
import {
	getAllBoundaryInstances,
	getBoundary,
	getBoundaryByName,
} from 'src/Boundaries';
import { useProxy } from 'src/Proxies';

const assertBoundary = (id: string) => {
	if (!getBoundary(id)) {
		throw `The boundary ${id} is not registered`;
	}
};

const populateMessagePayload = (
	message: MessageReceived,
	socket: Socket
): MessageReceivedByGateway => {
	const newMessage: MessageReceivedByGateway = {
		...message,
		timestamp: message.timestamp || new Date().getTime(),
		boundaryId: socket.id,
		boundaryName: getBoundary(socket.id)!.name,
		quotedMessage: message.quotedMessage
			? populateMessagePayload(message.quotedMessage, socket)
			: undefined,
	};

	return newMessage;
};

export const message = (socket: Socket) => (message: MessageReceived) => {
	try {
		const newMessage = populateMessagePayload(message, socket);

		const id = socket.id;
		assertBoundary(id);

		useProxy(newMessage);

		const command = parse(newMessage.santizedBody ?? newMessage.body);
		if (command.isError) {
			return;
		}
		const { module, method, immediateArg, namedArgs, query } = command.result;
		const handler = getHandlerByName(module);

		if (!handler) return;

		const commandPayload: Command = {
			module,
			method,
			immediateArg,
			namedArgs,
			boundaryId: socket.id,
			message: newMessage,
			query,
			boundaryName: getBoundary(socket.id)!.name,
			taggedContacts: newMessage.taggedContacts,
		};

		handler.socket.emit('command', commandPayload);
	} catch (e) {
		console.warn(e);
	}
};

const forwardsToBoundary = (eventName: string, payload: any) => {
	const boundaryData =
		getBoundary(payload.boundaryId || payload.boundaryName) ||
		getBoundaryByName(payload.boundaryId || payload.boundaryName);
	if (!boundaryData) return;
	boundaryData.socket.emit(eventName, payload);
};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const new_message = (socket: Socket) => (newMessagePayload: NewMessage) => {
	const author = getBoundary(socket.id);
	if (!author) {
		return console.warn('[new_message]: No author for the message was found');
	}

	forwardsToBoundary('new_message', {
		...newMessagePayload,
		author: author.name,
	});
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

export const delete_message =
	(socket: Socket) => (deleteMessagePayload: DeleteMessagePayload) => {
		forwardsToBoundary('delete_message', deleteMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_text =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
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
