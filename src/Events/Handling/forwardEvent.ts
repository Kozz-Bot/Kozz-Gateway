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

export const event_forward_request = 
	(socket: Socket) =>
	async ({ sourceId, destination, eventName }: ForwardEventPayload) => {
		const { type, id } = destination;
		await delay(5000);
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
		//chamadas quando manda emit forward_event
		const sourceName = getHandler(socket.id)
			? getHandler(socket.id)?.name
			: getBoundary(socket.id)?.name;

		if (!sourceName) {
			return console.warn('Invalid source name');
		}
		
		getAllBoundaries(true).filter((entity:any) => {
			return entity.boundary.listeners.some(
				(listener:any) => listener.eventName === eventName
				&& (listener.source == '*'
					|| listener.source == sourceName
				) )
		}).forEach(entity => {
			entity.boundary.socket?.emit('forwarded_event', {
				eventName,
				payload,
			});
			
		});
		
		getAllHandlers(true).filter((entity:any) => {
			return entity.handler.listeners.some(
				(listener:any) => listener.eventName === eventName
				&& (listener.source == '*'
					|| listener.source == sourceName
				) )
		}).forEach(entity => {
			entity.handler.socket?.emit('forwarded_event', {
				eventName,
				payload,
			});
			
		});

	};
