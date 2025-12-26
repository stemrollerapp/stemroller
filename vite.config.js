import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: true,
		fs: {
			allow: ['./static/', './renderer-src/'],
		},
	},
};

export default config;
