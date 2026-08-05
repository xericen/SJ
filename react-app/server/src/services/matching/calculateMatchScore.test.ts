import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateMatchScore} from './calculateMatchScore.js';

test('선호 장소 카테고리를 실제 매칭 점수와 이유에 반영한다',()=>{
  const result=calculateMatchScore(
    {preferredPlaceCategories:['카페']},
    {preferredPlaceCategories:['카페']},
  );
  assert.equal(result.placeCategoryScore,100);
  assert.equal(result.totalScore,30);
  assert.deepEqual(result.sharedPlaceCategories,['카페']);
  assert.match(result.reason,/선호 장소/);
});

test('체험·관심사·장소·목적·MBTI가 모두 같으면 100점이다',()=>{
  const profile={mbti:'ENFP',interests:['야간·감성'],usagePurposes:['축제 동행'],preferredPlaceCategories:['관광명소'],experienceRecords:['관심 축제: 세종 낙화축제']};
  const result=calculateMatchScore(profile,profile);
  assert.equal(result.totalScore,100);
  assert.equal(result.experienceScore,100);
  assert.equal(result.placeCategoryScore,100);
});
