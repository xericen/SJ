import {
  BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,FARM_REWARD_IDS,GARDEN_PLANTABLE_FLOWER_IDS,
  type BearFeedId,type BearFeedSpotId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../shared/personal-farm';

const now=()=>new Date().toISOString();

function emptyProgress():PersonalFarmProgressDto{
  const timestamp=now();
  return {
    gardenMission:{collectedFlowerIds:[],plantedFlowerIds:[],completed:false,completedAt:null,completedFlowerIds:[],requiredFlowerCount:5,interestCompleted:false,interestCompletedAt:null},
    bearMission:{collectedFeedIds:[],completedFeedSpotIds:[],fedFeedSpotIds:[],bearFed:false,bearFedAt:null,completed:false,completedAt:null},
    farm:{unlocked:false,unlockedRewardIds:[],activeRewardIds:[],bearGrowthStage:'locked'},
    natureChapter:{gardenCompleted:false,bearTreeCompleted:false,completed:false,completedAt:null,noticeShown:false},
    realVisit:{garden:{status:'locked',submittedAt:null,reviewedAt:null,metadata:{},file:null},bearTree:{status:'locked',submittedAt:null,reviewedAt:null,metadata:{},file:null}},
    layoutVersion:1,createdAt:timestamp,updatedAt:timestamp,
  };
}

function derive(progress:PersonalFarmProgressDto){
  const timestamp=now();
  const gardenCompleted=['hydrangea','tulip','iris','camellia','sunflower'].every(id=>progress.gardenMission.collectedFlowerIds.includes(id as GardenFlowerId))&&progress.gardenMission.plantedFlowerIds.length===5;
  const bearCompleted=BEAR_FEED_SPOT_IDS.every(id=>progress.bearMission.fedFeedSpotIds.includes(id));
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
  private progress=emptyProgress();
  private update(change:(progress:PersonalFarmProgressDto)=>void){change(this.progress);return Promise.resolve(derive(this.progress))}
  get(){return Promise.resolve(derive(this.progress))}
  collectFlower(id:GardenFlowerId){return this.update(progress=>{if(!progress.gardenMission.collectedFlowerIds.includes(id))progress.gardenMission.collectedFlowerIds.push(id)})}
  plantFlower(id:GardenFlowerId){return this.update(progress=>{if((GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(id)&&progress.gardenMission.collectedFlowerIds.includes(id)&&!progress.gardenMission.plantedFlowerIds.includes(id)&&progress.gardenMission.plantedFlowerIds.length<5)progress.gardenMission.plantedFlowerIds.push(id)})}
  removeFlower(id:GardenFlowerId){return this.update(progress=>{progress.gardenMission.plantedFlowerIds=progress.gardenMission.plantedFlowerIds.filter(value=>value!==id)})}
  collectFeed(id:BearFeedId){return this.update(progress=>{if(!progress.bearMission.collectedFeedIds.includes(id))progress.bearMission.collectedFeedIds.push(id)})}
  completeFeedSpot(id:BearFeedSpotId){return this.update(progress=>{if(progress.bearMission.completedFeedSpotIds.length>progress.bearMission.fedFeedSpotIds.length||progress.bearMission.completedFeedSpotIds.includes(id))return;const feedId=BEAR_FEED_PICKUPS[id].feedId;if(!progress.bearMission.collectedFeedIds.includes(feedId))progress.bearMission.collectedFeedIds.push(feedId);progress.bearMission.completedFeedSpotIds.push(id)})}
  feedBear(){return this.update(progress=>{const pending=progress.bearMission.completedFeedSpotIds.find(id=>!progress.bearMission.fedFeedSpotIds.includes(id));if(!pending)return;progress.bearMission.fedFeedSpotIds.push(pending);if(BEAR_FEED_SPOT_IDS.every(id=>progress.bearMission.fedFeedSpotIds.includes(id))){progress.bearMission.bearFed=true;progress.bearMission.bearFedAt=now()}})}
  activeRewards(ids:PersonalFarmProgressDto['farm']['activeRewardIds']){return this.update(progress=>{progress.farm.activeRewardIds=ids.filter(id=>(FARM_REWARD_IDS as readonly string[]).includes(id)&&progress.farm.unlockedRewardIds.includes(id))})}
  reset(){this.progress=emptyProgress()}
}
