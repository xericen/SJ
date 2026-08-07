import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('호수공원·축제부스 포탈 제목 크기를 통일하고 공동캠퍼스 제목을 낮춘다',()=>{
  const source=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  assert.match(source,/this\.options\.mapName==='세종호수공원'\|\|this\.options\.mapName==='축제부스'/);
  assert.match(source,/label\.position\.set\(0,config\.destination==='campus'\?38:62,85\)/);
});
