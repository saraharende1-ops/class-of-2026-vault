import { defineConfig } from 'vite'
import react from '@react-js/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // This forces absolute routing assets on production platforms
})
