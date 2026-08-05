import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { RUNTIME_BUILD_ID } from './src/runtimeBuild';

const runtimeEntryCachePlugin={
  name:'runtime-entry-cache-version',
  transformIndexHtml:{
    order:'post' as const,
    handler(html:string){
      const versioned=html.replaceAll('__JOCHWON_BUILD_ID__',RUNTIME_BUILD_ID);
      return versioned.replace(
        /(<script type="module" crossorigin src="\/auth\/jochwon-assets\/assets\/index-[^"?]+\.js)(?:\?[^\"]*)?("><\/script>)/,
        `$1?_build=${RUNTIME_BUILD_ID}$2`,
      );
    },
  },
};

export default defineConfig({
  base: '/auth/jochwon-assets/',
  plugins: [react(),runtimeEntryCachePlugin],
  build: {
    // Phaser is only needed after entering a 3D world. Keep the engine in a
    // deferred cacheable chunk instead of pulling it into profile helpers.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/phaser/')) return 'vendor-phaser';
          return undefined;
        },
      },
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/*.blend', '**/*.blend1'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
