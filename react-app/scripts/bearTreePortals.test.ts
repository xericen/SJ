import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {RoomStore} from '../server/src/rooms/roomStore';
import {WORLD_GUIDE_PORTAL_POSITIONS,worldGuideEntryState} from '../src/game/worldGuideEntryPoints';
import {BEAR_TREE_TO_GARDEN_ARRIVAL,GARDEN_SAFE_ARRIVAL,isGardenMemoryTreeEntry,safeWorldEntrySpawn,worldPortalArrivalOverride} from '../src/game/worldPortalArrivals';

const expected=[
  {mapId:'bear-tree-park',destination:'town',x:1185,z:1616},
  {mapId:'bear-tree-park',destination:'garden',x:767,z:751},
  {mapId:'bear-tree-park',destination:'bear-play-zone',x:1482,z:661},
] as const;
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('베어트리파크 포탈 3개는 요청자가 확정한 공용 좌표를 사용한다',()=>{
  expected.forEach(position=>{
    assert.deepEqual(
      WORLD_PORTAL_DEFAULTS.find(item=>item.mapId===position.mapId&&item.destination===position.destination),
      position,
    );
  });
});

test('베어트리파크에서 수목원으로 이동하면 귀환 포탈 아래쪽에 도착한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const worldScene=read('../src/game/scenes/WorldScene.ts');
  const gardenOptions=renderer.slice(
    renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),
    renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'),
  );
  const arrival=worldPortalArrivalOverride('bear-tree-park','garden');

  assert.deepEqual(arrival,BEAR_TREE_TO_GARDEN_ARRIVAL);
  assert.deepEqual(arrival,{x:1200,z:1400,yaw:0});
  assert.equal(arrival.z>WORLD_GUIDE_PORTAL_POSITIONS.garden.z,true);
  assert.equal(worldPortalArrivalOverride('town','garden'),undefined);
  assert.match(gardenOptions,/destination:'bear-tree-park'[\s\S]*?arrivalDirection:\{x:0,z:1\}/);
  assert.match(worldScene,/const routeArrival=worldPortalArrivalOverride\(sourceMapId,mapId\)/);
  assert.match(worldScene,/renderer\.arrivalSpawnFrom\(sourceMapId,routeArrival\)/);
  assert.match(renderer,/const safeSpawn=forcedSpawn\?this\.findSafeSpawn\(requestedSpawn\.x,requestedSpawn\.z\):undefined/);
  assert.match(renderer,/if\(forcedSpawn\)this\.pendingTeleport=/);
});

test('수목원 모든 진입 경로와 갇힌 저장 좌표를 안전 보행로로 보정한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const worldScene=read('../src/game/scenes/WorldScene.ts');

  assert.deepEqual(worldGuideEntryState('garden'),{mapId:'garden',...GARDEN_SAFE_ARRIVAL});
  assert.equal(isGardenMemoryTreeEntry({x:1200,z:1120}),true);
  assert.equal(isGardenMemoryTreeEntry({x:1200,z:1180}),true);
  assert.deepEqual(safeWorldEntrySpawn('garden',{x:1200,z:1120,yaw:Math.PI}),GARDEN_SAFE_ARRIVAL);
  assert.deepEqual(safeWorldEntrySpawn('garden',{x:1200,z:1180,yaw:Math.PI}),GARDEN_SAFE_ARRIVAL);
  assert.deepEqual(safeWorldEntrySpawn('garden',{x:1200,z:1400,yaw:0}),GARDEN_SAFE_ARRIVAL);
  assert.deepEqual(safeWorldEntrySpawn('town',{x:1200,z:950,yaw:1}),{x:1200,z:950,yaw:1});
  assert.match(renderer,/export const GARDEN_SPAWN[^=]*=\{\.\.\.GARDEN_SAFE_ARRIVAL\}/);
  assert.match(worldScene,/worldSpawn=safeWorldEntrySpawn\(this\.mapId,requestedWorldSpawn\)/);
});

test('수목원은 선명한 식생과 입체감을 위한 기본 렌더링 품질을 유지한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'));

  assert.match(options,/sceneBackgroundColor:'#b8d9c3'/);
  assert.match(options,/antialias:true/);
  assert.match(options,/maxTextureSize:2048/);
  assert.match(options,/minPixelRatio:1/);
  assert.match(options,/performancePixelRatio:1\.2/);
  assert.match(options,/maxPixelRatio:1\.5/);
  assert.match(options,/prioritizeGroundTextures:true/);
  assert.match(options,/groundingShadows:true/);
  assert.match(options,/lowQualityFallback:\{maxTextureSize:512,performancePixelRatio:\.75,performanceFrameRate:30,balancedTextureQuality:false\}/);
});

test('실시간 서버는 베어트리파크 포탈 위치 변경을 거부한다',()=>{
  const store=new RoomStore();
  expected.forEach(position=>{
    assert.equal(store.setPortalPosition({...position,x:position.x+100}),false);
    assert.deepEqual(store.portalPositions.get(`${position.mapId}:${position.destination}`),position);
  });
  assert.equal(store.setPortalPosition({mapId:'bear-tree-park',destination:'personal-farm',x:1500,z:1400}),false);
  assert.equal(store.portalPositions.has('bear-tree-park:personal-farm'),false);
});

test('React와 WIZ의 편집 UI·저장 API가 베어트리파크 포탈을 고정한다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const socketHandlers=read('../server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('../server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../../src/app/page.home/api.py');

  assert.doesNotMatch(page,/bear-tree-portal-place-at-player/);
  assert.match(page,/!\['bear-tree-park','personal-farm','campus','recruitment-center','project-room'\]\.includes\(currentMapId\)/);
  assert.match(renderer,/position\.mapId==='bear-tree-park'/);
  assert.match(socketHandlers,/position\.mapId==='bear-tree-park'/);
  assert.match(serverModel,/fixedBearTreePortals/);
  assert.match(wizApi,/key\[0\] in FROZEN_WORLD_PORTAL_MAPS or key in CANONICAL_WORLD_PORTAL_KEYS/);
  expected.forEach(({destination,x,z})=>{
    assert.match(wizApi,new RegExp(`\\("bear-tree-park", "${destination}", ${x}, ${z}\\)`));
  });
});

test('베어트리파크 먹이 미션은 복구하고 곰 체험소의 이전 조사 활동은 유지하지 않는다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('../src/game/GameCanvas.tsx');
  const guide=read('../src/components/NatureDiscoveryGuide.tsx');
  const shared=read('../shared/world-portals.ts');
  const serverModel=read('../server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../../src/app/page.home/api.py');
  const bearTreeOptions=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));

  assert.match(bearTreeOptions,/wildlifeClues:/);
  assert.match(bearTreeOptions,/feedSpotAnchors:/);
  assert.match(bearTreeOptions,/BEAR_FEED_SPOT_05/);
  assert.match(bearTreeOptions,/bearFeedingAnchor:/);
  assert.doesNotMatch(bearTreeOptions,/대표 곰 관찰|먹이 구역 곰 관찰|destination:'personal-farm'/);
  assert.doesNotMatch(shared,/mapId:'bear-tree-park',destination:'personal-farm'/);
  assert.doesNotMatch(wizApi,/\("bear-tree-park", "personal-farm"/);
  assert.match(serverModel,/worldPortalKeys\.has\(worldPortalKey\(position\)\)/);
  const bearLabOptions=renderer.slice(renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'),renderer.indexOf('const PERSONAL_FARM_COLLIDER_PREFIXES'));
  assert.doesNotMatch(bearLabOptions,/wildlifeClues|불곰 조사|반달가슴곰 조사/);
  assert.doesNotMatch(canvas,/BearHabitatDesignExperience|bear-(?:wildlife-progress|travel-style|habitat-decision)-changed/);
  assert.doesNotMatch(guide,/AI 생태 탐험|두 곰을 조사|loadBearHabitatProgress/);
  assert.doesNotMatch(renderer,/natureJourney='bear'/);
});

test('공간 안내와 맵 화면의 기존 연구소 명칭을 곰 체험소로 통일한다',()=>{
  const shared=read('../shared/world-portals.ts');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('../src/game/GameCanvas.tsx');
  const scene=read('../src/game/scenes/WorldScene.ts');
  const page=read('../src/pages/GamePage.tsx');
  const landing=read('../src/pages/LandingPage.tsx');
  const preview=read('../src/pages/MapPreviewPage.tsx');
  const harness=read('../src/services/experienceHarness.ts');
  const profile=read('../src/services/profileProgress.ts');

  [shared,renderer,canvas,scene,landing,preview,harness,profile].forEach(source=>{
    assert.match(source,/곰 체험소/);
    assert.doesNotMatch(source,/AI (?:탐험|생태) 연구소/);
  });
  assert.doesNotMatch(page,/AI (?:탐험|생태) 연구소|AI탐험 연구소|AI 탐험연구소|곰 놀이 공간/);
  assert.match(page,/normalizePlaceName=\(name:string\)=>name/);
  assert.match(page,/\['베어트리파크','곰 체험소','수목원'\]/);
});
