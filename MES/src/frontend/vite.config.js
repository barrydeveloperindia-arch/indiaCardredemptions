import { defineConfig } from 'vite'
// Force Restart 2026-01-29
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        watch: {
            usePolling: true,
            interval: 100,
        },
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://englabs_backend:8000', // Docker DNS
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
