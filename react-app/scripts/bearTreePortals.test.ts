import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
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
const expectedGarden=[
  {mapId:'garden',destination:'bear-tree-park',x:1218,z:1585},
  {mapId:'garden',destination:'personal-farm',x:1196,z:258},
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

test('베어트리파크의 곰 체험소 포탈은 실제 GLB를 선로딩하고 수락될 때까지 이동을 재시도한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('../src/game/GameCanvas.tsx');
  const bearPlayZoneAsset=new URL('../src/assets/maps/park-landscape.glb',import.meta.url);
  const bearPlayZoneOptions=renderer.slice(
    renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'),
    renderer.indexOf('const PERSONAL_FARM_COLLIDER_PREFIXES'),
  );

  assert.ok(statSync(bearPlayZoneAsset).size>5_000_000);
  assert.match(renderer,/import bearPlayZoneModelUrl from '\.\.\/\.\.\/assets\/maps\/park-landscape\.glb\?url'/);
  assert.match(bearPlayZoneOptions,/modelUrl:bearPlayZoneModelUrl/);
  assert.match(renderer,/export const preloadBearPlayZoneDownload=/);
  assert.match(canvas,/mapId==='bear-tree-park'\?'bear-play-zone':'bear-tree-park'/);
  assert.match(canvas,/target==='bear-play-zone'\?preloadBearPlayZoneDownload:preloadBearTreeParkDownload/);
  assert.match(renderer,/private interactionTravelGate=new PortalTravelGate\(\)/);
  assert.match(renderer,/this\.interactionTravelGate\.update\(performance\.now\(\),chargeDuration,accept=>/);
  assert.match(renderer,/gameEvents\.emit\('travel-to-map',this\.options\.interaction!\.destination,accept\)/);
  assert.match(renderer,/if\(this\.options\.interaction\?\.destination===mapId\)this\.resetInteractionCharge\(\)/);
});

test('베어트리파크에서 수목원으로 이동하면 귀환 포탈에서 떨어진 안전 보행로에 도착한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const worldScene=read('../src/game/scenes/WorldScene.ts');
  const gardenOptions=renderer.slice(
    renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),
    renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'),
  );
  const arrival=worldPortalArrivalOverride('bear-tree-park','garden');

  assert.deepEqual(arrival,BEAR_TREE_TO_GARDEN_ARRIVAL);
  assert.deepEqual(arrival,{x:1200,z:1400,yaw:0});
  assert.ok(Math.hypot(arrival.x-WORLD_GUIDE_PORTAL_POSITIONS.garden.x,arrival.z-WORLD_GUIDE_PORTAL_POSITIONS.garden.z)>=140);
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

test('수목원 카메라는 세종호수공원 각도와 고정 내비게이션 프로필을 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'));

  assert.match(options,/perspectiveCamera:false/);
  assert.match(options,/cameraElevationDeg:LAKE_PARK_CAMERA_ELEVATION_DEG/);
  assert.match(options,/cameraDistance:GARDEN_NAVIGATION_PROFILE\.cameraDistance/);
  assert.match(options,/cameraZoom:GARDEN_NAVIGATION_PROFILE\.cameraZoom/);
  assert.match(options,/characterHeight:GARDEN_NAVIGATION_PROFILE\.characterHeight/);
  assert.doesNotMatch(options,/cameraFollowBounds|cameraTargetHeight|cameraFov/);
});

test('수목원 포탈 2개는 요청자가 확정한 공용 좌표를 사용하고 위치 편집을 허용하지 않는다',()=>{
  assert.deepEqual(WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='garden'),expectedGarden);
  assert.deepEqual(WORLD_GUIDE_PORTAL_POSITIONS.garden,{x:1218,z:1585});

  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const gardenOptions=renderer.slice(renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'));
  assert.match(gardenOptions,/x:1218,[\s\S]*?z:1585,[\s\S]*?destination:'bear-tree-park'/);
  assert.match(gardenOptions,/x:1196,[\s\S]*?z:258,[\s\S]*?destination:'personal-farm'/);
  assert.doesNotMatch(gardenOptions,/positionEditable:true/);
  assert.match(renderer,/position\.mapId==='campus'\|\|position\.mapId==='garden'/);
  assert.match(renderer,/!mapId\|\|mapId==='garden'\|\|!this\.getPortalDestinations/);

  const page=read('../src/pages/GamePage.tsx');
  const canvas=read('../src/game/GameCanvas.tsx');
  assert.match(page,/\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]/);
  assert.match(page,/\['town','personal-farm','garden','campus','arts-center'/);
  assert.match(canvas,/if\(activeMapId==='garden'\)return/);

  const store=new RoomStore();
  for(const position of expectedGarden){
    assert.equal(store.setPortalPosition({...position,x:position.x+100,z:position.z+100}),false);
    assert.deepEqual(store.portalPositions.get(`${position.mapId}:${position.destination}`),position);
  }

  const socketHandlers=read('../server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('../server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../../src/app/page.home/api.py');
  assert.match(socketHandlers,/position\.mapId==='campus'\|\|position\.mapId==='garden'/);
  assert.match(serverModel,/fixedGardenPortals/);
  assert.match(wizApi,/"garden",[\s\S]*?CANONICAL_WORLD_PORTAL_KEYS/);
  expectedGarden.forEach(({destination,x,z})=>{
    assert.match(wizApi,new RegExp(`\\("garden", "${destination}", ${x}, ${z}\\)`));
    assert.match(wizApi,new RegExp(`\\("garden", "${destination}"\\),`));
  });
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
  assert.match(page,/!\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]\.includes\(currentMapId\)/);
  assert.match(renderer,/position\.mapId==='bear-tree-park'/);
  assert.match(socketHandlers,/position\.mapId==='bear-tree-park'/);
  assert.match(serverModel,/fixedBearTreePortals/);
  assert.match(wizApi,/key\[0\] in FROZEN_WORLD_PORTAL_MAPS or key in CANONICAL_WORLD_PORTAL_KEYS/);
  expected.forEach(({destination,x,z})=>{
    assert.match(wizApi,new RegExp(`\\("bear-tree-park", "${destination}", ${x}, ${z}\\)`));
  });
});

test('먹이 미션은 베어트리파크에서 제거하고 곰 체험소로 이동한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('../src/game/GameCanvas.tsx');
  const guide=read('../src/components/NatureDiscoveryGuide.tsx');
  const shared=read('../shared/world-portals.ts');
  const serverModel=read('../server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../../src/app/page.home/api.py');
  const bearTreeOptions=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));

  assert.doesNotMatch(bearTreeOptions,/resident:|residentDecor:|wildlifeClues:|feedSpotAnchors:|bearFeedingAnchor:/);
  assert.doesNotMatch(bearTreeOptions,/대표 곰 관찰|먹이 구역 곰 관찰|destination:'personal-farm'/);
  assert.doesNotMatch(shared,/mapId:'bear-tree-park',destination:'personal-farm'/);
  assert.doesNotMatch(wizApi,/\("bear-tree-park", "personal-farm"/);
  assert.match(serverModel,/worldPortalKeys\.has\(worldPortalKey\(position\)\)/);
  const bearLabOptions=renderer.slice(renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'),renderer.indexOf('const PERSONAL_FARM_COLLIDER_PREFIXES'));
  assert.match(bearLabOptions,/modelUrl:bearModelUrl/);
  assert.match(bearLabOptions,/feedSpotAnchors:/);
  assert.match(bearLabOptions,/BEAR_FEED_SPOT_05/);
  assert.match(bearLabOptions,/bearFeedingAnchor:/);
  assert.match(bearLabOptions,/residentDecor:\[\{modelUrl:bearModelUrl/);
  assert.doesNotMatch(bearLabOptions,/bearCubModelUrl|grizzlyBearModelUrl|wildlifeClues|불곰 조사|반달가슴곰 조사/);
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
