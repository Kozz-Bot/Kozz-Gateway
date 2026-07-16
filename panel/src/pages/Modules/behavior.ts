import { useEffect, useMemo, useRef, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { formatJson } from '@/lib/json';

type ModuleRecord = {
	name: string;
	handler?: {
		id?: string;
		methods?: string[];
		role?: string;
		listeners?: unknown[];
	};
};

type TimelineEntry = {
	id: string;
	event: string;
	receivedAt: number;
	payload: Record<string, unknown>;
};

const getPayload = (payload: unknown) =>
	typeof payload === 'object' && payload !== null
		? (payload as Record<string, unknown>)
		: {};

const getResponseBody = (entry: TimelineEntry) => {
	const payload = getPayload(entry.payload.payload);
	const body = payload.body;
	const emote = payload.emote;
	const media = getPayload(payload.media);
	const mimeType = media.mimeType;

	if (typeof body === 'string' && body) {
		return body;
	}
	if (typeof emote === 'string' && emote) {
		return `React: ${emote}`;
	}
	if (typeof mimeType === 'string' && mimeType) {
		return `Media: ${mimeType}`;
	}
	return entry.event;
};

const getResponseMeta = (entry: TimelineEntry) => {
	const payload = getPayload(entry.payload.payload);
	const parts = [
		entry.event,
		typeof payload.chatId === 'string' ? payload.chatId : '',
		typeof payload.quoteId === 'string' ? `quote ${payload.quoteId}` : '',
	].filter(Boolean);
	return parts.join(' · ');
};

export const useModulesBehavior = ({ model }: { model: AppModel }) => {
	const [modules, setModules] = useState<ModuleRecord[]>([]);
	const [moduleName, setModuleName] = useState('');
	const [commandText, setCommandText] = useState('');
	const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const [status, setStatus] = useState('');
	const sessionIdsRef = useRef<Set<string>>(new Set());
	const createTimelineId = (prefix: string) => `${prefix}:${crypto.randomUUID()}`;

	useEffect(() => {
		model.socket.askGateway('all_modules').then(response => {
			const nextModules = (response.response as ModuleRecord[]) || [];
			setModules(nextModules);
			setModuleName(current => current || nextModules[0]?.name || '');
		});
	}, [model.socket]);

	useEffect(() => {
		const unsubscribeDispatched = model.socket.subscribeEvent(
			'panel_module_command_dispatched',
			payload => {
				const data = getPayload(payload);
				const command = getPayload(data.command);
				const boundaryId = String(command.boundaryId || '');
				if (!boundaryId) {
					return;
				}
				sessionIdsRef.current.add(boundaryId);
				setTimeline(current => [
					{
						event: 'command',
						id: createTimelineId('command'),
						payload: data,
						receivedAt: Date.now(),
					},
					...current,
				]);
				setStatus('Command dispatched');
			}
		);
		const unsubscribeResponse = model.socket.subscribeEvent(
			'panel_module_response',
			payload => {
				const data = getPayload(payload);
				const responsePayload = getPayload(data.payload);
				const boundaryId = String(responsePayload.boundaryId || '');
				if (!sessionIdsRef.current.has(boundaryId)) {
					return;
				}
				setTimeline(current => [
					{
						event: String(data.event || 'response'),
						id: createTimelineId(String(data.event || 'response')),
						payload: data,
						receivedAt:
							typeof data.receivedAt === 'number' ? data.receivedAt : Date.now(),
					},
					...current,
				]);
				setStatus('Response received');
			}
		);
		const unsubscribeError = model.socket.subscribeEvent(
			'panel_module_error',
			payload => {
				const data = getPayload(payload);
				setTimeline(current => [
					{
						event: 'error',
						id: createTimelineId('error'),
						payload: data,
						receivedAt: Date.now(),
					},
					...current,
				]);
				setStatus('Command failed');
			}
		);

		return () => {
			unsubscribeDispatched();
			unsubscribeResponse();
			unsubscribeError();
		};
	}, [model.socket]);

	const selectedModule = useMemo(
		() => modules.find(module => module.name === moduleName),
		[moduleName, modules]
	);

	const methods = selectedModule?.handler?.methods || [];

	const sendCommand = () => {
		const trimmed = commandText.trim();
		if (!moduleName || !trimmed) {
			return;
		}

		model.socket.sendModuleCommand({
			commandText: trimmed,
			moduleName,
		});
		setStatus('Waiting for response');
	};

	const clearTimeline = () => {
		setTimeline([]);
		setExpandedIds(new Set());
		sessionIdsRef.current.clear();
		setStatus('');
	};

	return {
		canSend: Boolean(moduleName && commandText.trim()),
		clearTimeline,
		commandText,
		methods,
		moduleName,
		modules: modules.map(module => ({
			label: module.name,
			value: module.name,
		})),
		selectedModuleText: formatJson(selectedModule || {}),
		sendCommand,
		setCommandText,
		setModuleName,
		status,
		timeline: timeline.map(entry => ({
			...entry,
			body: getResponseBody(entry),
			expanded: expandedIds.has(entry.id),
			meta: getResponseMeta(entry),
			payloadText: formatJson(entry.payload),
			time: new Date(entry.receivedAt).toLocaleTimeString(),
		})),
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
		useMethod: (method: string) => setCommandText(method),
	};
};
