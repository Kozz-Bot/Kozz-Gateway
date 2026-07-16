export const formatJson = (value: unknown) => JSON.stringify(value, undefined, 2);

export const parseJson = (value: string) => {
	try {
		return {
			ok: true as const,
			value: JSON.parse(value),
		};
	} catch (error) {
		return {
			ok: false as const,
			error: error instanceof Error ? error.message : 'Invalid JSON',
		};
	}
};
