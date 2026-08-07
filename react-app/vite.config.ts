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
        "    const currentRetry=entryRetry?.startsWith(`${runtimeBuildId}:`)??false;",
        '    let recoveryStarted=false;',
        '    const showFailure=()=>{',
        "      const root=document.getElementById('root');",
        '      if(!root)return;',
        "      root.innerHTML='<main style=\"min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#f4f7f5;font-family:SUIT,\\\"Noto Sans KR\\\",sans-serif;color:#183a32\"><section style=\"width:min(440px,100%);padding:36px;border:1px solid #c9ded7;border-radius:24px;background:#fff;text-align:center;box-shadow:0 18px 48px rgba(25,73,61,.12)\"><strong style=\"display:block;font-size:24px;margin-bottom:10px\">화면을 다시 준비해 주세요</strong><p style=\"margin:0 0 22px;color:#657b75;line-height:1.6\">최신 화면을 불러오는 중 문제가 발생했습니다.</p><button type=\"button\" onclick=\"window.__retryJochwonRuntime()\" style=\"border:0;border-radius:12px;padding:13px 22px;background:#087a62;color:#fff;font:inherit;font-weight:800;cursor:pointer\">다시 불러오기</button></section></main>';",
        '    };',
        '    window.__retryJochwonRuntime=()=>{',
        "      pageUrl.searchParams.set('_build',runtimeBuildId);",
        "      pageUrl.searchParams.delete('_entry_retry');",
        '      window.location.replace(pageUrl.toString());',
        '    };',
        '    const recover=async()=>{',
        '      if(recoveryStarted)return;',
        '      recoveryStarted=true;',
        '      if(currentRetry){',
        "        if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showFailure,{once:true});",
        '        else showFailure();',
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
        "      pageUrl.searchParams.set('_entry_retry',`${runtimeBuildId}:${Date.now()}`);",
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
      // The content hash already gives this module a unique cache key. Adding a
      // query here creates a second module identity when lazy chunks import the
      // same entry without that query, which mounts React twice after login.
      const staticEntry=`<script type="module" crossorigin src="${entry[1]}" onerror="void window.__recoverJochwonRuntime?.()"></script>`;
      const renderBlockingStylesheet=stylesheet
        ?`<link rel="stylesheet" crossorigin href="${stylesheet[1]}" onerror="void window.__recoverJochwonRuntime?.()">`
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
    // The default Oxc minifier emitted a runtime-only variable reference error
    // in some Kakao login return browsers. Use the mature esbuild transform and
    // an explicit target so the authentication callback can always mount React.
    target: 'es2020',
    minify: 'esbuild',
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
