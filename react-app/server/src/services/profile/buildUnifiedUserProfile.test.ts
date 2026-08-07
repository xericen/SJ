import assert from 'node:assert/strict';
import test from 'node:test';
import {buildUnifiedUserProfileFromSources,calculateProfileCompletion} from './buildUnifiedUserProfile.js';
import {createEmptyUnifiedUserProfile} from '../../../../shared/unified-user-profile.js';

const NOW=new Date('2026-08-06T12:00:00.000Z');
const flower={flowerId:'tulip',infoViewCount:2,totalInfoViewSeconds:20,nearbyVisitCount:1,totalNearbySeconds:10,revisitCount:1,interestScore:21,lastInteractedAt:NOW.toISOString()};

test('빈 신규 사용자는 모든 기본값과 완성도 0을 반환한다',()=>{
  const profile=buildUnifiedUserProfileFromSources('user-empty',{user:{_id:'user-empty'}},NOW);
  assert.deepEqual(profile,createEmptyUnifiedUserProfile('user-empty',NOW.toISOString()));
});

test('축제·먹거리 근거만 있으면 festivalFood 영역만 완료한다',()=>{
  const profile=buildUnifiedUserProfileFromSources('festival-user',{user:{experienceHarness:{
    festival:{scores:{participation:5},evidence:['부스 참여'],sessionSummary:{mostViewedCategories:['야간','공연']}},
    food:{scores:{local:4},evidence:['로컬 음식 저장'],sessionSummary:{mostViewedCategories:['한식']}},
    savedInterests:[{domain:'food',tags:['복숭아']}],activityRecords:[],
  }}},NOW);
  assert.deepEqual(profile.festivalFood.festivalTypes,['야간','공연']);
  assert.deepEqual(profile.festivalFood.foodTypes,['한식','복숭아']);
  assert.equal(profile.profileCompletion,20);
  assert.deepEqual(profile.completedDomains,['festivalFood']);
});

test('꽃 관심도는 shared catalog의 이름과 꽃말을 결합한다',()=>{
  const profile=buildUnifiedUserProfileFromSources('garden-user',{user:{profile:{gardenNature:{flowerInterests:[flower],observationStyle:'천천히 관찰형'}}}},NOW);
  assert.deepEqual(profile.gardenNature.topFlowers,[{flowerId:'tulip',displayName:'튤립',meanings:['사랑','고백','애정'],interestScore:21}]);
  assert.equal(profile.gardenNature.exploredFlowerCount,1);
  assert.equal(profile.profileCompletion,20);
});

test('동아리·프로젝트는 서버 컬렉션 원본만 조립한다',()=>{
  const profile=buildUnifiedUserProfileFromSources('social-user',{
    user:{clubs:{categories:[],campusProfileSignals:[]},collaborationProjects:{interests:[],preferredRoles:[],availableTimes:[]}},
    clubs:[{id:'club-a',category:'사진',capacity:6,members:[{userId:'social-user',role:'executive'}]}],
    projects:[{id:'project-a',leaderUserId:'social-user',memberUserIds:['social-user'],tags:['수목원'],activityTypes:['사진']}],
    applications:[{id:'application-a',applicantUserId:'social-user',profileSnapshot:{activities:['기록']},recommendedRole:'사진 기록'}],
  },NOW);
  assert.deepEqual(profile.clubs.categories,['사진']);
  assert.equal(profile.clubs.participationRole,'운영진');
  assert.deepEqual(profile.collaborationProjects.interests,['수목원','사진','기록']);
  assert.deepEqual(profile.collaborationProjects.preferredRoles,['사진 기록']);
  assert.equal(profile.profileCompletion,40);
});

test('전체 사용자, 장소 집계와 100점 상한을 계산한다',()=>{
  const profile=buildUnifiedUserProfileFromSources('full-user',{
    user:{updatedAt:NOW,experienceHarness:{festival:{scores:{participation:1},sessionSummary:{mostViewedCategories:['문화']}},performance:{scores:{classical:5,immersion:2},evidence:['완주']},activityRecords:[]},profile:{gardenNature:{flowerInterests:[flower]}},placeBehavior:{visitRecords:[{placeId:'garden',visitCount:2,activeDurationSeconds:120},{placeId:'arts-center',visitCount:1,activeDurationSeconds:300}]}},
    clubs:[{category:'자연',capacity:10,members:[{userId:'full-user',role:'member'}]}],
    projects:[{leaderUserId:'full-user',memberUserIds:['full-user'],tags:['생태'],activityTypes:['조사']}],applications:[],
  },NOW);
  assert.equal(profile.profileCompletion,100);
  assert.deepEqual(profile.completedDomains,['festivalFood','gardenNature','arts','clubs','collaborationProjects']);
  assert.deepEqual(profile.placeBehavior.mostVisitedPlaceIds,['garden']);
  assert.deepEqual(profile.placeBehavior.longestStayedPlaceIds,['arts-center']);
  assert.deepEqual(profile.placeBehavior.revisitPlaceIds,['garden']);
  const tampered={...profile,profileCompletion:999};
  assert.equal(calculateProfileCompletion(tampered).profileCompletion,100);
});

test('사용자 A와 B의 컬렉션 데이터를 섞지 않는다',()=>{
  const clubs=[{category:'A분야',members:[{userId:'A'}]},{category:'B분야',members:[{userId:'B'}]}];
  const projects=[{leaderUserId:'A',memberUserIds:['A'],tags:['A관심'],activityTypes:[]},{leaderUserId:'B',memberUserIds:['B'],tags:['B관심'],activityTypes:[]}];
  const a=buildUnifiedUserProfileFromSources('A',{user:{},clubs,projects},NOW),b=buildUnifiedUserProfileFromSources('B',{user:{},clubs,projects},NOW);
  assert.deepEqual(a.clubs.categories,['A분야']);assert.deepEqual(a.collaborationProjects.interests,['A관심']);
  assert.deepEqual(b.clubs.categories,['B분야']);assert.deepEqual(b.collaborationProjects.interests,['B관심']);
});
