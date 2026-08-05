import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import { RUNTIME_BUILD_ID } from '../src/runtimeBuild';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('소스 HTML과 WIZ iframe이 동일한 런타임 빌드 ID를 사용한다',()=>{
  const sourceHtml=readFileSync(resolve(root,'index.html'),'utf8');
  const hostView=readFileSync(resolve(root,'../src/app/page.home/view.pug'),'utf8');
  assert.match(sourceHtml,/__JOCHWON_BUILD_ID__/);
  assert.ok(hostView.includes(RUNTIME_BUILD_ID));
});

test('프로덕션 엔트리는 고유 파일명과 빌드 쿼리를 함께 사용한다',()=>{
  const distHtmlPath=resolve(root,'dist/index.html');
  assert.equal(existsSync(distHtmlPath),true,'npm run build를 먼저 실행해야 합니다.');
  const distHtml=readFileSync(distHtmlPath,'utf8');
  assert.ok(distHtml.includes(`const buildId = '${RUNTIME_BUILD_ID}'`));
  const entry=distHtml.match(/src="\/auth\/jochwon-assets\/assets\/(index-[^"?]+\.js)\?_build=([^"&]+)"/);
  assert.ok(entry,'버전 쿼리가 포함된 엔트리 스크립트가 필요합니다.');
  assert.equal(entry[2],RUNTIME_BUILD_ID);
  assert.equal(existsSync(resolve(root,'dist/assets',entry[1])),true);
});
