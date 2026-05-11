import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        // This allows you to use '@/components/Button' instead of '../../../../components/Button'
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 3000,
      strictPort: true, // Prevents Vite from trying another port if 3000 is busy
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false, // Useful if your dev backend uses self-signed SSL
          rewrite: (path) => path.replace(/^\/api/, ''), // Optional: removes /api prefix before sending to backend
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Only generate sourcemaps in dev for security/size
      rollupOptions: {
        output: {
          // Manual chunking prevents one massive JS file (better for performance)
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-utils': ['axios', 'recharts', 'lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
