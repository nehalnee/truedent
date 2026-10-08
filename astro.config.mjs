import { defineConfig } from 'astro/config';

// SITE_URL / BASE_PATH let the same code deploy to a domain root (truedent.ly)
// or to a sub-folder such as GitHub Pages (nehalnee.github.io/truedent).
export default defineConfig({
  site: process.env.SITE_URL || 'https://truedent.ly',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
});
