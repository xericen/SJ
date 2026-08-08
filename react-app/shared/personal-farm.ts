export const GARDEN_FLOWER_IDS=[
  'magnolia','adonis','azalea','hydrangea','tulip','iris','lily','camellia',
  'sunflower','gujeolcho','hibiscus','bird-of-paradise','peach-tree','maple-tree',
] as const;
export type GardenFlowerId=typeof GARDEN_FLOWER_IDS[number];

export const GARDEN_PLANTABLE_FLOWER_IDS=GARDEN_FLOWER_IDS;
export type GardenPlantableFlowerId=typeof GARDEN_PLANTABLE_FLOWER_IDS[number];

export const BEAR_FEED_IDS=['apple','carrot','acorn'] as const;
export type BearFeedId=typeof BEAR_FEED_IDS[number];

export const BEAR_FEED_SPOT_IDS=['BEAR_FEED_SPOT_01','BEAR_FEED_SPOT_02','BEAR_FEED_SPOT_03','BEAR_FEED_SPOT_04','BEAR_FEED_SPOT_05'] as const;
export type BearFeedSpotId=typeof BEAR_FEED_SPOT_IDS[number];

export const BEAR_FEED_PICKUPS:Record<BearFeedSpotId,{feedId:BearFeedId;name:string;emoji:string}>={
  BEAR_FEED_SPOT_01:{feedId:'apple',name:'사과',emoji:'🍎'},
  BEAR_FEED_SPOT_02:{feedId:'carrot',name:'당근',emoji:'🥕'},
  BEAR_FEED_SPOT_03:{feedId:'acorn',name:'도토리',emoji:'🌰'},
  BEAR_FEED_SPOT_04:{feedId:'apple',name:'사과',emoji:'🍎'},
  BEAR_FEED_SPOT_05:{feedId:'carrot',name:'당근',emoji:'🥕'},
};

export const FARM_REWARD_IDS=['flower-garden','bear-statue','nature-complete-emblem','real-visit-missions-unlocked','nature-chapter-complete'] as const;
export type FarmRewardId=typeof FARM_REWARD_IDS[number];

export type BearGrowthStage='locked'|'cub'|'young'|'adult';
export type VisitMissionStatus='locked'|'available'|'submitted'|'verified'|'rejected';
export type VisitPlaceId='garden'|'bearTree';
export type FlowerSlot=1|2|3|4|5;
export interface PlantedFlowerDto {slot:FlowerSlot;flowerId:GardenFlowerId;plantedAt:string}
export interface MemoryTreeDto {sourceFlowerIds:GardenFlowerId[];analysisText:string;analyzedAt:string|null}

export interface VisitMissionDto {
  status:VisitMissionStatus;
  submittedAt:string|null;
  reviewedAt:string|null;
  metadata:Record<string,string>;
  file:{originalName:string;mimeType:string;size:number}|null;
}

export interface PersonalFarmProgressDto {
  gardenMission:{guideSeen:boolean;collectedFlowerIds:GardenFlowerId[];favoriteFlowerIds:GardenFlowerId[];plantedFlowerIds:GardenFlowerId[];plantedFlowers:PlantedFlowerDto[];completed:boolean;completedAt:string|null;completedFlowerIds:string[];requiredFlowerCount:number;interestCompleted:boolean;interestCompletedAt:string|null};
  memoryTree:MemoryTreeDto;
  bearMission:{collectedFeedIds:BearFeedId[];completedFeedSpotIds:BearFeedSpotId[];fedFeedSpotIds:BearFeedSpotId[];repeatFeedSpotId:BearFeedSpotId|null;repeatFeedAvailableAt:string|null;totalFeedCount:number;bearFed:boolean;bearFedAt:string|null;completed:boolean;completedAt:string|null};
  farm:{unlocked:boolean;unlockedRewardIds:FarmRewardId[];activeRewardIds:FarmRewardId[];bearGrowthStage:BearGrowthStage};
  natureChapter:{gardenCompleted:boolean;bearTreeCompleted:boolean;completed:boolean;completedAt:string|null;noticeShown:boolean};
  realVisit:{garden:VisitMissionDto;bearTree:VisitMissionDto};
  layoutVersion:number;
  createdAt:string;
  updatedAt:string;
}
