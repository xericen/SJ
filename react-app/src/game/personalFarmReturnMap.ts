import type {MapId} from '../../shared/socket-events';
import {WORLD_GUIDE_MAP_IDS} from './worldNavigationProfile';

export const PERSONAL_FARM_RETURN_MAP_STORAGE_KEY='personal-farm-return-map-v1';
export const PERSONAL_FARM_RETURN_MAP_IDS=WORLD_GUIDE_MAP_IDS.filter(mapId=>mapId!=='personal-farm') as Exclude<MapId,'personal-farm'>[];
const personalFarmReturnMaps=new Set<MapId>(PERSONAL_FARM_RETURN_MAP_IDS);

export const isPersonalFarmReturnMap=(value:unknown):value is Exclude<MapId,'personal-farm'>=>typeof value==='string'&&personalFarmReturnMaps.has(value as MapId);

export function loadPersonalFarmReturnMap(storage:Pick<Storage,'getItem'>=sessionStorage):Exclude<MapId,'personal-farm'>{
  try{
    const saved=storage.getItem(PERSONAL_FARM_RETURN_MAP_STORAGE_KEY);
    return isPersonalFarmReturnMap(saved)?saved:'town';
  }catch{return 'town'}
}

export function savePersonalFarmReturnMap(mapId:MapId,storage:Pick<Storage,'setItem'>=sessionStorage):Exclude<MapId,'personal-farm'>{
  const safeMapId=isPersonalFarmReturnMap(mapId)?mapId:'town';
  try{storage.setItem(PERSONAL_FARM_RETURN_MAP_STORAGE_KEY,safeMapId)}catch{/* Keep the in-memory return target when session storage is unavailable. */}
  return safeMapId;
}
