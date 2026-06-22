import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      },
      mangle: {
        toplevel: true
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },

  optimizeDeps: {
    include: ['vue', 'pinia']
  }
})
