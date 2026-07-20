import { describe, expect, it } from 'vitest';
import { ProxyRegistry } from '.';

const source = (boundary = 'wa', chats: '*' | string[] = '*') => ({
	boundary,
	chats,
});

describe('ProxyRegistry', () => {
	it('creates a wildcard proxy for the requester by default', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		const subscriptions = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});

		expect(subscriptions).toHaveLength(1);
		expect(subscriptions[0]).toMatchObject({
			requestedBy: 'module-a',
			subscriber: 'module-a',
			source: source(),
			status: 'active',
		});
	});

	it('creates one subscription per chat when the source contains many chats', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		const subscriptions = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source('wa', ['chat-1', 'chat-2', 'chat-1']),
			},
			now: 2,
		});

		expect(subscriptions.map(subscription => subscription.source)).toEqual([
			source('wa', ['chat-1']),
			source('wa', ['chat-2']),
		]);
	});

	it('supports creating a proxy for another subscriber', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-b', 1);

		const [subscription] = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
				subscriber: 'module-b',
			},
			now: 2,
		});

		expect(subscription.requestedBy).toBe('module-a');
		expect(subscription.subscriber).toBe('module-b');
	});

	it('upserts the same subscriber, boundary and chat instead of duplicating it', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		const [first] = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source('wa', ['chat-1']),
			},
			now: 2,
		});
		const [second] = registry.createProxy({
			requestedBy: 'module-b',
			payload: {
				source: source('wa', ['chat-1']),
				subscriber: 'module-a',
			},
			now: 3,
		});

		expect(first.id).toBe(second.id);
		expect(registry.getAllSubscriptions()).toHaveLength(1);
		expect(second.requestedBy).toBe('module-b');
		expect(second.updatedAt).toBe(3);
	});

	it('deduplicates wildcard and exact matches for the same subscriber', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});
		registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source('wa', ['chat-1']),
			},
			now: 3,
		});

		expect(registry.getSubscriptionsForMessage('wa', 'chat-1')).toHaveLength(1);
	});

	it('isolates subscriptions by namespace', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 'tenant-a', 1);
		registry.markBoundaryConnected('wa', 'tenant-b', 1);
		registry.markSubscriberConnected('module-a', 'tenant-a', 1);
		registry.markSubscriberConnected('module-a', 'tenant-b', 1);

		registry.createProxy({
			requestedBy: 'module-a',
			namespace: 'tenant-a',
			payload: {
				source: source('wa', ['chat-1']),
			},
			now: 2,
		});
		registry.createProxy({
			requestedBy: 'module-a',
			namespace: 'tenant-b',
			payload: {
				source: source('wa', ['chat-1']),
			},
			now: 2,
		});

		expect(registry.getSubscriptionsForMessage('wa', 'chat-1', 'tenant-a')).toHaveLength(1);
		expect(registry.getSubscriptionsForMessage('wa', 'chat-1', 'tenant-b')).toHaveLength(1);
		expect(registry.getSubscriptionsForMessage('wa', 'chat-1')).toHaveLength(0);
	});

	it('keeps boundary subscriptions pending while the boundary is offline', () => {
		const registry = new ProxyRegistry();
		registry.markSubscriberConnected('module-a', 1);

		const [subscription] = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});

		expect(subscription.status).toBe('pending_boundary');
		expect(registry.getSubscriptionsForMessage('wa', 'chat-1')).toHaveLength(0);

		registry.markBoundaryConnected('wa', 3);

		expect(subscription.status).toBe('active');
		expect(registry.getSubscriptionsForMessage('wa', 'chat-1')).toHaveLength(1);
	});

	it('keeps subscriber subscriptions pending until the grace period expires', () => {
		const registry = new ProxyRegistry(100);
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		const [subscription] = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});

		registry.markSubscriberDisconnected('module-a', 10);

		expect(subscription.status).toBe('pending_subscriber');
		expect(subscription.expiresAt).toBe(110);
		expect(registry.expirePendingSubscribers(109)).toBe(0);

		registry.markSubscriberConnected('module-a', 110);

		expect(subscription.status).toBe('active');
		expect(subscription.expiresAt).toBeUndefined();
	});

	it('expires pending subscriber subscriptions after the grace period', () => {
		const registry = new ProxyRegistry(100);
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});

		registry.markSubscriberDisconnected('module-a', 10);

		expect(registry.expirePendingSubscribers(110)).toBe(1);
		expect(registry.getAllSubscriptions()).toHaveLength(0);
	});

	it('revokes subscriptions by id and by filter', () => {
		const registry = new ProxyRegistry();
		registry.markBoundaryConnected('wa', 1);
		registry.markSubscriberConnected('module-a', 1);

		const [wildcard] = registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source(),
			},
			now: 2,
		});
		registry.createProxy({
			requestedBy: 'module-a',
			payload: {
				source: source('wa', ['chat-1', 'chat-2']),
			},
			now: 3,
		});

		expect(registry.revokeProxy({ payload: { subscriptionId: wildcard.id } })).toBe(1);
		expect(
			registry.revokeProxy({
				payload: {
					subscriber: 'module-a',
					source: source('wa', ['chat-1']),
				},
			})
		).toBe(1);
		expect(registry.getAllSubscriptions()).toHaveLength(1);
	});
});
