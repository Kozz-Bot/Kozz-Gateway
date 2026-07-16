import { io, Socket } from 'socket.io-client';
import { createAskResource } from 'kozz-module-maker/dist/Message/RoutineCreation/AskResource';
import { HistoryEntry, createHistoryStore } from './historyStore';

type HistoryStore = ReturnType<typeof createHistoryStore>;

type SocketStatus = {
	connected: boolean;
	connecting: boolean;
	error?: string;
};

type StatusListener = (status: SocketStatus) => void;
type EventListener = (payload: unknown) => void;
type ResourceTarget = {
	id: string;
	type: 'Gateway' | 'Boundary' | 'Handler';
};

const PANEL_NAME = 'kozz-gw-panel';
const socketPath = window.location.pathname.startsWith('/kozz/')
	? '/kozz/socket.io/'
	: '/socket.io/';
const socketOrigin = window.location.pathname.startsWith('/kozz/')
	? window.location.origin
	: window.location.origin.replace(/:3878$/, ':4521');

export type PanelSocket = ReturnType<typeof createPanelSocket>;

export const createPanelSocket = (historyStore: HistoryStore) => {
	let socket: Socket | undefined;
	let status: SocketStatus = {
		connected: false,
		connecting: false,
	};
	const statusListeners = new Set<StatusListener>();
	const eventListeners = new Map<string, Set<EventListener>>();

	const emitStatus = (nextStatus: SocketStatus) => {
		status = nextStatus;
		statusListeners.forEach(listener => listener(status));
	};

	const addHistory = (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
		historyStore.add(entry);
	};

	const connect = (signature: string) => {
		if (socket?.connected) {
			return;
		}

		emitStatus({ connected: false, connecting: true });
		socket = io(socketOrigin, {
			path: socketPath,
		});

		socket.on('connect', () => {
			socket?.emit('introduction', {
				aliases: [],
				methods: [],
				name: PANEL_NAME,
				role: 'handler',
				signature,
			});
			emitStatus({ connected: true, connecting: false });
			addHistory({
				type: 'auth',
				title: 'Panel connected',
				payload: { name: PANEL_NAME },
			});
		});

		socket.on('connect_error', error => {
			emitStatus({
				connected: false,
				connecting: false,
				error: error.message,
			});
			addHistory({
				type: 'error',
				title: 'Socket connection error',
				payload: { message: error.message },
			});
		});

		socket.on('disconnect', reason => {
			emitStatus({ connected: false, connecting: false });
			addHistory({
				type: 'socket',
				title: 'Panel disconnected',
				payload: { reason },
			});
		});

		socket.onAny((event, payload) => {
			eventListeners.get(event)?.forEach(listener => listener(payload));
			addHistory({
				type: 'socket',
				title: event,
				payload,
			});
		});
	};

	const disconnect = () => {
		socket?.disconnect();
		socket = undefined;
		emitStatus({ connected: false, connecting: false });
	};

	const getStatus = () => status;

	const subscribeStatus = (listener: StatusListener) => {
		statusListeners.add(listener);
		listener(status);
		return () => {
			statusListeners.delete(listener);
		};
	};

	const subscribeEvent = (event: string, listener: EventListener) => {
		const listeners = eventListeners.get(event) || new Set<EventListener>();
		listeners.add(listener);
		eventListeners.set(event, listeners);
		return () => {
			listeners.delete(listener);
		};
	};

	const askGateway = async (resource: string, data: Record<string, unknown> = {}) => {
		return askResource({ id: 'Gateway', type: 'Gateway' }, resource, data);
	};

	const askResource = async (
		target: ResourceTarget,
		resource: string,
		data: Record<string, unknown> = {}
	) => {
		if (!socket) {
			throw new Error('Socket is not connected');
		}

		const ask = createAskResource(socket as never, {
			requester: {
				id: PANEL_NAME,
				type: 'Handler',
			},
		});
		const response = await (async () => {
			if (target.type === 'Boundary') {
				return ask.boundary(target.id, resource, data);
			}
			if (target.type === 'Handler') {
				return ask.handler(target.id, resource, data);
			}
			return ask.gateway(resource, data);
		})();
		addHistory({
			type: 'resource',
			title: `${target.type}/${target.id}/${resource}`,
			payload: {
				request: { target, resource, data },
				response,
			},
		});
		return response;
	};

	const dispatch = (event: string, payload: unknown) => {
		if (!socket) {
			throw new Error('Socket is not connected');
		}

		socket.emit(event, payload);
		addHistory({
			type: 'dispatch',
			title: event,
			payload,
		});
	};

	const sendTextMessage = ({
		body,
		boundaryId,
		chatId,
	}: {
		body: string;
		boundaryId: string;
		chatId: string;
	}) => {
		dispatch('send_message', {
			body,
			boundaryId,
			chatId,
			contact: {
				hostAdded: true,
				id: PANEL_NAME,
				isBlocked: false,
				isGroup: false,
				isHostAccount: true,
				privateName: PANEL_NAME,
				publicName: PANEL_NAME,
			},
			platform: 'other',
			timestamp: Date.now(),
		});
	};

	const sendModuleCommand = ({
		commandText,
		moduleName,
	}: {
		commandText: string;
		moduleName: string;
	}) => {
		dispatch('panel_module_command', {
			commandText,
			moduleName,
		});
	};

	const subscribeProxy = (source: string) => {
		dispatch('panel_proxy_subscribe', { source });
	};

	const unsubscribeProxy = (source?: string) => {
		dispatch('panel_proxy_unsubscribe', { source });
	};

	return {
		askGateway,
		askResource,
		connect,
		disconnect,
		dispatch,
		getStatus,
		sendModuleCommand,
		sendTextMessage,
		subscribeProxy,
		subscribeEvent,
		subscribeStatus,
		unsubscribeProxy,
	};
};
