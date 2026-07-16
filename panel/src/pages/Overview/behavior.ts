import { useEffect, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { StatItem } from '@/components/StatGrid/behavior';

type Snapshot = {
	status?: {
		uptimeMs?: number;
		counts?: {
			boundaries?: number;
			handlers?: number;
			proxies?: number;
		};
		process?: {
			pid?: number;
			nodeVersion?: string;
		};
	};
};

export const useOverviewBehavior = ({ model }: { model: AppModel }) => {
	const [snapshot, setSnapshot] = useState<Snapshot>({});
	const [socketStatus, setSocketStatus] = useState(model.socket.getStatus());

	useEffect(
		() => model.socket.subscribeStatus(setSocketStatus),
		[model.socket]
	);

	useEffect(() => {
		model.socket
			.askGateway('gateway_snapshot')
			.then(response => setSnapshot(response.response as Snapshot))
			.catch(() => setSnapshot({}));
	}, [model.socket]);

	const stats: StatItem[] = [
		{
			label: 'Socket',
			value: socketStatus.connected ? 'Connected' : 'Disconnected',
			detail: socketStatus.error,
		},
		{
			label: 'Boundaries',
			value: snapshot.status?.counts?.boundaries ?? 0,
		},
		{
			label: 'Handlers',
			value: snapshot.status?.counts?.handlers ?? 0,
		},
		{
			label: 'Proxies',
			value: snapshot.status?.counts?.proxies ?? 0,
		},
		{
			label: 'Gateway PID',
			value: snapshot.status?.process?.pid ?? 'n/a',
			detail: snapshot.status?.process?.nodeVersion,
		},
		{
			label: 'Uptime',
			value: `${Math.floor((snapshot.status?.uptimeMs ?? 0) / 1000)}s`,
		},
	];

	return {
		stats,
	};
};
