import assert from 'node:assert/strict';
import test from 'node:test';
import { ARTS_CENTER_PERFORMANCES } from '../src/game/artsCenterPerformances';
import { ARTS_CENTER_VIDEOS } from '../src/game/artsCenterVideos';
import { ARTS_CENTER_CHARACTER_FOOT_LIFT,ARTS_CENTER_MAX_JUMP_STEP_HEIGHT,characterVisualY,DEFAULT_MAX_STEP_HEIGHT,isGroundFootprintCoherent,JUMP_COLLISION_CLEARANCE,reachableStepHeight } from '../src/game/groundTraversal';
const ARTS_CENTER_ENTRANCE_RISE=24.58;

test('예술의전당 갈색 입구 단차는 보행으로 넘지 못한다',()=>{
  const walkingHeight=reachableStepHeight(0,ARTS_CENTER_MAX_JUMP_STEP_HEIGHT);
  assert.equal(walkingHeight,DEFAULT_MAX_STEP_HEIGHT);
  assert.equal(walkingHeight<ARTS_CENTER_ENTRANCE_RISE,true);
  assert.equal(isGroundFootprintCoherent([0,ARTS_CENTER_ENTRANCE_RISE],walkingHeight),false);
});

test('실제 점프 높이에 도달하면 입구 단차와 혼합 발판을 통과한다',()=>{
  const jumpHeight=JUMP_COLLISION_CLEARANCE+.1;
  const jumpingHeight=reachableStepHeight(jumpHeight,ARTS_CENTER_MAX_JUMP_STEP_HEIGHT);
  assert.equal(jumpingHeight>=ARTS_CENTER_ENTRANCE_RISE,true);
  assert.equal(isGroundFootprintCoherent([0,ARTS_CENTER_ENTRANCE_RISE],jumpingHeight),true);
});

test('점프 단차 허용은 예술의전당 상한을 넘거나 다른 맵으로 퍼지지 않는다',()=>{
  assert.equal(reachableStepHeight(100,ARTS_CENTER_MAX_JUMP_STEP_HEIGHT),ARTS_CENTER_MAX_JUMP_STEP_HEIGHT);
  assert.equal(reachableStepHeight(100),DEFAULT_MAX_STEP_HEIGHT);
  assert.equal(isGroundFootprintCoherent([0,ARTS_CENTER_ENTRANCE_RISE],ARTS_CENTER_MAX_JUMP_STEP_HEIGHT,true),false);
});

test('예술의전당 발 높이 보정은 충돌 지면과 별도로 캐릭터에만 더한다',()=>{
  const groundHeight=24.58;
  const groundClearance=4;
  assert.equal(ARTS_CENTER_CHARACTER_FOOT_LIFT,8);
  assert.equal(characterVisualY(groundHeight,groundClearance),28.58);
  assert.equal(characterVisualY(groundHeight,groundClearance,ARTS_CENTER_CHARACTER_FOOT_LIFT),36.58);
});

test('기존 5개 공연 선택과 영상 연결은 그대로 유지한다',()=>{
  assert.equal(ARTS_CENTER_PERFORMANCES.length,5);
  assert.equal(ARTS_CENTER_VIDEOS.length,ARTS_CENTER_PERFORMANCES.length);
  ARTS_CENTER_VIDEOS.forEach(videos=>assert.equal(videos.length>0,true));
});
