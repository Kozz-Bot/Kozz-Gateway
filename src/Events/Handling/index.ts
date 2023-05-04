import { Socket } from 'socket.io';
import { addIntroductionHandlers } from '../Introduction';
import * as messageHandlers from './messageHandler';
import * as replyHandler from './replyHandler';

export const registerSocketEventHandlers = (socket: Socket) => {
	addIntroductionHandlers(socket);

	Object.entries(messageHandlers).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});

	Object.entries(replyHandler).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
