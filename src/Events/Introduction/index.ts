import { Introduction } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import boundaries, { isBoundary, addBoundary } from 'src/Boundaries';
import handlers, { isHandler, addHandler } from 'src/Handlers';

export const addIntroductionHandlers = (socket: Socket) => {
	socket.on('introduction', (introduction: Introduction) => {
		if (isBoundary(introduction)) {
			addBoundary(introduction.id || socket.id, socket, introduction);
			console.log(`Connecting boundary with ID ${introduction.id}. Total boundaries: ${Object.keys(boundaries)}`);
		}
		if (isHandler(introduction)) {
			addHandler(introduction.name, socket, introduction);
			console.log(`Connecting Handler with ID ${introduction.name}. Total handlers: ${Object.keys(handlers)}`);

		}
	});
};
