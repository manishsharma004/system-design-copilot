import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const basePath = '/system-design-copilot';

export default defineConfig({
	base: `${basePath}/`,
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg', 'robots.txt'],
			kit: {
				trailingSlash: 'always'
			},
			manifest: {
				name: 'System Design Copilot',
				short_name: 'SD Copilot',
				description:
					'Mobile-friendly system design interview prep with lessons, practice labs, and simulations.',
				theme_color: '#232333',
				background_color: '#232333',
				display: 'standalone',
				scope: `${basePath}/`,
				start_url: `${basePath}/`,
				icons: [
					{
						src: `${basePath}/favicon.svg`,
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any'
					},
					{
						src: `${basePath}/favicon.svg`,
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: [
					'client/**/*.{css,svg,ico,webmanifest}',
					'prerendered/**/*.html',
					'client/_app/immutable/entry/*.{js,json}',
					'client/_app/immutable/nodes/*.{js,css}'
				],
				globIgnores: ['**/workers/**'],
				// Fully prerendered static export: do not SPA-fallback to index.html on navigation.
				navigateFallback: null,
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.pathname.includes('/_app/immutable/'),
						handler: 'CacheFirst',
						options: {
							cacheName: 'app-immutable-assets',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30
							},
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-stylesheets',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
							},
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-webfonts',
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365
							},
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				navigateFallback: `${basePath}/`
			}
		})
	],
	optimizeDeps: {
		exclude: ['@yowasp/clang', '@yowasp/clang/gen/bundle.js', '@wasmer/wasi']
	}
});
