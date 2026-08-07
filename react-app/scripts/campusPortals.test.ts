import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {RoomStore} from '../server/src/rooms/roomStore';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';
import {CAMPUS_FEATURE_PORTALS} from '../src/game/campusFeaturePortals';
import {WORLD_GUIDE_PORTAL_POSITIONS} from '../src/game/worldGuideEntryPoints';
import {CAMPUS_TO_PROJECT_ROOM_ARRIVAL,worldPortalArrivalOverride} from '../src/game/worldPortalArrivals';
import {isPortalChargePositionHeld,PortalTravelGate} from '../src/game/portalTravelGate';
import {CAMPUS_PORTAL_VISUAL_SCALE,portalVisualScaleForMap} from '../src/game/campusPortalVisual';

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
  assert.deepEqual(WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='campus'&&position.destination!=='government'),expected);
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  for(const position of expected.slice(1)){
    const portal=CAMPUS_FEATURE_PORTALS.find(item=>item.destination===position.destination);
    assert.deepEqual(portal&&{x:portal.x,z:portal.z},{x:position.x,z:position.z});
  }
  assert.match(renderer,/campusFeaturePortals:CAMPUS_FEATURE_PORTALS\.map/);
});

test('공동캠퍼스 건물 포탈 4개는 범위 안에서 3초를 유지해야 이동한다',()=>{
  assert.equal(CAMPUS_FEATURE_PORTALS.length,4);
  for(const portal of CAMPUS_FEATURE_PORTALS){
    assert.equal(portal.chargeSeconds,3);
    assert.equal(portal.activationRadius,140);
    const gate=new PortalTravelGate();
    let requests=0;
    const request=()=>{requests+=1};
    assert.equal(gate.update(0,portal.chargeSeconds,request).progress,0);
    assert.equal(gate.update(2500,portal.chargeSeconds,request).progress,5/6);
    assert.equal(isPortalChargePositionHeld(portal.activationRadius,portal.activationRadius),false);
    gate.reset();
    assert.equal(gate.update(2600,portal.chargeSeconds,request).progress,0);
    assert.equal(gate.update(5599,portal.chargeSeconds,request).progress,2999/3000);
    assert.equal(requests,0);
    assert.equal(gate.update(5600,portal.chargeSeconds,request).progress,1);
    assert.equal(requests,1);
  }
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  assert.match(renderer,/\.\.\.\(this\.options\.campusFeaturePortals\?\?\[\]\),/);
  assert.doesNotMatch(renderer,/this\.options\.mapName==='공동캠퍼스'[\s\S]{0,160}travel-to-map/);
});

test('공동캠퍼스의 clubs 포탈 명칭은 동아리 거리제다',()=>{
  assert.equal(CAMPUS_FEATURE_PORTALS.find(portal=>portal.id==='clubs')?.label,'동아리 거리제');
  assert.doesNotMatch(read('src/game/campusFeaturePortals.ts'),/동아리관/);
});

test('공동캠퍼스 포탈 6개와 이름표는 이동 범위를 유지한 채 2/3 크기로 표시한다',()=>{
  assert.equal(CAMPUS_PORTAL_VISUAL_SCALE,2/3);
  assert.equal(portalVisualScaleForMap('공동캠퍼스'),2/3);
  assert.equal(portalVisualScaleForMap('모집센터'),1);
  assert.equal(WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='campus').length,6);

  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  assert.match(renderer,/const visualScale=portalVisualScaleForMap\(this\.options\.mapName\)/);
  assert.match(renderer,/root\.userData\.visualScale=visualScale/);
  assert.match(renderer,/root\.scale\.setScalar\(visualScale\*\(1\+Math\.sin/);
  assert.match(renderer,/root\.add\(label\);root\.userData\.label=label/);
  CAMPUS_FEATURE_PORTALS.forEach(portal=>assert.equal(portal.activationRadius,140));
});

test('학생회관 AI 추천 트리는 원형 소파 앞에서도 E 안내를 노출한다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  assert.match(renderer,/const STUDENT_HALL_AI_TREE_OPEN_DISTANCE=190;/);
  assert.match(renderer,/id:'people'[\s\S]{0,160}radius:STUDENT_HALL_AI_TREE_OPEN_DISTANCE[\s\S]{0,120}label:'AI 추천 트리'/);
});

test('기존 공동캠퍼스 포탈 5개는 브라우저별 좌표와 위치 이동 UI를 사용하지 않는다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const canvas=read('src/game/GameCanvas.tsx');
  const page=read('src/pages/GamePage.tsx');
  assert.doesNotMatch(renderer,/campus-feature-portal-position-v1/);
  assert.doesNotMatch(canvas,/campus-feature-portal-place-at-player|saveCampusFeaturePortalPosition/);
  assert.doesNotMatch(page,/campus-portal-editors|campus-feature-portal-place-at-player/);
  assert.match(page,/\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]/);
});

test('클라이언트·서버 저장 우회도 공동캠퍼스 좌표를 변경하지 못한다',()=>{
  const store=new RoomStore();
  for(const position of expected){
    assert.equal(store.setPortalPosition({...position,x:position.x+100}),false);
  }
  assert.equal(store.setPortalPosition({mapId:'campus',destination:'government',x:1300,z:1250}),false);
  assert.equal(store.setCampusFeaturePortalPosition({portal:'clubs',x:100,z:100}),false);
  assert.deepEqual(store.allCampusFeaturePortalPositions(),[
    {portal:'people',x:881,z:950},
    {portal:'clubs',x:1537,z:499},
    {portal:'recruit',x:817,z:1318},
    {portal:'government',x:1590,z:1543},
  ]);
  assert.doesNotMatch(read('server/src/socket/registerSocketHandlers.ts'),/editableCampusGovernment/);
  const wizApi=read('../src/app/page.home/api.py');
  const frozenMaps=wizApi.slice(wizApi.indexOf('FROZEN_WORLD_PORTAL_MAPS'),wizApi.indexOf('CANONICAL_WORLD_PORTAL_KEYS'));
  assert.match(frozenMaps,/"campus",/);
  assert.doesNotMatch(frozenMaps,/"government",/);
  assert.doesNotMatch(wizApi.slice(wizApi.indexOf('CANONICAL_WORLD_PORTAL_KEYS'),wizApi.indexOf('FOOD_SOURCE_PREVIEW_HOSTS')),/\("government", "campus"\),/);
});

test('공동캠퍼스 정부청사 포탈은 요청자가 확정한 공용 좌표로 고정하고 편집 버튼을 제거한다',()=>{
  const fixed={mapId:'campus',destination:'government',x:368,z:899} as const;
  assert.deepEqual(
    WORLD_PORTAL_DEFAULTS.find(position=>position.mapId===fixed.mapId&&position.destination===fixed.destination),
    fixed,
  );

  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const campusOptions=renderer.slice(renderer.indexOf('export const CAMPUS_RENDERER_OPTIONS'),renderer.indexOf('export const CLUB_STREET_FESTIVAL_RENDERER_OPTIONS'));
  assert.match(campusOptions,/x:368,z:899,destination:'government',label:'정부청사'/);
  assert.match(campusOptions,/fixedPosition:true,sharedPosition:false/);
  assert.doesNotMatch(campusOptions,/positionEditable:true/);
  assert.doesNotMatch(renderer,/editableCampusGovernment/);

  const page=read('src/pages/GamePage.tsx');
  assert.doesNotMatch(page,/currentMapId==='campus'\?destination==='government'/);
  assert.match(page,/!\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]\.includes\(currentMapId\)/);
  assert.match(page,/!\['town','personal-farm','garden','campus','arts-center'/);

  const store=new RoomStore();
  assert.equal(store.setPortalPosition({...fixed,x:1320,z:1180}),false);
  assert.deepEqual(store.portalPositions.get('campus:government'),fixed);

  const serverModel=read('server/src/models/WorldPortalPosition.ts');
  const socketHandlers=read('server/src/socket/registerSocketHandlers.ts');
  const wizApi=read('../src/app/page.home/api.py');
  assert.match(serverModel,/fixedCampusPortals=WORLD_PORTAL_DEFAULTS\.filter\(position=>position\.mapId==='campus'\)/);
  assert.match(socketHandlers,/position\.mapId==='town'\|\|position\.mapId==='campus'/);
  assert.match(wizApi,/\("campus", "government", 368, 899\)/);
  const canonicalKeys=wizApi.slice(wizApi.indexOf('CANONICAL_WORLD_PORTAL_KEYS'),wizApi.indexOf('FOOD_SOURCE_PREVIEW_HOSTS'));
  assert.match(canonicalKeys,/\("campus", "government"\),/);
});

test('정부청사 전체 포탈은 E 버튼 없이 3초 체류로 이동한다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const government=renderer.slice(renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'),renderer.indexOf('export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS'));
  ['campus','government-central-plaza','government-observatory','sejong-smart-city'].forEach(destination=>{
    assert.match(government,new RegExp(`destination:'${destination}'[\\s\\S]{0,180}chargeSeconds:3`));
  });
  assert.doesNotMatch(government,/chargeSeconds:undefined/);
  assert.match(renderer,/activePortal\?\.chargeSeconds/);
  assert.match(renderer,/this\.portalTravelGate\.update\(performance\.now\(\),activePortal\.chargeSeconds/);
});

test('모집센터 공동캠퍼스 귀환 포탈은 요청자 좌표로 고정되고 편집 경로를 노출하지 않는다',()=>{
  const fixed={mapId:'recruitment-center',destination:'campus',x:1200,z:2014} as const;
  assert.deepEqual(
    WORLD_PORTAL_DEFAULTS.find(position=>position.mapId===fixed.mapId&&position.destination===fixed.destination),
    fixed,
  );
  assert.deepEqual(WORLD_GUIDE_PORTAL_POSITIONS['recruitment-center'],{x:fixed.x,z:fixed.z});

  const page=read('src/pages/GamePage.tsx');
  assert.match(page,/\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]/);
  assert.doesNotMatch(page,/currentMapId==='recruitment-center'.*portal-position-editor/);

  const store=new RoomStore();
  assert.equal(store.setPortalPosition({...fixed,x:980,z:1420}),false);
  assert.deepEqual(
    store.allPortalPositions().find(item=>item.mapId===fixed.mapId&&item.destination===fixed.destination),
    fixed,
  );

  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const socketHandlers=read('server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../src/app/page.home/api.py');
  assert.match(renderer,/position\.mapId==='recruitment-center'&&position\.destination==='campus'/);
  assert.match(socketHandlers,/position\.mapId==='recruitment-center'&&position\.destination==='campus'/);
  assert.match(serverModel,/fixedRecruitmentCenterPortal/);
  assert.match(wizApi,/\("recruitment-center", "campus", 1200, 2014\)/);
  assert.match(wizApi,/\("recruitment-center", "campus"\),/);
});

test('프로젝트실 전광판 HTML은 실제 보드의 긴 축을 가로로 유지하고 카메라 확대로 표시된다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const board=read('src/components/ProjectLobbyBoard.tsx');
  const zoomCss=read('src/components/ProjectLobbyBoardZoom.css');
  assert.doesNotMatch(renderer,/Project_Lobby_Board_Upright/);
  assert.match(board,/BOARD_SURFACE_WIDTH=1541,BOARD_SURFACE_HEIGHT=1000/);
  assert.match(board,/perspectiveMatrix/);
  assert.match(board,/matrix3d/);
  assert.match(renderer,/projectedMeshScreenQuad\(this\.projectLobbyBoardScreen,true\)/);
  assert.match(renderer,/preserveLandscapeAxis&&thinAxis==='x'/);
  assert.match(board,/style=\{projectedBoardStyle\(rect\)\}/);
  assert.match(zoomCss,/background: transparent/);
  assert.doesNotMatch(zoomCss,/92vw|92vh|rgba\(3, 10, 9, 0\.88\)/);
});

test('공동캠퍼스에서 프로젝트실로 들어오면 안전한 로비 좌표에 도착한다',()=>{
  assert.deepEqual(worldPortalArrivalOverride('campus','project-room'),CAMPUS_TO_PROJECT_ROOM_ARRIVAL);
  assert.deepEqual(CAMPUS_TO_PROJECT_ROOM_ARRIVAL,{x:1220,z:1690,yaw:Math.PI});
  const returnPortal=WORLD_PORTAL_DEFAULTS.find(position=>position.mapId==='project-room'&&position.destination==='campus');
  assert.ok(returnPortal);
  assert.ok(Math.hypot(CAMPUS_TO_PROJECT_ROOM_ARRIVAL.x-returnPortal.x,CAMPUS_TO_PROJECT_ROOM_ARRIVAL.z-returnPortal.z)>=300);
});

test('프로젝트실 공동캠퍼스 포탈은 요청자 좌표로 고정되고 편집 버튼을 노출하지 않는다',()=>{
  const fixed={mapId:'project-room',destination:'campus',x:1220,z:2050} as const;
  assert.deepEqual(
    WORLD_PORTAL_DEFAULTS.find(position=>position.mapId===fixed.mapId&&position.destination===fixed.destination),
    fixed,
  );
  assert.deepEqual(WORLD_GUIDE_PORTAL_POSITIONS['project-room'],{x:fixed.x,z:fixed.z});
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const projectRoom=renderer.slice(renderer.indexOf('export const PROJECT_ROOM_RENDERER_OPTIONS'),renderer.indexOf('export const GOVERNMENT_RENDERER_OPTIONS'));
  assert.match(projectRoom,/destination:'campus'[\s\S]*chargeSeconds:3[\s\S]*activationRadius:140/);
  assert.match(projectRoom,/label:'공동캠퍼스로 돌아가기'/);

  const store=new RoomStore();
  assert.equal(store.setPortalPosition({...fixed,x:1500,z:1800}),false);
  assert.deepEqual(
    store.allPortalPositions().find(item=>item.mapId===fixed.mapId&&item.destination===fixed.destination),
    fixed,
  );

  const page=read('src/pages/GamePage.tsx');
  const socketHandlers=read('server/src/socket/registerSocketHandlers.ts');
  const serverModel=read('server/src/models/WorldPortalPosition.ts');
  const wizApi=read('../src/app/page.home/api.py');
  assert.match(page,/\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]/);
  assert.match(renderer,/position\.mapId==='project-room'&&position\.destination==='campus'/);
  assert.match(socketHandlers,/position\.mapId==='project-room'&&position\.destination==='campus'/);
  assert.match(serverModel,/fixedProjectRoomPortal/);
  assert.match(wizApi,/\("project-room", "campus", 1220, 2050\)/);
  assert.match(wizApi,/\("project-room", "campus"\),/);
});
