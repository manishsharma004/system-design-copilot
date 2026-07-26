
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist'
    }),
    paths: {
      base: '/system-design-copilot'
    },
    serviceWorker: {
      register: false
    }
  }
};

export default config;
