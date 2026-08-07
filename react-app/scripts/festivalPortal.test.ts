import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {RoomStore} from '../server/src/rooms/roomStore';
import {LAKE_PARK_PORTALS} from '../src/game/lakeParkPortals';
import {WORLD_GUIDE_PORTAL_POSITIONS} from '../src/game/worldGuideEntryPoints';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const fixedPosition={mapId:'festival-experience',destination:'town',x:1211,z:440} as const;

test('축제부스의 세종호수공원 귀환 포탈은 승인 좌표를 공용 기준으로 사용한다',()=>{
  const shared=WORLD_PORTAL_DEFAULTS.find(
    position=>position.mapId===fixedPosition.mapId&&position.destination===fixedPosition.destination,
  );
  assert.deepEqual(shared,fixedPosition);
  assert.deepEqual(WORLD_GUIDE_PORTAL_POSITIONS['festival-experience'],{x:1211,z:440});
});

test('실시간 메모리 저장소는 축제부스 귀환 포탈 변경을 거부한다',()=>{
  const store=new RoomStore();
  assert.equal(store.setPortalPosition({...fixedPosition,x:900,z:900}),false);
  assert.deepEqual(
    store.allPortalPositions().find(
      position=>position.mapId===fixedPosition.mapId&&position.destination===fixedPosition.destination,
    ),
    fixedPosition,
  );
});

test('축제부스 편집 UI와 모든 서버 저장 경로가 닫혀 있다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const experiences=read('../src/components/LakeParkExperiences.tsx');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const socketHandlers=read('../server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('../server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../../src/app/page.home/api.py');

  assert.match(page,/portalEditor=!\['town','personal-farm','garden','campus','arts-center','festival-experience','food-experience','club-street-festival','government-central-plaza','sejong-smart-city'\]\.includes\(currentMapId\)/);
  assert.doesNotMatch(experiences,/포탈 위치 편집/);
  assert.match(renderer,/position\.mapId==='festival-experience'/);
  assert.match(socketHandlers,/position\.mapId==='festival-experience'/);
  assert.match(serverModel,/fixedFestivalPortal/);
  assert.match(wizApi,/\("festival-experience", "town", 1211, 440\)/);
  assert.match(wizApi,/\("festival-experience", "town"\),/);
});

test('축제부스 카메라는 40% 가까워지고 호수공원 귀환 시 포탈 앞쪽에 도착한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const lakePortal=LAKE_PARK_PORTALS.find(position=>position.destination==='festival-experience');
  assert.ok(lakePortal);
  assert.deepEqual(lakePortal.arrivalDirection,{x:0,z:1});
  assert.equal(lakePortal.arrivalClearance,220);
  assert.equal(lakePortal.arrivalClearance>lakePortal.activationRadius,true);
  assert.deepEqual(
    {x:lakePortal.x+lakePortal.arrivalDirection.x*lakePortal.arrivalClearance,z:lakePortal.z+lakePortal.arrivalDirection.z*lakePortal.arrivalClearance},
    {x:1219,z:1682},
  );
  assert.match(renderer,/cameraDistance:FIXED_WORLD_CAMERA_PROFILES\['festival-experience'\]\.cameraDistance/);
  assert.match(renderer,/'arrivalDirection' in entrance/);
  assert.match(renderer,/'arrivalClearance' in entrance/);
});
