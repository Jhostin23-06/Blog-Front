import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        tsDecorators: true,
      }),
    ],
    define: {
      'process.env': env, // Exponer variables de entorno al código
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
      '/api': {
        target: 'https://tech-blog-kz8g.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
    },
  };
});