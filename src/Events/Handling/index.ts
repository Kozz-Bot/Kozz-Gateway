import { Socket } from 'socket.io';

import * as introductionHandlers from '../Lifecycle/Introduction';
import * as messageHandlers from './messageHandler';
import * as proxyHandlers from './proxyHanlder';
import * as askingResourceHandlers from './askResource';

export const registerSocketEventHandlers = (socket: Socket) => {
	Object.entries({
		...messageHandlers,
		...proxyHandlers,
		...introductionHandlers,
		...askingResourceHandlers,
	}).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
