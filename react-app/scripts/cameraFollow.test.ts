import assert from 'node:assert/strict';
import test from 'node:test';
import {clampCameraBehindLimit,LAKE_PARK_CAMERA_ELEVATION_DEG,LAKE_PARK_CAMERA_ZOOM,LAKE_PARK_FOLLOW_CAMERA_DISTANCE,SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE} from '../src/game/cameraFollow';

test('예술의전당 카메라는 스크린샷 기준 앞에서 자유롭게 왕복한다',()=>{
  const screenshotCameraZ=780;
  assert.equal(clampCameraBehindLimit(780,screenshotCameraZ),780);
  assert.equal(clampCameraBehindLimit(940,screenshotCameraZ),940);
  assert.equal(clampCameraBehindLimit(820,screenshotCameraZ),820);
  assert.equal(clampCameraBehindLimit(720,screenshotCameraZ),780);
});

test('호수공원 카메라는 각도를 유지하며 조금 더 넓어진 거리 1080 구도를 사용한다',()=>{
  assert.equal(SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE,1300);
  assert.equal(LAKE_PARK_FOLLOW_CAMERA_DISTANCE,1080);
  assert.equal(LAKE_PARK_CAMERA_ZOOM,1.35);
  assert.equal(LAKE_PARK_CAMERA_ELEVATION_DEG,33);
});
