import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base نسبی تا خروجی بیلد هم روی Vercel و هم داخل iframe سایت itch.io کار کند
export default defineConfig({
  base: './',
  plugins: [react()],
})
