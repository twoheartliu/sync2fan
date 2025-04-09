import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import * as sass from 'sass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 1234,
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        // Use the modern API
        sassOptions: {
          // Your Sass options here if needed
        },
      },
    },
  },
})
