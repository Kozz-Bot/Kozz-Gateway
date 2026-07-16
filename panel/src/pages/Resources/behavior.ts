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

const getNestedEntity = (entity: Record<string, unknown>, key: string) =>
	typeof entity[key] === 'object' && entity[key] !== null
		? (entity[key] as Record<string, unknown>)
		: {};

const toOptions = (
	entities: Array<Record<string, unknown>> = [],
	type: Exclude<EntityType, 'Gateway'>
) => {
	const options = entities
		.map(entity => {
			const nested = getNestedEntity(
				entity,
				type === 'Boundary' ? 'boundary' : 'handler'
			);
			const name = String(entity.name || nested.name || '');
			const id = String(entity.id || nested.id || '');
			const value = name || id;
			const label = name ? (id ? `${name} (${id})` : name) : id;

			return {
				label,
				value,
			};
		})
		.filter(option => option.value);

	return options.filter(
		(option, index) =>
			options.findIndex(candidate => candidate.value === option.value) === index
	);
};

export const useResourcesBehavior = ({ model }: { model: AppModel }) => {
	const [snapshot, setSnapshot] = useState<GatewaySnapshot>({});
	const [entityType, setEntityType] = useState<EntityType>('Gateway');
	const [entityId, setEntityId] = useState('Gateway');
	const [resourceName, setResourceName] = useState('gateway_status');
	const [customResourceName, setCustomResourceName] = useState('');
	const [paramsText, setParamsText] = useState('{}');
	const [responseText, setResponseText] = useState('{}');

	useEffect(() => {
		Promise.all([
			model.socket.askGateway('all_boundaries'),
			model.socket.askGateway('all_modules'),
			model.socket.askGateway('gateway_resources'),
		]).then(([boundariesResponse, handlersResponse, resourcesResponse]) => {
			setSnapshot({
				boundaries:
					(boundariesResponse.response as Array<Record<string, unknown>>) || [],
				handlers:
					(handlersResponse.response as Array<Record<string, unknown>>) || [],
				resources: (resourcesResponse.response as string[]) || [],
			});
		});
	}, [model.socket]);

	const entityOptions = useMemo(() => {
		if (entityType === 'Boundary') {
			return toOptions(snapshot.boundaries, 'Boundary');
		}
		if (entityType === 'Handler') {
			return toOptions(snapshot.handlers, 'Handler');
		}
		return [{ label: 'Gateway', value: 'Gateway' }];
	}, [entityType, snapshot.boundaries, snapshot.handlers]);

	useEffect(() => {
		if (entityType === 'Gateway') {
			setEntityId('Gateway');
			return;
		}

		if (!entityOptions.some(option => option.value === entityId) && entityOptions[0]) {
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
