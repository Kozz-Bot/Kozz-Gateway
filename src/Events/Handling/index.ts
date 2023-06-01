import { Socket } from 'socket.io';
import { addIntroductionHandlers } from '../Lifecycle/Introduction';
import * as messageHandlers from './messageHandler';
import * as proxyHandlers from './proxyHanlder';

export const registerSocketEventHandlers = (socket: Socket) => {
	addIntroductionHandlers(socket);

	Object.entries({
		...messageHandlers,
		...proxyHandlers,
	}).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
