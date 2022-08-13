import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'

const config = {
	kit: {
		files: {
			assets: 'static',
			hooks: 'renderer-src/hooks',
			lib: 'renderer-src/lib',
			params: 'renderer-src/params',
			routes: 'renderer-src/routes',
			serviceWorker: 'renderer-src/service-worker',
			template: 'renderer-src/app.html',
		},
		alias: {
			$components: 'renderer-src/components',
			$icons: 'renderer-src/icons',
		},
		prerender: {
			default: true,
		},
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'img-src': ['self', 'https://img.youtube.com/'],
				'object-src': ['none']
			},
		},
		adapter: adapter(),
	},
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
}

export default config
