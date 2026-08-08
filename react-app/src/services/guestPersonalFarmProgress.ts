import {
  BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,FARM_REWARD_IDS,GARDEN_PLANTABLE_FLOWER_IDS,
  type BearFeedId,type BearFeedSpotId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../shared/personal-farm';

const now=()=>new Date().toISOString();
export const GUEST_PERSONAL_FARM_SESSION_KEY='sj-guest-personal-farm-progress-v1';

function emptyProgress():PersonalFarmProgressDto{
  const timestamp=now();
  return {
    gardenMission:{guideSeen:false,collectedFlowerIds:[],favoriteFlowerIds:[],plantedFlowerIds:[],plantedFlowers:[],completed:false,completedAt:null,completedFlowerIds:[],requiredFlowerCount:5,interestCompleted:false,interestCompletedAt:null},
    memoryTree:{sourceFlowerIds:[],analysisText:'',analyzedAt:null},
    bearMission:{collectedFeedIds:[],completedFeedSpotIds:[],fedFeedSpotIds:[],repeatFeedSpotId:null,repeatFeedAvailableAt:null,totalFeedCount:0,bearFed:false,bearFedAt:null,completed:false,completedAt:null},
    farm:{unlocked:false,unlockedRewardIds:[],activeRewardIds:[],bearGrowthStage:'locked'},
    natureChapter:{gardenCompleted:false,bearTreeCompleted:false,completed:false,completedAt:null,noticeShown:false},
    realVisit:{garden:{status:'locked',submittedAt:null,reviewedAt:null,metadata:{},file:null},bearTree:{status:'locked',submittedAt:null,reviewedAt:null,metadata:{},file:null}},
    layoutVersion:1,createdAt:timestamp,updatedAt:timestamp,
  };
}

function derive(progress:PersonalFarmProgressDto){
  const timestamp=now();
  progress.gardenMission.guideSeen=progress.gardenMission.guideSeen===true;
  progress.gardenMission.favoriteFlowerIds=[...new Set(progress.gardenMission.favoriteFlowerIds??[])].slice(0,5);
  const storedPlantedFlowers=Array.isArray(progress.gardenMission.plantedFlowers)?progress.gardenMission.plantedFlowers:[];
  progress.gardenMission.plantedFlowers=storedPlantedFlowers.length?storedPlantedFlowers:progress.gardenMission.plantedFlowerIds.slice(0,5).map((flowerId,index)=>({slot:(index+1) as 1|2|3|4|5,flowerId,plantedAt:timestamp}));
  progress.gardenMission.plantedFlowerIds=progress.gardenMission.plantedFlowers.sort((a,b)=>a.slot-b.slot).map(item=>item.flowerId);
  progress.memoryTree??={sourceFlowerIds:[],analysisText:'',analyzedAt:null};
  progress.bearMission.repeatFeedSpotId??=null;progress.bearMission.repeatFeedAvailableAt??=null;progress.bearMission.totalFeedCount=Math.max(progress.bearMission.fedFeedSpotIds.length,Number(progress.bearMission.totalFeedCount)||0);
  const gardenCompleted=progress.gardenMission.favoriteFlowerIds.length===5&&progress.gardenMission.plantedFlowers.length===5;
  const bearCompleted=progress.bearMission.bearFed||progress.bearMission.totalFeedCount>=5||BEAR_FEED_SPOT_IDS.every(id=>progress.bearMission.fedFeedSpotIds.includes(id));
  progress.gardenMission.completedFlowerIds=[...progress.gardenMission.collectedFlowerIds];
  progress.gardenMission.completed=gardenCompleted;progress.gardenMission.interestCompleted=gardenCompleted;
  progress.bearMission.completed=bearCompleted;progress.bearMission.bearFed=bearCompleted;
  if(!bearCompleted)progress.bearMission.bearFedAt=null;
  progress.natureChapter.gardenCompleted=gardenCompleted;progress.natureChapter.bearTreeCompleted=bearCompleted;progress.natureChapter.completed=gardenCompleted&&bearCompleted;
  if(gardenCompleted&&!progress.gardenMission.completedAt)progress.gardenMission.completedAt=timestamp;
  if(gardenCompleted&&!progress.gardenMission.interestCompletedAt)progress.gardenMission.interestCompletedAt=timestamp;
  if(bearCompleted&&!progress.bearMission.completedAt)progress.bearMission.completedAt=timestamp;
  if(progress.natureChapter.completed&&!progress.natureChapter.completedAt)progress.natureChapter.completedAt=timestamp;
  const rewards:PersonalFarmProgressDto['farm']['unlockedRewardIds']=[];
  if(gardenCompleted)rewards.push('flower-garden');
  if(bearCompleted)rewards.push('bear-statue');
  if(gardenCompleted&&bearCompleted)rewards.push('nature-complete-emblem','real-visit-missions-unlocked','nature-chapter-complete');
  progress.farm.unlocked=gardenCompleted&&bearCompleted;progress.farm.unlockedRewardIds=rewards;
  progress.farm.activeRewardIds=progress.farm.activeRewardIds.filter(id=>rewards.includes(id));
  progress.updatedAt=timestamp;
  return structuredClone(progress);
}

export class GuestPersonalFarmProgress{
  // Guest progress is intentionally session-memory only. A browser refresh
  // starts a new demo from an empty state; authenticated progress uses the API.
  private progress=emptyProgress();
  private update(change:(progress:PersonalFarmProgressDto)=>void){change(this.progress);return Promise.resolve(derive(this.progress))}
  get(){return Promise.resolve(derive(this.progress))}
  collectFlower(id:GardenFlowerId){return this.update(progress=>{if(!progress.gardenMission.collectedFlowerIds.includes(id))progress.gardenMission.collectedFlowerIds.push(id)})}
  guideSeen(){return this.update(progress=>{progress.gardenMission.guideSeen=true})}
  toggleFavorite(id:GardenFlowerId){return this.update(progress=>{const selected=progress.gardenMission.favoriteFlowerIds;if(selected.includes(id))progress.gardenMission.favoriteFlowerIds=selected.filter(value=>value!==id);else if(selected.length<5){if(!progress.gardenMission.collectedFlowerIds.includes(id))progress.gardenMission.collectedFlowerIds.push(id);selected.push(id)}progress.memoryTree={sourceFlowerIds:[],analysisText:'',analyzedAt:null}})}
  memoryTreeAnalysis(sourceFlowerIds:GardenFlowerId[],analysisText:string){return this.update(progress=>{progress.memoryTree={sourceFlowerIds:[...sourceFlowerIds],analysisText,analyzedAt:now()}})}
  plantFlower(id:GardenFlowerId){return this.update(progress=>{if((GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(id)&&progress.gardenMission.collectedFlowerIds.includes(id)&&!progress.gardenMission.plantedFlowerIds.includes(id)&&progress.gardenMission.plantedFlowerIds.length<5)progress.gardenMission.plantedFlowerIds.push(id)})}
  plantFlowerInSlot(id:GardenFlowerId,slot:1|2|3|4|5){return this.update(progress=>{if(!progress.gardenMission.favoriteFlowerIds.includes(id)&&!progress.gardenMission.collectedFlowerIds.includes(id))return;progress.gardenMission.plantedFlowers=progress.gardenMission.plantedFlowers.filter(item=>item.slot!==slot&&item.flowerId!==id);progress.gardenMission.plantedFlowers.push({slot,flowerId:id,plantedAt:now()})})}
  removeFlower(id:GardenFlowerId){return this.update(progress=>{progress.gardenMission.plantedFlowerIds=progress.gardenMission.plantedFlowerIds.filter(value=>value!==id);progress.gardenMission.plantedFlowers=progress.gardenMission.plantedFlowers.filter(item=>item.flowerId!==id)})}
  collectFeed(id:BearFeedId){return this.update(progress=>{if(!progress.bearMission.collectedFeedIds.includes(id))progress.bearMission.collectedFeedIds.push(id)})}
  completeFeedSpot(id:BearFeedSpotId){return this.update(progress=>{if(progress.bearMission.completed){if(progress.bearMission.repeatFeedSpotId)return;if(progress.bearMission.repeatFeedAvailableAt&&Date.parse(progress.bearMission.repeatFeedAvailableAt)>Date.now())return;progress.bearMission.repeatFeedSpotId=id;return}if(progress.bearMission.completedFeedSpotIds.length>progress.bearMission.fedFeedSpotIds.length||progress.bearMission.completedFeedSpotIds.includes(id))return;const feedId=BEAR_FEED_PICKUPS[id].feedId;if(!progress.bearMission.collectedFeedIds.includes(feedId))progress.bearMission.collectedFeedIds.push(feedId);progress.bearMission.completedFeedSpotIds.push(id)})}
  feedBear(){return this.update(progress=>{if(progress.bearMission.completed){if(!progress.bearMission.repeatFeedSpotId)return;progress.bearMission.repeatFeedSpotId=null;progress.bearMission.repeatFeedAvailableAt=new Date(Date.now()+3000).toISOString();progress.bearMission.totalFeedCount+=1;return}const pending=progress.bearMission.completedFeedSpotIds.find(id=>!progress.bearMission.fedFeedSpotIds.includes(id));if(!pending)return;progress.bearMission.fedFeedSpotIds.push(pending);progress.bearMission.totalFeedCount+=1;if(BEAR_FEED_SPOT_IDS.every(id=>progress.bearMission.fedFeedSpotIds.includes(id))){progress.bearMission.bearFed=true;progress.bearMission.bearFedAt=now();progress.bearMission.repeatFeedAvailableAt=new Date(Date.now()+3000).toISOString()}})}
  activeRewards(ids:PersonalFarmProgressDto['farm']['activeRewardIds']){return this.update(progress=>{progress.farm.activeRewardIds=ids.filter(id=>(FARM_REWARD_IDS as readonly string[]).includes(id)&&progress.farm.unlockedRewardIds.includes(id))})}
  reset(){this.progress=emptyProgress();try{sessionStorage.removeItem(GUEST_PERSONAL_FARM_SESSION_KEY)}catch{/* no-op */}}
}
