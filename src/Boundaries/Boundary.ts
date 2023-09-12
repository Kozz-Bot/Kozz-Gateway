import { BoundaryIntroduction, type BoundaryInstance } from 'kozz-types';
import { Socket } from 'socket.io';

type CreateBoundaryInfo = BoundaryIntroduction & {
	id: string;
	socket: Socket;
};

export const createBoundary = (info: CreateBoundaryInfo): BoundaryInstance => {
	return {
		...info,
		listeners: [],
	};
};
