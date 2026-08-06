import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
const bearTree=renderer.slice(renderer.indexOf('export const BEAR_TREE_PARK_RENDERER_OPTIONS'),renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'));

const bearTreeNodeNames=()=>{
  const buffer=readFileSync(new URL('../src/assets/maps/new-beartree.glb',import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString('utf8').replace(/\0+$/,'')) as {nodes?:Array<{name?:string}>};
  return new Set((json.nodes??[]).map(node=>node.name).filter((name):name is string=>!!name));
};

test('베어트리파크는 선명한 화면을 위한 렌더링 품질을 고정한다',()=>{
  assert.match(bearTree,/adaptivePixelRatio:false/);
  assert.match(bearTree,/antialias:true/);
  assert.match(bearTree,/balancedTextureQuality:true/);
  assert.match(bearTree,/maxTextureSize:2048/);
  assert.match(bearTree,/performancePixelRatio:1\.25/);
  assert.doesNotMatch(bearTree,/maxTextureSize:512|performancePixelRatio:\.75/);
});

test('베어트리파크는 캐릭터를 줄여도 이름표 가독성을 유지한다',()=>{
  assert.match(bearTree,/nameplateScale:1\.25/);
  assert.match(renderer,/\*this\.nameplateScale/);
  assert.match(renderer,/options\.nameplateScale\?\?1/);
});

test('마이홈 곰 보상은 베어트리파크 원본 GLB의 확정 노드를 사용한다',()=>{
  const names=bearTreeNodeNames();
  assert.equal(names.has('tripo_node_663ac3ae-202d-4035-bde3-3b143688b477'),true);
  assert.equal(names.has('tripo_node_205fe7ff-0ff3-479d-8efe-efb90df4bf37'),true);
});
