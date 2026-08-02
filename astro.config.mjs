// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rsroyalprimajambi.co.id',
  output: 'static',
  integrations: [
    react(),
    sitemap(),
  ],
  image: {
    domains: ['tsavaawnubadqgzcqakd.supabase.co'],
    remotePatterns: [
      { protocol: 'https', hostname: 'tsavaawnubadqgzcqakd.supabase.co' },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
