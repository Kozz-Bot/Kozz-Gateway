import { useState } from 'react';
import { AppModel } from '@/App/behavior';
import { DispatchForm } from '@/components/DispatchForm';
import { dispatchSchema } from '@/lib/schemas';

const presets = [
	{
		label: 'Ask gateway status',
		value: {
			event: 'ask_resource',
			payload: {
				requester: { id: 'kozz-gw-panel', type: 'Handler' },
				responder: { id: 'Gateway', type: 'Gateway' },
				timestamp: Date.now(),
				request: {
					id: `panel/${Date.now()}`,
					resource: 'gateway_status',
					data: {},
				},
			},
		},
	},
	{
		label: 'Ask gateway entities',
		value: {
			event: 'ask_resource',
			payload: {
				requester: { id: 'kozz-gw-panel', type: 'Handler' },
				responder: { id: 'Gateway', type: 'Gateway' },
				timestamp: Date.now(),
				request: {
					id: `panel/${Date.now()}`,
					resource: 'gateway_entities',
					data: {},
				},
			},
		},
	},
	{
		label: 'Forward event',
		value: {
			event: 'forwardable_event',
			payload: {
				eventName: 'panel_test',
				payload: {},
			},
		},
	},
	{
		label: 'Boundary message',
		value: {
			event: 'message',
			payload: {
				boundary: 'kozz-baileys',
				message: {
					body: '',
					from: '',
					to: '',
				},
			},
		},
	},
];

export const useDispatchBehavior = ({ model }: { model: AppModel }) => {
	const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
	const selectedPreset = presets[selectedPresetIndex];

	const submit = (value: unknown) => {
		const parsed = dispatchSchema.parse(value);
		model.socket.dispatch(parsed.event, parsed.payload);
	};

	return {
		DispatchForm,
		fields: [{ name: 'event', label: 'Event', placeholder: 'send_message' }],
		initialJson: selectedPreset.value,
		presets: presets.map((preset, index) => ({
			active: index === selectedPresetIndex,
			label: preset.label,
			onClick: () => setSelectedPresetIndex(index),
		})),
		schema: dispatchSchema,
		submit,
	};
};
