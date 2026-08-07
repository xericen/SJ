import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {after,before,test} from 'node:test';
import express from 'express';
import {connectDatabase,disconnectDatabase} from '../config/database.js';
import {PersonalFarmProgressModel} from '../models/PersonalFarmProgress.js';
import {UserModel} from '../models/User.js';
import {BEAR_FEED_SPOT_IDS,GARDEN_FLOWER_IDS} from '../../../shared/personal-farm.js';
import {collectGardenFlower,completeBearFeedSpot,feedBear,getOrCreatePersonalFarmProgress,plantGardenFlower,removeGardenFlower} from './personalFarmProgressService.js';

const testUserIds=new Set<string>();
const userId=()=>{const id=randomBytes(12).toString('hex');testUserIds.add(id);return id};

before(async()=>{await connectDatabase()});
after(async()=>{
  const ids=[...testUserIds];
  if(ids.length)await Promise.all([PersonalFarmProgressModel.deleteMany({_id:{$in:ids}}),UserModel.deleteMany({_id:{$in:ids}})]);
  await disconnectDatabase();
});

test('MySQL progress documents are isolated by authenticated user id',async()=>{
  const first=userId(),second=userId();
  await collectGardenFlower(first,'tulip');await getOrCreatePersonalFarmProgress(second);
  const firstProgress=await PersonalFarmProgressModel.findOne({_id:first}),secondProgress=await PersonalFarmProgressModel.findOne({_id:second});
  assert.ok(firstProgress);assert.ok(secondProgress);
  assert.deepEqual(firstProgress.gardenMission.collectedFlowerIds,['tulip']);assert.deepEqual(secondProgress.gardenMission.collectedFlowerIds,[]);
});

test('duplicate flower collection is rejected',async()=>{const id=userId();await collectGardenFlower(id,'tulip');await assert.rejects(()=>collectGardenFlower(id,'tulip'),{code:'FLOWER_ALREADY_COLLECTED'})});
test('an uncollected flower cannot be planted',async()=>{await assert.rejects(()=>plantGardenFlower(userId(),'iris'),{code:'FLOWER_NOT_COLLECTED'})});
test('the flower bed holds five flowers and supports removal',async()=>{const id=userId();for(const flower of GARDEN_FLOWER_IDS.slice(0,6))await collectGardenFlower(id,flower);for(const flower of GARDEN_FLOWER_IDS.slice(0,5))await plantGardenFlower(id,flower);await assert.rejects(()=>plantGardenFlower(id,GARDEN_FLOWER_IDS[5]),{code:'FLOWER_BED_FULL'});await removeGardenFlower(id,GARDEN_FLOWER_IDS[0]);const progress=await plantGardenFlower(id,GARDEN_FLOWER_IDS[5]);assert.equal(progress.gardenMission.plantedFlowerIds.length,5);assert.equal(progress.gardenMission.plantedFlowerIds.includes(GARDEN_FLOWER_IDS[0]),false)});
test('picking up a roadside feed spot records its food type',async()=>{const id=userId();await completeBearFeedSpot(id,'BEAR_FEED_SPOT_01');const progress=await getOrCreatePersonalFarmProgress(id);assert.deepEqual(progress.bearMission.collectedFeedIds,['apple'])});
test('the same feed pickup cannot be collected twice',async()=>{const id=userId();await completeBearFeedSpot(id,'BEAR_FEED_SPOT_01');await assert.rejects(()=>completeBearFeedSpot(id,'BEAR_FEED_SPOT_01'),{code:'FEED_SPOT_ALREADY_COMPLETED'})});
test('each pickup must be delivered before another feed can be collected',async()=>{const id=userId();await completeBearFeedSpot(id,'BEAR_FEED_SPOT_01');await assert.rejects(()=>completeBearFeedSpot(id,'BEAR_FEED_SPOT_02'),{code:'FEED_PENDING_DELIVERY'});const progress=await feedBear(id);assert.deepEqual(progress.bearMission.fedFeedSpotIds,['BEAR_FEED_SPOT_01']);assert.equal(progress.bearMission.completed,false)});
test('the bear cannot be fed without one collected food',async()=>{await assert.rejects(()=>feedBear(userId()),{code:'FEED_NOT_COLLECTED'})});

const REQUIRED_GARDEN_FLOWERS=['hydrangea','tulip','iris','camellia','sunflower'] as const;
async function completeGarden(id:string){for(const flower of REQUIRED_GARDEN_FLOWERS){await collectGardenFlower(id,flower);await plantGardenFlower(id,flower)}}
async function completeBearMission(id:string){for(const spot of BEAR_FEED_SPOT_IDS){await completeBearFeedSpot(id,spot);await feedBear(id)}}

test('completing only one location keeps the farm locked',async()=>{
  const id=userId();await completeGarden(id);const progress=await getOrCreatePersonalFarmProgress(id);
  assert.equal(progress.gardenMission.completed,true);assert.equal(progress.bearMission.completed,false);assert.equal(progress.farm.unlocked,false);
  assert.deepEqual(progress.farm.unlockedRewardIds,['flower-garden']);
});

test('completion and rewards are derived only after both locations are complete',async()=>{
  const id=userId();await completeGarden(id);await completeBearMission(id);const progress=await getOrCreatePersonalFarmProgress(id);
  assert.equal(progress.gardenMission.completed,true);assert.equal(progress.bearMission.completed,true);assert.equal(progress.farm.unlocked,true);
  assert.deepEqual(progress.bearMission.fedFeedSpotIds,BEAR_FEED_SPOT_IDS);
  assert.deepEqual([...progress.farm.unlockedRewardIds].sort(),['bear-statue','flower-garden','nature-chapter-complete','nature-complete-emblem','real-visit-missions-unlocked'].sort());
  assert.equal(progress.natureChapter.completed,true);
  assert.equal(progress.farm.bearGrowthStage,'locked');
});

test('server rules overwrite forged completion and unlock values',async()=>{
  const id=userId();await PersonalFarmProgressModel.create({_id:id,userId:id,gardenMission:{completed:true},bearMission:{completed:true},farm:{unlocked:true}});
  const progress=await getOrCreatePersonalFarmProgress(id);
  assert.equal(progress.gardenMission.completed,false);assert.equal(progress.bearMission.completed,false);assert.equal(progress.farm.unlocked,false);
});

test('authenticated API ignores another user id and client completion fields',async()=>{
  const [{personalFarmRouter},{createAuthSessionToken}]=await Promise.all([import('../routes/personalFarm.js'),import('../middleware/authenticatedUser.js')]);
  const firstId=userId(),secondId=userId();
  await UserModel.create({_id:firstId,kakaoId:`farm-${firstId}`,nickname:'first'});
  await UserModel.create({_id:secondId,kakaoId:`farm-${secondId}`,nickname:'second'});
  const token=createAuthSessionToken(secondId);assert.ok(token);
  const app=express();app.use(express.json());app.use('/api/account',personalFarmRouter);
  const server=app.listen(0);await new Promise<void>(resolve=>server.once('listening',resolve));
  try{
    const address=server.address();assert.ok(address&&typeof address==='object');
    const response=await fetch(`http://127.0.0.1:${address.port}/api/account/me/personal-farm/garden/collect/tulip`,{method:'POST',headers:{'content-type':'application/json',cookie:`jochwon_session=${token}`},body:JSON.stringify({userId:firstId,completed:true,unlocked:true})});
    assert.equal(response.status,200);
    const firstProgress=await PersonalFarmProgressModel.findOne({_id:firstId});
    const secondProgress=await PersonalFarmProgressModel.findOne({_id:secondId});assert.ok(secondProgress);
    assert.equal(firstProgress,null);assert.deepEqual(secondProgress.gardenMission.collectedFlowerIds,['tulip']);assert.equal(secondProgress.gardenMission.completed,false);assert.equal(secondProgress.farm.unlocked,false);
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))}
});
