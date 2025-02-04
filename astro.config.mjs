// @ts-check
import react from '@astrojs/react';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
// import sentry from '@sentry/astro';
// import spotlightjs from '@spotlightjs/astro';
import sentry from '@sentry/astro';
import { defineConfig, envField } from 'astro/config';
import { visualizer } from 'rollup-plugin-visualizer';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_API_WEB3FORM: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SENTRY_DSN: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  site: 'https://vernandosimbolon.com',
  integrations: [tailwind(), react(), sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en-US',
        id: 'id',
      },
    },
    serialize(item) {
      item.changefreq = ChangeFreqEnum.DAILY;
      item.lastmod = new Date().toISOString();
      item.priority = 0.9;
      return item;
    },
  }), sentry({
    sourceMapsUploadOptions: {
      project: 'javascript-astro',
      authToken: process.env.PRIVATE_SENTRY_AUTH_TOKEN,
      telemetry: false,
    },
  })],
  vite: {
    plugins: [visualizer({
      emitFile: true,
      filename: 'stats.html',
    })],
  },
});
