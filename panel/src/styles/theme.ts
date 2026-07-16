export const lightTheme = {
	name: 'light',
	colors: {
		background: '#f6f7f9',
		surface: '#ffffff',
		surfaceMuted: '#eef1f4',
		border: '#d9dee5',
		text: '#17202a',
		textMuted: '#647282',
		primary: '#275c7a',
		primaryText: '#ffffff',
		danger: '#9a342f',
		success: '#2f6f4e',
		warning: '#8a6a18',
		codeBackground: '#f3f5f7',
	},
	shadow: '0 1px 2px rgba(20, 30, 40, 0.08)',
};

export const darkTheme = {
	name: 'dark',
	colors: {
		background: '#111417',
		surface: '#1a1f24',
		surfaceMuted: '#232a31',
		border: '#323b45',
		text: '#e8edf2',
		textMuted: '#9aa6b2',
		primary: '#6ea3bd',
		primaryText: '#0d1317',
		danger: '#d07870',
		success: '#7fb28e',
		warning: '#c4a451',
		codeBackground: '#15191d',
	},
	shadow: '0 1px 2px rgba(0, 0, 0, 0.28)',
};

export type AppTheme = typeof lightTheme;
