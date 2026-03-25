import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: { port: 3010, open: true },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
      '@/components': path.resolve(__dirname, 'src/modules/shared/components'),
      '@/hooks': path.resolve(__dirname, 'src/modules/shared/hooks'),
      '@/services': path.resolve(__dirname, 'src/modules/shared/services'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/types': path.resolve(__dirname, 'src/modules/shared/types'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
})
