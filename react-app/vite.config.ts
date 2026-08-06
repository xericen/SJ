import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { RUNTIME_BUILD_ID } from './src/runtimeBuild';

const runtimeEntryCachePlugin={
  name:'runtime-entry-cache-version',
  transformIndexHtml:{
    order:'post' as const,
    handler(html:string){
      const versioned=html.replaceAll('__JOCHWON_BUILD_ID__',RUNTIME_BUILD_ID);
      const entryPattern=/<script type="module" crossorigin src="(\/auth\/jochwon-assets\/assets\/index-[^"?]+\.js)(?:\?[^\"]*)?"><\/script>/;
      const entry=versioned.match(entryPattern);
      if(!entry)return versioned;
      const stylesheetPattern=/[ \t]*<link rel="stylesheet" crossorigin href="(\/auth\/jochwon-assets\/assets\/index-[^"]+\.css)">/;
      const stylesheet=versioned.match(stylesheetPattern);
      const recoveryGuard=[
        '<script>',
        '  (() => {',
        `    const runtimeBuildId=${JSON.stringify(RUNTIME_BUILD_ID)};`,
        `    const runtimeEntryPath=${JSON.stringify(entry[1])};`,
        '    const pageUrl=new URL(window.location.href);',
        "    const entryRetry=pageUrl.searchParams.get('_entry_retry');",
        '    let recoveryStarted=false;',
        '    const recover=async()=>{',
        '      if(recoveryStarted)return;',
        '      recoveryStarted=true;',
        '      if(entryRetry){',
        "        const root=document.getElementById('root');",
        "        if(root)root.textContent='새 버전을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';",
        '        return;',
        '      }',
        "      const cacheReset='caches' in window",
        '        ?caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).catch(()=>undefined)',
        '        :Promise.resolve();',
        "      const workerReset='serviceWorker' in navigator",
        '        ?navigator.serviceWorker.getRegistrations().then(items=>Promise.all(items.map(item=>item.unregister()))).catch(()=>undefined)',
        '        :Promise.resolve();',
        '      await Promise.all([cacheReset,workerReset]);',
        "      pageUrl.searchParams.set('_build',runtimeBuildId);",
        "      pageUrl.searchParams.set('_entry_retry',String(Date.now()));",
        '      window.location.replace(pageUrl.toString());',
        '    };',
        '    window.__recoverJochwonRuntime=recover;',
        "    window.addEventListener('error',event=>{",
        "      const filename=typeof event.filename==='string'?event.filename:'';",
        '      if(filename.includes(runtimeEntryPath))void recover();',
        '    });',
        '  })();',
        '</script>',
      ].join('\n');
      const staticEntry=`<script type="module" crossorigin src="${entry[1]}?_build=${encodeURIComponent(RUNTIME_BUILD_ID)}" onerror="void window.__recoverJochwonRuntime?.()"></script>`;
      const renderBlockingStylesheet=stylesheet
        ?`<link rel="stylesheet" crossorigin href="${stylesheet[1]}?_build=${encodeURIComponent(RUNTIME_BUILD_ID)}" onerror="void window.__recoverJochwonRuntime?.()">`
        :'';
      const withoutOriginalStylesheet=versioned.replace(stylesheetPattern,'');
      return withoutOriginalStylesheet.replace(
        entryPattern,
        `${recoveryGuard}\n${renderBlockingStylesheet}\n${staticEntry}`,
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
