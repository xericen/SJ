import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const gamePage=readFileSync(new URL('../src/pages/GamePage.tsx',import.meta.url),'utf8');
const aiCenter=readFileSync(new URL('../src/components/GovernmentAiRecommendationCenter.tsx',import.meta.url),'utf8');

test('축제·먹거리 입장 설명은 로그인 상태와 무관한 canonical map id로 연다',()=>{
  assert.match(gamePage,/currentMapId==='festival-experience'\?'festival'/);
  assert.match(gamePage,/currentMapId==='food-experience'\?'food'/);
  assert.doesNotMatch(gamePage,/location==='축제부스'\?'festival'/);
});

test('STEP 9 여행 시작은 홈 이동 전에 두 버튼 확인창을 연다',()=>{
  assert.match(aiCenter,/setExitConfirmationOpen\(true\)/);
  assert.match(aiCenter,/중앙광장에 머무르기/);
  assert.match(aiCenter,/그래도 홈으로 이동/);
  assert.match(aiCenter,/className="confirm" onClick=\{confirmStartTrip\}/);
});
