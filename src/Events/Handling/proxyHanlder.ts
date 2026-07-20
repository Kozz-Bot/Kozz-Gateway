import { ProxyRequestPayload, ProxyRevokePayload } from 'kozz-types';
import { Socket } from 'socket.io';
import { getEntityBySocketId, normalizeNamespace } from 'src/Entities';
import { createProxy, revokeProxy } from 'src/Proxies';

export const request_proxy = (socket: Socket) => (payload: ProxyRequestPayload) => {
	const requester = getEntityBySocketId(socket.id);
	if (!requester) {
		return socket.emit('request_proxy_ack', {
			success: false,
			error: 'requester is not registered',
		});
	}

	const created = createProxy(
		requester.name,
		payload,
		normalizeNamespace(requester.namespace)
	);

	socket.emit('request_proxy_ack', {
		success: true,
		subscriptionIds: created.map(subscription => subscription.id),
	});
};

export const revoke_proxy =
	(socket: Socket) => (payload: ProxyRevokePayload, disconnecting?: boolean) => {
		const requester = getEntityBySocketId(socket.id);
		if (!requester) {
			return;
		}
		revokeProxy(payload, normalizeNamespace(requester.namespace));
	};
