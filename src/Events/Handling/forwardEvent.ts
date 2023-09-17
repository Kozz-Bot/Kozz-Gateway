import { ForwardEventPayload, ForwardedEventPayload } from 'kozz-types';
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
import { getAllBoundaries, getAllHandlers } from './Getters';

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
	({ destination, eventName }: ForwardEventPayload) => {
		const { type, id } = destination;

		if (type === 'Boundary' && getBoundary(id)) {
			removeListenerFromBoundary(destination.id, eventName);
		}

		if (type === 'Handler' && getHandler(id)) {
			removeListenerFromHandler(destination.id, eventName);
		}
	};

export const forward_event =
	(socket: Socket) =>
	({ eventName, payload }: ForwardedEventPayload) => {
		const source = socket.id;
		const [allBoundaries, allHandlers] = [
			getAllBoundaries(true),
			getAllHandlers(true),
		];

		allBoundaries.forEach(entity => {
			const isListeningToEvent = entity.boundary.listeners.find(
				event => event.eventName === eventName && event.source === source
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
				event => event.eventName === eventName && event.source === source
			);
			if (isListeningToEvent) {
				entity.handler.socket?.emit('forwarded_event', {
					eventName,
					payload,
				});
			}
		});
	};
