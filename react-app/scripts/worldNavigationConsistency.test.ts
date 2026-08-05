import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyUnifiedWorldCamera,
  SEJONG_ARTS_CENTER_NAVIGATION_PROFILE,
  UNIFIED_WORLD_MAP_IDS,
  usesUnifiedWorldNavigation,
} from '../src/game/worldNavigationProfile';

test('공간 안내의 17개 맵이 하나의 예술의전당 이동 프로필을 사용한다',()=>{
  assert.equal(UNIFIED_WORLD_MAP_IDS.length,17);
  assert.equal(new Set(UNIFIED_WORLD_MAP_IDS).size,17);
  UNIFIED_WORLD_MAP_IDS.forEach(mapId=>assert.equal(usesUnifiedWorldNavigation(mapId),true));
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
