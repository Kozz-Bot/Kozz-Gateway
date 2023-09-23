import { BoundaryInstance, Destination, MessageReceived, Source } from 'kozz-types';
import { getBoundaryByName } from 'src/Boundaries';
import { getHandler, getHandlerByName } from 'src/Handlers';

type ProxyMap = {
	[key: Source]: {
		keepAlive: boolean;
		destination: Destination;
	}[];
};

const getDestination = (destinationName: Destination) => {
	return getBoundaryByName(destinationName) || getHandlerByName(destinationName);
};

const proxyMap: ProxyMap = {};

export const upsertProxy = (
	source: Source,
	destination: Destination,
	keepAlive?: boolean
) => {
	const alreadyHasProxy = proxyMap[source]?.length > 0;
	if (!alreadyHasProxy) {
		proxyMap[source] = [];
	}

	const alreadyHasDestination =
		proxyMap[source].filter(proxy => proxy.destination === destination).length > 0;

	//Proxy is already there, no need to insert it again.
	if (alreadyHasDestination) return;

	proxyMap[source].push({
		destination,
		keepAlive: keepAlive ?? false,
	});
};

export const getProxy = (source: Source) => {
	return proxyMap[source];
};

const disconnectedAllProxies = (origin: string, disconnecting?: boolean) => {
	Object.entries(proxyMap).forEach(([proxySource, proxy]) => {
		if (disconnecting && proxySource.startsWith(origin)) {
			proxyMap[proxySource as keyof ProxyMap] = proxy.filter(
				proxy => !!proxy.keepAlive
			);
		} else if (proxySource.startsWith(origin)) {
			delete proxyMap[proxySource as keyof ProxyMap];
		}
	});
};

const disconnectProxyByOrigin = (origin: string, disconnecting?: boolean) => {
	// I know this is indexable because i'm using a if inside `removeProxy`
	let proxyEntry = proxyMap[origin as keyof ProxyMap];

	if (disconnecting) {
		proxyEntry = proxyEntry.filter(proxy => !!proxy.keepAlive);
	} else {
		delete proxyMap[origin as keyof ProxyMap];
	}
};

export const removeProxy = (source: Source, disconnecting?: boolean) => {
	// if source is `${boundaryName}/*`, delete all proxies from that boundary
	const [boundary, chat] = source.split('/');
	if (chat === '*') {
		disconnectedAllProxies(boundary, disconnecting);
	} else if (proxyMap[source]) {
		disconnectProxyByOrigin(boundary, disconnecting);
	}
};

export const useProxy = (message: MessageReceived) => {
	// If message was sent to a group, we want to capture the group id, not the author id
	const messageSource = message.groupName ? message.to : message.from;
	const proxies = Object.entries(proxyMap).filter(
		([source, _]) =>
			source === `${message.boundaryName}/*` ||
			source === `${message.boundaryName}/${messageSource}`
	);

	if (!proxies.length) return;

	proxies.forEach(entry => {
		const [_, destinations] = entry;
		destinations.forEach(proxy => {
			const destinationEntity = getDestination(proxy.destination);
			if (!destinationEntity) return;
			destinationEntity.socket.emit('proxied_message', message);
		});
	});
};
