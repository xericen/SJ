import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {isWorldCameraProfile,WORLD_CAMERA_EDITOR_MAP_IDS,WORLD_CAMERA_PROFILE_LIMITS} from '../src/services/worldCameraProfiles';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const editor=read('../src/components/WorldCameraEditor.tsx');
const editorCss=read('../src/components/WorldCameraEditor.css');
const canvas=read('../src/game/GameCanvas.tsx');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const page=read('../src/pages/GamePage.tsx');
const api=read('../../src/app/page.home/api.py');
const cameraModel=read('../../src/model/db/world_camera_profiles.py');
const structModel=read('../../src/model/struct.py');

test('카메라 편집 대상은 공간 안내의 17개 맵으로 제한한다',()=>{
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.length,17);
  assert.equal(new Set(WORLD_CAMERA_EDITOR_MAP_IDS).size,17);
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.includes('personal-farm'),true);
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.includes('government-policy-hall' as never),false);
});

test('카메라 프로필은 안전한 조절 범위 안의 여섯 값을 요구한다',()=>{
  const valid={mapId:'town',characterHeight:120,cameraElevationDeg:32,cameraAzimuthDeg:0,cameraDistance:1100,cameraTargetHeight:70,cameraFov:46} as const;
  assert.equal(isWorldCameraProfile(valid),true);
  assert.equal(isWorldCameraProfile({...valid,cameraDistance:WORLD_CAMERA_PROFILE_LIMITS.cameraDistance.max+1}),false);
  assert.equal(isWorldCameraProfile({...valid,mapId:'college-street'}),false);
});

test('권한 사용자 편집 바는 모든 값을 실시간 미리보기하고 공용 저장한다',()=>{
  ['characterHeight','cameraElevationDeg','cameraAzimuthDeg','cameraDistance','cameraTargetHeight','cameraFov'].forEach(field=>assert.match(editor,new RegExp(`field:'${field}'`)));
  assert.match(editor,/canEdit\|\|!isWorldCameraEditorMap/);
  assert.match(editor,/world-camera-profile-preview/);
  assert.match(editor,/world-camera-editor-open-changed/);
  assert.match(editor,/saveSharedWorldCameraProfile/);
  assert.match(editor,/resetSharedWorldCameraProfile/);
  assert.match(page,/WorldCameraEditor mapId=\{currentMapId\} canEdit=\{canEditPortals\}/);
  assert.match(page,/currentMapId==='sejong-smart-city'&&canEditPortals/);
  assert.match(page,/currentMapId==='government-central-plaza'&&canEditPortals/);
  assert.equal((page.match(/운영자 포탈 편집/g)??[]).length,2);
  assert.match(editorCss,/position:fixed[^}]*top:14px/);
});

test('저장 전 조절값도 맵을 이동했다 돌아오면 세션에서 복원한다',()=>{
  assert.match(editor,/loadWorldCameraProfileDraft\(mapId\)/);
  assert.match(editor,/saveWorldCameraProfileDraft\(next\)/);
  assert.match(editor,/clearWorldCameraProfileDraft\(mapId\)/);
  assert.match(editor,/이동 전 조절값 유지 중/);
  assert.match(canvas,/loadWorldCameraProfileDraft\(mapId\)\?\?latestCameraProfiles\.get\(mapId\)/);
  assert.match(canvas,/loadWorldCameraProfileDraft\(mapId as MapId\)\?\?latestCameraProfiles\.get\(mapId as MapId\)/);
});

test('렌더러와 게임 캔버스는 저장값을 현재 맵에 즉시 반영한다',()=>{
  assert.match(renderer,/applyWorldCameraProfile\(profile:WorldCameraProfile\)/);
  assert.match(renderer,/this\.localCharacter\.setHeight\(profile\.characterHeight\)/);
  assert.match(renderer,/this\.cameraProfileOverride\?\.cameraDistance/);
  assert.match(renderer,/this\.cameraProfileOverride\?\.cameraElevationDeg/);
  assert.match(renderer,/this\.cameraProfileOverride\?\.cameraAzimuthDeg/);
  assert.match(renderer,/orthographicZoomForCameraDistance\(zoom,this\.authoredCameraProfile\.cameraDistance,this\.cameraProfileOverride\.cameraDistance\)/);
  assert.match(canvas,/loadSharedWorldCameraProfiles/);
  assert.match(canvas,/world-camera-profile-request/);
  assert.match(canvas,/world-camera-profile-reset/);
});

test('WIZ API는 편집 권한과 맵별 공용 카메라 저장소를 검증한다',()=>{
  assert.match(api,/WORLD_CAMERA_LAYOUT_ID = "shared-world-camera-profiles-v1"/);
  assert.match(api,/def camera_profiles\(payload=None\):/);
  assert.match(api,/worldCameraProfiles[\s\S]+return camera_profiles\(serialized_camera_payload\)/);
  assert.match(api,/editor = _world_portal_editor\(\)/);
  assert.match(api,/struct\.db\("world_camera_profiles"\)/);
  assert.match(cameraModel,/db_table = "world_camera_profiles"/);
  assert.match(structModel,/"world_camera_profiles"/);
  assert.match(api,/모든 사용자에게 적용되는 카메라 설정으로 저장했어요/);
});
