import { useEffect, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { DispatchForm } from '@/components/DispatchForm';
import { gatewayResourceSchema } from '@/lib/schemas';
import { formatJson } from '@/lib/json';

export const useResourcesBehavior = ({ model }: { model: AppModel }) => {
	const [resources, setResources] = useState<string[]>([]);
	const [responseText, setResponseText] = useState('{}');

	useEffect(() => {
		model.socket.askGateway('gateway_resources').then(response => {
			setResources((response.response as string[]) || []);
		});
	}, [model.socket]);

	const submit = (value: unknown) => {
		const request = gatewayResourceSchema.parse(value);
		model.socket.askGateway(request.resource, request.data).then(response => {
			setResponseText(formatJson(response));
		});
	};

	return {
		DispatchForm,
		fields: [
			{ name: 'resource', label: 'Resource', placeholder: 'gateway_status' },
		],
		initialJson: {
			resource: 'gateway_status',
			data: {},
		},
		resources,
		responseText,
		schema: gatewayResourceSchema,
		submit,
	};
};
