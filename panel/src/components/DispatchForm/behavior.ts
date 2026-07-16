import { useMemo, useState } from 'react';
import { z } from 'zod';
import { CodeField } from '@/components/CodeField';
import { formatJson, parseJson } from '@/lib/json';

export type FieldSpec = {
	name: string;
	label: string;
	placeholder?: string;
};

export const useDispatchFormBehavior = ({
	fields,
	initialJson,
	schema,
	onSubmit,
}: {
	fields: FieldSpec[];
	initialJson: unknown;
	schema: z.ZodType;
	onSubmit: (value: unknown) => void;
}) => {
	const baseJson = typeof initialJson === 'object' && initialJson ? initialJson : {};
	const [form, setForm] = useState<Record<string, string>>(() =>
		fields.reduce<Record<string, string>>((acc, field) => {
			const value = (baseJson as Record<string, unknown>)[field.name];
			acc[field.name] = typeof value === 'string' ? value : '';
			return acc;
		}, {})
	);
	const [jsonText, setJsonText] = useState(formatJson(initialJson));

	const parsed = useMemo(() => parseJson(jsonText), [jsonText]);
	const validation = useMemo(
		() => (parsed.ok ? schema.safeParse(parsed.value) : undefined),
		[parsed, schema]
	);
	const error = parsed.ok
		? validation?.success
			? ''
			: validation?.error.issues[0]?.message || 'Schema validation failed'
		: parsed.error;

	const updateField = (field: string, value: string) => {
		const nextForm = {
			...form,
			[field]: value,
		};
		setForm(nextForm);
		setJsonText(formatJson({ ...baseJson, ...nextForm }));
	};

	const submit = () => {
		if (parsed.ok && validation?.success) {
			onSubmit(parsed.value);
		}
	};

	return {
		CodeField,
		error,
		fields: fields.map(field => ({
			...field,
			value: form[field.name] || '',
			onChange: (value: string) => updateField(field.name, value),
		})),
		jsonText,
		setJsonText,
		submit,
	};
};
