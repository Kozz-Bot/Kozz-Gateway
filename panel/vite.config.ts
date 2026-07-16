import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	base: '/kozz/web/',
	plugins: [react()],
	root: path.resolve(__dirname),
	build: {
		outDir: path.resolve(__dirname, '../public'),
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
});
