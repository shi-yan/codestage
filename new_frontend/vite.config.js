import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

console.log(monacoEditorPlugin.getWorks())

export default defineConfig({
  plugins: [solid(), monacoEditorPlugin.default()],
  base: '$$_codestage_prefix_$$',
  build: {
    outDir: '../cli/dist'
  }
})
