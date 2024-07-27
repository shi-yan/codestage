import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  base: '$$_codestage_prefix_$$',
  build: {
    outDir: '../cli/dist',
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      },
      input: {
        app: 'code.html', // default
      },
      external: [
        'node_modules/monaco-editor/min'
      ],
    }
  },
  optimizeDeps: {
    exclude: ['node_modules/monaco-editor'],
  },
})
