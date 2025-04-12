import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config = {
  kit: {
    files: {
      assets: 'static',
      hooks: {
        client: 'renderer-src/hooks.client',
        client: 'renderer-src/hooks.server',
        client: 'renderer-src/hooks',
      },
      lib: 'renderer-src/lib',
      params: 'renderer-src/params',
      routes: 'renderer-src/routes',
      serviceWorker: 'renderer-src/service-worker',
      appTemplate: 'renderer-src/app.html',
    },
    alias: {
      $components: 'renderer-src/components',
      $icons: 'renderer-src/icons',
    },
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'img-src': ['self', 'https://img.youtube.com/'],
        'object-src': ['none'],
      },
    },
    adapter: adapter(),
  },
  preprocess: vitePreprocess(),
}

export default config
