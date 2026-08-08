import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {RoomStore} from '../server/src/rooms/roomStore';
import {applyUnifiedWorldCamera,GOVERNMENT_NAVIGATION_PROFILE} from '../src/game/worldNavigationProfile';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const editableDestinations=['campus','government-central-plaza','government-observatory','sejong-smart-city'] as const;

test('정부청사 캐릭터는 대형 맵 비율에 맞춘 축소 높이를 사용한다',()=>{
  assert.deepEqual(GOVERNMENT_NAVIGATION_PROFILE,{characterHeight:78});
  assert.equal(applyUnifiedWorldCamera({},'government').characterHeight,78);
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
  assert.equal(options.match(/positionEditable:true/g)?.length,2);
  assert.match(options,/x:1900,z:1350,destination:'government-observatory'/);
  assert.match(options,/x:260,z:1190,destination:'sejong-smart-city'/);
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

test('정부청사 포탈 라벨은 E 키 안내 대신 3초 체류 안내를 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
  );
  ['government-central-plaza','government-observatory','sejong-smart-city'].forEach(destination=>{
    assert.match(options,new RegExp(`destination:'${destination}'[\\s\\S]{0,180}chargeSeconds:3`));
  });
  assert.doesNotMatch(options,/E\s+포탈 들어가기|E 버튼으로 포탈|포탈 들어가기/);
});

test('정부청사 이동 렌더링은 60fps와 안정적인 다중 지면 샘플링을 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
  );
  assert.match(options,/performanceFrameRate:60/);
  assert.match(options,/performancePixelRatio:\.9/);
  assert.match(options,/simplifiedCollision:false/);
  assert.match(options,/fastGroundSampling:false/);
  assert.match(options,/stableCharacterGrounding:true/);
  assert.match(options,/lowQualityFallback:\{maxTextureSize:512,performancePixelRatio:\.7,performanceFrameRate:30/);
});

test('정부청사 중앙광장은 고해상도 고정 렌더링을 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_OBSERVATORY_RENDERER_OPTIONS'),
  );
  assert.match(options,/adaptivePixelRatio:false/);
  assert.match(options,/antialias:true/);
  assert.match(options,/prioritizeGroundTextures:true/);
  assert.match(options,/maxTextureSize:2048/);
  assert.match(options,/performancePixelRatio:1\.2/);
  assert.match(options,/performanceFrameRate:45/);
});

test('AI 종합 분석은 최신 관심사·레이더·저장 항목을 매번 다시 조합한다',()=>{
  const profile=read('../src/services/aiSejongProfile.ts');
  assert.match(profile,/buildProfileProgress\(profile\)/);
  assert.match(profile,/liveRadar/);
  assert.match(profile,/savedEvidence/);
  assert.match(profile,/liveEvidence/);
});

test('공동캠퍼스 포탈 저장 중 오래된 좌표 응답을 적용하지 않는다',()=>{
  const canvas=read('../src/game/GameCanvas.tsx');
  assert.match(canvas,/pendingPortalSaveCount=0/);
  assert.match(canvas,/generation===portalSyncGeneration/);
  assert.match(canvas,/upsertPortalPosition\(latestPortalPositions,saved\)/);
  assert.doesNotMatch(canvas,/socket\.on\('portalPositionsUpdated'/);
  assert.doesNotMatch(canvas,/socket\.emit\('savePortalPosition'/);
});
