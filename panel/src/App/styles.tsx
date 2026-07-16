import { Global, Theme } from '@emotion/react';

export const GlobalStyles = ({ theme }: { theme: Theme }) => (
	<Global
		styles={{
			'*': {
				boxSizing: 'border-box',
			},
			body: {
				margin: 0,
				fontFamily:
					'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
				background: theme.colors.background,
				color: theme.colors.text,
				letterSpacing: 0,
			},
			button: {
				fontFamily: 'inherit',
			},
			input: {
				fontFamily: 'inherit',
			},
			textarea: {
				fontFamily: 'inherit',
			},
			a: {
				color: 'inherit',
			},
		}}
	/>
);
