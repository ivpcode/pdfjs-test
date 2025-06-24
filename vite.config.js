import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild',
    rollupOptions: {
      input: 'index.html',
    },
  },
});