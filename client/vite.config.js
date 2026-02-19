import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const bffUrl = env.VITE_BFF_URL || 'http://localhost:3000';

  return {
    plugins: [vue()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    server: {
      port: Number(env.VITE_PORT || 5173),
      proxy: {
        '/api': {
          target: bffUrl,
          changeOrigin: true
        },
        '/auth': {
          target: bffUrl,
          changeOrigin: true
        }
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    }
  };
});
