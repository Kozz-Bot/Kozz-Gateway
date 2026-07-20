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
import { delay } from 'src/Util';
import { getEntityBySocketId, normalizeNamespace } from 'src/Entities';

export const event_forward_request =
	(socket: Socket) =>
	async ({ sourceId, destination, eventName }: ForwardEventPayload) => {
		const requester = getEntityBySocketId(socket.id);
		const namespace = normalizeNamespace(requester?.namespace);
		const { type, id } = destination;
		await delay(5000);
		if (type === 'Boundary' && getBoundaryByName(id, namespace)) {
			addListenerToBoundary(destination.id, eventName, sourceId, namespace);
		} else if (type === 'Handler' && getHandlerByName(id, namespace)) {
			addListenerToHandler(destination.id, eventName, sourceId, namespace);
		} else {
			console.warn('Wrong payload when trying to request event listening', {
				sourceId,
				destination,
				eventName,
			});
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

		const { type, id } = destination;
		const namespace = normalizeNamespace(getEntityBySocketId(socket.id)?.namespace);

		if (type === 'Boundary' && getBoundaryByName(sourceName, namespace)) {
			removeListenerFromBoundary(destination.id, eventName);
		}

		if (type === 'Handler' && getHandlerByName(sourceName, namespace)) {
			removeListenerFromHandler(destination.id, eventName);
		}
	};

export const forward_event =
	(socket: Socket) =>
	({ eventName, payload }: ForwardedEventPayload) => {
		try {
			const source = (getBoundary(socket.id) || getHandler(socket.id))?.name;
			const namespace = normalizeNamespace(
				(getBoundary(socket.id) || getHandler(socket.id))?.namespace
			);

			console.log({ eventName, payload, source });

			const allBoundaries = getAllBoundaries(true, namespace);
			allBoundaries.forEach(boundary => {
				const isListening = boundary.boundary.listeners.some(
					listener => listener.eventName === eventName && listener.source === source
				);

				if (isListening) {
					boundary.boundary.socket.emit('forwarded_event', {
						eventName,
						payload,
					});
				}
			});

			const allHandlers = getAllHandlers(true, namespace);
			allHandlers.forEach(handler => {
				const isListening = handler.handler.listeners.some(
					listener => listener.eventName === eventName && listener.source === source
				);

				console.log(handler.handler.socket.id);
				console.log(handler.handler.listeners);

				console.log(handler.name, 'is listening?', isListening);

				if (isListening) {
					handler.handler.socket.emit('forwarded_event', {
						eventName,
						payload,
					});
				}
			});
		} catch (e) {
			console.warn(e);
		}
	};
