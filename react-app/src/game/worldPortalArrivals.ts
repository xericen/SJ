import type {MapId,RespawnPosition} from '../../shared/socket-events';

export const GARDEN_SAFE_ARRIVAL:Readonly<RespawnPosition>={x:1200,z:1400,yaw:0};
export const BEAR_TREE_TO_GARDEN_ARRIVAL=GARDEN_SAFE_ARRIVAL;
export const CAMPUS_TO_PROJECT_ROOM_ARRIVAL:Readonly<RespawnPosition>={x:1220,z:1690,yaw:Math.PI};

const GARDEN_MEMORY_TREE_EXCLUSION={centerX:1200,centerZ:950,radiusX:320,radiusZ:280} as const;

export function isGardenMemoryTreeEntry(spawn:Pick<RespawnPosition,'x'|'z'>){
  const dx=(spawn.x-GARDEN_MEMORY_TREE_EXCLUSION.centerX)/GARDEN_MEMORY_TREE_EXCLUSION.radiusX;
  const dz=(spawn.z-GARDEN_MEMORY_TREE_EXCLUSION.centerZ)/GARDEN_MEMORY_TREE_EXCLUSION.radiusZ;
  return dx*dx+dz*dz<=1;
}

export function safeWorldEntrySpawn(mapId:MapId,spawn:RespawnPosition):RespawnPosition{
  return mapId==='garden'&&isGardenMemoryTreeEntry(spawn)?{...GARDEN_SAFE_ARRIVAL}:spawn;
}

export function worldPortalArrivalOverride(sourceMapId:MapId,destinationMapId:MapId):RespawnPosition|undefined{
  if(sourceMapId==='bear-tree-park'&&destinationMapId==='garden')return {...BEAR_TREE_TO_GARDEN_ARRIVAL};
  if(sourceMapId==='campus'&&destinationMapId==='project-room')return {...CAMPUS_TO_PROJECT_ROOM_ARRIVAL};
  return undefined;
}
