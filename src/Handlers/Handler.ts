import { type HandlerIntroduction, type HandlerInstance } from 'kozz-types';
import { Socket } from 'socket.io';

type CreateBoundaryInfo = HandlerIntroduction & {
	id: string;
	socket: Socket;
};

export const createHandler = (info: CreateBoundaryInfo): HandlerInstance => {
	return {
		...info,
		listeners: [],
	};
};
