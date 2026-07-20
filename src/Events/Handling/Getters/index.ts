import { BoundaryInstance, EventListener } from 'kozz-types';
import { Socket } from 'socket.io';
import boundaries from 'src/Boundaries';
import handlers from 'src/Handlers';
import { getAllProxies } from 'src/Proxies';
import { normalizeNamespace } from 'src/Entities';

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
	return Object.keys(boundaries)
		.filter(
			key =>
				!namespace ||
				normalizeNamespace(boundaries[key].namespace) === normalizeNamespace(namespace)
		)
		.map(key => {
		const { name, platform, OS, listeners, socket } = boundaries[key];

		return {
			id: key,
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
	return Object.keys(handlers)
		.filter(
			key =>
				!namespace ||
				normalizeNamespace(handlers[key].namespace) === normalizeNamespace(namespace)
		)
		.map(key => {
		const { id, methods, name, role, listeners, socket } = handlers[key];

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
