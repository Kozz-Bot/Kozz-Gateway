import {
	BoundaryInstance,
	BoundaryIntroduction,
	Introduction,
} from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createBoundary } from './Boundary';
import { normalizeString } from 'src/Util';
import {
	getAllBoundaryEntities,
	getBoundaryEntityByName,
	getBoundaryEntityBySocketId,
	normalizeNamespace,
	registerBoundaryEntity,
	removeEntityBySocketId,
} from 'src/Entities';

let boundaries: {
	[key: string]: BoundaryInstance;
} = {};

export const addBoundary = (socket: Socket, introduction: BoundaryIntroduction) => {
	const id = socket.id;
	const namespace = normalizeNamespace(introduction.namespace);
	const oldBoundaryConnection = getBoundaryByName(introduction.name, namespace);
	if (oldBoundaryConnection) {
		console.warn(`Reconnecting Boundary with name ${introduction.name}`);
		delete boundaries[oldBoundaryConnection.id];
	}

	const boundary = createBoundary({ id, socket, ...introduction, namespace });
	boundaries[id] = boundary;
	registerBoundaryEntity(boundary);
};

export const getBoundary = (id: string): BoundaryInstance | undefined =>
	getBoundaryEntityBySocketId(normalizeString(id)) || boundaries[normalizeString(id)];

export const getBoundaryByName = (name: string, namespace?: string) =>
	getBoundaryEntityByName(name, namespace) ||
	getAllBoundaryInstances(namespace).find(boundary => boundary.name === name);

export const getAllBoundaryInstances = (namespace?: string): BoundaryInstance[] =>
	getAllBoundaryEntities().filter(
		boundary =>
			!namespace || normalizeNamespace(boundary.namespace) === normalizeNamespace(namespace)
	);

export const isBoundary = (
	introduction: Introduction
): introduction is BoundaryIntroduction => {
	return introduction.role === 'boundary';
};

export const logBoundary = (boundary: BoundaryInstance) => {
	console.log(
		`[SERVER]: Boundary with role ${boundary.role} connected with ID ${boundary.id}`
	);
};

export const addListenerToBoundary = (
	destinationId: string,
	eventName: string,
	sourceId: string,
	namespace?: string
) => {
	const boundary =
		getBoundary(destinationId) || getBoundaryByName(destinationId, namespace);

	if (!boundary) {
		return console.warn(
			`Tried to register listener for event ${eventName} in non-existent boundary ${destinationId}`
		);
	}

	//If is already listening listening to the event, do nothing;
	if (boundary.listeners.find(ev => ev.eventName === eventName)) {
		return;
	}

	boundary.listeners.push({
		id: new Date().getTime().toString(),
		eventName,
		source: sourceId,
	});
};

export const removeListenerFromBoundary = (id: string, eventName: string) => {
	const boundary = getBoundary(id);

	if (!boundary) {
		return console.warn(
			`Tried to remove listener for event ${eventName} from non-existent boundary ${id}`
		);
	}

	boundary.listeners = boundary.listeners.filter(
		listener => listener.eventName !== eventName
	);
};

export const removeBoundary = (boundaryName: string) => {
	console.log(`Disconnecting Boundary with id ${boundaryName}`);
	delete boundaries[boundaryName];
	removeEntityBySocketId(boundaryName);
};

export default boundaries;
