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
import {
	getCommandAlias,
	getCommandAliasTargetModule,
	getHandlerByName,
} from 'src/Handlers';
import { parse } from 'src/Parser';
import { getBoundary, getBoundaryByName } from 'src/Boundaries';
import { getPanelSessionSocket } from 'src/PanelSessions';
import { useProxy } from 'src/Proxies';
import { getEntityBySocketId, normalizeNamespace } from 'src/Entities';

const assertBoundary = (id: string) => {
	if (!getBoundary(id)) {
		throw `The boundary ${id} is not registered`;
	}
};

const populateMessagePayload = (
	message: MessageReceived,
	socket: Socket
): MessageReceivedByGateway => {
	const boundary = getBoundary(socket.id)!;
	const newMessage: MessageReceivedByGateway = {
		...message,
		timestamp: message.timestamp || new Date().getTime(),
		boundaryId: socket.id,
		boundaryName: boundary.name,
		namespace: normalizeNamespace(boundary.namespace),
		quotedMessage: message.quotedMessage
			? populateMessagePayload(message.quotedMessage, socket)
			: undefined,
	};

	return newMessage;
};

const appendImmediateArg = (
	targetImmediateArg: string | null | undefined,
	incomingQuery: string
) => {
	const immediateArg = [targetImmediateArg || '', incomingQuery]
		.map(value => value.trim())
		.filter(Boolean)
		.join(' ');

	return immediateArg || null;
};

const mergeNamedArgs = (
	targetNamedArgs: Record<string, string | number | boolean> | undefined,
	incomingNamedArgs: Record<string, string | number | boolean> | null
) => {
	const namedArgs = {
		...(targetNamedArgs || {}),
		...(incomingNamedArgs || {}),
	};

	return Object.keys(namedArgs).length ? namedArgs : null;
};

const getQuery = (method: string, immediateArg: string | null) => {
	return method !== 'default'
		? `${method} ${immediateArg || ''}`.trim()
		: immediateArg ?? '';
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
		const alias = getCommandAlias(module, newMessage.namespace);
		const target = alias?.alias.target;
		const targetModule = alias ? getCommandAliasTargetModule(alias) : module;
		const targetMethod = target?.method || method;
		const targetImmediateArg = target
			? appendImmediateArg(target.immediateArg, query)
			: immediateArg;
		const targetNamedArgs = target
			? mergeNamedArgs(target.namedArgs, namedArgs)
			: namedArgs;
		const targetQuery = getQuery(targetMethod, targetImmediateArg);
		const handler = getHandlerByName(targetModule, newMessage.namespace);

		if (!handler) return;

		const commandPayload: Command = {
			module: targetModule,
			method: targetMethod,
			immediateArg: targetImmediateArg,
			namedArgs: targetNamedArgs,
			boundaryId: socket.id,
			message: newMessage,
			query: targetQuery,
			boundaryName: getBoundary(socket.id)!.name,
			namespace: newMessage.namespace,
			taggedContacts: newMessage.taggedContacts,
		};

		handler.socket.emit('command', commandPayload);
	} catch (e) {
		console.warn(e);
	}
};

const forwardsToBoundary = (socket: Socket, eventName: string, payload: any) => {
	const panelSocket = getPanelSessionSocket(payload.boundaryId);
	if (panelSocket) {
		panelSocket.emit('panel_module_response', {
			event: eventName,
			payload,
			receivedAt: Date.now(),
		});
		return;
	}

	const author = getEntityBySocketId(socket.id);
	const namespace = normalizeNamespace(author?.namespace);
	const boundaryData =
		getBoundary(payload.boundaryId || payload.boundaryName) ||
		getBoundaryByName(payload.boundaryId || payload.boundaryName, namespace);
	console.log(`Forwarding event ${eventName} to boundary ${boundaryData?.name}`);
	if (!boundaryData) return;
	if (normalizeNamespace(boundaryData.namespace) !== namespace) return;
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

	forwardsToBoundary(socket, 'new_message', {
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
			forwardsToBoundary(socket, 'send_message_with_media', sendMessagePayload);
		} else {
			forwardsToBoundary(socket, 'send_message', sendMessagePayload);
		}
	};

export const delete_message =
	(socket: Socket) => (deleteMessagePayload: DeleteMessagePayload) => {
		forwardsToBoundary(socket, 'delete_message', deleteMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_text =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		forwardsToBoundary(socket, 'reply_with_text', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_sticker =
	(socket: Socket) => (sendMessagePayload: SendMessagePayload) => {
		forwardsToBoundary(socket, 'reply_with_sticker', sendMessagePayload);
	};

/**
 * Forwards the request to the provided boundary
 * @param socket
 * @returns
 */
export const reply_with_media =
	(socket: Socket) => (sendMediaPayload: SendMediaPayload) => {
		forwardsToBoundary(socket, 'reply_with_media', sendMediaPayload);
	};

export const react_message =
	(socket: Socket) => (reactPayload: ReactToMessagePayload) => {
		forwardsToBoundary(socket, 'react_message', reactPayload);
	};

export const edit_message =
	(socket: Socket) => (editMessagePayload: EditMessagePayload) => {
		forwardsToBoundary(socket, 'edit_message', editMessagePayload);
	};
