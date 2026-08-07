import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('프로젝트실 콘텐츠는 WIZ MySQL 모델과 API를 사용한다',()=>{
  const model=read('../src/model/db/project_room_project.py');
  const struct=read('../src/model/struct.py');
  const api=read('../src/app/page.home/api.py');
  assert.match(model,/db_table = "project_room_project"/);
  assert.match(model,/payload = pw\.TextField/);
  assert.match(struct,/"project_room_project"/);
  assert.match(api,/def _project_room_projects\(user_id\):/);
  assert.match(api,/struct\.db\("project_room_project"\)/);
  assert.match(api,/PROJECT_ROOM_SEEDS/);
  assert.match(api,/resource[\s\S]*projectRoomProjects[\s\S]*_project_room_projects\(user_id\)/);
});

test('전광판과 프로젝트실 UI는 DB 목록을 다시 불러오고 저장한다',()=>{
  const projects=read('src/services/projectRoomProjects.ts');
  const unified=read('src/services/unifiedProfileApi.ts');
  const board=read('src/components/ProjectLobbyBoard.tsx');
  const interactions=read('src/components/ProjectRoomInteractions.tsx');
  assert.match(projects,/fetchUnifiedProjects/);
  assert.match(projects,/refreshProjectRoomProjects/);
  assert.match(unified,/\/wiz\/api\/page\.home\/behavior_state/);
  assert.match(unified,/resource:'projectRoomProjects'/);
  assert.match(unified,/endpoint\('\/projects'\)/);
  assert.match(board,/refreshProjectRoomProjects\(\)/);
  assert.match(interactions,/refreshProjectRoomProjects\(\)/);
});
