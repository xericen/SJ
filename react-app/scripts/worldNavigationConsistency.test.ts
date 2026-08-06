import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyUnifiedWorldCamera,
  AUTHORED_CAMERA_MAP_IDS,
  CAMPUS_NAVIGATION_PROFILE,
  PERSONAL_FARM_CAMERA_PROFILE,
  personalFarmCameraDistance,
  SEJONG_ARTS_CENTER_NAVIGATION_PROFILE,
  UNIFIED_WORLD_MAP_IDS,
  usesUnifiedWorldNavigation,
  WORLD_GUIDE_MAP_IDS,
} from '../src/game/worldNavigationProfile';

test('공간 안내 17개 중 호수공원과 베어트리파크는 지형 맞춤 카메라를 유지한다',()=>{
  assert.equal(WORLD_GUIDE_MAP_IDS.length,17);
  assert.equal(new Set(WORLD_GUIDE_MAP_IDS).size,17);
  assert.deepEqual(AUTHORED_CAMERA_MAP_IDS,['town','bear-tree-park']);
  assert.equal(UNIFIED_WORLD_MAP_IDS.length,15);
  UNIFIED_WORLD_MAP_IDS.forEach(mapId=>assert.equal(usesUnifiedWorldNavigation(mapId),true));
  assert.equal(usesUnifiedWorldNavigation('town'),false);
  assert.equal(usesUnifiedWorldNavigation('bear-tree-park'),false);
  assert.deepEqual(SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.character,{height:150});
  assert.deepEqual(SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.movement,{walkSpeed:180,runSpeed:280});
});

test('맵별 카메라 거리와 추적 제한을 예술의전당 기준으로 덮어쓴다',()=>{
  const options=applyUnifiedWorldCamera({
    perspectiveCamera:false,
    fixedCameraTarget:true,
    cameraElevationDeg:50,
    cameraDistance:1880,
    cameraHorizontalDistance:1600,
    cameraFov:39,
    cameraTargetHeight:120,
    cameraScreenOffsetY:140,
    cameraFollowBounds:{maxZ:1000},
    cameraDownScreenLimitZ:900,
    characterHeight:94,
  });
  assert.equal(options.perspectiveCamera,true);
  assert.equal(options.fixedCameraTarget,false);
  assert.equal(options.cameraElevationDeg,29);
  assert.equal(options.cameraDistance,1300);
  assert.equal(options.cameraFov,46);
  assert.equal(options.cameraTargetHeight,75);
  assert.equal(options.cameraScreenOffsetY,0);
  assert.equal(options.cameraHorizontalDistance,undefined);
  assert.equal(options.cameraFollowBounds,undefined);
  assert.equal(options.cameraDownScreenLimitZ,undefined);
  assert.equal(options.characterHeight,150);
});

test('마이홈 카메라는 야외와 실내 모두 기존보다 2/5 더 멀다',()=>{
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.distanceMultiplier,1.4);
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.outdoorDistance,Math.round(1300*1.4));
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.interiorDistance,Math.round(800*1.4));
  assert.equal(personalFarmCameraDistance(false),1820);
  assert.equal(personalFarmCameraDistance(true),1120);
  assert.equal(applyUnifiedWorldCamera({},'personal-farm').cameraDistance,1820);
});

test('공동캠퍼스는 넓은 맵에 맞춰 카메라를 넓히고 캐릭터 비율을 줄인다',()=>{
  assert.deepEqual(CAMPUS_NAVIGATION_PROFILE,{cameraDistance:1450,characterHeight:120});
  const options=applyUnifiedWorldCamera({},'campus');
  assert.equal(options.cameraDistance,1450);
  assert.equal(options.characterHeight,120);
});
