import { getAllBoundaries, getAllHandlers } from 'src/Events/Handling/Getters';
import { getAllProxies } from 'src/Proxies';

const startedAt = Date.now();

export const getGatewayAdminSnapshot = (namespace?: string) => {
	const boundaries = getAllBoundaries(false, namespace);
	const handlers = getAllHandlers(false, namespace);
	const proxies = getAllProxies(namespace);

	return {
		status: {
			ready: true,
			startedAt,
			uptimeMs: Date.now() - startedAt,
			process: {
				pid: process.pid,
				nodeVersion: process.version,
				platform: process.platform,
				memoryUsage: process.memoryUsage(),
			},
			counts: {
				boundaries: boundaries.length,
				handlers: handlers.length,
				proxies: Object.keys(proxies).length,
			},
		},
		boundaries,
		handlers,
		proxies,
		resources: [
			'gateway_status',
			'gateway_entities',
			'gateway_boundaries',
			'gateway_handlers',
			'gateway_proxies',
			'gateway_resources',
			'gateway_snapshot',
		],
	};
};
