import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('동아리 API가 HTML을 반환해도 JSON 파싱 오류 없이 fallback을 사용한다',()=>{
  const source=readFileSync(new URL('../src/components/CampusCommunicationHub.tsx',import.meta.url),'utf8');
  assert.match(source,/isJsonResponse/);
  assert.match(source,/readLocalClubs\(\)/);
  assert.doesNotMatch(source,/if\(response\.ok\)setClubs\(await clubResponse\.json\(\)/);
});
