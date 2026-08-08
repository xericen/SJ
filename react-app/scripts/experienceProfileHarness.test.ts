import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('다른 지도 이동은 모집센터·학생회관·동아리 방문으로 기록하지 않는다',()=>{
  const recruitment=read('src/components/RecruitmentCenterDesk.tsx');
  const studentHall=read('src/components/CampusStudentHall.tsx');
  const club=read('src/components/ClubStreetExperience.tsx');
  assert.doesNotMatch(recruitment,/map-travel-complete[\s\S]{0,300}visit-complete/);
  assert.doesNotMatch(studentHall,/map-travel-complete/);
  assert.doesNotMatch(club,/map-travel-complete[\s\S]{0,300}visit-complete/);
  assert.match(read('src/services/campusProfileSignals.ts'),/isLegacyPhantomVisit/);
});

test('공간별 실제 선택 행동을 프로필 하네스에 연결한다',()=>{
  const recruitment=read('src/components/RecruitmentCenterDesk.tsx');
  const garden=read('src/components/GreenhouseExperience.tsx');
  const project=read('src/components/ProjectRoomInteractions.tsx');
  assert.match(recruitment,/ai-recruiter-chat/);
  assert.match(recruitment,/view-recruitment/);
  for(const action of ['greenhouse-observe','greenhouse-collect','greenhouse-analysis','greenhouse-memory'])assert.match(garden,new RegExp(action));
  for(const action of ['view-project','apply-project','create-project','project-activity','project-role'])assert.match(project,new RegExp(action));
});

test('기억나무 공개 기록은 WIZ DB API를 사용하고 최근 전용 활동은 분석 점수에서 제외한다',()=>{
  const memory=read('src/services/publicGreenhouseMemories.ts');
  const api=read('../src/app/page.home/api.py');
  const profile=read('src/services/profileProgress.ts');
  assert.match(memory,/community\?resource=greenhouse_memories/);
  assert.match(api,/resource[^\n]+greenhouse_memories/);
  assert.match(profile,/profileScope:'recent-only'/);
  assert.match(profile,/analysisRecords=sortedRecords\.filter/);
});
