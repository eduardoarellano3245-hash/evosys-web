/// <reference types="vitest" />

import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',

  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'logo.png',
        'icons/icon-192.png',
        'icons/icon-512.png'
      ],

      manifest: {
        name: 'EVOSYS',
        short_name: 'EVOSYS',
        description: 'Sistema de gestión empresarial inteligente',
        theme_color: '#0066cc',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },

      devOptions: {
        enabled: true
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  test: {
    globals: true,
    environment: 'jsdom'
  }
})