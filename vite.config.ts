import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  envDir: false,
  resolve: {
    alias: {
      dotenv: new URL('./src/compat/dotenv.ts', import.meta.url).pathname,
      winston: new URL('./src/compat/winston.ts', import.meta.url).pathname,
      'winston-daily-rotate-file': new URL('./src/compat/winston.ts', import.meta.url).pathname,
    },
  },
  plugins: [nodePolyfills({
    include: ['buffer', 'process', 'util', 'stream', 'crypto', 'os', 'vm'],
    globals: { Buffer: true, global: true, process: true },
  })],
});
