import { Introduction } from 'kozz-types';
import { Socket } from 'socket.io';
import { isBoundary, removeBoundary } from 'src/Boundaries';
import { isHandler, removeHandler } from 'src/Handlers';
import { removePanelSessions } from 'src/PanelSessions';
import { removePanelProxySubscriptions } from 'src/PanelProxySubscriptions';
import {
	markBoundaryProxyOffline,
	markSubscriberProxyOffline,
} from 'src/Proxies';
import { normalizeNamespace } from 'src/Entities';

export const addDisconnectHandlers = (
	socket: Socket,
	introduction: Introduction
) => {
	socket.on('disconnecting', () => {
		removePanelSessions(socket);
		removePanelProxySubscriptions(socket);
		if (isBoundary(introduction)) {
			markBoundaryProxyOffline(
				introduction.name,
				normalizeNamespace(introduction.namespace)
			);
			removeBoundary(socket.id);
		}
		if (isHandler(introduction)) {
			markSubscriberProxyOffline(
				introduction.name,
				normalizeNamespace(introduction.namespace)
			);
			removeHandler(socket.id);
		}
	});
};
