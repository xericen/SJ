import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('자연 맵 UI 조정이 반영된다',()=>{
  const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  const navigation=readFileSync(new URL('../src/game/worldNavigationProfile.ts',import.meta.url),'utf8');
  const canvas=readFileSync(new URL('../src/game/GameCanvas.tsx',import.meta.url),'utf8');
  const pageCss=readFileSync(new URL('../src/pages/GamePage.css',import.meta.url),'utf8');
  const greenhouse=readFileSync(new URL('../src/components/GreenhouseExperience.tsx',import.meta.url),'utf8');
  const farm=readFileSync(new URL('../src/components/PersonalFarmProgressExperience.tsx',import.meta.url),'utf8');
  assert.match(renderer,/BEAR_TREE_PARK_RENDERER_OPTIONS[\s\S]*theme:'orange'/);
  assert.match(navigation,/characterHeight:160/);
  assert.doesNotMatch(canvas,/NatureDiscoveryGuide/);
  assert.match(pageCss,/online\.is-nature-chapter\{top:70px/);
  assert.match(greenhouse,/greenhouse-save-button/);
  assert.match(greenhouse,/saveDiscoveryOnly/);
  assert.doesNotMatch(farm,/mapId==='garden'&&gardenFlower/);
  assert.doesNotMatch(farm,/flower:\$\{gardenFlower\}/);
});
