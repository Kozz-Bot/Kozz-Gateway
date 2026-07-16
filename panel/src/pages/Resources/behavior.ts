import { useEffect, useMemo, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { CodeField } from '@/components/CodeField';
import { formatJson, parseJson } from '@/lib/json';

type EntityType = 'Gateway' | 'Boundary' | 'Handler';

type EntityOption = {
	label: string;
	value: string;
};

type GatewaySnapshot = {
	boundaries?: Array<Record<string, unknown>>;
	handlers?: Array<Record<string, unknown>>;
	resources?: string[];
};

const otherResource = '__other__';

const boundaryResources = [
	'contact_profile_pic',
	'group_chat_info',
	'group_admin_list',
	'unread_count',
	'chat_details',
	'contact_info',
	'lid_from_jid',
	'jid_from_lid',
	'chat_order',
	'chat_status',
	'all_groups',
	'all_private_chats',
	'recent_chat_messages',
	'message_count',
];

const handlerResources = ['help'];

const getEntityLabel = (entity: Record<string, unknown>) =>
	String(entity.name || entity.id || 'unknown');

const getEntityValue = (entity: Record<string, unknown>) =>
	String(entity.id || entity.name || '');

const toOptions = (entities: Array<Record<string, unknown>> = []) =>
	entities.map(entity => ({
		label: getEntityLabel(entity),
		value: getEntityValue(entity),
	}));

export const useResourcesBehavior = ({ model }: { model: AppModel }) => {
	const [snapshot, setSnapshot] = useState<GatewaySnapshot>({});
	const [entityType, setEntityType] = useState<EntityType>('Gateway');
	const [entityId, setEntityId] = useState('Gateway');
	const [resourceName, setResourceName] = useState('gateway_status');
	const [customResourceName, setCustomResourceName] = useState('');
	const [paramsText, setParamsText] = useState('{}');
	const [responseText, setResponseText] = useState('{}');

	useEffect(() => {
		model.socket.askGateway('gateway_snapshot').then(response => {
			setSnapshot((response.response as GatewaySnapshot) || {});
		});
	}, [model.socket]);

	const entityOptions = useMemo(() => {
		if (entityType === 'Boundary') {
			return toOptions(snapshot.boundaries);
		}
		if (entityType === 'Handler') {
			return toOptions(snapshot.handlers);
		}
		return [{ label: 'Gateway', value: 'Gateway' }];
	}, [entityType, snapshot.boundaries, snapshot.handlers]);

	useEffect(() => {
		if (entityType === 'Gateway') {
			setEntityId('Gateway');
			return;
		}

		if (!entityId && entityOptions[0]) {
			setEntityId(entityOptions[0].value);
		}
	}, [entityId, entityOptions, entityType]);

	const resourceOptions = useMemo(() => {
		const resources = (() => {
			if (entityType === 'Boundary') {
				return boundaryResources;
			}
			if (entityType === 'Handler') {
				return handlerResources;
			}
			return snapshot.resources || [];
		})();

		return [
			...resources.map(resource => ({ label: resource, value: resource })),
			{ label: 'Other', value: otherResource },
		];
	}, [entityType, snapshot.resources]);

	const selectedResourceName =
		resourceName === otherResource ? customResourceName.trim() : resourceName;
	const parsedParams = useMemo(() => parseJson(paramsText), [paramsText]);
	const paramsError = parsedParams.ok
		? typeof parsedParams.value === 'object' && parsedParams.value !== null
			? ''
			: 'Parameters must be a JSON object'
		: parsedParams.error;
	const canSubmit = Boolean(entityId && selectedResourceName && !paramsError);

	const setType = (nextType: EntityType) => {
		setEntityType(nextType);
		setEntityId(nextType === 'Gateway' ? 'Gateway' : '');
		setResourceName(
			nextType === 'Boundary'
				? boundaryResources[0]
				: nextType === 'Handler'
				? handlerResources[0]
				: (snapshot.resources || ['gateway_status'])[0]
		);
		setCustomResourceName('');
		setParamsText('{}');
	};

	const setResource = (nextResource: string) => {
		setResourceName(nextResource);
		if (nextResource !== otherResource) {
			setCustomResourceName('');
		}
	};

	const submit = () => {
		if (!canSubmit || !parsedParams.ok) {
			return;
		}

		model.socket
			.askResource(
				{
					id: entityId,
					type: entityType,
				},
				selectedResourceName,
				parsedParams.value as Record<string, unknown>
			)
			.then(response => {
				setResponseText(formatJson(response));
			});
	};

	return {
		canSubmit,
		CodeField,
		customResourceName,
		entityId,
		entityOptions,
		entityType,
		paramsError,
		paramsText,
		resourceName,
		resourceOptions,
		responseText,
		selectedResourceName,
		setCustomResourceName,
		setEntityId,
		setParamsText,
		setResource,
		setType,
		showCustomResource: resourceName === otherResource,
		submit,
	};
};
