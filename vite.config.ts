import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' делает сборку переносимой — работает и на GitHub Pages (в подпапке),
// и при открытии через любой статический хостинг.
export default defineConfig({
  plugins: [react()],
  base: './',
})
