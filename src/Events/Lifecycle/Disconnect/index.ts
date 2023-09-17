import { Introduction } from 'kozz-types';
import { Socket } from 'socket.io';
import { isBoundary, removeBoundary } from 'src/Boundaries';
import { isHandler, removeHandler } from 'src/Handlers';

export const addDisconnectHandlers = (
	socket: Socket,
	introduction: Introduction
) => {
	socket.on('disconnecting', () => {
		if (isBoundary(introduction)) {
			removeBoundary(socket.id);
		}
		if (isHandler(introduction)) {
			removeHandler(socket.id);
		}
	});
};
