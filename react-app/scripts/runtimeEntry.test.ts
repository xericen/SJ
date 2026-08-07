import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { RUNTIME_BUILD_ID } from '../src/runtimeBuild';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('소스 HTML과 WIZ iframe이 동일한 런타임 빌드 ID를 사용한다',()=>{
  const sourceHtml=readFileSync(resolve(root,'index.html'),'utf8');
  const hostView=readFileSync(resolve(root,'../src/app/page.home/view.pug'),'utf8');
  assert.match(sourceHtml,/__JOCHWON_BUILD_ID__/);
  assert.ok(hostView.includes(RUNTIME_BUILD_ID));
});

test('호스트는 외부 ReviewOps SDK의 단일 식별자 오류만 격리한다',()=>{
  const hostHtml=readFileSync(resolve(root,'../src/angular/index.pug'),'utf8');
  assert.match(hostHtml,/reviewops-sdk\\\.js/);
  assert.match(hostHtml,/isMinifiedReferenceError/);
  assert.match(hostHtml,/isClosedMessageChannel/);
  assert.match(hostHtml,/event\.stopImmediatePropagation\(\)/);
  assert.match(hostHtml,/event\.preventDefault\(\)/);
});

test('프로덕션 엔트리는 단일 모듈 identity를 유지하는 고유 파일명을 사용한다',()=>{
  const distHtmlPath=resolve(root,'dist/index.html');
  assert.equal(existsSync(distHtmlPath),true,'npm run build를 먼저 실행해야 합니다.');
  const distHtml=readFileSync(distHtmlPath,'utf8');
  assert.ok(distHtml.includes(`const buildId = '${RUNTIME_BUILD_ID}'`));
  const entry=distHtml.match(/<script type="module" crossorigin src="\/auth\/jochwon-assets\/assets\/(index-[^"?]+\.js)"/);
  assert.ok(entry,'고유 파일명의 런타임 엔트리가 필요합니다.');
  assert.match(entry[1],/^index-[A-Za-z0-9_-]{8}\.js$/,'엔트리는 Vite 콘텐츠 해시 파일명이어야 합니다.');
  assert.doesNotMatch(entry[1],/profile|records|(?:^|[-_.])v\d+(?:[-_.]|$)/i,'기능명이나 버전명을 고정 엔트리 파일명으로 사용하면 안 됩니다.');
  const entryPath=resolve(root,'dist/assets',entry[1]);
  assert.equal(existsSync(entryPath),true);
  assert.ok(readFileSync(entryPath,'utf8').includes(RUNTIME_BUILD_ID),'엔트리와 HTML의 빌드 ID가 일치해야 합니다.');
  assert.ok(distHtml.includes(`const runtimeBuildId="${RUNTIME_BUILD_ID}"`));
  assert.doesNotMatch(distHtml,new RegExp(`${entry[1].replaceAll('.','\\.')}\\?`));
});

test('화면은 정적 모듈 엔트리로 렌더링하고 오류 복구 가드를 별도로 둔다',()=>{
  const distHtml=readFileSync(resolve(root,'dist/index.html'),'utf8');
  assert.match(distHtml,/<script type="module" crossorigin src="\/auth\/jochwon-assets\/assets\/index-[^"?]+\.js" onerror=/);
  assert.ok(distHtml.includes('window.__recoverJochwonRuntime=recover'));
  assert.ok(distHtml.includes("pageUrl.searchParams.set('_entry_retry',`${runtimeBuildId}:${Date.now()}`)"));
  assert.ok(distHtml.includes("pageUrl.searchParams.delete('_entry_retry')"));
  assert.doesNotMatch(distHtml,/import\(runtimeEntryUrl\.href\)/);
});

test('메인 스타일은 외부 폰트 요청 없이 런타임 실행 전에 준비된다',()=>{
  const sourceStyles=readFileSync(resolve(root,'src/styles.css'),'utf8');
  const distHtml=readFileSync(resolve(root,'dist/index.html'),'utf8');
  const stylesheet=distHtml.match(/<link rel="stylesheet" crossorigin href="\/auth\/jochwon-assets\/assets\/(index-[^"?]+\.css)" onerror=/);
  const entryIndex=distHtml.indexOf('<script type="module" crossorigin src="/auth/jochwon-assets/assets/index-');
  const stylesheetIndex=distHtml.indexOf('<link rel="stylesheet" crossorigin href="/auth/jochwon-assets/assets/index-');
  assert.doesNotMatch(sourceStyles,/fonts\.googleapis\.com|@import\s+url/);
  assert.match(sourceStyles,/SUIT-Regular\.woff2/);
  assert.ok(stylesheet,'고유 파일명의 메인 스타일시트가 필요합니다.');
  assert.equal(existsSync(resolve(root,'dist/assets',stylesheet[1])),true);
  assert.ok(stylesheetIndex>=0&&stylesheetIndex<entryIndex,'스타일시트가 런타임 엔트리보다 먼저 와야 합니다.');
});

test('엔트리 로드 실패 시 캐시를 비우고 재시도 URL로 이동한다',async()=>{
  const distHtml=readFileSync(resolve(root,'dist/index.html'),'utf8');
  const loader=[...distHtml.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match=>match[1])
    .find(script=>script.includes('window.__recoverJochwonRuntime=recover'));
  assert.ok(loader);
  let replaced='';
  const caches={keys:async()=>['old-runtime'],delete:async()=>true};
  const window={
    location:{
      href:`https://sj.wizide.com/assets/jochwon-app/index.html?_build=${RUNTIME_BUILD_ID}`,
      origin:'https://sj.wizide.com',
      replace:(url:string)=>{replaced=url},
    },
    caches,
    addEventListener:()=>undefined,
    __recoverJochwonRuntime:undefined as undefined|(()=>Promise<void>),
  };
  runInNewContext(loader,{
    URL,
    caches,
    console:{error:()=>undefined},
    document:{getElementById:()=>null},
    navigator:{serviceWorker:{getRegistrations:async()=>[]}},
    window,
  });
  assert.ok(window.__recoverJochwonRuntime);
  await window.__recoverJochwonRuntime();
  const recoveryUrl=new URL(replaced);
  assert.equal(recoveryUrl.searchParams.get('_build'),RUNTIME_BUILD_ID);
  assert.match(recoveryUrl.searchParams.get('_entry_retry')??'',new RegExp(`^${RUNTIME_BUILD_ID}:\\d+$`));
});
