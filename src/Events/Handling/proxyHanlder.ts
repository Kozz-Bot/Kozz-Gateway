import {
	BidirectionalProxyRequestPayload,
	ProxyRequestPayload,
	UnidirectionalProxyRequestPayload,
	ProxyRevokePayload,
} from 'kozz-types';
import { Socket } from 'socket.io';
import { removeProxy, upsertProxy } from 'src/Proxies';

const isUnidirectional = (
	proxy: ProxyRequestPayload
): proxy is UnidirectionalProxyRequestPayload => {
	return !proxy.bidirectional;
};
const isBidirectional = (
	proxy: ProxyRequestPayload
): proxy is BidirectionalProxyRequestPayload => {
	return !!proxy.bidirectional;
};

export const request_proxy = (_: Socket) => (payload: ProxyRequestPayload) => {
	if (isUnidirectional(payload)) {
		upsertProxy(payload.source, payload.destination);
	}

	if (isBidirectional(payload)) {
		upsertProxy(payload.source, payload.destination);
		upsertProxy(payload.replyDirection.source, payload.replyDirection.destination);
	}
};

export const revoke_proxy = (_: Socket) => (payload: ProxyRevokePayload) => {
	removeProxy(payload.source);
};
