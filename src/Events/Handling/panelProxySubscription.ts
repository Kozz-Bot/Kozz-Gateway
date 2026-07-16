import { Socket } from 'socket.io';
import {
	subscribePanelToProxy,
	unsubscribePanelFromProxy,
} from 'src/PanelProxySubscriptions';

export const panel_proxy_subscribe =
	(socket: Socket) =>
	({ source }: { source: string }) => {
		if (!source) {
			return;
		}

		const subscriptionId = subscribePanelToProxy(socket, source);
		socket.emit('panel_proxy_subscribed', {
			source,
			subscriptionId,
		});
	};

export const panel_proxy_unsubscribe =
	(socket: Socket) =>
	({ source }: { source?: string }) => {
		unsubscribePanelFromProxy(socket, source);
		socket.emit('panel_proxy_unsubscribed', {
			source,
		});
	};
