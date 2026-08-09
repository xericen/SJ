import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {LAKE_PARK_PORTALS} from '../src/game/lakeParkPortals';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const page=read('../src/pages/GamePage.tsx');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const api=read('../../src/app/page.home/api.py');
const app=read('../src/App.tsx');
const portalService=read('../src/services/worldPortalPositions.ts');
const cameraService=read('../src/services/worldCameraProfiles.ts');

test('세종호수공원 5개 포탈은 저장된 위치를 계속 적용할 수 있다',()=>{
  assert.equal(LAKE_PARK_PORTALS.length,5);
  LAKE_PARK_PORTALS.forEach(portal=>{
    assert.equal(portal.fixedPosition,false);
    assert.equal(portal.sharedPosition,true);
    assert.equal(portal.positionEditable,true);
  });
  assert.match(page,/naturalLayoutLocked=currentMapId==='town'\|\|currentMapId==='bear-tree-park'/);
  assert.match(page,/portalEditor=!naturalLayoutLocked/);
  const frozenMaps=api.slice(api.indexOf('FROZEN_WORLD_PORTAL_MAPS'),api.indexOf('CANONICAL_WORLD_PORTAL_KEYS'));
  assert.doesNotMatch(frozenMaps,/"town"/);
});

test('체험 세션에서 정한 위치와 카메라 값을 고정 저장소로 승격한다',()=>{
  assert.match(app,/experienceMode=\{experienceMode === 'local' \? 'local' : 'social'\}/);
  assert.match(page,/useState\(experienceMode==='local'\)/);
  assert.match(page,/experienceMode==='local'\|\|state\.canEdit/);
  assert.match(portalService,/jochiwon-fixed-world-portal-positions-v1/);
  assert.match(portalService,/sessionPositions\.length/);
  assert.match(cameraService,/jochiwon-fixed-world-camera-profiles-v1/);
  assert.match(cameraService,/sessionProfiles\.length/);
  assert.match(portalService,/resource:'promoteNaturalPortalsV2'/);
  assert.match(api,/NATURAL_PORTAL_LOCK_ID = "shared-natural-portals-lock-v1"/);
  assert.match(api,/routed_payload\.get\("resource"\) in \("promoteNaturalPortals", "promoteNaturalPortalsV2"\)/);
});

test('공용 DB로 승격한 자연 맵 좌표를 기본 좌표로 덮어쓰지 않는다',()=>{
  assert.match(api,/key not in CANONICAL_WORLD_PORTAL_KEYS or key\[0\] in \("town", "bear-tree-park"\)/);
  assert.match(api,/promoteNaturalPortalsV2/);
  assert.match(api,/NATURAL_PORTAL_CORRECTION_LOCK_ID/);
});

test('베어트리파크 3개 포탈은 저장 위치를 적용하되 두 자연 맵의 조절 바는 숨긴다',()=>{
  assert.match(renderer,/mapName:'베어트리파크'[\s\S]*?destination:'town'[\s\S]*?sharedPosition:true/);
  assert.match(renderer,/destination:'garden'[\s\S]*?sharedPosition:true/);
  assert.match(renderer,/destination:'bear-play-zone'[\s\S]*?positionEditable:true/);
  assert.match(page,/layoutCanEdit=canEditPortals&&!naturalLayoutLocked/);
  assert.match(page,/WorldCameraEditor mapId=\{currentMapId\} canEdit=\{layoutCanEdit\}/);
});

test('두 자연 맵의 포탈 제목은 1.5배이고 추천 코스 게시판은 월드에서 제거된다',()=>{
  assert.match(renderer,/requestedTitleScale=\['세종호수공원','베어트리파크'\]\.includes\(this\.options\.mapName\)\?1\.5:1/);
  assert.match(renderer,/세종예술의전당[\s\S]*?축제부스/);
  const lakeOptions=renderer.slice(renderer.indexOf('export const LAKE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'));
  assert.doesNotMatch(lakeOptions,/세종 추천 코스 게시판|lakeExperiences/);
});
