import type {MapId} from '../../shared/socket-events';
import {SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE} from './cameraFollow';

export const WORLD_GUIDE_MAP_IDS=[
  'personal-farm','town','arts-center','festival-experience','food-experience','club-street-festival',
  'bear-tree-park','bear-play-zone','garden','campus','student-hall','recruitment-center','project-room',
  'government','government-central-plaza','government-observatory','sejong-smart-city',
] as const satisfies readonly MapId[];

export const AUTHORED_CAMERA_MAP_IDS=['town','garden'] as const satisfies readonly MapId[];
const authoredCameraMapIds=new Set<MapId>(AUTHORED_CAMERA_MAP_IDS);
export const UNIFIED_WORLD_MAP_IDS=WORLD_GUIDE_MAP_IDS.filter(mapId=>!authoredCameraMapIds.has(mapId));

export const SEJONG_ARTS_CENTER_NAVIGATION_PROFILE={
  camera:{
    perspectiveCamera:true,
    fixedCameraTarget:false,
    cameraElevationDeg:29,
    cameraDistance:SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE,
    cameraFov:46,
    cameraTargetHeight:75,
    cameraScreenOffsetY:0,
  },
  character:{height:150},
  movement:{walkSpeed:180,runSpeed:280},
} as const;

export const PERSONAL_FARM_CAMERA_PROFILE={
  distanceMultiplier:1.4,
  outdoorDistance:1820,
  interiorDistance:1400,
} as const;

export const personalFarmCameraDistance=(interior:boolean)=>interior
  ?PERSONAL_FARM_CAMERA_PROFILE.interiorDistance
  :PERSONAL_FARM_CAMERA_PROFILE.outdoorDistance;

export const CAMPUS_NAVIGATION_PROFILE={
  cameraDistance:800,
  characterHeight:80,
} as const;

export const BEAR_TREE_NAVIGATION_PROFILE={
  cameraDistance:1000,
  characterHeight:80,
} as const;

export const GOVERNMENT_NAVIGATION_PROFILE={
  characterHeight:94,
} as const;

export const SHOWCASE_WORLD_CAMERA_DISTANCE=1550;
const showcaseWorldMapIds=new Set<MapId>(['arts-center','festival-experience','food-experience']);

const unifiedWorldMapIds=new Set<MapId>(UNIFIED_WORLD_MAP_IDS);
export const usesUnifiedWorldNavigation=(mapId:MapId)=>unifiedWorldMapIds.has(mapId);

export function applyUnifiedWorldCamera<T extends object>(options:T,mapId?:MapId){
  return {
    ...options,
    ...SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.camera,
    cameraDistance:mapId==='personal-farm'
      ?PERSONAL_FARM_CAMERA_PROFILE.outdoorDistance
      :mapId==='campus'
        ?CAMPUS_NAVIGATION_PROFILE.cameraDistance
      :mapId==='bear-tree-park'
        ?BEAR_TREE_NAVIGATION_PROFILE.cameraDistance
      :mapId&&showcaseWorldMapIds.has(mapId)
        ?SHOWCASE_WORLD_CAMERA_DISTANCE
      :SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.camera.cameraDistance,
    characterHeight:mapId==='campus'
      ?CAMPUS_NAVIGATION_PROFILE.characterHeight
      :mapId==='bear-tree-park'
        ?BEAR_TREE_NAVIGATION_PROFILE.characterHeight
      :mapId==='government'
        ?GOVERNMENT_NAVIGATION_PROFILE.characterHeight
      :SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.character.height,
    // These authored constraints made the camera stop while the character
    // kept moving, which changed their apparent distance from map to map.
    cameraHorizontalDistance:undefined,
    cameraFollowBounds:undefined,
    cameraDownScreenLimitZ:undefined,
  };
}
