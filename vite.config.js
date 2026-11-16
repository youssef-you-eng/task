// Vite configuration.
// The React plugin teaches Vite how to compile JSX and enables fast refresh
// (the page updates instantly when you save a file, without losing state).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
