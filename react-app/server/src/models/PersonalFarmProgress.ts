import {createMysqlJsonModel} from '../database/mysqlJsonModel.js';
import {
  type BearFeedId,type BearFeedSpotId,type BearGrowthStage,type FarmRewardId,type GardenFlowerId,type VisitMissionStatus,
} from '../../../shared/personal-farm.js';

type StoredDate=Date|string;

export interface VisitMissionRecord {
  status:VisitMissionStatus;
  submittedAt?:StoredDate;
  reviewedAt?:StoredDate;
  metadata:Record<string,string>;
  file?:{originalName:string;mimeType:string;size:number};
}

export interface PersonalFarmProgress {
  _id:string;
  id:string;
  userId:string;
  gardenMission:{collectedFlowerIds:GardenFlowerId[];plantedFlowerIds:GardenFlowerId[];completed:boolean;completedAt?:StoredDate;completedFlowerIds:string[];requiredFlowerCount:number;interestCompleted:boolean;interestCompletedAt?:StoredDate};
  bearMission:{collectedFeedIds:BearFeedId[];completedFeedSpotIds:BearFeedSpotId[];fedFeedSpotIds:BearFeedSpotId[];bearFed:boolean;bearFedAt?:StoredDate;completed:boolean;completedAt?:StoredDate};
  farm:{unlocked:boolean;unlockedRewardIds:FarmRewardId[];activeRewardIds:FarmRewardId[];bearGrowthStage:BearGrowthStage};
  natureChapter:{gardenCompleted:boolean;bearTreeCompleted:boolean;completed:boolean;completedAt?:StoredDate;noticeShown:boolean};
  realVisit:{garden:VisitMissionRecord;bearTree:VisitMissionRecord};
  layoutVersion:number;
  createdAt:StoredDate;
  updatedAt:StoredDate;
}

export interface PersonalFarmProgressDocument extends PersonalFarmProgress {
  save():Promise<PersonalFarmProgressDocument>;
}

const visitDefaults=(value:Partial<VisitMissionRecord>|undefined):VisitMissionRecord=>({
  status:'locked',...value,metadata:{...(value?.metadata??{})},
});
const bearMissionDefaults=(value:Partial<PersonalFarmProgress['bearMission']>|undefined)=>{
  const mission={collectedFeedIds:[],completedFeedSpotIds:[],fedFeedSpotIds:[],bearFed:false,completed:false,...value} as PersonalFarmProgress['bearMission'];
  if(mission.bearFed&&!mission.fedFeedSpotIds.length)mission.fedFeedSpotIds=[...mission.completedFeedSpotIds];
  return mission;
};

export const PersonalFarmProgressModel=createMysqlJsonModel('personal_farm_progress',(input)=>({
  ...input,
  _id:String(input.userId??input._id),
  id:String(input.userId??input.id??input._id),
  userId:String(input.userId??input._id),
  gardenMission:{collectedFlowerIds:[],plantedFlowerIds:[],completed:false,completedFlowerIds:[],requiredFlowerCount:5,interestCompleted:false,...input.gardenMission},
  bearMission:bearMissionDefaults(input.bearMission),
  farm:{unlocked:false,unlockedRewardIds:[],activeRewardIds:[],bearGrowthStage:'locked',...input.farm},
  natureChapter:{gardenCompleted:false,bearTreeCompleted:false,completed:false,noticeShown:false,...input.natureChapter},
  realVisit:{
    garden:visitDefaults(input.realVisit?.garden),
    bearTree:visitDefaults(input.realVisit?.bearTree),
  },
  layoutVersion:Math.max(1,Number(input.layoutVersion)||1),
})) as {
  findOne(filter:Record<string,unknown>):Promise<PersonalFarmProgressDocument|null>;
  findOneAndUpdate(filter:Record<string,unknown>,update:Record<string,unknown>,options:Record<string,unknown>):Promise<PersonalFarmProgressDocument|null>;
  create(input:Record<string,unknown>):Promise<PersonalFarmProgressDocument>;
  deleteMany(filter?:Record<string,unknown>):Promise<{acknowledged:boolean;deletedCount:number}>;
};
