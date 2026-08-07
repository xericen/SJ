import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
const page=readFileSync(new URL('../src/pages/GamePage.tsx',import.meta.url),'utf8');
const sharedPortals=readFileSync(new URL('../shared/world-portals.ts',import.meta.url),'utf8');

test('스마트시티 정부청사 포탈은 승인 좌표에 고정하고 위치 편집을 제거한다',()=>{
  const options=renderer.slice(renderer.indexOf('export const SEJONG_SMART_CITY_RENDERER_OPTIONS'),renderer.indexOf('export const SEJONG_ARTS_CENTER_RENDERER_OPTIONS'));
  assert.match(options,/destination:'government'/);
  assert.match(sharedPortals,/mapId:'sejong-smart-city',destination:'government',x:1200,z:2680/);
  assert.match(options,/WORLD_GUIDE_PORTAL_POSITIONS\['sejong-smart-city'\]/);
  assert.match(options,/fixedPosition:true/);
  assert.match(options,/sharedPosition:false/);
  assert.doesNotMatch(options,/positionEditable:true/);
  assert.doesNotMatch(page,/currentMapId==='sejong-smart-city'.*primary-portal-place-at-player/);
  assert.doesNotMatch(page,/정부청사 포탈 이동/);
});

test('중앙광장 정부청사 포탈은 전용 로컬 편집 버튼만 사용한다',()=>{
  const options=renderer.slice(renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),renderer.indexOf('export const GOVERNMENT_OBSERVATORY_RENDERER_OPTIONS'));
  assert.match(options,/destination:'government'/);
  assert.match(options,/sharedPosition:false/);
  assert.match(options,/positionEditable:true/);
  assert.match(page,/currentMapId==='government-central-plaza'.*primary-portal-place-at-player/);
  assert.match(page,/portalEditor=!\[[^\]]*'government-central-plaza'[^\]]*'sejong-smart-city'/);
});

test('공용 좌표 동기화는 로컬 전용 포탈을 덮어쓰지 않는다',()=>{
  assert.match(renderer,/if\(sharedUpdate&&'sharedPosition' in config&&config\.sharedPosition===false\)return true/);
  assert.match(renderer,/setPortalPosition\(position:PortalPosition,sharedUpdate=true\)/);
  assert.match(renderer,/localStorage\.setItem\(`world-portal-position-\$\{this\.options\.mapName\}-\$\{config\.destination\}`/);
});
