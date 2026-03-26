import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/controllers': path.resolve(__dirname, './src/controllers'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/repositories': path.resolve(__dirname, './src/repositories'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/middlewares': path.resolve(__dirname, './src/middlewares'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
