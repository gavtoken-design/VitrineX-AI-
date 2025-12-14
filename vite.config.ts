import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'gemini': ['@google/genai'],
          }
        }
      }
    },
    server: {
      port: 3000,
      host: 'localhost', // Changed from 0.0.0.0 to avoid Windows Firewall popups
    },
    base: './',
    plugins: [
      react(),
      // VitePWA({
      //   registerType: 'autoUpdate',
      //   includeAssets: ['icon.svg', '.htaccess'],
      //   manifest: {
      //     name: 'VitrineX AI - Automação de Marketing com IA',
      //     short_name: 'VitrineX AI',
      //     description: 'Plataforma completa de automação de marketing movida por IA. Crie conteúdo, anúncios e campanhas com Google Gemini.',
      //     theme_color: '#4F46E5',
      //     background_color: '#ffffff',
      //     display: 'standalone',
      //     scope: './',
      //     start_url: './',
      //     orientation: 'portrait',
      //     icons: [
      //       {
      //         src: 'icon.svg',
      //         sizes: 'any',
      //         type: 'image/svg+xml',
      //         purpose: 'any maskable'
      //       }
      //     ]
      //   },
      //   workbox: {
      //     globPatterns: ['**/*.{js,css,html,svg,json}'],
      //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      //   },
      //   devOptions: {
      //     enabled: false
      //   }
      // })
    ],
    define: {
      // process.env usage removed in favor of import.meta.env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
