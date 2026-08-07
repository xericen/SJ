import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const landing=read('../src/pages/LandingPage.tsx');
const landingCss=read('../src/pages/LandingPage.css');
const profile=read('../src/components/AiSejongProfile.tsx');
const profileCss=read('../src/components/AiSejongProfile.css');

test('랜딩 핵심 콘텐츠는 데스크톱 한 화면 대시보드와 네 개의 압축 카드로 구성한다',()=>{
  assert.match(landing,/className="welcome-home-dashboard"/);
  assert.match(landing,/className="welcome-flow-summary"/);
  assert.match(landing,/탐험[\s\S]*취향 기록[\s\S]*사람 연결[\s\S]*AI 코스 추천/);
  assert.match(landingCss,/@media\(min-width:901px\)[\s\S]*?\.welcome-page\{height:100dvh;min-height:100dvh;[^}]*overflow:hidden/);
  assert.match(landingCss,/\.welcome-card\{width:min\(1480px,100%\);height:calc\(100dvh - 48px\)/);
  assert.match(landingCss,/\.welcome-card-home \.welcome-hero\{[^}]*grid-template-columns:minmax\(0,42fr\) minmax\(0,58fr\)/);
  assert.match(landingCss,/\.welcome-place-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)/);
});

test('프로필 첫 화면은 요약·핵심 성향·최근 활동·AI·추천을 고정 대시보드로 제공한다',()=>{
  assert.match(profile,/progress\.records\.slice\(0, 4\)/);
  assert.match(profile,/ai\.recommendedCourse\.slice\(0,3\)/);
  assert.match(profile,/className="profile-card ai-summary-card"/);
  assert.doesNotMatch(profile,/최근 활동 기록<\/h3><button[^>]*>전체 기록 보기/);
  assert.match(profile,/className="profile-detail-tabs"/);
  assert.match(profile,/저장한 관심사[\s\S]*성장 히스토리[\s\S]*전체 활동 기록[\s\S]*AI 상세 분석/);
  assert.match(profileCss,/@media\(min-width:901px\)[\s\S]*?grid-template-rows:106px minmax\(0,1fr\) 164px 46px/);
  assert.match(profileCss,/@media\(max-width:900px\)[\s\S]*?overflow:visible/);
});

test('상세 정보와 활동 점수는 기본 화면이 아닌 내부 스크롤 패널에서 연다',()=>{
  assert.match(profile,/setSelectedRecordId\(item\.id\)/);
  assert.match(profile,/RecordDetailPanel/);
  assert.match(profileCss,/\.profile-detail-panel\{[^}]*max-height:[^;}]+;[^}]*overflow:auto/);
});
