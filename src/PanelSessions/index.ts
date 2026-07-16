import { Socket } from 'socket.io';

const sessions: Record<string, Socket> = {};

export const createPanelSession = (socket: Socket) => {
	const id = `panel:${socket.id}`;
	sessions[id] = socket;
	return id;
};

export const getPanelSessionSocket = (id: string | undefined) => {
	if (!id) {
		return undefined;
	}

	return sessions[id];
};

export const removePanelSessions = (socket: Socket) => {
	Object.entries(sessions).forEach(([id, sessionSocket]) => {
		if (sessionSocket.id === socket.id) {
			delete sessions[id];
		}
	});
};
