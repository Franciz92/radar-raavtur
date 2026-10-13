import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================
// VITE CONFIG — Radar RAAVTUR
// ============================================
// host: '0.0.0.0' → escuta em TODAS as interfaces
// (IPv4 + IPv6 + Tailscale + Wi-Fi local)
// Isto permite acesso de telemóvel / outro dispositivo
// ============================================

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',          // ✅ escuta em todas as interfaces
    port: 5173,
    strictPort: true,         // ✅ falha se porta ocupada (previsível)
    open: true,               // abre browser automaticamente
    cors: true,               // permite cross-origin em dev
    allowedHosts: [
      '.ts.net',              // Tailscale (ex: pc.tailxxxx.ts.net)
      '.ngrok-free.app',      // ngrok
      '.trycloudflare.com',   // waytunnel / cloudflare
      'localhost',
    ],
  },
})