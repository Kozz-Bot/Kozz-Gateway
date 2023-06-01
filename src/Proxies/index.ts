import { BoundaryInstance, Destination, MessageReceived, Source } from 'kozz-types';
import { getBoundary } from 'src/Boundaries';

type ProxyMap = {
	[key: Source]: Destination;
};

const getDestinationBoundaries = (destinationBoundariesId: Destination) => {
	const destinationBoundariesIdAsArray =
		typeof destinationBoundariesId === 'string'
			? [destinationBoundariesId]
			: destinationBoundariesId;

	return destinationBoundariesIdAsArray
		.map(id => getBoundary(id))
		.filter((boundary): boundary is BoundaryInstance => !!boundary);
};

const proxyMap: ProxyMap = {};

export const upsertProxy = (source: Source, destination: Destination) => {
	console.log(`upserting proxy: ${source} -> ${destination}`);

	proxyMap[source] = destination;
};

export const getProxy = (source: Source) => {
	return proxyMap[source];
};

export const removeProxy = (source: Source) => {
	if (source.split('/')[1] === '*') {
		Object.entries(proxyMap).forEach(() => {
			delete proxyMap[source as Source];
		});
	} else if (proxyMap[source]) {
		delete proxyMap[source];
	}
};

export const useProxy = (message: MessageReceived) => {
	const proxy = Object.entries(proxyMap).find(([source, _]) =>
		source.startsWith(message.boundaryId)
	);

	if (!proxy) return;

	const [source, destinationBoundariesId] = proxy;
	const destinationBoundaries = getDestinationBoundaries(destinationBoundariesId);
	const [_, sourceChatID] = source.split('/');
	if (sourceChatID !== '*' && sourceChatID !== message.from) {
		return;
	}

	destinationBoundaries.forEach(boundary => {
		boundary.socket.emit('proxied_message', message);
	});
};
