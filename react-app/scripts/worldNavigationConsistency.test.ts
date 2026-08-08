import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyUnifiedWorldCamera,
  AUTHORED_CAMERA_MAP_IDS,
  BEAR_TREE_NAVIGATION_PROFILE,
  CAMPUS_NAVIGATION_PROFILE,
  GARDEN_NAVIGATION_PROFILE,
  PERSONAL_FARM_CAMERA_PROFILE,
  personalFarmCameraDistance,
  SEJONG_ARTS_CENTER_NAVIGATION_PROFILE,
  UNIFIED_WORLD_MAP_IDS,
  usesUnifiedWorldNavigation,
  WORLD_GUIDE_MAP_IDS,
} from '../src/game/worldNavigationProfile';

test('공간 안내 17개 중 호수공원·수목원과 고정 완료된 세 체험 맵은 지형 맞춤 카메라를 유지한다',()=>{
  assert.equal(WORLD_GUIDE_MAP_IDS.length,17);
  assert.equal(new Set(WORLD_GUIDE_MAP_IDS).size,17);
  assert.deepEqual(AUTHORED_CAMERA_MAP_IDS,['town','garden','arts-center','festival-experience','food-experience']);
  assert.equal(UNIFIED_WORLD_MAP_IDS.length,12);
  UNIFIED_WORLD_MAP_IDS.forEach(mapId=>assert.equal(usesUnifiedWorldNavigation(mapId),true));
  assert.equal(usesUnifiedWorldNavigation('town'),false);
  assert.equal(usesUnifiedWorldNavigation('bear-tree-park'),true);
  assert.equal(usesUnifiedWorldNavigation('garden'),false);
  assert.equal(usesUnifiedWorldNavigation('arts-center'),false);
  assert.equal(usesUnifiedWorldNavigation('festival-experience'),false);
  assert.equal(usesUnifiedWorldNavigation('food-experience'),false);
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
    characterHeight:78,
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

test('마이홈 카메라는 야외 1820과 이후 확대한 실내 1400 거리를 유지한다',()=>{
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.distanceMultiplier,1.4);
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.outdoorDistance,Math.round(1300*1.4));
  assert.equal(PERSONAL_FARM_CAMERA_PROFILE.interiorDistance,1400);
  assert.equal(personalFarmCameraDistance(false),1820);
  assert.equal(personalFarmCameraDistance(true),1400);
  assert.equal(applyUnifiedWorldCamera({},'personal-farm').cameraDistance,1820);
});

test('수목원은 캐릭터 비율을 낮추고 더 넓은 맵 조망을 유지한다',()=>{
  assert.deepEqual(GARDEN_NAVIGATION_PROFILE,{cameraDistance:1550,cameraZoom:.9,characterHeight:160});
});

test('공동캠퍼스는 이름표를 줄이고 베어트리파크는 좁은 화각으로 렌즈 왜곡을 줄인다',()=>{
  assert.deepEqual(CAMPUS_NAVIGATION_PROFILE,{cameraDistance:800,characterHeight:80,nameplateScale:.8});
  assert.deepEqual(BEAR_TREE_NAVIGATION_PROFILE,{cameraDistance:1800,cameraFov:38,characterHeight:80});
  (['campus','bear-tree-park'] as const).forEach(mapId=>{
    const options=applyUnifiedWorldCamera({},mapId);
    assert.equal(options.perspectiveCamera,true);
    assert.equal(options.fixedCameraTarget,false);
    assert.equal(options.characterHeight,80);
    assert.equal(options.cameraFollowBounds,undefined);
  });
  assert.equal(applyUnifiedWorldCamera({},'campus').cameraDistance,800);
  assert.equal(applyUnifiedWorldCamera({},'campus').nameplateScale,.8);
  assert.equal(applyUnifiedWorldCamera({},'bear-tree-park').cameraDistance,1800);
  assert.equal(applyUnifiedWorldCamera({},'bear-tree-park').cameraFov,38);
});
