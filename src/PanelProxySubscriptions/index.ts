import { MessageReceived } from 'kozz-types';
import { Socket } from 'socket.io';

type PanelProxySubscription = {
	id: string;
	socket: Socket;
	source: string;
};

const subscriptions: PanelProxySubscription[] = [];

export const subscribePanelToProxy = (socket: Socket, source: string) => {
	const id = `${socket.id}:${source}`;
	const existing = subscriptions.find(subscription => subscription.id === id);
	if (existing) {
		return existing.id;
	}

	subscriptions.push({
		id,
		socket,
		source,
	});
	return id;
};

export const unsubscribePanelFromProxy = (socket: Socket, source?: string) => {
	for (let index = subscriptions.length - 1; index >= 0; index -= 1) {
		const subscription = subscriptions[index];
		if (subscription.socket.id === socket.id && (!source || subscription.source === source)) {
			subscriptions.splice(index, 1);
		}
	}
};

export const removePanelProxySubscriptions = (socket: Socket) => {
	unsubscribePanelFromProxy(socket);
};

export const notifyPanelProxySubscribers = ({
	destinations,
	message,
	source,
}: {
	destinations: string[];
	message: MessageReceived;
	source: string;
}) => {
	subscriptions
		.filter(subscription => subscription.source === source)
		.forEach(subscription => {
			subscription.socket.emit('panel_proxy_event', {
				destinations,
				message,
				receivedAt: Date.now(),
				source,
			});
		});
};
