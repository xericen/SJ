import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const page=read('../src/pages/GamePage.tsx');

const glbNodeNames=()=>{
  const buffer=readFileSync(new URL('../src/assets/objects/personal-space-cottage.glb',import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString('utf8').replace(/\0+$/,'')) as {nodes?:Array<{name?:string}>};
  return new Set((json.nodes??[]).map(node=>node.name).filter((name):name is string=>!!name));
};

test('마이홈 모델은 독립 착석 대상 7개를 제공한다',()=>{
  const names=glbNodeNames();
  ['N','S','W','E'].forEach(direction=>assert.equal(names.has(`FURN_Dining_Chair_${direction}_Seat`),true));
  for(let index=0;index<3;index++)assert.equal(names.has(`FURN_Sofa_Cushion_${index}`),true);
  assert.equal(names.has('EXTERIOR_Entry_Door'),true);
});

test('집·가구·식물의 중첩 메시를 충돌 영역으로 등록한다',()=>{
  assert.match(renderer,/'ENV_Bush_'[^\]]*'ENV_Tree_Trunk_'/s);
  assert.match(renderer,/'FURN_Dining_Chair_'[^\]]*'DECOR_Bookcase_Plant_'/s);
  assert.match(renderer,/if\(!authoredCollider\|\|object\.parent!==model&&!this\.options\.personalFarm\)return/);
  assert.match(renderer,/PERSONAL_FARM_COLLIDER_PREFIXES\.some\(prefix=>object\.name\.startsWith\(prefix\)\)/);
});

test('문 출입과 의자·소파 착석은 E 상호작용으로만 실행한다',()=>{
  assert.match(renderer,/event\.code!=='KeyE'/);
  assert.match(renderer,/this\.options\.personalFarm&&this\.personalFarmDoorNearby/);
  assert.match(renderer,/setupPersonalFarmSeats\(model\)/);
  assert.match(renderer,/\(\['N','S','W','E'\] as const\)/);
  assert.match(renderer,/for\(let index=0;index<3;index\+\+\)/);
  assert.match(renderer,/this\.personalFarmActiveSeat\?20:0/);
  assert.match(page,/E 버튼으로 집 들어가기/);
  assert.match(page,/personal-farm-seat-toggle/);
  assert.match(page,/E 버튼으로 앉기/);
});
