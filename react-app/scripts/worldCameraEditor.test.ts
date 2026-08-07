import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {FIXED_WORLD_CAMERA_MAP_IDS,FIXED_WORLD_CAMERA_PROFILES} from '../src/game/fixedWorldCameraProfiles';
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

test('카메라 편집 대상에서 고정 완료된 열 맵을 제외한다',()=>{
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.length,7);
  assert.equal(new Set(WORLD_CAMERA_EDITOR_MAP_IDS).size,7);
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.includes('personal-farm'),true);
  assert.deepEqual([...FIXED_WORLD_CAMERA_MAP_IDS].sort(),['arts-center','campus','club-street-festival','festival-experience','food-experience','government','project-room','recruitment-center','sejong-smart-city','student-hall']);
  FIXED_WORLD_CAMERA_MAP_IDS.forEach(mapId=>assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.includes(mapId),false));
  assert.equal(WORLD_CAMERA_EDITOR_MAP_IDS.includes('government-policy-hall' as never),false);
});

test('세 체험 맵은 운영 편집기에서 마지막으로 저장한 카메라 값을 소스에 고정한다',()=>{
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['arts-center'],{mapId:'arts-center',characterHeight:142,cameraElevationDeg:30,cameraAzimuthDeg:180,cameraDistance:1410,cameraTargetHeight:95,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['food-experience'],{mapId:'food-experience',characterHeight:134,cameraElevationDeg:34,cameraAzimuthDeg:180,cameraDistance:1290,cameraTargetHeight:110,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['festival-experience'],{mapId:'festival-experience',characterHeight:120,cameraElevationDeg:30,cameraAzimuthDeg:180,cameraDistance:930,cameraTargetHeight:90,cameraFov:46});
  (['arts-center','food-experience','festival-experience'] as const).forEach(mapId=>{
    assert.match(renderer,new RegExp(`cameraDistance:FIXED_WORLD_CAMERA_PROFILES\\['${mapId}'\\]\\.cameraDistance`));
    assert.match(renderer,new RegExp(`characterHeight:FIXED_WORLD_CAMERA_PROFILES\\['${mapId}'\\]\\.characterHeight`));
  });
});

test('추가 일곱 맵은 운영 저장값과 현재 적용값을 고정 프로필로 사용한다',()=>{
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES.campus,{mapId:'campus',characterHeight:72,cameraElevationDeg:27,cameraAzimuthDeg:-1,cameraDistance:780,cameraTargetHeight:50,cameraFov:40});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['project-room'],{mapId:'project-room',characterHeight:150,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['recruitment-center'],{mapId:'recruitment-center',characterHeight:142,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['student-hall'],{mapId:'student-hall',characterHeight:138,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['club-street-festival'],{mapId:'club-street-festival',characterHeight:150,cameraElevationDeg:34,cameraAzimuthDeg:180,cameraDistance:1750,cameraTargetHeight:75,cameraFov:46});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES.government,{mapId:'government',characterHeight:65,cameraElevationDeg:27,cameraAzimuthDeg:18,cameraDistance:770,cameraTargetHeight:55,cameraFov:47});
  assert.deepEqual(FIXED_WORLD_CAMERA_PROFILES['sejong-smart-city'],{mapId:'sejong-smart-city',characterHeight:136,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1290,cameraTargetHeight:75,cameraFov:46});
  assert.match(canvas,/fixedWorldCameraProfileFor\(initialMapId\)\?\?loadWorldCameraProfileDraft/);
  assert.match(canvas,/fixedWorldCameraProfileFor\(mapId\)\?\?loadWorldCameraProfileDraft/);
  assert.match(canvas,/if\(isFixedWorldCameraMap\(cameraProfile\.mapId\)\)return/);
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
  assert.match(editor,/7개 맵 개별 설정/);
  assert.match(editor,/world-camera-editor-open-changed/);
  assert.match(editor,/saveSharedWorldCameraProfile/);
  assert.match(editor,/resetSharedWorldCameraProfile/);
  assert.match(page,/WorldCameraEditor mapId=\{currentMapId\} canEdit=\{canEditPortals\}/);
  assert.doesNotMatch(page,/currentMapId==='sejong-smart-city'&&canEditPortals/);
  assert.match(page,/currentMapId==='government-central-plaza'&&canEditPortals/);
  assert.equal((page.match(/운영자 포탈 편집/g)??[]).length,1);
  assert.match(editorCss,/position:fixed[^}]*top:14px/);
});

test('저장 전 조절값도 맵을 이동했다 돌아오면 세션에서 복원한다',()=>{
  assert.match(editor,/loadWorldCameraProfileDraft\(mapId\)/);
  assert.match(editor,/saveWorldCameraProfileDraft\(next\)/);
  assert.match(editor,/clearWorldCameraProfileDraft\(mapId\)/);
  assert.match(editor,/이동 전 조절값 유지 중/);
  assert.match(canvas,/loadWorldCameraProfileDraft\(mapId\)\?\?latestCameraProfiles\.get\(mapId\)/);
  assert.match(canvas,/fixedWorldCameraProfileFor\(typedMapId\)\?\?loadWorldCameraProfileDraft\(typedMapId\)\?\?latestCameraProfiles\.get\(typedMapId\)/);
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
