import { ForwardEventPayload, ForwardedEventPayload } from 'kozz-types';
import { Socket } from 'socket.io';
import {
	addListenerToBoundary,
	getBoundary,
	getBoundaryByName,
	removeListenerFromBoundary,
} from 'src/Boundaries';
import {
	addListenerToHandler,
	getHandler,
	getHandlerByName,
	removeListenerFromHandler,
} from 'src/Handlers';
import { getAllBoundaries, getAllHandlers } from './Getters';

export const event_forward_request =
	(socket: Socket) =>
	({ sourceId, destination, eventName }: ForwardEventPayload) => {
		const { type, id } = destination;

		if (type === 'Boundary' && getBoundaryByName(id)) {
			addListenerToBoundary(destination.id, eventName, sourceId);
		} else if (type === 'Handler' && getHandlerByName(id)) {
			addListenerToHandler(destination.id, eventName, sourceId);
		} else {
			console.warn('Wrong payload');
		}
	};

export const event_forward_revoke =
	(socket: Socket) =>
	({ destination, eventName }: ForwardEventPayload) => {
		const sourceName = getHandler(socket.id)
			? getHandler(socket.id)?.name
			: getBoundary(socket.id)?.name;

		if (!sourceName) {
			return console.warn('Invalid source name');
		}

		console.log('Forwarding Event Revoke', {
			destination,
			eventName,
		});

		const { type, id } = destination;

		if (type === 'Boundary' && getBoundaryByName(sourceName)) {
			removeListenerFromBoundary(destination.id, eventName);
		}

		if (type === 'Handler' && getHandlerByName(sourceName)) {
			removeListenerFromHandler(destination.id, eventName);
		}
	};

export const forward_event =
	(socket: Socket) =>
	({ eventName, payload }: ForwardedEventPayload) => {
		const sourceName = getHandler(socket.id)
			? getHandler(socket.id)?.name
			: getBoundary(socket.id)?.name;

		if (!sourceName) {
			return console.warn('Invalid source name');
		}

		const [allBoundaries, allHandlers] = [
			getAllBoundaries(true),
			getAllHandlers(true),
		];

		allBoundaries.forEach(entity => {
			const isListeningToEvent = entity.boundary.listeners.find(
				event => event.eventName === eventName && event.source === sourceName
			);
			if (isListeningToEvent) {
				entity.boundary.socket?.emit('forwarded_event', {
					eventName,
					payload,
				});
			}
		});

		allHandlers.forEach(entity => {
			const isListeningToEvent = entity.handler.listeners.find(
				event => event.eventName === eventName && event.source === sourceName
			);

			if (isListeningToEvent) {
				entity.handler.socket?.emit('forwarded_event', {
					eventName,
					payload,
				});
			}
		});
	};
