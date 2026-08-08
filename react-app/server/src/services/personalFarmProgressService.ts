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
  document.gardenMission.guideSeen=document.gardenMission.guideSeen===true;
  document.gardenMission.favoriteFlowerIds=unique(document.gardenMission.favoriteFlowerIds??[]).slice(0,5);
  const legacyPlanted=(document.gardenMission.plantedFlowerIds??[]).slice(0,5).map((flowerId,index)=>({slot:(index+1) as 1|2|3|4|5,flowerId,plantedAt:now}));
  document.gardenMission.plantedFlowers=[...new Map((document.gardenMission.plantedFlowers?.length?document.gardenMission.plantedFlowers:legacyPlanted).filter(item=>Number.isInteger(item.slot)&&item.slot>=1&&item.slot<=5).map(item=>[item.slot,item])).values()].filter((item,index,all)=>all.findIndex(other=>other.flowerId===item.flowerId)===index).sort((a,b)=>a.slot-b.slot);
  document.memoryTree??={sourceFlowerIds:[],analysisText:''};
  document.gardenMission.plantedFlowerIds=document.gardenMission.plantedFlowers.map(item=>item.flowerId);
  const gardenComplete=document.gardenMission.favoriteFlowerIds.length===5&&document.gardenMission.plantedFlowers.length===5;
  document.bearMission.fedFeedSpotIds=unique(document.bearMission.fedFeedSpotIds).filter(id=>document.bearMission.completedFeedSpotIds.includes(id));
  document.bearMission.totalFeedCount=Math.max(document.bearMission.fedFeedSpotIds.length,Number(document.bearMission.totalFeedCount)||0);
  const bearComplete=document.bearMission.bearFed||document.bearMission.totalFeedCount>=5||containsAll(document.bearMission.fedFeedSpotIds,BEAR_FEED_SPOT_IDS);
  document.bearMission.bearFed=bearComplete;
  if(bearComplete&&!document.bearMission.bearFedAt)document.bearMission.bearFedAt=now;
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
    gardenMission:{guideSeen:document.gardenMission.guideSeen,collectedFlowerIds:[...document.gardenMission.collectedFlowerIds],favoriteFlowerIds:[...document.gardenMission.favoriteFlowerIds],plantedFlowerIds:[...document.gardenMission.plantedFlowerIds],plantedFlowers:document.gardenMission.plantedFlowers.map(item=>({slot:item.slot,flowerId:item.flowerId,plantedAt:asIso(item.plantedAt)!})),completed:document.gardenMission.completed,completedAt:asIso(document.gardenMission.completedAt),completedFlowerIds:[...document.gardenMission.completedFlowerIds],requiredFlowerCount:document.gardenMission.requiredFlowerCount,interestCompleted:document.gardenMission.interestCompleted,interestCompletedAt:asIso(document.gardenMission.interestCompletedAt)},
    memoryTree:{sourceFlowerIds:[...document.memoryTree.sourceFlowerIds],analysisText:document.memoryTree.analysisText,analyzedAt:asIso(document.memoryTree.analyzedAt)},
    bearMission:{collectedFeedIds:[...document.bearMission.collectedFeedIds],completedFeedSpotIds:[...document.bearMission.completedFeedSpotIds],fedFeedSpotIds:[...document.bearMission.fedFeedSpotIds],repeatFeedSpotId:document.bearMission.repeatFeedSpotId??null,repeatFeedAvailableAt:asIso(document.bearMission.repeatFeedAvailableAt),totalFeedCount:document.bearMission.totalFeedCount,bearFed:document.bearMission.bearFed,bearFedAt:asIso(document.bearMission.bearFedAt),completed:document.bearMission.completed,completedAt:asIso(document.bearMission.completedAt)},
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

async function mutate(userId:string,change:(document:PersonalFarmProgressDocument)=>void){const document=await getOrCreatePersonalFarmProgress(userId);change(document);applyPersonalFarmUnlockRules(document);const fields=Object.fromEntries(['gardenMission','memoryTree','bearMission','farm','natureChapter','realVisit'].map(path=>[path,structuredClone((document as any)[path])]));await (PersonalFarmProgressModel as any).updateOne({_id:userId},{$set:fields});return await PersonalFarmProgressModel.findOne({_id:userId}) as PersonalFarmProgressDocument}

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
export const completeBearFeedSpot=(userId:string,spotId:BearFeedSpotId)=>mutate(userId,document=>{if(document.bearMission.completed){if(document.bearMission.repeatFeedSpotId)throw new PersonalFarmProgressError('FEED_PENDING_DELIVERY','먼저 들고 있는 먹이를 곰에게 주세요.',409);if(document.bearMission.repeatFeedAvailableAt&&new Date(document.bearMission.repeatFeedAvailableAt).getTime()>Date.now())throw new PersonalFarmProgressError('FEED_RESPAWNING','먹이가 다시 나타나는 중입니다.',409);document.bearMission.repeatFeedSpotId=spotId;return}if(document.bearMission.completedFeedSpotIds.includes(spotId))throw new PersonalFarmProgressError('FEED_SPOT_ALREADY_COMPLETED','이미 주운 먹이입니다.',409);if(document.bearMission.completedFeedSpotIds.length>document.bearMission.fedFeedSpotIds.length)throw new PersonalFarmProgressError('FEED_PENDING_DELIVERY','먼저 들고 있는 먹이를 곰에게 주세요.',409);const feedId=BEAR_FEED_PICKUPS[spotId].feedId;if(!document.bearMission.collectedFeedIds.includes(feedId))document.bearMission.collectedFeedIds.push(feedId);document.bearMission.completedFeedSpotIds.push(spotId)});
export const feedBear=(userId:string)=>mutate(userId,document=>{if(document.bearMission.completed){if(!document.bearMission.repeatFeedSpotId)throw new PersonalFarmProgressError('FEED_NOT_COLLECTED','먼저 다시 나타난 먹이를 주워 주세요.',409);document.bearMission.repeatFeedSpotId=undefined;document.bearMission.repeatFeedAvailableAt=new Date(Date.now()+3000);document.bearMission.totalFeedCount+=1;return}const pending=document.bearMission.completedFeedSpotIds.find(id=>!document.bearMission.fedFeedSpotIds.includes(id));if(!pending)throw new PersonalFarmProgressError('FEED_NOT_COLLECTED','먼저 길가의 먹이 하나를 주워 주세요.',409);document.bearMission.fedFeedSpotIds.push(pending);document.bearMission.totalFeedCount+=1;if(containsAll(document.bearMission.fedFeedSpotIds,BEAR_FEED_SPOT_IDS)){document.bearMission.bearFedAt=new Date();document.bearMission.repeatFeedAvailableAt=new Date(Date.now()+3000)}});
export const setActiveFarmRewards=(userId:string,rewardIds:FarmRewardId[])=>mutate(userId,document=>{const next=unique(rewardIds);if(next.some(reward=>!document.farm.unlockedRewardIds.includes(reward)))throw new PersonalFarmProgressError('REWARD_NOT_UNLOCKED','잠금 해제된 보상만 배치할 수 있습니다.',409);document.farm.activeRewardIds=next});
export const submitVisitProof=(userId:string,mission:'garden'|'bearTree',metadata:Record<string,string>)=>mutate(userId,document=>{const target=document.realVisit[mission];if(target.status==='locked')throw new PersonalFarmProgressError('VISIT_MISSION_LOCKED','현장 방문 미션이 아직 잠겨 있습니다.',409);target.status='submitted';target.submittedAt=new Date();target.reviewedAt=undefined;target.metadata={...metadata}});

export const setGardenGuideSeen=(userId:string)=>mutate(userId,document=>{document.gardenMission.guideSeen=true});
export const toggleFavoriteFlower=(userId:string,flowerId:GardenFlowerId)=>mutate(userId,document=>{
  const selected=document.gardenMission.favoriteFlowerIds;
  if(selected.includes(flowerId)){
    document.gardenMission.favoriteFlowerIds=selected.filter(id=>id!==flowerId);
    document.memoryTree={sourceFlowerIds:[],analysisText:''};
    return;
  }
  if(selected.length>=5)throw new PersonalFarmProgressError('FAVORITE_FLOWERS_FULL','선택한 꽃 5개 중 하나를 해제한 뒤 새 꽃을 선택해 주세요.',409);
  if(!document.gardenMission.collectedFlowerIds.includes(flowerId))document.gardenMission.collectedFlowerIds.push(flowerId);
  selected.push(flowerId);
  document.memoryTree={sourceFlowerIds:[],analysisText:''};
});
export const plantGardenFlowerInSlot=(userId:string,flowerId:GardenFlowerId,slot:1|2|3|4|5)=>mutate(userId,document=>{
  if(!(GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(flowerId))throw new PersonalFarmProgressError('INVALID_FLOWER_ID','지원하지 않는 꽃입니다.');
  if(!document.gardenMission.favoriteFlowerIds.includes(flowerId)&&!document.gardenMission.collectedFlowerIds.includes(flowerId))throw new PersonalFarmProgressError('FLOWER_NOT_COLLECTED','수목원에서 채집하거나 선택한 꽃만 심을 수 있습니다.',409);
  document.gardenMission.plantedFlowers=document.gardenMission.plantedFlowers.filter(item=>item.slot!==slot&&item.flowerId!==flowerId);
  document.gardenMission.plantedFlowers.push({slot,flowerId,plantedAt:new Date()});
});
export const setMemoryTreeAnalysis=(userId:string,sourceFlowerIds:GardenFlowerId[],analysisText:string)=>mutate(userId,document=>{document.memoryTree={sourceFlowerIds:[...sourceFlowerIds],analysisText,analyzedAt:new Date()}});

export const isGardenFlowerId=(value:string):value is GardenFlowerId=>(GARDEN_FLOWER_IDS as readonly string[]).includes(value);
export const isBearFeedId=(value:string):value is BearFeedId=>(BEAR_FEED_IDS as readonly string[]).includes(value);
export const isBearFeedSpotId=(value:string):value is BearFeedSpotId=>(BEAR_FEED_SPOT_IDS as readonly string[]).includes(value);
export const isFarmRewardId=(value:string):value is FarmRewardId=>(FARM_REWARD_IDS as readonly string[]).includes(value);
