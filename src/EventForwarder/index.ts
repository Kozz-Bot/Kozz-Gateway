import { EventListener } from 'kozz-types';
import { getAllBoundaryInstances } from 'src/Boundaries';
import { getAllHandlerInstancess } from 'src/Handlers';

const getValidListeners =
	(eventName: string, sourceId: string) =>
	({ listeners }: { listeners: EventListener[] }) => {
		return listeners.filter(
			listener => listener.eventName === eventName && listener.source == sourceId
		);
	};

export const forwardEventToListeners = (
	eventName: string,
	payload: { boundaryId: string }
) => {
	const allBoundariesListening = getAllBoundaryInstances().filter(
		getValidListeners(eventName, payload.boundaryId)
	);

	const allHandlersListening = getAllHandlerInstancess().filter(
		getValidListeners(eventName, payload.boundaryId)
	);

	[...allBoundariesListening, ...allHandlersListening].forEach(entity =>
		entity.socket.emit(eventName, payload)
	);
};
