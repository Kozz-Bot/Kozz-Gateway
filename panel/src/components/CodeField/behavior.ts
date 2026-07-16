import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '@emotion/react';

export const useCodeFieldBehavior = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) => {
	const theme = useTheme();

	return {
		extensions: [json()],
		onChange,
		editorTheme: (theme.name === 'dark' ? oneDark : 'light') as never,
		value,
	};
};
