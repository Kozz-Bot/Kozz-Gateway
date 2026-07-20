import { BoundaryInstance, HandlerInstance } from 'kozz-types';

const DEFAULT_NAMESPACE = 'default';

export type GatewayEntity =
	| {
			role: 'Boundary';
			name: string;
			namespace: string;
			socketId: string;
			entity: BoundaryInstance;
	  }
	| {
			role: 'Handler';
			name: string;
			namespace: string;
			socketId: string;
			entity: HandlerInstance;
	  };

const byName = new Map<string, GatewayEntity>();
const bySocketId = new Map<string, GatewayEntity>();

export const normalizeNamespace = (namespace?: string) =>
	namespace?.trim() || DEFAULT_NAMESPACE;

export const entityNameKey = (name: string, namespace?: string) =>
	`${normalizeNamespace(namespace)}:${name}`;

export const registerBoundaryEntity = (entity: BoundaryInstance) => {
	const namespace = normalizeNamespace(entity.namespace);
	const existing = byName.get(entityNameKey(entity.name, namespace));
	if (existing) {
		bySocketId.delete(existing.socketId);
	}

	const gatewayEntity: GatewayEntity = {
		role: 'Boundary',
		name: entity.name,
		namespace,
		socketId: entity.id,
		entity: {
			...entity,
			namespace,
		},
	};

	byName.set(entityNameKey(entity.name, namespace), gatewayEntity);
	bySocketId.set(entity.id, gatewayEntity);
	return gatewayEntity;
};

export const registerHandlerEntity = (entity: HandlerInstance) => {
	const namespace = normalizeNamespace(entity.namespace);
	const existing = byName.get(entityNameKey(entity.name, namespace));
	if (existing) {
		bySocketId.delete(existing.socketId);
	}

	const gatewayEntity: GatewayEntity = {
		role: 'Handler',
		name: entity.name,
		namespace,
		socketId: entity.id,
		entity: {
			...entity,
			namespace,
		},
	};

	byName.set(entityNameKey(entity.name, namespace), gatewayEntity);
	bySocketId.set(entity.id, gatewayEntity);
	return gatewayEntity;
};

export const removeEntityBySocketId = (socketId: string) => {
	const entity = bySocketId.get(socketId);
	if (!entity) {
		return;
	}

	bySocketId.delete(socketId);
	const key = entityNameKey(entity.name, entity.namespace);
	if (byName.get(key)?.socketId === socketId) {
		byName.delete(key);
	}
};

export const getEntityByName = (name: string, namespace?: string) =>
	byName.get(entityNameKey(name, namespace));

export const getEntityBySocketId = (socketId: string) => bySocketId.get(socketId);

export const getBoundaryEntityByName = (name: string, namespace?: string) => {
	const entity = byName.get(entityNameKey(name, namespace));
	return entity?.role === 'Boundary' ? entity.entity : undefined;
};

export const getHandlerEntityByName = (name: string, namespace?: string) => {
	const entity = byName.get(entityNameKey(name, namespace));
	return entity?.role === 'Handler' ? entity.entity : undefined;
};

export const getBoundaryEntityBySocketId = (socketId: string) => {
	const entity = bySocketId.get(socketId);
	return entity?.role === 'Boundary' ? entity.entity : undefined;
};

export const getHandlerEntityBySocketId = (socketId: string) => {
	const entity = bySocketId.get(socketId);
	return entity?.role === 'Handler' ? entity.entity : undefined;
};

export const getAllBoundaryEntities = () =>
	Array.from(byName.values())
		.filter((entity): entity is Extract<GatewayEntity, { role: 'Boundary' }> => entity.role === 'Boundary')
		.map(entity => entity.entity);

export const getAllHandlerEntities = () =>
	Array.from(byName.values())
		.filter((entity): entity is Extract<GatewayEntity, { role: 'Handler' }> => entity.role === 'Handler')
		.map(entity => entity.entity);
