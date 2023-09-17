import { Socket } from 'socket.io';

import * as introductionHandlers from '../Lifecycle/Introduction';
import * as messageHandlers from './messageHandler';
import * as proxyHandlers from './proxyHanlder';
import * as askingResourceHandlers from './askResource';
import * as chatEvents from './chatEvents';
import * as eventForwarding from './forwardEvent';

export const registerSocketEventHandlers = (socket: Socket) => {
	Object.entries({
		...messageHandlers,
		...proxyHandlers,
		...introductionHandlers,
		...askingResourceHandlers,
		...chatEvents,
		...eventForwarding,
	}).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
