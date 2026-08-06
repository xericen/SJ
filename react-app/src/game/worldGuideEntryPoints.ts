import type { MapId,PortalPosition } from '../../shared/socket-events';
import type { GameReturnState } from './gameReturnState';
import { GARDEN_SAFE_ARRIVAL } from './worldPortalArrivals';

type GuideWorldMapId=Extract<MapId,
  'personal-farm'|'town'|'arts-center'|'festival-experience'|'food-experience'|'club-street-festival'|
  'bear-tree-park'|'bear-play-zone'|'garden'|'campus'|'student-hall'|
  'recruitment-center'|'project-room'|'government'|'government-central-plaza'|
  'government-observatory'|'sejong-smart-city'
>;

type PortalPoint={x:number;z:number};

/**
 * Canonical portal positions used by both the rendered worlds and Space Guide
 * direct entry. Keeping these authored coordinates here prevents per-browser
 * portal overrides from producing a different arrival point for each user.
 */
export const WORLD_GUIDE_PORTAL_POSITIONS:Record<GuideWorldMapId,PortalPoint>={
  'personal-farm':{x:1050,z:1510},
  town:{x:2122,z:944},
  'arts-center':{x:1000,z:780},
  'festival-experience':{x:1211,z:440},
  'food-experience':{x:1193,z:546},
  'club-street-festival':{x:1200,z:1580},
  'bear-tree-park':{x:1185,z:1616},
  'bear-play-zone':{x:1200,z:1650},
  garden:{x:1200,z:1260},
  campus:{x:1120,z:1731},
  'student-hall':{x:1200,z:1660},
  'recruitment-center':{x:1200,z:1690},
  'project-room':{x:1220,z:2050},
  government:{x:1120,z:1731},
  'government-central-plaza':{x:1200,z:1690},
  'government-observatory':{x:1200,z:1790},
  'sejong-smart-city':{x:1200,z:1690},
};

const PORTAL_SAFE_ENTRY_DISTANCE=140;

export function worldGuideEntryState(mapId:MapId,sharedPositions:readonly PortalPosition[]=[]):GameReturnState|undefined{
  if(mapId==='garden')return {mapId,...GARDEN_SAFE_ARRIVAL};
  const portal=sharedPositions.find(position=>position.mapId===mapId)??WORLD_GUIDE_PORTAL_POSITIONS[mapId as GuideWorldMapId];
  if(!portal)return undefined;
  const center=mapId==='project-room'?{x:2350,z:1200}:{x:1200,z:950};
  let dx=center.x-portal.x,dz=center.z-portal.z;
  const length=Math.hypot(dx,dz);
  if(length<1){dx=0;dz=1}else{dx/=length;dz/=length}
  return {
    mapId,
    x:portal.x+dx*PORTAL_SAFE_ENTRY_DISTANCE,
    z:portal.z+dz*PORTAL_SAFE_ENTRY_DISTANCE,
    yaw:Math.atan2(dx,dz),
  };
}
