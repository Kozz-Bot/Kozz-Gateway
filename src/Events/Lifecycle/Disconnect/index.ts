import { Introduction } from 'kozz-types';
import { Socket } from 'socket.io';
import { isBoundary, removeBoundary } from 'src/Boundaries';
import { revoke_proxy } from 'src/Events/Handling/proxyHanlder';
import { isHandler, removeHandler } from 'src/Handlers';

export const addDisconnectHandlers = (
	socket: Socket,
	introduction: Introduction
) => {
	const proxyRevoker = revoke_proxy(socket);

	socket.on('disconnecting', () => {
		if (isBoundary(introduction)) {
			removeBoundary(introduction.name);
			proxyRevoker(
				{
					source: `${introduction.name}/*`,
				},
				true
			);
		}
		if (isHandler(introduction)) {
			removeHandler(introduction.name);
			proxyRevoker(
				{
					source: `${introduction.name}/*`,
				},
				true
			);
		}
	});
};
