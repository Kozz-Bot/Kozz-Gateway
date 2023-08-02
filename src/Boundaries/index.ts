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

export const addBoundary = (
	id: string,
	socket: Socket,
	introduction: BoundaryIntroduction
) => {
	if (getBoundary(id)) {
		console.warn(`Reconecting boundary with ID ${id}`);
	}
	boundaries[id] = createBoundary({ id, socket, ...introduction });
};

export const getBoundary = (id: string): BoundaryInstance | undefined =>
	boundaries[normalizeString(id)];

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

export const removeBoundary = (boundaryId: string) => {
	console.log(`Disconnecting Boundary with id ${boundaryId}`);
	delete boundaries[boundaryId];
};

export default boundaries;
