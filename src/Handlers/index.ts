import {
	CommandAlias,
	type HandlerInstance,
	HandlerIntroduction,
	Introduction,
	ForwardEventPayload,
} from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createHandler } from './Handler';
import {
	getAllHandlerEntities,
	getHandlerEntityByName,
	getHandlerEntityBySocketId,
	normalizeNamespace,
	registerHandlerEntity,
	removeEntityBySocketId,
} from 'src/Entities';

let handlers: {
	[key: string]: HandlerInstance;
} = {};

export type ResolvedCommandAlias = {
	alias: CommandAlias;
	owner: HandlerInstance;
};

const getAliasTargetModule = (alias: CommandAlias, owner: HandlerInstance) =>
	alias.target.module || owner.name;

const getAllAliases = (namespace?: string): ResolvedCommandAlias[] =>
	Object.values(handlers)
		.filter(
			handler =>
				!namespace ||
				normalizeNamespace(handler.namespace) === normalizeNamespace(namespace)
		)
		.flatMap(handler =>
		(handler.aliases || []).map(alias => ({
			alias,
			owner: handler,
		}))
	);

const isAliasConflictingWithHandler = (alias: CommandAlias, namespace?: string) =>
	Object.values(handlers).some(
		handler =>
			handler.name === alias.name &&
			normalizeNamespace(handler.namespace) === normalizeNamespace(namespace)
	);

const isAliasConflictingWithAlias = (
	alias: CommandAlias,
	ownerName: string,
	namespace?: string
) =>
	getAllAliases(namespace).some(
		registeredAlias =>
			registeredAlias.alias.name === alias.name &&
			registeredAlias.owner.name !== ownerName
	);

const getValidAliases = (
	introduction: HandlerIntroduction
): CommandAlias[] => {
	const aliasNames = new Set<string>();
	const namespace = normalizeNamespace(introduction.namespace);

	return (introduction.aliases || []).filter(alias => {
		if (aliasNames.has(alias.name)) {
			console.warn(
				`Ignoring alias ${alias.name} from handler ${introduction.name}: alias already declared by this handler`
			);
			return false;
		}

		if (isAliasConflictingWithHandler(alias, namespace)) {
			console.warn(
				`Ignoring alias ${alias.name} from handler ${introduction.name}: a handler with that name already exists`
			);
			return false;
		}

		if (isAliasConflictingWithAlias(alias, introduction.name, namespace)) {
			console.warn(
				`Ignoring alias ${alias.name} from handler ${introduction.name}: alias already registered by another handler`
			);
			return false;
		}

		aliasNames.add(alias.name);
		return true;
	});
};

export const addHandler = (socket: Socket, introduction: HandlerIntroduction) => {
	const id = socket.id;
	const namespace = normalizeNamespace(introduction.namespace);
	const oldHandlerConnection = getHandlerByName(introduction.name, namespace);
	if (oldHandlerConnection) {
		console.warn(`Reconnecting Handler with name ${introduction.name}`);
		delete handlers[oldHandlerConnection.id];
	}

	const aliases = getValidAliases({ ...introduction, namespace });
	const handler = createHandler({ id, socket, ...introduction, namespace, aliases });
	handlers[id] = handler;
	registerHandlerEntity(handler);
};

export const getCommandAlias = (
	name: string,
	namespace?: string
): ResolvedCommandAlias | undefined => {
	const handler = getHandlerByName(name, namespace);
	if (handler) {
		return;
	}

	return getAllAliases(namespace).find(
		registeredAlias => registeredAlias.alias.name === name
	);
};

export const getCommandAliasTargetModule = ({
	alias,
	owner,
}: ResolvedCommandAlias) => {
	return getAliasTargetModule(alias, owner);
};

export const getHandlerByName = (
	name: string,
	namespace?: string
): HandlerInstance | undefined => {
	return (
		getHandlerEntityByName(name, namespace) ||
		Object.values(handlers).find(
			handler =>
				handler.name === name &&
				normalizeNamespace(handler.namespace) === normalizeNamespace(namespace)
		)
	);
};

export const getHandler = (id: string): HandlerInstance | undefined => {
	return getHandlerEntityBySocketId(id) || getHandlerEntityByName(id) || handlers[id];
};

export const getAllHandlerInstancess = (namespace?: string): HandlerInstance[] =>
	getAllHandlerEntities().filter(
		handler =>
			!namespace || normalizeNamespace(handler.namespace) === normalizeNamespace(namespace)
	);

export const isHandler = (
	introduction: Introduction
): introduction is HandlerIntroduction => {
	return introduction.role === 'handler';
};

export const addListenerToHandler = (
	destinationId: string,
	eventName: string,
	sourceId: string,
	namespace?: string
) => {
	const handler = getHandler(destinationId) || getHandlerByName(destinationId, namespace);

	if (!handler) {
		return console.warn(
			`Tried to register listener for event ${eventName} in non-existent handler ${destinationId}`
		);
	}

	console.log(
		`Handler ${handler.name} is requesting to listen to events ${eventName} from ${sourceId}`
	);

	//If is already listening listening to the event, do nothing;
	if (handler.listeners.find(ev => ev.eventName === eventName)) {
		return;
	}

	handler.listeners.push({
		id: new Date().getTime().toString(),
		eventName,
		source: sourceId,
	});
};

export const removeListenerFromHandler = (id: string, eventName: string) => {
	const handler = getHandler(id);

	if (!handler) {
		return console.warn(
			`Tried to remove listener for event ${eventName} from non-existent handler ${id}`
		);
	}

	handler.listeners = handler.listeners.filter(
		listener => listener.eventName !== eventName
	);
};

export const logHandler = (boundary: HandlerInstance) => {
	console.log(`[SERVER]: Handler with name ${boundary.name} connected`);
};

export const removeHandler = (handlerName: string) => {
	const handler = handlers[handlerName];
	if (!handler) {
		console.warn(`Tried to disconnect unknown handler with id ${handlerName}`);
		return;
	}

	console.log(`Disconnecting handler with id ${handler.name}`);
	delete handlers[handlerName];
	removeEntityBySocketId(handlerName);
};

export default handlers;
