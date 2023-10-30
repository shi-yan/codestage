import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  base: '{{_codestage_prefix_}}',
  build: {
    outDir: '../cli/dist'
  }
})
