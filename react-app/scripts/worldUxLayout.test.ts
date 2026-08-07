import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const festivalNpc=read('../src/data/festivalNpc.ts');
const page=read('../src/pages/GamePage.tsx');
const pageCss=read('../src/pages/GamePage.css');
const greenhouse=read('../src/components/GreenhouseExperience.tsx');

test('축제 포탈 안내 충녕이는 고정 NPC이며 통과할 수 없다',()=>{
  assert.match(festivalNpc,/id: 'festival-guide-chungnyeong', nickname: '충녕이'/);
  assert.match(festivalNpc,/x: 1090, z: 520,[\s\S]*?staticPose: true,[\s\S]*?collisionRadius: 52/);
  assert.match(renderer,/this\.localNpcs\.some\(npc=>npc\.config\.collisionRadius&&Math\.hypot\(worldX-npc\.x,worldZ-npc\.z\)<npc\.config\.collisionRadius\)/);
});

test('알림과 요청 카드는 한 스택에서 순서대로 표시된다',()=>{
  assert.match(page,/\(request\|\|friendRequest\|\|notice\)&&<aside className="game-notification-stack"/);
  assert.match(page,/game-notification-stack[\s\S]*?\{notice&&[\s\S]*?\{request&&[\s\S]*?\{friendRequest&&/);
  assert.match(pageCss,/\.game-notification-stack\{[^}]*display:grid;gap:10px;[^}]*overflow-y:auto/);
  assert.match(pageCss,/\.game-notification-stack>\.notice,\.game-notification-stack>\.request-toast\{[^}]*position:relative;[^}]*top:auto/);
});

test('곰 먹이 위치는 지도 중앙 보행 구역에서 크게 표시된다',()=>{
  assert.match(renderer,/BEAR_FEED_PICKUPS\[config\.id\]/);
  assert.match(renderer,/context\.fillText\(`\$\{pickup\.emoji\} \$\{pickup\.name\} 줍기`/);
  assert.match(renderer,/new THREE\.RingGeometry\(28,39,40\)/);
  assert.match(renderer,/label\.scale\.set\(126,48,1\)/);
});

test('기억나무는 Git 기반 내 기억·모두의 기억을 유지하고 씨앗·식물도감 UI를 제외한다',()=>{
  assert.match(greenhouse,/🌱 내 기억/);
  assert.match(greenhouse,/🌳 모두의 기억/);
  assert.match(greenhouse,/기억 문장 만들기/);
  assert.match(greenhouse,/모두의 기억 잎/);
  assert.doesNotMatch(greenhouse,/식물도감|greenhouse-book-button|greenhouse-seed-notice|view==='book'/);
});

test('수목원은 클릭 관찰 후 명시적 채집과 행동 가중치 TOP 5를 제공한다',()=>{
  assert.match(renderer,/greenhouse-observe-plant/);
  assert.match(greenhouse,/아래 채집하기 버튼/);
  assert.match(greenhouse,/collectionPending\?'채집 중…':existing\?'다시 채집하기':'채집하기'/);
  assert.match(greenhouse,/recordPlantInfoOpen/);
  assert.match(greenhouse,/recordPlantInfoDuration/);
  assert.match(greenhouse,/recordPlantNearby/);
  assert.match(greenhouse,/내 관심 식물 TOP 5/);
  assert.match(renderer,/memoryTreeGlowMaterials/);
  assert.match(renderer,/emissiveIntensity=this\.greenhouseTreeStage===3\?1\.35/);
});
