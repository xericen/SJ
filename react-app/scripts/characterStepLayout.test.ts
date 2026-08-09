import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('../src/pages/CharacterDesignStep.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/pages/CreateProfilePage.css',import.meta.url),'utf8');

test('남성형 2와 여성형 2는 축소 옵션 레이아웃을 사용한다',()=>{
  assert.match(page,/model==='women'\|\|model==='cloths'\?'compact-options'/);
  assert.match(css,/@media\(min-width:1051px\) and \(max-height:950px\)/);
  assert.match(css,/compact-options \.character-style-row[^}]*min-height:50px/);
});

test('1440x900 캐릭터 설정은 저장 버튼 전용 행을 확보한다',()=>{
  assert.match(css,/character-design-card\{padding:22px 44px 20px;grid-template-rows:auto minmax\(0,1fr\) 54px\}/);
  assert.match(css,/character-design-actions\{height:54px;margin-top:8px;align-self:end\}/);
});
