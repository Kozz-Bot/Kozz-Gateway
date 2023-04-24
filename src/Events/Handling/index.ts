import { Socket } from 'socket.io';
import * as messageHandlers from './messageHandler';

export const registerHandlers = (socket: Socket) => {
	Object.entries(messageHandlers).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
