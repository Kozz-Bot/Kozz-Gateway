import { AskResourcePayload, ProvideResourcePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getBoundary, getBoundaryByName } from '../../Boundaries';
import { getHandler, getHandlerByName } from '../../Handlers';
import { getAllBoundaries, getAllHandlers } from './Getters';
import { getAllProxies } from 'src/Proxies';
import { getGatewayAdminSnapshot } from 'src/API/AdminSnapshot';
import { getEntityBySocketId, normalizeNamespace } from 'src/Entities';

export const ask_resource = (socket: Socket) => (payload: AskResourcePayload) => {
	const requester = getEntityBySocketId(socket.id);
	if (!requester) {
		return;
	}
	const namespace = normalizeNamespace(requester.namespace);
	const scopedPayload: AskResourcePayload = {
		...payload,
		requester: {
			...payload.requester,
			namespace,
		},
		responder: {
			...payload.responder,
			namespace:
				payload.responder.type === 'Gateway'
					? payload.responder.namespace
					: namespace,
		},
	};

	if (scopedPayload.responder.type === 'Handler') {
		return askHandler(scopedPayload);
	}
	if (scopedPayload.responder.type === 'Boundary') {
		return askBoundary(scopedPayload);
	}
	if (scopedPayload.responder.type === 'Gateway') {
		return askGateway(scopedPayload);
	}
};

export const reply_resource =
	(socket: Socket) => (payload: ProvideResourcePayload) => {
		const destinyEntityType = payload.requester.type;

		const destinationEntity = (() => {
			const entityId = payload.requester.id;
			const namespace = normalizeNamespace(payload.requester.namespace);
			if (destinyEntityType === 'Boundary')
				return getBoundary(entityId) || getBoundaryByName(entityId, namespace);
			if (destinyEntityType === 'Handler')
				return getHandler(entityId) || getHandlerByName(entityId, namespace);
			// Gateway can't ask any entity so it can't be the target of the response;
		})();

		if (
			destinationEntity &&
			normalizeNamespace(destinationEntity.namespace) !==
				normalizeNamespace(payload.requester.namespace)
		) {
			return;
		}

		destinationEntity?.socket.emit(`reply_resource/${payload.request.id}`, payload);
	};

/**
 * Forwards request to the correct boundary
 * @param payload
 * @returns
 */
const askBoundary = (payload: AskResourcePayload) => {
	const namespace = normalizeNamespace(payload.requester.namespace);
	const boundary =
		getBoundary(payload.responder.id) ||
		getBoundaryByName(payload.responder.id, namespace);
	if (!boundary) {
		return;
	}
	if (normalizeNamespace(boundary.namespace) !== namespace) {
		return;
	}

	boundary.socket.emit('ask_resource', payload);
};

/**
 * Forwards request to the correct boundary
 * @param payload
 * @returns
 */
const askHandler = (payload: AskResourcePayload) => {
	const namespace = normalizeNamespace(payload.requester.namespace);
	const handler =
		getHandler(payload.responder.id) ||
		getHandlerByName(payload.responder.id, namespace);
	if (!handler) {
		return;
	}
	if (normalizeNamespace(handler.namespace) !== namespace) {
		return;
	}

	handler.socket.emit('ask_resource', payload);
};

const askGateway = (payload: AskResourcePayload) => {
	const namespace = normalizeNamespace(payload.requester.namespace);
	const response = (() => {
		if (payload.request.resource === 'all_boundaries') {
			return getAllBoundaries(false, namespace);
		}
		if (payload.request.resource === 'all_modules') {
			return getAllHandlers(false, namespace);
		}
		if (payload.request.resource === 'all_proxies') {
			return getAllProxies(namespace);
		}
		if (payload.request.resource === 'gateway_status') {
			return getGatewayAdminSnapshot(namespace).status;
		}
		if (payload.request.resource === 'gateway_entities') {
			const { boundaries, handlers } = getGatewayAdminSnapshot(namespace);
			return {
				boundaries,
				handlers,
			};
		}
		if (payload.request.resource === 'gateway_boundaries') {
			return getAllBoundaries(false, namespace);
		}
		if (payload.request.resource === 'gateway_handlers') {
			return getAllHandlers(false, namespace);
		}
		if (payload.request.resource === 'gateway_proxies') {
			return getAllProxies(namespace);
		}
		if (payload.request.resource === 'gateway_resources') {
			return getGatewayAdminSnapshot(namespace).resources;
		}
		if (payload.request.resource === 'gateway_snapshot') {
			return getGatewayAdminSnapshot(namespace);
		}
	})();

	const destinyEntityType = payload.requester.type;

	const destinationEntity = (() => {
		const entityId = payload.requester.id;
		const namespace = normalizeNamespace(payload.requester.namespace);
		if (destinyEntityType === 'Boundary')
			return getBoundary(entityId) || getBoundaryByName(entityId, namespace);
		if (destinyEntityType === 'Handler')
			return getHandler(entityId) || getHandlerByName(entityId, namespace);
	})();

	const responsePayload: ProvideResourcePayload = {
		...payload,
		response,
	};

	destinationEntity?.socket.emit(
		`reply_resource/${payload.request.id}`,
		responsePayload
	);
};
