import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {WORLD_GUIDE_MAP_IDS} from '../src/game/worldNavigationProfile';
import {UNIFIED_WORLD_PORTAL_VISUAL,withUnifiedWorldPortalVisual} from '../src/game/worldPortalVisual';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const renderer=readFileSync(resolve(root,'src/game/renderers/VillageMapRenderer.ts'),'utf8');

test('17개 공간의 월드 포탈은 공통 흰색 바닥 원형 디자인을 사용한다',()=>{
  assert.equal(WORLD_GUIDE_MAP_IDS.length,17);
  assert.deepEqual(UNIFIED_WORLD_PORTAL_VISUAL,{appearance:'white-circle',theme:'mint'});
  assert.deepEqual(
    withUnifiedWorldPortalVisual({appearance:'energy-rift',theme:'orange',label:'대상'}),
    {appearance:'white-circle',theme:'mint',label:'대상'},
  );
  assert.match(renderer,/private createPortal\(config:PortalConfig,groundHeight:number\)\{\s*config=withUnifiedWorldPortalVisual\(config\)/);
  assert.match(renderer,/new THREE\.CircleGeometry\(50,64\)/);
  assert.match(renderer,/new THREE\.CircleGeometry\(50,64\),material\(\.08\)\)/);
  assert.match(renderer,/new THREE\.RingGeometry\(45,54,64\)/);
  assert.match(renderer,/new THREE\.RingGeometry\(34,38,64\)/);
  assert.match(renderer,/new THREE\.RingGeometry\(18,22,64\)/);
  assert.match(renderer,/new THREE\.RingGeometry\(55,59,64\)/);
});

test('공동캠퍼스 내부 포탈과 곰 체험소 이동 포탈도 같은 공통 렌더러를 사용한다',()=>{
  assert.match(renderer,/this\.interactionRoot=this\.createPortal\(withUnifiedWorldPortalVisual/);
  assert.match(renderer,/private createCampusFeaturePortal[\s\S]*?const root=this\.createPortal\(withUnifiedWorldPortalVisual/);
  assert.match(renderer,/\.\.\.this\.fixedPortalRoots,this\.interactionRoot,\.\.\.this\.campusFeaturePortalRoots\.values\(\)/);
  assert.match(renderer,/label\.position\.set\(0,0,112\)/);
});

test('포탈 충전 UI는 E 키 상호작용 안내가 함께 나타나면 위쪽으로 분리된다',()=>{
  const pageCss=readFileSync(resolve(root,'src/pages/GamePage.css'),'utf8');
  assert.match(pageCss,/\.game-page:has\(\.portal-charge-panel\):has\(kbd\) \.portal-charge-panel\{bottom:190px\}/);
  assert.match(pageCss,/\.game-page:has\(\.portal-charge-panel\):has\(kbd\) \.portal-charge-panel\.with-nearby-actions\{bottom:306px\}/);
});
