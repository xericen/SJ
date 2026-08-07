import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {DEFAULT_BEAR_PHOTO_PORTAL_POSITION} from '../src/game/bearPhotoZonePosition';
import {RoomStore} from '../server/src/rooms/roomStore';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('포토존은 요청자가 확정한 공용 좌표를 사용한다',()=>{
  assert.deepEqual(DEFAULT_BEAR_PHOTO_PORTAL_POSITION,{x:1478,z:1479});
  assert.deepEqual(new RoomStore().bearTreePortalPositions.photo,{x:1478,z:1479});
});

test('베어트리파크 포토존 위치 변경 UI와 로컬 저장을 제거한다',()=>{
  const page=readFileSync(new URL('../src/pages/GamePage.tsx',import.meta.url),'utf8');
  const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  assert.doesNotMatch(page,/bear-photo-zone-place-at-player|포토존 위치 편집|bear-photo-position-editor/);
  assert.doesNotMatch(renderer,/bear-photo-zone-place-at-player|loadBearPhotoPortalPosition|saveBearPhotoPortalPosition/);
  assert.match(renderer,/bearPhotoPortalPosition:\{x:number;z:number\}=\{\.\.\.DEFAULT_BEAR_PHOTO_PORTAL_POSITION\}/);
});

test('베어트리파크 곰은 제거하고 곰 체험소는 업로드한 곰 두 마리를 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const bearTree=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));
  const bearLab=renderer.slice(renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'),renderer.indexOf('const PERSONAL_FARM_COLLIDER_PREFIXES'));
  assert.doesNotMatch(bearTree,/resident:|residentDecor:/);
  assert.match(bearLab,/resident:\{modelUrl:bearModelUrl/);
  assert.match(bearLab,/residentDecor:\[\{modelUrl:bearModelUrl/);
  assert.doesNotMatch(bearLab,/bearCubModelUrl|grizzlyBearModelUrl/);
});
