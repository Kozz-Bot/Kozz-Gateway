import { ForwardEventPayload } from 'kozz-types';
import { Socket } from 'socket.io';
import {
	addListenerToBoundary,
	getBoundary,
	removeListenerFromBoundary,
} from 'src/Boundaries';
import {
	addListenerToHandler,
	getHandler,
	removeListenerFromHandler,
} from 'src/Handlers';

export const event_forward_request =
	(socket: Socket) =>
	({ sourceId, destination, eventName }: ForwardEventPayload) => {
		const { type, id } = destination;

		if (type === 'Boundary' && getBoundary(id)) {
			addListenerToBoundary(destination.id, eventName, sourceId);
		}

		if (type === 'Handler' && getHandler(id)) {
			addListenerToHandler(destination.id, eventName, sourceId);
		}
	};

export const event_forward_revoke =
	(socket: Socket) =>
	({ sourceId, destination, eventName }: ForwardEventPayload) => {
		const { type, id } = destination;

		if (type === 'Boundary' && getBoundary(id)) {
			removeListenerFromBoundary(destination.id, eventName);
		}

		if (type === 'Handler' && getHandler(id)) {
			removeListenerFromHandler(destination.id, eventName);
		}
	};
