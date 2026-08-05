import assert from 'node:assert/strict';
import test from 'node:test';
import {buildDeterministicExperienceProfile} from './experienceProfile.js';

test('점수가 적은 단일 먹거리 저장도 먹거리 분석 프로필로 유지한다',()=>{
  const profile=buildDeterministicExperienceProfile({food:{scores:{},evidence:[],sessionSummary:{cafesViewed:1,savedItems:['cafe-1']}}});
  assert.equal(profile.source,'sejong_food_trucks');
  assert.match(profile.title,/맛|카페/);
});

test('공연·먹거리·축제 분석 조각은 서로 다른 source로 유지한다',()=>{
  const performance=buildDeterministicExperienceProfile({performance:{scores:{classical:9},evidence:['클래식 관심 저장']}});
  const food=buildDeterministicExperienceProfile({food:{scores:{cafeVisitIntent:7},evidence:['카페 지도 확인']}});
  const festival=buildDeterministicExperienceProfile({festival:{scores:{nightFestivalInterest:80},evidence:['야간 축제 저장'],sessionSummary:{festivalsViewed:1}}});
  assert.deepEqual([performance.source,food.source,festival.source],['sejong_arts_center','sejong_food_trucks','sejong_festival_booth']);
});
