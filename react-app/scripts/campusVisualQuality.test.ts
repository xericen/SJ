import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyUnifiedWorldCamera,CAMPUS_NAVIGATION_PROFILE} from '../src/game/worldNavigationProfile';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const rendererSource=readFileSync(resolve(root,'src/game/renderers/VillageMapRenderer.ts'),'utf8');
const campusOptions=rendererSource.slice(
  rendererSource.indexOf('export const CAMPUS_RENDERER_OPTIONS'),
  rendererSource.indexOf('export const CLUB_STREET_FESTIVAL_RENDERER_OPTIONS'),
);

test('공동캠퍼스 기본 렌더링은 선명도 우선 품질을 유지한다',()=>{
  assert.match(campusOptions,/antialias:true/);
  assert.match(campusOptions,/balancedTextureQuality:true/);
  assert.match(campusOptions,/maxTextureSize:1024/);
  assert.match(campusOptions,/minPixelRatio:\.85/);
  assert.match(campusOptions,/performancePixelRatio:1/);
  assert.match(campusOptions,/geometrySimplificationRatio:0/);
});

test('저사양 기기에는 별도 품질 폴백을 적용한다',()=>{
  assert.match(campusOptions,/lowQualityFallback:\{maxTextureSize:512,performancePixelRatio:\.8,performanceFrameRate:30,balancedTextureQuality:false\}/);
});

test('공동캠퍼스 맵은 가까이 보이고 캐릭터는 공통 맵보다 작다',()=>{
  const options=applyUnifiedWorldCamera({},'campus');
  assert.equal(options.characterHeight,CAMPUS_NAVIGATION_PROFILE.characterHeight);
  assert.equal(options.cameraDistance,CAMPUS_NAVIGATION_PROFILE.cameraDistance);
  assert.ok(options.characterHeight<94);
  assert.equal(options.cameraDistance,800);
});
