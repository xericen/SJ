import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('축제 스탬프 패널은 좌측 하단에 배치된다',()=>{
  const source=readFileSync(new URL('../src/pages/GamePage.css',import.meta.url),'utf8');
  assert.match(source,/festival-experience-passport\}\{left:20px;top:auto;bottom:88px\}/);
  assert.match(source,/festival-experience-passport\}\{left:12px;top:auto;bottom:78px\}/);
});
