import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('축제부스와 먹거리부스는 진입 시 안내를 연다',()=>{
  const source=readFileSync(new URL('../src/pages/GamePage.tsx',import.meta.url),'utf8');
  assert.match(source,/location==='축제부스'\?'festival':location==='먹거리 부스'\?'food'/);
  assert.match(source,/experienceTutorialOpen&&<ExperienceTutorial/);
});
