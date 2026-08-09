import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {readOptionalJson} from '../src/services/optionalJson';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Three.js 폐기 API를 렌더링 경로에서 사용하지 않는다',()=>{
  const sources=[
    read('../src/components/ThreeCharacterPreview.tsx'),
    read('../src/game/renderers/VillageMapRenderer.ts'),
    read('../../src/app/page.home/avatar-preview-renderer.ts'),
  ].join('\n');
  assert.doesNotMatch(sources,/\bClock\b|PCFSoftShadowMap/);
  assert.match(sources,/PCFShadowMap/);
});

test('운영 API가 HTML을 반환해도 JSON으로 파싱하지 않는다',async()=>{
  const htmlResponse=new Response('<!DOCTYPE html><html></html>',{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}});
  assert.equal(await readOptionalJson(htmlResponse),null);
  const jsonResponse=new Response(JSON.stringify({data:{profile:null}}),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
  assert.deepEqual(await readOptionalJson(jsonResponse),{data:{profile:null}});
});

test('확장 프로그램 메시지 채널 종료 오류만 제한적으로 격리한다',()=>{
  const entry=read('../index.html');
  assert.match(entry,/unhandledrejection/);
  assert.match(entry,/A listener indicated an asynchronous response by returning true/);
  assert.match(entry,/The message port closed before a response was received/);
  assert.match(entry,/getRejectionMessage/);
  assert.match(entry,/if \(closedExtensionChannel\.test\(message\)\) event\.preventDefault\(\)/);
});

test('AI 5·6단계 체류 시간과 양쪽 전광판 정면 확대를 유지한다',()=>{
  const experience=read('../src/components/GovernmentAiRecommendationCenter.tsx');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(experience,/title: "프로필 생성",[\s\S]*?duration: 5000/);
  assert.match(experience,/title: "AI 분석 결과",[\s\S]*?duration: 5000/);
  assert.match(renderer,/const cameraDirection=normal;/);
  assert.match(renderer,/addScaledVector\(cameraDirection,1120\)/);
  assert.match(renderer,/fov:36/);
});

test('중앙광장 01·02·03 화면을 역할별로 분리하고 확정 코스를 프로필에 반영한다',()=>{
  const ui=read('../src/components/GovernmentCentralPlazaWebUI.tsx');
  const profile=read('../src/services/aiSejongProfile.ts');
  assert.match(ui,/screen==='experience-analysis'/);
  assert.match(ui,/screen==='course-recommendation'/);
  assert.match(ui,/screen==='course-browser'/);
  assert.match(ui,/recordConfirmedCourseVisit/);
  assert.match(profile,/confirmedDraft\.courseOrder/);
});
