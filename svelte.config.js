
import adapter from '@sveltejs/adapter-static';

const basePath = '/system-design-copilot';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist'
    }),
    paths: {
      base: basePath,
      relative: false
    },
    serviceWorker: {
      register: false
    }
  }
};

export default config;
