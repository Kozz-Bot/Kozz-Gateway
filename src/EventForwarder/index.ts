import { EventListener } from 'kozz-types';
import { getAllBoundaryInstances } from 'src/Boundaries';
import { forward_event } from 'src/Events/Handling/forwardEvent';
import { getAllHandlerInstancess } from 'src/Handlers';

const getValidListeners =
	(eventName: string, sourceId: string) =>
	({ listeners }: { listeners: EventListener[] }) => {
		
		return listeners.filter(
			listener => listener.eventName === eventName 
			&& (listener.source == '*'
				|| listener.source == sourceId
			)
		).length;
	};

export const forwardEventToListeners = (
	eventName: string,
	payload: { boundaryName: string }
) => {
	// eu nao testei pra bound
	const allBoundariesListening = getAllBoundaryInstances().filter(
		getValidListeners(eventName, payload.boundaryName)
	);

	const allHandlersListening = getAllHandlerInstancess().filter(
		getValidListeners(eventName, payload.boundaryName)
	);
	
	[...allBoundariesListening, ...allHandlersListening].forEach(entity => {
		return entity.socket?.emit('forwarded_event', {
			eventName,
			payload,
		});
		}
	);
};
