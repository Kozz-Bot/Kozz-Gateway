import { Socket } from 'socket.io';
import { addIntroductionHandlers } from '../Introduction';
import * as messageHandlers from './messageHandler';

export const registerSocketEventHandlers = (socket: Socket) => {
	addIntroductionHandlers(socket);

	Object.entries(messageHandlers).forEach(([evName, handler]) => {
		socket.on(evName, handler(socket));
	});
};
