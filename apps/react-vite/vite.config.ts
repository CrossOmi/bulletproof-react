/// <reference types="vitest" />
/// <reference types="vite/client" />

// 1. Node.js built-in modules
import { fileURLToPath, URL } from 'url';

// 2. External packages
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
  // ViteとVitestの両方でパスエイリアスを解決するための設定
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  optimizeDeps: { exclude: ['fsevents'] },
  build: {
    rollupOptions: {
      external: ['fs/promises'],
      output: {
        experimentalMinChunkSize: 3500,
      },
    },
  },
});
