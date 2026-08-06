import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {RoomStore} from '../server/src/rooms/roomStore';
import {applyUnifiedWorldCamera,GOVERNMENT_NAVIGATION_PROFILE} from '../src/game/worldNavigationProfile';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const editableDestinations=['government-central-plaza','government-observatory','sejong-smart-city'] as const;

test('정부청사 캐릭터는 대형 맵 비율에 맞춘 축소 높이를 사용한다',()=>{
  assert.deepEqual(GOVERNMENT_NAVIGATION_PROFILE,{characterHeight:94});
  assert.equal(applyUnifiedWorldCamera({},'government').characterHeight,94);
});

test('정부청사는 정책 체험관을 제외하고 포탈 3개만 편집한다',()=>{
  const governmentPortals=WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='government');
  assert.deepEqual(
    governmentPortals.map(({destination})=>destination),
    ['campus',...editableDestinations],
  );
  assert.equal(governmentPortals.some(({destination})=>destination==='government-policy-hall'),false);

  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const options=renderer.slice(
    renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),
    renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'),
  );
  assert.doesNotMatch(options,/government-policy-hall|정책 체험관/);
  assert.equal(options.match(/positionEditable:true/g)?.length,3);
});

test('정부청사 포탈 편집은 3개 공용 포탈만 허용하고 캠퍼스 귀환은 고정한다',()=>{
  const store=new RoomStore();
  editableDestinations.forEach(destination=>{
    assert.equal(store.setPortalPosition({mapId:'government',destination,x:900,z:900}),true);
  });
  assert.equal(store.setPortalPosition({mapId:'government',destination:'campus',x:900,z:900}),false);
  assert.equal(store.setPortalPosition({mapId:'government',destination:'government-policy-hall',x:900,z:900}),false);

  const page=read('../src/pages/GamePage.tsx');
  const api=read('../../src/app/page.home/api.py');
  assert.match(page,/currentMapId==='government'&&destination==='campus'/);
  assert.doesNotMatch(api,/\("government", "government-policy-hall"/);
  assert.match(api,/\("government", "campus"\),/);
});
