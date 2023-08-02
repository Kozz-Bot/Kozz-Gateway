import {
	type HandlerInstance,
	HandlerIntroduction,
	Introduction,
} from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createHandler } from './Handler';
import { normalizeString } from 'src/Util';

let handlers: {
	[key: string]: HandlerInstance;
} = {};

export const addHandler = (
	id: string,
	socket: Socket,
	introduction: HandlerIntroduction
) => {
	if (getHandler(id)) {
		console.warn(`Reconnecting Handler with id ${id}`);
	}
	handlers[id] = createHandler({ id, socket, ...introduction });
};

export const getHandler = (id: string): HandlerInstance | undefined =>
	handlers[normalizeString(id)];

export const isHandler = (
	introduction: Introduction
): introduction is HandlerIntroduction => {
	return introduction.role === 'handler';
};

export const logHandler = (boundary: HandlerInstance) => {
	console.log(`[SERVER]: Handler with name ${boundary.name} connected`);
};

export const removeHandler = (handlerName: string) => {
	console.log(`Disconnecting handler with name ${handlerName}`);
	delete handlers[handlerName];
};
export default handlers;
