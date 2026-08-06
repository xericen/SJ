import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {WORLD_PORTAL_DEFAULTS} from '../shared/world-portals';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('마이홈에는 다른 월드로 이동하는 포탈이 없다',()=>{
  assert.deepEqual(WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='personal-farm'),[]);

  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const personalFarmOptions=renderer.slice(
    renderer.indexOf('export const PERSONAL_FARM_RENDERER_OPTIONS'),
    renderer.indexOf('export const GARDEN_RENDERER_OPTIONS'),
  );
  assert.doesNotMatch(personalFarmOptions,/portal:|fixedPortals:|destination:'(?:town|bear-tree-park|garden)'/);
});

test('마이홈의 포탈 위치 이동 버튼은 노출하지 않는다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  assert.match(page,/\['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'\]\.includes\(currentMapId\)/);
  assert.match(page,/\['town','personal-farm','garden','campus','arts-center','festival-experience','food-experience','club-street-festival','government-central-plaza','sejong-smart-city'\]\.includes\(currentMapId\)/);
});

test('마이홈 미션 상태는 나가기 버튼 왼쪽 상단에 배치한다',()=>{
  const statusCss=read('../src/components/PersonalFarmProgressExperience.css');
  assert.match(statusCss,/\.personal-farm-reward-status\{position:absolute;right:218px;top:20px;/);
});
