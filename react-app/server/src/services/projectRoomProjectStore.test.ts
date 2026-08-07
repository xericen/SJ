import assert from 'node:assert/strict';
import test from 'node:test';
import {PROJECT_ROOM_DATABASE_SEEDS,projectRoomProjectDto} from './projectRoomProjectStore.js';

test('프로젝트실 기본 콘텐츠는 DB 시드 문서로 정의된다',()=>{
  assert.equal(PROJECT_ROOM_DATABASE_SEEDS.length,3);
  assert.ok(PROJECT_ROOM_DATABASE_SEEDS.every(project=>project.visibility==='public'&&project.leaderUserId.startsWith('seed:')));
});

test('DB 프로젝트 문서를 전광판용 가로 프로젝트 데이터로 변환한다',()=>{
  const dto=projectRoomProjectDto({id:'project-db',title:'DB 프로젝트',summary:'실제 저장 데이터',description:'내용',leaderUserId:'user-1',leaderNickname:'민주',memberUserIds:['user-1'],memberNicknames:['민주','지호'],applicantNicknames:['하늘'],placeIds:['프로젝트실'],activityTypes:['기획'],tags:['DB'],preferredTraits:['계획형'],maxMembers:4,status:'active',visibility:'public',createdAt:'2026-08-06T00:00:00.000Z'});
  assert.equal(dto.leaderId,'민주');
  assert.deepEqual(dto.memberIds,['민주','지호']);
  assert.deepEqual(dto.applicantIds,['하늘']);
  assert.equal(dto.createdAt,'2026-08-06T00:00:00.000Z');
});
