import { AskResourcePayload, ProvideResourcePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getBoundary } from '../../Boundaries';
import { getHandler } from '../../Handlers';

export const ask_resource = (socket: Socket) => (payload: AskResourcePayload) => {
	if (payload.responder.type === 'Handler') {
		return askHandler(payload);
	}
	if (payload.responder.type === 'Boundary') {
		return askBoundary(payload);
	}
	if (payload.responder.type === 'Gateway') {
		// [TODO]
		return askGateway(payload);
	}
};

export const reply_resource =
	(socket: Socket) => (payload: ProvideResourcePayload) => {
		const destinyEntityType = payload.requester.type;

		const destinationEntity = (() => {
			const entityId = payload.requester.id;
			if (destinyEntityType === 'Boundary') return getBoundary(entityId);
			if (destinyEntityType === 'Handler') return getHandler(entityId);
			// Gateway can't ask any entity so it can't be the target of the response;
		})();

		console.log(
			`Replying resource ${payload.request.resource} for ${destinationEntity?.id}`
		);

		destinationEntity?.socket.emit(`reply_resource/${payload.request.id}`, payload);
	};

/**
 * Forwards request to the correct boundary
 * @param payload
 * @returns
 */
const askBoundary = (payload: AskResourcePayload) => {
	const boundary = getBoundary(payload.responder.id);
	if (!boundary) {
		return;
	}

	console.log(
		`Asking Boundary ${boundary.id} for resource ${payload.request.resource}`
	);
	boundary.socket.emit('ask_resource', payload);
};

/**
 * Forwards request to the correct boundary
 * @param payload
 * @returns
 */
const askHandler = (payload: AskResourcePayload) => {
	const handler = getHandler(payload.responder.id);
	if (!handler) {
		return;
	}

	console.log(
		`Asking handler ${handler.name} for resource ${payload.request.resource}`
	);
	handler.socket.emit('ask_resource', payload);
};

const askGateway = (payload: AskResourcePayload) => {};
