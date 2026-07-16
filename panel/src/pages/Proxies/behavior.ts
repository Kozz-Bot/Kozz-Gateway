import { useEffect, useMemo, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { formatJson } from '@/lib/json';

type ProxyDestination = {
	destination?: string;
	keepAlive?: boolean;
};

type ProxyMap = Record<string, ProxyDestination[]>;

type ProxyEvent = {
	id: string;
	source: string;
	destinations: string[];
	message: Record<string, unknown>;
	receivedAt: number;
	payload: Record<string, unknown>;
};

const getPayload = (payload: unknown) =>
	typeof payload === 'object' && payload !== null
		? (payload as Record<string, unknown>)
		: {};

const getMessageFocus = (message: Record<string, unknown>) => {
	const body = message.body;
	const from = message.from;
	const to = message.to;
	const type = message.messageType;

	if (typeof body === 'string' && body) {
		return body;
	}

	return [type, from, to].filter(value => typeof value === 'string' && value).join(' · ');
};

export const useProxiesBehavior = ({ model }: { model: AppModel }) => {
	const [proxyMap, setProxyMap] = useState<ProxyMap>({});
	const [selectedSource, setSelectedSource] = useState('');
	const [events, setEvents] = useState<ProxyEvent[]>([]);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const [status, setStatus] = useState('');

	useEffect(() => {
		model.socket.askGateway('gateway_proxies').then(response => {
			const nextProxyMap = (response.response as ProxyMap) || {};
			const sources = Object.keys(nextProxyMap);
			setProxyMap(nextProxyMap);
			setSelectedSource(current => current || sources[0] || '');
		});
	}, [model.socket]);

	useEffect(() => {
		if (!selectedSource) {
			return;
		}

		model.socket.subscribeProxy(selectedSource);
		setStatus(`Listening to ${selectedSource}`);
		return () => {
			model.socket.unsubscribeProxy(selectedSource);
		};
	}, [model.socket, selectedSource]);

	useEffect(() => {
		const unsubscribeEvent = model.socket.subscribeEvent('panel_proxy_event', payload => {
			const data = getPayload(payload);
			const source = String(data.source || '');
			if (source !== selectedSource) {
				return;
			}

			setEvents(current => [
				{
					destinations: Array.isArray(data.destinations)
						? data.destinations.map(String)
						: [],
					id: crypto.randomUUID(),
					message: getPayload(data.message),
					payload: data,
					receivedAt:
						typeof data.receivedAt === 'number' ? data.receivedAt : Date.now(),
					source,
				},
				...current,
			]);
			setStatus('Proxy event received');
		});
		const unsubscribeSubscribed = model.socket.subscribeEvent(
			'panel_proxy_subscribed',
			payload => {
				const data = getPayload(payload);
				if (data.source === selectedSource) {
					setStatus(`Listening to ${selectedSource}`);
				}
			}
		);

		return () => {
			unsubscribeEvent();
			unsubscribeSubscribed();
		};
	}, [model.socket, selectedSource]);

	const proxyOptions = useMemo(
		() =>
			Object.entries(proxyMap).map(([source, destinations]) => ({
				destinationLabel: destinations
					.map(destination => destination.destination)
					.filter(Boolean)
					.join(', '),
				label: source,
				value: source,
			})),
		[proxyMap]
	);

	const clearEvents = () => {
		setEvents([]);
		setExpandedIds(new Set());
		setStatus(selectedSource ? `Listening to ${selectedSource}` : '');
	};

	return {
		clearEvents,
		events: events.map(event => ({
			...event,
			expanded: expandedIds.has(event.id),
			focus: getMessageFocus(event.message),
			meta: [
				event.source,
				event.destinations.length ? `to ${event.destinations.join(', ')}` : '',
				new Date(event.receivedAt).toLocaleTimeString(),
			]
				.filter(Boolean)
				.join(' · '),
			payloadText: formatJson(event.payload),
		})),
		proxyOptions,
		selectedSource,
		selectedSourceText: formatJson(proxyMap[selectedSource] || []),
		setSelectedSource,
		status,
		togglePayload: (id: string) =>
			setExpandedIds(current => {
				const next = new Set(current);
				if (next.has(id)) {
					next.delete(id);
				} else {
					next.add(id);
				}
				return next;
			}),
	};
};
