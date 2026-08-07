import {
  BEAR_FEED_IDS,BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,FARM_REWARD_IDS,GARDEN_FLOWER_IDS,GARDEN_PLANTABLE_FLOWER_IDS,
  type BearFeedId,type BearFeedSpotId,type FarmRewardId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../../shared/personal-farm.js';
import {PersonalFarmProgressModel,type PersonalFarmProgressDocument,type VisitMissionRecord} from '../models/PersonalFarmProgress.js';
import {UserModel} from '../models/User.js';
import {calculateFlowerInterestScore} from '../../../shared/flower-interest.js';

export class PersonalFarmProgressError extends Error {
  constructor(readonly code:string,message:string,readonly status=400){super(message)}
}

const containsAll=<T extends string>(actual:readonly T[],required:readonly T[])=>required.every(value=>actual.includes(value));
const unique=<T extends string>(values:readonly T[])=>[...new Set(values)];
const asIso=(value:Date|string|undefined)=>value?(value instanceof Date?value:new Date(value)).toISOString():null;

export function applyPersonalFarmUnlockRules(document:PersonalFarmProgressDocument,now=new Date()){
  const requiredFlowers:GardenFlowerId[]=['hydrangea','tulip','iris','camellia','sunflower'];
  const gardenComplete=containsAll(document.gardenMission.collectedFlowerIds,requiredFlowers)&&document.gardenMission.plantedFlowerIds.length===5;
  document.bearMission.fedFeedSpotIds=unique(document.bearMission.fedFeedSpotIds).filter(id=>document.bearMission.completedFeedSpotIds.includes(id));
  const bearComplete=containsAll(document.bearMission.fedFeedSpotIds,BEAR_FEED_SPOT_IDS);
  document.bearMission.bearFed=bearComplete;
  if(!bearComplete)document.bearMission.bearFedAt=undefined;
  if(gardenComplete&&!document.gardenMission.completedAt)document.gardenMission.completedAt=now;
  if(bearComplete&&!document.bearMission.completedAt)document.bearMission.completedAt=now;
  document.gardenMission.completed=gardenComplete;
  document.gardenMission.completedFlowerIds=[...document.gardenMission.collectedFlowerIds];
  document.gardenMission.requiredFlowerCount=5;
  document.gardenMission.interestCompleted=gardenComplete;
  if(gardenComplete&&!document.gardenMission.interestCompletedAt)document.gardenMission.interestCompletedAt=now;
  document.bearMission.completed=bearComplete;
  const rewards:FarmRewardId[]=[];
  if(gardenComplete)rewards.push('flower-garden');
  if(bearComplete)rewards.push('bear-statue');
  if(gardenComplete&&bearComplete)rewards.push('nature-complete-emblem','real-visit-missions-unlocked','nature-chapter-complete');
  document.farm.unlocked=gardenComplete&&bearComplete;
  document.farm.unlockedRewardIds=unique(rewards);
  document.farm.activeRewardIds=document.farm.activeRewardIds.filter(reward=>rewards.includes(reward));
  document.farm.bearGrowthStage='locked';
  document.natureChapter.gardenCompleted=gardenComplete;
  document.natureChapter.bearTreeCompleted=bearComplete;
  document.natureChapter.completed=gardenComplete&&bearComplete;
  if(document.natureChapter.completed&&!document.natureChapter.completedAt)document.natureChapter.completedAt=now;
  const visitStatus=gardenComplete&&bearComplete?'available':'locked';
  if(document.realVisit.garden.status==='locked')document.realVisit.garden.status=visitStatus;
  if(document.realVisit.bearTree.status==='locked')document.realVisit.bearTree.status=visitStatus;
}

const metadataDto=(record:VisitMissionRecord)=>record.metadata instanceof Map?Object.fromEntries(record.metadata):{...(record.metadata??{})};
export function personalFarmProgressDto(document:PersonalFarmProgressDocument):PersonalFarmProgressDto{
  const visit=(record:VisitMissionRecord)=>({status:record.status,submittedAt:asIso(record.submittedAt),reviewedAt:asIso(record.reviewedAt),metadata:metadataDto(record),file:record.file?{...record.file}:null});
  return {
    gardenMission:{collectedFlowerIds:[...document.gardenMission.collectedFlowerIds],plantedFlowerIds:[...document.gardenMission.plantedFlowerIds],completed:document.gardenMission.completed,completedAt:asIso(document.gardenMission.completedAt),completedFlowerIds:[...document.gardenMission.completedFlowerIds],requiredFlowerCount:document.gardenMission.requiredFlowerCount,interestCompleted:document.gardenMission.interestCompleted,interestCompletedAt:asIso(document.gardenMission.interestCompletedAt)},
    bearMission:{collectedFeedIds:[...document.bearMission.collectedFeedIds],completedFeedSpotIds:[...document.bearMission.completedFeedSpotIds],fedFeedSpotIds:[...document.bearMission.fedFeedSpotIds],bearFed:document.bearMission.bearFed,bearFedAt:asIso(document.bearMission.bearFedAt),completed:document.bearMission.completed,completedAt:asIso(document.bearMission.completedAt)},
    farm:{unlocked:document.farm.unlocked,unlockedRewardIds:[...document.farm.unlockedRewardIds],activeRewardIds:[...document.farm.activeRewardIds],bearGrowthStage:document.farm.bearGrowthStage},
    natureChapter:{gardenCompleted:document.natureChapter.gardenCompleted,bearTreeCompleted:document.natureChapter.bearTreeCompleted,completed:document.natureChapter.completed,completedAt:asIso(document.natureChapter.completedAt),noticeShown:document.natureChapter.noticeShown},
    realVisit:{garden:visit(document.realVisit.garden),bearTree:visit(document.realVisit.bearTree)},layoutVersion:document.layoutVersion,
    createdAt:asIso(document.createdAt)!,updatedAt:asIso(document.updatedAt)!,
  };
}

export async function getOrCreatePersonalFarmProgress(userId:string){
  const document=await PersonalFarmProgressModel.findOneAndUpdate({_id:userId},{$setOnInsert:{_id:userId,userId}},{upsert:true,returnDocument:'after'});
  if(!document)throw new PersonalFarmProgressError('PROGRESS_NOT_FOUND','개인 팜 진행도를 생성하지 못했습니다.',500);
  applyPersonalFarmUnlockRules(document);
  await document.save();
  return document;
}

async function mutate(userId:string,change:(document:PersonalFarmProgressDocument)=>void){const document=await getOrCreatePersonalFarmProgress(userId);change(document);applyPersonalFarmUnlockRules(document);await document.save();return document}

export const collectGardenFlower=async(userId:string,flowerId:GardenFlowerId)=>{
  const progress=await mutate(userId,document=>{if(document.gardenMission.collectedFlowerIds.includes(flowerId))throw new PersonalFarmProgressError('FLOWER_ALREADY_COLLECTED','이미 수집한 꽃입니다.',409);document.gardenMission.collectedFlowerIds.push(flowerId)});
  const user=await UserModel.findById(userId).select('profile');
  if(user){
    const profile=user.get('profile')??{},gardenNature=profile.gardenNature??{},records=Array.isArray(gardenNature.flowerInterests)?gardenNature.flowerInterests:[];
    if(!records.some((record:any)=>record?.flowerId===flowerId)){
      const base={flowerId,infoViewCount:0,totalInfoViewSeconds:0,nearbyVisitCount:1,totalNearbySeconds:0,revisitCount:0,lastInteractedAt:new Date().toISOString()};
      gardenNature.flowerInterests=[...records,{...base,interestScore:calculateFlowerInterestScore(base)}];profile.gardenNature=gardenNature;user.set('profile',profile);await user.save();
    }
  }
  return progress;
};
export const plantGardenFlower=(userId:string,flowerId:GardenFlowerId)=>mutate(userId,document=>{if(!(GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(flowerId))throw new PersonalFarmProgressError('INVALID_FLOWER_ID','지원하지 않는 꽃입니다.');if(!document.gardenMission.collectedFlowerIds.includes(flowerId))throw new PersonalFarmProgressError('FLOWER_NOT_COLLECTED','꽃을 먼저 수집해 주세요.',409);if(document.gardenMission.plantedFlowerIds.includes(flowerId))throw new PersonalFarmProgressError('FLOWER_ALREADY_PLANTED','이미 심은 꽃입니다.',409);if(document.gardenMission.plantedFlowerIds.length>=5)throw new PersonalFarmProgressError('FLOWER_BED_FULL','화단에는 꽃을 5개까지 심을 수 있습니다.',409);document.gardenMission.plantedFlowerIds.push(flowerId)});
export const removeGardenFlower=(userId:string,flowerId:GardenFlowerId)=>mutate(userId,document=>{if(!document.gardenMission.plantedFlowerIds.includes(flowerId))throw new PersonalFarmProgressError('FLOWER_NOT_PLANTED','화단에 심지 않은 꽃입니다.',409);document.gardenMission.plantedFlowerIds=document.gardenMission.plantedFlowerIds.filter(value=>value!==flowerId)});
export const collectBearFeed=(userId:string,feedId:BearFeedId)=>mutate(userId,document=>{if(document.bearMission.collectedFeedIds.includes(feedId))throw new PersonalFarmProgressError('FEED_ALREADY_COLLECTED','이미 수집한 먹이입니다.',409);document.bearMission.collectedFeedIds.push(feedId)});
export const completeBearFeedSpot=(userId:string,spotId:BearFeedSpotId)=>mutate(userId,document=>{if(document.bearMission.completedFeedSpotIds.includes(spotId))throw new PersonalFarmProgressError('FEED_SPOT_ALREADY_COMPLETED','이미 주운 먹이입니다.',409);if(document.bearMission.completedFeedSpotIds.length>document.bearMission.fedFeedSpotIds.length)throw new PersonalFarmProgressError('FEED_PENDING_DELIVERY','먼저 들고 있는 먹이를 곰에게 주세요.',409);const feedId=BEAR_FEED_PICKUPS[spotId].feedId;if(!document.bearMission.collectedFeedIds.includes(feedId))document.bearMission.collectedFeedIds.push(feedId);document.bearMission.completedFeedSpotIds.push(spotId)});
export const feedBear=(userId:string)=>mutate(userId,document=>{if(document.bearMission.bearFed)throw new PersonalFarmProgressError('BEAR_ALREADY_FED','이미 곰 급여 체험을 완료했습니다.',409);const pending=document.bearMission.completedFeedSpotIds.find(id=>!document.bearMission.fedFeedSpotIds.includes(id));if(!pending)throw new PersonalFarmProgressError('FEED_NOT_COLLECTED','먼저 길가의 먹이 하나를 주워 주세요.',409);document.bearMission.fedFeedSpotIds.push(pending);if(containsAll(document.bearMission.fedFeedSpotIds,BEAR_FEED_SPOT_IDS))document.bearMission.bearFedAt=new Date()});
export const setActiveFarmRewards=(userId:string,rewardIds:FarmRewardId[])=>mutate(userId,document=>{const next=unique(rewardIds);if(next.some(reward=>!document.farm.unlockedRewardIds.includes(reward)))throw new PersonalFarmProgressError('REWARD_NOT_UNLOCKED','잠금 해제된 보상만 배치할 수 있습니다.',409);document.farm.activeRewardIds=next});
export const submitVisitProof=(userId:string,mission:'garden'|'bearTree',metadata:Record<string,string>)=>mutate(userId,document=>{const target=document.realVisit[mission];if(target.status==='locked')throw new PersonalFarmProgressError('VISIT_MISSION_LOCKED','현장 방문 미션이 아직 잠겨 있습니다.',409);target.status='submitted';target.submittedAt=new Date();target.reviewedAt=undefined;target.metadata={...metadata}});

export const isGardenFlowerId=(value:string):value is GardenFlowerId=>(GARDEN_FLOWER_IDS as readonly string[]).includes(value);
export const isBearFeedId=(value:string):value is BearFeedId=>(BEAR_FEED_IDS as readonly string[]).includes(value);
export const isBearFeedSpotId=(value:string):value is BearFeedSpotId=>(BEAR_FEED_SPOT_IDS as readonly string[]).includes(value);
export const isFarmRewardId=(value:string):value is FarmRewardId=>(FARM_REWARD_IDS as readonly string[]).includes(value);
