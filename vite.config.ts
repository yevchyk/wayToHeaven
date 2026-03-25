import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const aliasEntries = {
  '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
  '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
  '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
  '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
  '@test': fileURLToPath(new URL('./src/test', import.meta.url)),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: aliasEntries,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});

