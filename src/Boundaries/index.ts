import {
	BoundaryInstance,
	BoundaryIntroduction,
	Introduction,
} from 'kozz-types/dist';
import { Socket } from 'socket.io';
import { createBoundary } from './Boundary';
import { normalizeString } from 'src/Util';

let boundaries: {
	[key: string]: BoundaryInstance;
} = {};

export const addBoundary = (socket: Socket, introduction: BoundaryIntroduction) => {
	const id = socket.id;
	if (getBoundary(id)) {
		console.warn(`Reconecting boundary with name ${introduction.name}`);
	}
	boundaries[id] = createBoundary({ id, socket, ...introduction });
};

export const getBoundary = (id: string): BoundaryInstance | undefined =>
	boundaries[normalizeString(id)];

export const getBoundaryByName = (name: string) =>
	getAllBoundaryInstances().find(boundary => boundary.name === name);

export const getAllBoundaryInstances = (): BoundaryInstance[] =>
	Object.values(boundaries);

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
	sourceId: string
) => {
	const boundary = getBoundary(destinationId);

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
};

export default boundaries;
