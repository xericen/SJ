import type { FlowerInterestRecord } from '../../shared/flower-interest';
import {FLOWER_CATALOG,FLOWER_CATALOG_BY_ID,type FlowerCatalogEntry as SharedFlowerCatalogEntry} from '../../shared/flower-catalog';

export interface FlowerProfileCard extends FlowerInterestRecord {
  displayName:string;
  meaning:string;
  description:string;
}

export interface FlowerCatalogEntry extends Omit<SharedFlowerCatalogEntry,'meanings'> { meaning:string }

export const flowerCatalog:readonly FlowerCatalogEntry[]=FLOWER_CATALOG.map(entry=>({...entry,meaning:entry.meanings.join(', ')}));

export const flowerCatalogByFlowerId=new Map(flowerCatalog.map(entry=>[entry.flowerId,entry]));
export const flowerCatalogByPlantId=new Map(flowerCatalog.map(entry=>[entry.plantId,entry]));

export function topFlowerInterests(records:FlowerInterestRecord[],limit=5):FlowerProfileCard[]{
  return records.filter(record=>record&&typeof record.flowerId==='string').map(record=>{
    const sharedCatalog=FLOWER_CATALOG_BY_ID.get(record.flowerId),catalog=flowerCatalogByFlowerId.get(record.flowerId);
    return {...record,displayName:catalog?.displayName??record.flowerId,meaning:sharedCatalog?.meanings.join(', ')??'자연과 함께한 기억',description:catalog?.description??'수목원에서 함께한 꽃의 관찰 기록입니다.'};
  }).sort((a,b)=>b.interestScore-a.interestScore||b.totalInfoViewSeconds-a.totalInfoViewSeconds||b.infoViewCount-a.infoViewCount||a.flowerId.localeCompare(b.flowerId)).slice(0,limit);
}

export const formatFlowerSeconds=(seconds:number)=>{
  const safe=Math.max(0,Math.round(seconds));
  return safe<60?`${safe}초`:`${Math.floor(safe/60)}분 ${safe%60}초`;
};
