import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import { BEAR_TREE_PARK_CAMERA_DISTANCE_MULTIPLIER,BEAR_TREE_PARK_CAMERA_ELEVATION_DEG,BEAR_TREE_PARK_CAMERA_ZOOM,BEAR_TREE_PARK_FOLLOW_CAMERA_DISTANCE,clampCameraBehindLimit,LAKE_PARK_CAMERA_ELEVATION_DEG,LAKE_PARK_CAMERA_ZOOM,LAKE_PARK_FOLLOW_CAMERA_DISTANCE,SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE } from '../src/game/cameraFollow';

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

test('베어트리파크는 호수공원형 직교 구도에서 카메라를 현재보다 2/3 더 멀리 둔다',()=>{
  const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  const bearTree=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));
  assert.equal(BEAR_TREE_PARK_CAMERA_ELEVATION_DEG,29);
  assert.ok(BEAR_TREE_PARK_CAMERA_ELEVATION_DEG<LAKE_PARK_CAMERA_ELEVATION_DEG);
  assert.equal(BEAR_TREE_PARK_CAMERA_DISTANCE_MULTIPLIER,5/3);
  assert.equal(BEAR_TREE_PARK_FOLLOW_CAMERA_DISTANCE,1667);
  assert.equal(BEAR_TREE_PARK_CAMERA_ZOOM,.876);
  assert.match(bearTree,/perspectiveCamera:false/);
  assert.match(bearTree,/cameraZoom:BEAR_TREE_PARK_CAMERA_ZOOM/);
  assert.match(bearTree,/cameraDistance:BEAR_TREE_PARK_FOLLOW_CAMERA_DISTANCE/);
  assert.match(bearTree,/cameraElevationDeg:BEAR_TREE_PARK_CAMERA_ELEVATION_DEG/);
});
