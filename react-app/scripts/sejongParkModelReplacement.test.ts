import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const model=readFileSync(new URL('../src/assets/maps/sejong-lake-park.glb',import.meta.url));
const landing=readFileSync(new URL('../src/pages/LandingPage.tsx',import.meta.url),'utf8');
const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');

test('공용 SejongPark GLB가 세종호수공원 원본으로 교체됐다',()=>{
  assert.equal(createHash('sha256').update(model).digest('hex'),'5416eb9a5897d56d7e23deac2a937d875142744446ef5c7317d8e0bc026cb994');
  assert.equal(model.readUInt32LE(0),0x46546c67);
  assert.equal(model.readUInt32LE(8),model.byteLength);
});

test('실제 월드와 홈·공간안내가 같은 교체 GLB를 참조한다',()=>{
  assert.match(renderer,/import villageModelUrl from '\.\.\/\.\.\/assets\/maps\/sejong-lake-park\.glb\?url'/);
  assert.match(landing,/import lakeWorldUrl from '\.\.\/assets\/maps\/sejong-lake-park\.glb\?url'/);
  assert.equal((landing.match(/modelUrl:lakeWorldUrl,modelSize:'3\.9MB'/g)??[]).length,2);
});
