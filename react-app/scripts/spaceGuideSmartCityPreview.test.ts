import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const preview=readFileSync(new URL('../src/components/WorldModelPreview.tsx',import.meta.url),'utf8');
const landing=readFileSync(new URL('../src/pages/LandingPage.tsx',import.meta.url),'utf8');

test('스마트시티 공간 안내는 실제 GLB와 표준 격리 뷰어를 사용한다',()=>{
  assert.match(landing,/sejong-smartcity-exhibition\.glb\?url/);
  assert.match(landing,/name:'세종 스마트시티 국가시범도시'.*modelUrl:sejongSmartCityWorldUrl/);
  assert.match(preview,/document\.createElement\('model-viewer'\)/);
  assert.match(preview,/viewer\.src=src/);
});

test('Meshopt 전용 Three 렌더러는 동아리 거리제에만 사용한다',()=>{
  assert.match(preview,/props\.name==='동아리 거리제'\?<MeshoptWorldModelPreview/);
  assert.match(preview,/StandardWorldModelPreview/);
});
