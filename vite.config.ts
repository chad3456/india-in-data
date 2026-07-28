import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is overridable so the same build can be served from a project page
// (https://<user>.github.io/india-in-data/) or from a domain root.
export default defineConfig({
  base: process.env.SITE_BASE ?? '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
