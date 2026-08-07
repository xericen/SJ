import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const css=readFileSync(new URL('../src/pages/LandingPage.css',import.meta.url),'utf8');

test('홈 소개 통계는 두 개의 동일 폭 카드로 유지한다',()=>{
  assert.match(css,/\.welcome-stats\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.welcome-stats>span\{[^}]*min-width:0[^}]*grid-template-columns:20px minmax\(0,1fr\)/);
});

test('통계 제목과 설명은 좁은 화면에서 카드 밖으로 줄바꿈되지 않는다',()=>{
  assert.match(css,/\.welcome-stats b\{[^}]*text-overflow:ellipsis[^}]*white-space:nowrap/);
  assert.match(css,/\.welcome-stats small\{[^}]*text-overflow:ellipsis[^}]*white-space:nowrap/);
  assert.match(css,/@media\(max-width:600px\)\{[^}]*[\s\S]*?\.welcome-stats\{width:100%;gap:8px\}/);
  assert.match(css,/\.welcome-stats small\{font-size:clamp\(7px,2\.2vw,8px\)\}/);
});
