import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {RoomStore} from '../server/src/rooms/roomStore';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';

const root=resolve(import.meta.dirname,'..');
const read=(path:string)=>readFileSync(resolve(root,path),'utf8');
const expected=[
  {mapId:'campus',destination:'town',x:1120,z:1731},
  {mapId:'campus',destination:'student-hall',x:881,z:950},
  {mapId:'campus',destination:'club-street-festival',x:1537,z:499},
  {mapId:'campus',destination:'recruitment-center',x:817,z:1318},
  {mapId:'campus',destination:'project-room',x:1590,z:1543},
] as const;

test('공동캠퍼스 포탈 5개는 요청자가 확정한 공용 좌표를 사용한다',()=>{
  assert.deepEqual(WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='campus'),expected);
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  for(const position of expected.slice(1)){
    assert.match(renderer,new RegExp(`x:${position.x},z:${position.z}`));
  }
});

test('브라우저별 좌표와 위치 이동 UI를 사용하지 않는다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('src/game/GameCanvas.tsx');
  const page=read('src/pages/GamePage.tsx');
  assert.doesNotMatch(renderer,/campus-feature-portal-position-v1/);
  assert.doesNotMatch(canvas,/campus-feature-portal-place-at-player|saveCampusFeaturePortalPosition/);
  assert.doesNotMatch(page,/campus-portal-editors|campus-feature-portal-place-at-player/);
  assert.match(page,/\['bear-tree-park','personal-farm','campus'\]/);
});

test('클라이언트·서버 저장 우회도 공동캠퍼스 좌표를 변경하지 못한다',()=>{
  const store=new RoomStore();
  for(const position of expected){
    assert.equal(store.setPortalPosition({...position,x:position.x+100}),false);
  }
  assert.equal(store.setCampusFeaturePortalPosition({portal:'clubs',x:100,z:100}),false);
  assert.deepEqual(store.allCampusFeaturePortalPositions(),[
    {portal:'people',x:881,z:950},
    {portal:'clubs',x:1537,z:499},
    {portal:'recruit',x:817,z:1318},
    {portal:'government',x:1590,z:1543},
  ]);
  assert.match(read('server/src/socket/registerSocketHandlers.ts'),/position\.mapId==='town'\|\|position\.mapId==='campus'/);
  assert.match(read('../src/app/page.home/api.py'),/"campus",\n\s+"government"/);
});
