import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {RoomStore} from '../server/src/rooms/roomStore';
import {applyUnifiedWorldCamera,GOVERNMENT_NAVIGATION_PROFILE} from '../src/game/worldNavigationProfile';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const editableDestinations=['campus','government-central-plaza','government-observatory','sejong-smart-city'] as const;

test('정부청사 캐릭터는 대형 맵 비율에 맞춘 축소 높이를 사용한다',()=>{
  assert.deepEqual(GOVERNMENT_NAVIGATION_PROFILE,{characterHeight:94});
  assert.equal(applyUnifiedWorldCamera({},'government').characterHeight,94);
});

test('정부청사는 정책 체험관을 제외하고 포탈 4개를 편집한다',()=>{
  const governmentPortals=WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='government');
  assert.deepEqual(
    governmentPortals.map(({destination})=>destination),
    editableDestinations,
  );
  assert.equal(governmentPortals.some(({destination})=>destination==='government-policy-hall'),false);

  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
  );
  assert.doesNotMatch(options,/government-policy-hall|정책 체험관/);
  assert.equal(options.match(/positionEditable:true/g)?.length,4);
});

test('정부청사 포탈 편집은 공동캠퍼스를 포함한 공용 포탈 4개를 허용한다',()=>{
  const store=new RoomStore();
  editableDestinations.forEach(destination=>{
    assert.equal(store.setPortalPosition({mapId:'government',destination,x:900,z:900}),true);
  });
  assert.equal(store.setPortalPosition({mapId:'government',destination:'government-policy-hall',x:900,z:900}),false);

  const page=read('../src/pages/GamePage.tsx');
  const api=read('../../src/app/page.home/api.py');
  const canonicalKeys=api.slice(api.indexOf('CANONICAL_WORLD_PORTAL_KEYS'),api.indexOf('FOOD_SOURCE_PREVIEW_HOSTS'));
  assert.doesNotMatch(page,/currentMapId==='government'&&destination==='campus'/);
  assert.doesNotMatch(api,/\("government", "government-policy-hall"/);
  assert.doesNotMatch(canonicalKeys,/\("government", "campus"\),/);
});

test('정부청사 이동 렌더링은 60fps와 단일 지면 샘플링을 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
  );
  assert.match(options,/performanceFrameRate:60/);
  assert.match(options,/performancePixelRatio:\.9/);
  assert.match(options,/simplifiedCollision:true/);
  assert.match(options,/fastGroundSampling:true/);
  assert.match(options,/lowQualityFallback:\{maxTextureSize:512,performancePixelRatio:\.7,performanceFrameRate:30/);
});

test('공동캠퍼스 포탈 저장 중 오래된 좌표 응답을 적용하지 않는다',()=>{
  const canvas=read('../src/game/GameCanvas.tsx');
  assert.match(canvas,/pendingPortalSaveCount=0/);
  assert.match(canvas,/generation===portalSyncGeneration/);
  assert.match(canvas,/upsertPortalPosition\(latestPortalPositions,saved\)/);
  assert.doesNotMatch(canvas,/socket\.on\('portalPositionsUpdated'/);
  assert.doesNotMatch(canvas,/socket\.emit\('savePortalPosition'/);
});
