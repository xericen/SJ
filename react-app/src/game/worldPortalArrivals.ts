import type {MapId,RespawnPosition} from '../../shared/socket-events';

export const BEAR_TREE_TO_GARDEN_ARRIVAL:Readonly<RespawnPosition>={x:1200,z:1400,yaw:0};

export function worldPortalArrivalOverride(sourceMapId:MapId,destinationMapId:MapId):RespawnPosition|undefined{
  if(sourceMapId==='bear-tree-park'&&destinationMapId==='garden')return {...BEAR_TREE_TO_GARDEN_ARRIVAL};
  return undefined;
}
