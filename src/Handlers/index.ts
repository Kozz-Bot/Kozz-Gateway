import {
	type HandlerInstance,
	HandlerIntroduction,
	Introduction,
	ForwardEventPayload,
} from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createHandler } from './Handler';
import { normalizeString } from 'src/Util';

let handlers: {
	[key: string]: HandlerInstance;
} = {};

export const addHandler = (
	name: string,
	socket: Socket,
	introduction: HandlerIntroduction
) => {
	const id = socket.id;
	if (getHandlerByName(name)) {
		console.warn(`Reconnecting Handler with name ${name}`);
	}
	handlers[id] = createHandler({ id, socket, ...introduction });
};

export const getHandlerByName = (name: string): HandlerInstance | undefined =>
	Object.values(handlers).find(handler => handler.name === name);

export const getHandler = (name: string): HandlerInstance | undefined =>
	Object.values(handlers).find(handler => handler.name === name);

export const getAllHandlerInstancess = (): HandlerInstance[] =>
	Object.values(handlers);

export const isHandler = (
	introduction: Introduction
): introduction is HandlerIntroduction => {
	return introduction.role === 'handler';
};

export const addListenerToHandler = (
	destinationId: string,
	eventName: string,
	sourceId: string
) => {
	const handler = getHandler(destinationId);

	if (!handler) {
		return console.warn(
			`Tried to register listener for event ${eventName} in non-existent handler ${destinationId}`
		);
	}

	//If is already listening listening to the event, do nothing;
	if (handler.listeners.find(ev => ev.eventName === eventName)) {
		return;
	}

	console.log('adding listener to event');

	handler.listeners.push({
		id: new Date().getTime().toString(),
		eventName,
		source: sourceId,
	});
};

export const removeListenerFromHandler = (id: string, eventName: string) => {
	const handler = getHandler(id);

	if (!handler) {
		return console.warn(
			`Tried to remove listener for event ${eventName} from non-existent handler ${id}`
		);
	}

	handler.listeners = handler.listeners.filter(
		listener => listener.eventName !== eventName
	);
};

export const logHandler = (boundary: HandlerInstance) => {
	console.log(`[SERVER]: Handler with name ${boundary.name} connected`);
};

export const removeHandler = (handlerName: string) => {
	console.log(`Disconnecting handler with name ${handlerName}`);
	delete handlers[handlerName];
};

export default handlers;
