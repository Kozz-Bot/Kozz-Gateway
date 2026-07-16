import { useEffect, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { TableColumn } from '@/components/DataTable/behavior';

type BoundaryRow = {
	id: string;
	boundary: {
		name: string;
		platform: string;
		OS: string;
		listeners: unknown[];
	};
};

type HandlerRow = {
	name: string;
	handler: {
		id: string;
		methods: string[];
		listeners: unknown[];
	};
};

export const useEntitiesBehavior = ({ model }: { model: AppModel }) => {
	const [boundaries, setBoundaries] = useState<BoundaryRow[]>([]);
	const [handlers, setHandlers] = useState<HandlerRow[]>([]);

	useEffect(() => {
		model.socket.askGateway('gateway_entities').then(response => {
			const data = response.response as {
				boundaries?: BoundaryRow[];
				handlers?: HandlerRow[];
			};
			setBoundaries(data.boundaries || []);
			setHandlers(data.handlers || []);
		});
	}, [model.socket]);

	const boundaryColumns: TableColumn<BoundaryRow>[] = [
		{ key: 'name', label: 'Name', render: row => row.boundary.name },
		{ key: 'id', label: 'Socket ID', render: row => row.id },
		{ key: 'platform', label: 'Platform', render: row => row.boundary.platform },
		{ key: 'os', label: 'OS', render: row => row.boundary.OS },
		{
			key: 'listeners',
			label: 'Listeners',
			render: row => row.boundary.listeners.length,
		},
	];

	const handlerColumns: TableColumn<HandlerRow>[] = [
		{ key: 'name', label: 'Name', render: row => row.name },
		{ key: 'id', label: 'Socket ID', render: row => row.handler.id },
		{
			key: 'methods',
			label: 'Methods',
			render: row => row.handler.methods.join(', ') || 'none',
		},
		{
			key: 'listeners',
			label: 'Listeners',
			render: row => row.handler.listeners.length,
		},
	];

	return {
		boundaries,
		boundaryColumns,
		handlers,
		handlerColumns,
	};
};
