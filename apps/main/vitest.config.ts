import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/types': path.resolve(__dirname, '../../packages-types/src'),
      '@repo/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@repo/shared': path.resolve(__dirname, '../../packages/shared/src'),
      'server-only': path.resolve(__dirname, './src/__mocks__/server-only.ts'),
    },
  },
});
