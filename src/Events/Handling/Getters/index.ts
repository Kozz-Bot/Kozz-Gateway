import { BoundaryInstance, EventListener } from 'kozz-types';
import { Socket } from 'socket.io';
import { getAllProxies } from 'src/Proxies';
import {
	getAllBoundaryEntities,
	getAllHandlerEntities,
	normalizeNamespace,
} from 'src/Entities';

type GetBoundaryReturn<GetSocket = false> = {
	id: string;
	boundary: {
		name: string;
		platform: 'WA';
		OS: NodeJS.Platform;
		listeners: EventListener[];
		socket: GetSocket extends true ? Socket : never;
	};
};

export const getAllBoundaries = <GetSocket>(
	getSocket?: GetSocket,
	namespace?: string
): GetBoundaryReturn<GetSocket>[] => {
	return getAllBoundaryEntities()
		.filter(
			boundary =>
				!namespace ||
				normalizeNamespace(boundary.namespace) === normalizeNamespace(namespace)
		)
		.map(boundary => {
		const { id, name, platform, OS, listeners, socket } = boundary;

		return {
			id,
			boundary: {
				name,
				platform,
				OS,
				listeners,
				socket: getSocket ? socket : undefined,
			},
		};
		// This cast is necessary because Object.keys doesnt behave
		// with proper static typing
	}) as unknown as GetBoundaryReturn<GetSocket>[];
};

export type GetAllHandlersReturn<GetSocket = false> = {
	name: string;
	handler: {
		id: string;
		methods: string[];
		role: 'handler';
		listeners: EventListener[];
		socket: GetSocket extends true ? Socket : never;
	};
};

export const getAllHandlers = <GetSocket>(
	getSocket?: GetSocket,
	namespace?: string
) => {
	return getAllHandlerEntities()
		.filter(
			handler =>
				!namespace ||
				normalizeNamespace(handler.namespace) === normalizeNamespace(namespace)
		)
		.map(handler => {
		const { id, methods, name, role, listeners, socket } = handler;

		return {
			name,
			handler: {
				id,
				methods,
				role,
				listeners,
				socket: getSocket ? socket : undefined,
			},
		};
	}) as unknown as GetAllHandlersReturn<GetSocket>[];
};

export const getProxyMap = (namespace?: string) => getAllProxies(namespace);
