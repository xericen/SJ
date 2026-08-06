import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
const bearTree=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));

test('베어트리파크는 선명한 화면을 위한 렌더링 품질을 고정한다',()=>{
  assert.match(bearTree,/adaptivePixelRatio:false/);
  assert.match(bearTree,/antialias:true/);
  assert.match(bearTree,/balancedTextureQuality:true/);
  assert.match(bearTree,/maxTextureSize:2048/);
  assert.match(bearTree,/performancePixelRatio:1\.25/);
  assert.doesNotMatch(bearTree,/maxTextureSize:512|performancePixelRatio:\.75/);
});

test('베어트리파크 이름표는 멀어진 카메라 배율만큼 확대해 가독성을 유지한다',()=>{
  assert.match(bearTree,/nameplateScale:BEAR_TREE_PARK_CAMERA_DISTANCE_MULTIPLIER/);
  assert.match(renderer,/\*this\.nameplateScale/);
  assert.match(renderer,/options\.nameplateScale\?\?1/);
});
