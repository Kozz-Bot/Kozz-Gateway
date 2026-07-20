import {
	MessageReceivedByGateway,
	ProxyRequestPayload,
	ProxyRevokePayload,
	ProxySource,
	ProxySubscription,
	ProxySubscriptionStatus,
} from 'kozz-types';
import {
	getBoundaryEntityByName,
	getEntityByName,
	getHandlerEntityByName,
	normalizeNamespace,
} from 'src/Entities';
import { notifyPanelProxySubscribers } from 'src/PanelProxySubscriptions';

const DEFAULT_SUBSCRIBER_GRACE_PERIOD_MS = 5 * 60 * 1000;

type ProxyChat = '*' | string;

type ProxyIndex = Map<string, Set<string>>;

type CreateProxyOptions = {
	requestedBy: string;
	namespace?: string;
	payload: ProxyRequestPayload;
	now?: number;
};

type RevokeProxyOptions = {
	payload: ProxyRevokePayload;
	namespace?: string;
	now?: number;
};

const sourceKey = (namespace: string, boundary: string, chat: ProxyChat) =>
	`${namespace}/${boundary}/${chat}`;

const subscriptionKey = (
	namespace: string,
	subscriber: string,
	boundary: string,
	chat: ProxyChat
) => `${namespace}:${subscriber}:${sourceKey(namespace, boundary, chat)}`;

const createSubscriptionId = (
	namespace: string,
	subscriber: string,
	boundary: string,
	chat: ProxyChat
) => `${namespace}:${subscriber}:${boundary}/${chat}`;

const normalizeChats = (source: ProxySource): ProxyChat[] => {
	if (source.chats === '*') {
		return ['*'];
	}

	return Array.from(new Set(source.chats));
};

const toSubscriptionSource = (boundary: string, chat: ProxyChat): ProxySource => ({
	boundary,
	chats: chat === '*' ? '*' : [chat],
});

const namespaceAndNow = (
	namespaceOrNow?: string | number,
	now = Date.now()
) => {
	if (typeof namespaceOrNow === 'number') {
		return {
			namespace: normalizeNamespace(),
			now: namespaceOrNow,
		};
	}

	return {
		namespace: normalizeNamespace(namespaceOrNow),
		now,
	};
};

const matchesRevokeSource = (
	subscription: ProxySubscription,
	source: Extract<ProxyRevokePayload, { source?: unknown }>['source']
) => {
	if (!source) {
		return true;
	}

	if (subscription.source.boundary !== source.boundary) {
		return false;
	}

	if (!source.chats) {
		return true;
	}

	if (source.chats === '*') {
		return subscription.source.chats === '*';
	}

	if (subscription.source.chats === '*') {
		return false;
	}

	return subscription.source.chats.some(chat => source.chats!.includes(chat));
};

export class ProxyRegistry {
	private subscriptionsById = new Map<string, ProxySubscription>();
	private subscriptionIdsByKey = new Map<string, string>();
	private exactIndex: ProxyIndex = new Map();
	private wildcardIndex: ProxyIndex = new Map();
	private onlineBoundaries = new Set<string>();
	private onlineSubscribers = new Set<string>();

	constructor(
		private subscriberGracePeriodMs = DEFAULT_SUBSCRIBER_GRACE_PERIOD_MS
	) {}

	createProxy({
		requestedBy,
		namespace: rawNamespace,
		payload,
		now = Date.now(),
	}: CreateProxyOptions) {
		const namespace = normalizeNamespace(rawNamespace);
		const subscriber = payload.subscriber || requestedBy;
		const chats = normalizeChats(payload.source);

		return chats.map(chat =>
			this.upsertSubscription({
				requestedBy,
				namespace,
				subscriber,
				boundary: payload.source.boundary,
				chat,
				now,
			})
		);
	}

	revokeProxy({ payload, namespace: rawNamespace }: RevokeProxyOptions) {
		const namespace = normalizeNamespace(rawNamespace);
		if ('subscriptionId' in payload) {
			const subscription = this.subscriptionsById.get(payload.subscriptionId);
			if (subscription?.namespace !== namespace) {
				return 0;
			}
			return this.removeById(payload.subscriptionId);
		}

		const toRemove = this.getAllSubscriptions()
			.filter(subscription => {
				if (subscription.namespace !== namespace) {
					return false;
				}

				if (payload.subscriber && subscription.subscriber !== payload.subscriber) {
					return false;
				}

				return matchesRevokeSource(subscription, payload.source);
			})
			.map(subscription => subscription.id);

		toRemove.forEach(id => this.removeById(id));
		return toRemove.length;
	}

	markBoundaryConnected(
		boundary: string,
		namespaceOrNow?: string | number,
		rawNow = Date.now()
	) {
		const { namespace: normalizedNamespace, now } = namespaceAndNow(
			namespaceOrNow,
			rawNow
		);
		this.onlineBoundaries.add(`${normalizedNamespace}:${boundary}`);
		this.refreshByBoundary(boundary, normalizedNamespace, now);
	}

	markBoundaryDisconnected(
		boundary: string,
		namespaceOrNow?: string | number,
		rawNow = Date.now()
	) {
		const { namespace: normalizedNamespace, now } = namespaceAndNow(
			namespaceOrNow,
			rawNow
		);
		this.onlineBoundaries.delete(`${normalizedNamespace}:${boundary}`);
		this.refreshByBoundary(boundary, normalizedNamespace, now);
	}

	markSubscriberConnected(
		subscriber: string,
		namespaceOrNow?: string | number,
		rawNow = Date.now()
	) {
		const { namespace: normalizedNamespace, now } = namespaceAndNow(
			namespaceOrNow,
			rawNow
		);
		this.onlineSubscribers.add(`${normalizedNamespace}:${subscriber}`);
		this.getAllSubscriptions()
			.filter(
				subscription =>
					subscription.subscriber === subscriber &&
					subscription.namespace === normalizedNamespace
			)
			.forEach(subscription => {
				subscription.expiresAt = undefined;
				this.refreshStatus(subscription, now);
			});
	}

	markSubscriberDisconnected(
		subscriber: string,
		namespaceOrNow?: string | number,
		rawNow = Date.now()
	) {
		const { namespace: normalizedNamespace, now } = namespaceAndNow(
			namespaceOrNow,
			rawNow
		);
		this.onlineSubscribers.delete(`${normalizedNamespace}:${subscriber}`);
		this.getAllSubscriptions()
			.filter(
				subscription =>
					subscription.subscriber === subscriber &&
					subscription.namespace === normalizedNamespace
			)
			.forEach(subscription => {
				subscription.expiresAt = now + this.subscriberGracePeriodMs;
				this.refreshStatus(subscription, now);
			});
	}

	expirePendingSubscribers(now = Date.now()) {
		const toRemove = this.getAllSubscriptions()
			.filter(
				subscription =>
					subscription.status === 'pending_subscriber' &&
					!!subscription.expiresAt &&
					subscription.expiresAt <= now
			)
			.map(subscription => subscription.id);

		toRemove.forEach(id => this.removeById(id));
		return toRemove.length;
	}

	getSubscriptionsForMessage(
		boundary: string,
		chat: string,
		namespace?: string
	) {
		const normalizedNamespace = normalizeNamespace(namespace);
		const ids = [
			...this.getIndexIds(
				this.wildcardIndex,
				sourceKey(normalizedNamespace, boundary, '*')
			),
			...this.getIndexIds(
				this.exactIndex,
				sourceKey(normalizedNamespace, boundary, chat)
			),
		];
		const bySubscriber = new Map<string, ProxySubscription>();

		ids.forEach(id => {
			const subscription = this.subscriptionsById.get(id);
			if (!subscription || subscription.status !== 'active') {
				return;
			}

			if (!bySubscriber.has(subscription.subscriber)) {
				bySubscriber.set(subscription.subscriber, subscription);
			}
		});

		return Array.from(bySubscriber.values());
	}

	getAllSubscriptions() {
		return Array.from(this.subscriptionsById.values());
	}

	private upsertSubscription({
		requestedBy,
		namespace,
		subscriber,
		boundary,
		chat,
		now,
	}: {
		requestedBy: string;
		namespace: string;
		subscriber: string;
		boundary: string;
		chat: ProxyChat;
		now: number;
	}) {
		const key = subscriptionKey(namespace, subscriber, boundary, chat);
		const existingId = this.subscriptionIdsByKey.get(key);
		if (existingId) {
			const existing = this.subscriptionsById.get(existingId)!;
			existing.requestedBy = requestedBy;
			existing.updatedAt = now;
			this.refreshStatus(existing, now);
			return existing;
		}

		const subscription: ProxySubscription = {
			id: createSubscriptionId(namespace, subscriber, boundary, chat),
			namespace,
			requestedBy,
			subscriber,
			source: toSubscriptionSource(boundary, chat),
			status: this.getStatus(namespace, boundary, subscriber),
			createdAt: now,
			updatedAt: now,
			expiresAt: this.onlineSubscribers.has(`${namespace}:${subscriber}`)
				? undefined
				: now + this.subscriberGracePeriodMs,
		};

		this.subscriptionsById.set(subscription.id, subscription);
		this.subscriptionIdsByKey.set(key, subscription.id);
		this.addToIndex(subscription, chat);
		return subscription;
	}

	private removeById(id: string) {
		const subscription = this.subscriptionsById.get(id);
		if (!subscription) {
			return 0;
		}

		const chat = subscription.source.chats === '*' ? '*' : subscription.source.chats[0];
		this.removeFromIndex(subscription, chat);
		this.subscriptionsById.delete(id);
		this.subscriptionIdsByKey.delete(
			subscriptionKey(
				subscription.namespace,
				subscription.subscriber,
				subscription.source.boundary,
				chat
			)
		);
		return 1;
	}

	private addToIndex(subscription: ProxySubscription, chat: ProxyChat) {
		const index = chat === '*' ? this.wildcardIndex : this.exactIndex;
		const key = sourceKey(
			subscription.namespace,
			subscription.source.boundary,
			chat
		);
		const existing = index.get(key) || new Set<string>();
		existing.add(subscription.id);
		index.set(key, existing);
	}

	private removeFromIndex(subscription: ProxySubscription, chat: ProxyChat) {
		const index = chat === '*' ? this.wildcardIndex : this.exactIndex;
		const key = sourceKey(
			subscription.namespace,
			subscription.source.boundary,
			chat
		);
		const existing = index.get(key);
		if (!existing) {
			return;
		}

		existing.delete(subscription.id);
		if (!existing.size) {
			index.delete(key);
		}
	}

	private refreshByBoundary(boundary: string, namespace: string, now: number) {
		this.getAllSubscriptions()
			.filter(
				subscription =>
					subscription.source.boundary === boundary &&
					subscription.namespace === namespace
			)
			.forEach(subscription => this.refreshStatus(subscription, now));
	}

	private refreshStatus(subscription: ProxySubscription, now: number) {
		subscription.status = this.getStatus(
			subscription.namespace,
			subscription.source.boundary,
			subscription.subscriber
		);
		subscription.updatedAt = now;
	}

	private getStatus(
		namespace: string,
		boundary: string,
		subscriber: string
	): ProxySubscriptionStatus {
		if (!this.onlineSubscribers.has(`${namespace}:${subscriber}`)) {
			return 'pending_subscriber';
		}

		if (!this.onlineBoundaries.has(`${namespace}:${boundary}`)) {
			return 'pending_boundary';
		}

		return 'active';
	}

	private getIndexIds(index: ProxyIndex, key: string) {
		return Array.from(index.get(key) || []);
	}

}

export const proxyRegistry = new ProxyRegistry();

export const createProxy = (
	requestedBy: string,
	payload: ProxyRequestPayload,
	namespace?: string
) => proxyRegistry.createProxy({ requestedBy, payload, namespace });

export const revokeProxy = (payload: ProxyRevokePayload, namespace?: string) =>
	proxyRegistry.revokeProxy({ payload, namespace });

export const markBoundaryProxyOnline = (boundary: string, namespace?: string) =>
	proxyRegistry.markBoundaryConnected(boundary, namespace);

export const markBoundaryProxyOffline = (boundary: string, namespace?: string) =>
	proxyRegistry.markBoundaryDisconnected(boundary, namespace);

export const markSubscriberProxyOnline = (subscriber: string, namespace?: string) =>
	proxyRegistry.markSubscriberConnected(subscriber, namespace);

export const markSubscriberProxyOffline = (
	subscriber: string,
	namespace?: string
) => proxyRegistry.markSubscriberDisconnected(subscriber, namespace);

export const expirePendingProxySubscribers = () =>
	proxyRegistry.expirePendingSubscribers();

export const getAllProxies = (namespace?: string) => {
	expirePendingProxySubscribers();
	return proxyRegistry
		.getAllSubscriptions()
		.filter(
			subscription =>
				!namespace ||
				subscription.namespace === normalizeNamespace(namespace)
		);
};

export const useProxy = (message: MessageReceivedByGateway) => {
	expirePendingProxySubscribers();

	// If message was sent to a group, capture the group id instead of the author id.
	const messageSource = message.groupName ? message.to : message.from;
	const subscriptions = proxyRegistry.getSubscriptionsForMessage(
		message.boundaryName,
		messageSource,
		message.namespace
	);

	if (!subscriptions.length) {
		return;
	}

	subscriptions.forEach(subscription => {
		const destinationEntity =
			getHandlerEntityByName(subscription.subscriber, subscription.namespace) ||
			getBoundaryEntityByName(subscription.subscriber, subscription.namespace) ||
			getEntityByName(subscription.subscriber, subscription.namespace)?.entity;

		notifyPanelProxySubscribers({
			destinations: [subscription.subscriber],
			message,
			source:
				subscription.source.chats === '*'
					? `${subscription.source.boundary}/*`
					: `${subscription.source.boundary}/${subscription.source.chats[0]}`,
		});

		if (!destinationEntity) {
			return;
		}

		destinationEntity.socket.emit('proxied_message', message);
	});
};
