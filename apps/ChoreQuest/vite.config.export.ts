import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Used by: npm run export
// Produces a single self-contained dist-html/ChoreQuest.html
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    outDir: 'dist-html',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Single chunk — no code splitting so the HTML is truly standalone
        inlineDynamicImports: true,
      },
    },
  },
})
