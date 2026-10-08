import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://truedent.ly',
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
});
