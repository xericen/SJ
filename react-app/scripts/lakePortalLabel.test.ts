import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('호수공원 포탈 제목은 동일한 크기이고 3초 안내를 표시하지 않는다',()=>{
  const source=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  assert.match(source,/context\.font='900 46px/);
  assert.match(source,/context\.fillText\(label,360,105\)/);
  assert.doesNotMatch(source,/초 머무르면 이동/);
});
