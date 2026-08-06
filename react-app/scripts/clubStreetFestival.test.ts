import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {RoomStore} from '../server/src/rooms/roomStore.js';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals.js';
import {WORLD_GUIDE_PORTAL_POSITIONS} from '../src/game/worldGuideEntryPoints.js';

const root=resolve(import.meta.dirname,'..');
const read=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('동아리 거리제 공동캠퍼스 포탈은 요청자 좌표로 고정되고 편집 경로를 노출하지 않는다',()=>{
  const fixed={mapId:'club-street-festival',destination:'campus',x:1209,z:502} as const;
  assert.deepEqual(
    WORLD_PORTAL_DEFAULTS.find(position=>position.mapId===fixed.mapId&&position.destination===fixed.destination),
    fixed,
  );
  assert.deepEqual(WORLD_GUIDE_PORTAL_POSITIONS['club-street-festival'],{x:fixed.x,z:fixed.z});

  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const page=read('src/pages/GamePage.tsx');
  const portalConfig=renderer.split('\n').find(line=>line.includes("WORLD_GUIDE_PORTAL_POSITIONS['club-street-festival']"));

  assert.ok(portalConfig);
  assert.match(portalConfig,/fixedPosition:true,sharedPosition:false/);
  assert.doesNotMatch(portalConfig,/positionEditable:true/);
  assert.doesNotMatch(page,/currentMapId==='club-street-festival'&&canEditPortals/);
  assert.match(page,/portalEditor=!\[[^\]]*'club-street-festival'[^\]]*\]\.includes\(currentMapId\)/);

  const store=new RoomStore();
  assert.equal(store.setPortalPosition({...fixed,x:980,z:1420}),false);
  assert.deepEqual(
    store.allPortalPositions().find(item=>item.mapId===fixed.mapId&&item.destination===fixed.destination),
    fixed,
  );

  const socketHandlers=read('server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../src/app/page.home/api.py');
  assert.match(renderer,/position\.mapId==='club-street-festival'&&position\.destination==='campus'/);
  assert.match(socketHandlers,/position\.mapId==='club-street-festival'&&position\.destination==='campus'/);
  assert.match(serverModel,/fixedClubStreetPortal/);
  assert.match(wizApi,/\("club-street-festival", "campus", 1209, 502\)/);
  assert.match(wizApi,/\("club-street-festival", "campus"\),/);
});

test('동아리 창설 부스는 남쪽 입구의 맨 앞 부스에 고정한다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const order=renderer.match(/const CLUB_STREET_BOOTH_ANCHORS_FRONT_TO_BACK=\[([\s\S]*?)\] as const;/)?.[1]??'';

  assert.match(order,/ClubBooth_L5_CanvasRoof/);
  assert.ok(order.indexOf('ClubBooth_L5_CanvasRoof')<order.indexOf('ClubBooth_L4_CanvasRoof'));
  assert.ok(order.indexOf('ClubBooth_L4_CanvasRoof')<order.indexOf('ClubBooth_L1_CanvasRoof'));
  assert.doesNotMatch(renderer,/clubBoothCardAnchors\.sort\([\s\S]*portalRoot/);
});
