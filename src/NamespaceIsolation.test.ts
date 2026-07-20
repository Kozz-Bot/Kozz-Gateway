import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addBoundary, removeBoundary } from './Boundaries';
import { getAllBoundaries } from './Events/Handling/Getters';
import { ask_resource } from './Events/Handling/askResource';
import {
	addHandler,
	getCommandAlias,
	getHandlerByName,
	removeHandler,
} from './Handlers';

type FakeSocket = {
	id: string;
	emitted: { event: string; payload: any }[];
	emit: (event: string, payload: any) => boolean;
	on: () => void;
};

const createdEntities: { id: string; role: 'boundary' | 'handler' }[] = [];

const createSocket = (
	id: string,
	role: 'boundary' | 'handler'
): FakeSocket => {
	const socket: FakeSocket = {
		id,
		emitted: [],
		emit: (event, payload) => {
			socket.emitted.push({ event, payload });
			return true;
		},
		on: () => undefined,
	};

	createdEntities.push({ id, role });
	return socket;
};

const testId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => undefined);
	vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
	createdEntities.forEach(({ id, role }) => {
		if (role === 'boundary') {
			removeBoundary(id);
		}
		if (role === 'handler') {
			removeHandler(id);
		}
	});
	createdEntities.length = 0;
	vi.restoreAllMocks();
});

describe('namespace isolation', () => {
	it('resolves handlers with the same name independently by namespace', () => {
		const id = testId();
		const tenantASocket = createSocket(`handler-a-${id}`, 'handler');
		const tenantBSocket = createSocket(`handler-b-${id}`, 'handler');

		addHandler(tenantASocket as any, {
			name: `shared-${id}`,
			namespace: 'tenant-a',
			role: 'handler',
			methods: ['default'],
			signature: 'signature',
		});
		addHandler(tenantBSocket as any, {
			name: `shared-${id}`,
			namespace: 'tenant-b',
			role: 'handler',
			methods: ['default'],
			signature: 'signature',
		});

		expect(getHandlerByName(`shared-${id}`, 'tenant-a')?.id).toBe(
			tenantASocket.id
		);
		expect(getHandlerByName(`shared-${id}`, 'tenant-b')?.id).toBe(
			tenantBSocket.id
		);
	});

	it('allows the same alias in different namespaces without cross-resolution', () => {
		const id = testId();

		addHandler(createSocket(`alias-a-${id}`, 'handler') as any, {
			name: `owner-a-${id}`,
			namespace: 'tenant-a',
			role: 'handler',
			methods: ['default'],
			aliases: [{ name: `same-alias-${id}`, target: { method: 'default' } }],
			signature: 'signature',
		});
		addHandler(createSocket(`alias-b-${id}`, 'handler') as any, {
			name: `owner-b-${id}`,
			namespace: 'tenant-b',
			role: 'handler',
			methods: ['default'],
			aliases: [{ name: `same-alias-${id}`, target: { method: 'default' } }],
			signature: 'signature',
		});

		expect(getCommandAlias(`same-alias-${id}`, 'tenant-a')?.owner.name).toBe(
			`owner-a-${id}`
		);
		expect(getCommandAlias(`same-alias-${id}`, 'tenant-b')?.owner.name).toBe(
			`owner-b-${id}`
		);
	});

	it('filters gateway all_boundaries and all_modules by requester namespace', () => {
		const id = testId();
		const requesterSocket = createSocket(`requester-${id}`, 'handler');

		addBoundary(createSocket(`boundary-a-${id}`, 'boundary') as any, {
			name: `wa-${id}`,
			namespace: 'tenant-a',
			role: 'boundary',
			platform: 'Baileys',
			OS: 'linux',
			signature: 'signature',
		});
		addBoundary(createSocket(`boundary-b-${id}`, 'boundary') as any, {
			name: `wa-${id}`,
			namespace: 'tenant-b',
			role: 'boundary',
			platform: 'Baileys',
			OS: 'linux',
			signature: 'signature',
		});
		addHandler(requesterSocket as any, {
			name: `requester-${id}`,
			namespace: 'tenant-a',
			role: 'handler',
			methods: ['default'],
			signature: 'signature',
		});
		addHandler(createSocket(`module-b-${id}`, 'handler') as any, {
			name: `module-${id}`,
			namespace: 'tenant-b',
			role: 'handler',
			methods: ['default'],
			signature: 'signature',
		});

		ask_resource(requesterSocket as any)({
			requester: { id: `requester-${id}`, type: 'Handler' },
			responder: { id: 'Gateway', type: 'Gateway' },
			request: {
				id: `all-boundaries/${Date.now()}`,
				resource: 'all_boundaries',
				data: {},
			},
			timestamp: Date.now(),
		});
		ask_resource(requesterSocket as any)({
			requester: { id: `requester-${id}`, type: 'Handler' },
			responder: { id: 'Gateway', type: 'Gateway' },
			request: {
				id: `all-modules/${Date.now()}`,
				resource: 'all_modules',
				data: {},
			},
			timestamp: Date.now(),
		});

		const boundaryResponse = requesterSocket.emitted.find(event =>
			event.event.startsWith('reply_resource/all-boundaries/')
		)?.payload.response;
		const moduleResponse = requesterSocket.emitted.find(event =>
			event.event.startsWith('reply_resource/all-modules/')
		)?.payload.response;

		expect(boundaryResponse).toHaveLength(1);
		expect(boundaryResponse[0].boundary.name).toBe(`wa-${id}`);
		expect(moduleResponse.map((module: any) => module.name)).toContain(
			`requester-${id}`
		);
		expect(moduleResponse.map((module: any) => module.name)).not.toContain(
			`module-${id}`
		);
		expect(getAllBoundaries(false, 'tenant-b').map(item => item.boundary.name)).toEqual([
			`wa-${id}`,
		]);
	});
});
