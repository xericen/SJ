import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('프로젝트실 콘텐츠는 WIZ MySQL 모델과 API를 사용한다',()=>{
  const model=read('../src/model/db/project_room_project.py');
  const applicationModel=read('../src/model/db/project_room_application.py');
  const struct=read('../src/model/struct.py');
  const api=read('../src/app/page.home/api.py');
  assert.match(model,/db_table = "project_room_project"/);
  assert.match(model,/payload = pw\.TextField/);
  assert.match(applicationModel,/db_table = "project_room_application"/);
  assert.match(struct,/"project_room_project"/);
  assert.match(struct,/"project_room_application"/);
  assert.match(api,/def _project_room_projects\(user_id\):/);
  assert.match(api,/struct\.db\("project_room_project"\)/);
  assert.match(api,/PROJECT_ROOM_SEEDS/);
  assert.match(api,/resource[\s\S]*projectRoomProjects[\s\S]*_project_room_projects\(user_id\)/);
  assert.doesNotMatch(api,/projectRoomProjects[\s\S]{0,100}try:/);
});

test('전광판과 프로젝트실 UI는 DB 목록을 다시 불러오고 체험 종료 시 생성 프로젝트를 정리한다',()=>{
  const projects=read('src/services/projectRoomProjects.ts');
  const unified=read('src/services/unifiedProfileApi.ts');
  const board=read('src/components/ProjectLobbyBoard.tsx');
  const interactions=read('src/components/ProjectRoomInteractions.tsx');
  assert.match(projects,/fetchUnifiedProjects/);
  assert.match(projects,/refreshProjectRoomProjects/);
  assert.match(unified,/\/wiz\/api\/page\.home\/behavior_state/);
  assert.match(unified,/resource=projectRoomProjects/);
  assert.match(unified,/endpoint\('\/projects'\)/);
  assert.match(board,/refreshProjectRoomProjects\(\)/);
  assert.match(interactions,/refreshProjectRoomProjects\(\)/);
  assert.match(interactions,/sessionCreatedProjectsRef\.current/);
  assert.match(interactions,/created\.map\(project=>deleteUnifiedProject\(project\)\)/);
  const canvas=read('src/game/GameCanvas.tsx');
  assert.doesNotMatch(canvas,/resetGuestProjectRoomProfile/);
  assert.match(unified,/syncUnifiedProject=.*sendWizProject\(project\)/);
  assert.doesNotMatch(unified,/syncUnifiedProject=.*Promise\.allSettled/);
});

test('참여 신청은 프로젝트 전용 DB API로 전달되고 만든 사람에게 다시 조회된다',()=>{
  const unified=read('src/services/unifiedProfileApi.ts');
  const interactions=read('src/components/ProjectRoomInteractions.tsx');
  assert.match(unified,/resource=projectRoomApplications&payload=/);
  assert.match(unified,/resource=projectRoomApplications`/);
  assert.match(interactions,/syncUnifiedProjectApplication\(reviewed\)/);
});

test('프로젝트 목록은 지정한 세 항목만 남기고 모집글 표기를 프로젝트로 바꾼다',()=>{
  const api=read('../src/app/page.home/api.py');
  const interactions=read('src/components/ProjectRoomInteractions.tsx');
  const css=read('src/components/ProjectRoomInteractions.css');
  assert.match(api,/PROJECT_ROOM_REMOVED_IDS/);
  assert.match(api,/"night-festival"/);
  assert.match(interactions,/· 프로젝트/);
  assert.doesNotMatch(interactions,/· 모집글/);
  assert.match(css,/justify-content:flex-start/);
  assert.match(interactions,/querySelector<HTMLElement>\('\.project-room-tools nav'\).*scrollTo\(\{left:0/);
});

test('체험용 공개 프로젝트는 게스트 소유자로 공용 DB에 저장되고 다른 사용자 조회에 포함된다',()=>{
  const api=read('../src/app/page.home/api.py');
  const projects=read('src/services/projectRoomProjects.ts');
  assert.match(api,/if not user_id:\s*user_id = "guest:" \+ project\["leaderId"\]/);
  assert.match(api,/project\.get\("visibility", "public"\) != "private"/);
  assert.match(api,/duplicate[\s\S]*entire public project list disappear/);
  assert.match(projects,/window\.location\.hostname\.endsWith\('\.wizide\.com'\)/);
  assert.match(projects,/fetchUnifiedProjects\(\)/);
});
