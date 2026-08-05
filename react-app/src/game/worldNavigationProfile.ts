import type {MapId} from '../../shared/socket-events';
import {SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE} from './cameraFollow';

export const UNIFIED_WORLD_MAP_IDS=[
  'personal-farm','town','arts-center','festival-experience','food-experience','club-street-festival',
  'bear-tree-park','bear-play-zone','garden','campus','student-hall','recruitment-center','project-room',
  'government','government-central-plaza','government-observatory','sejong-smart-city',
] as const satisfies readonly MapId[];

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

const unifiedWorldMapIds=new Set<MapId>(UNIFIED_WORLD_MAP_IDS);
export const usesUnifiedWorldNavigation=(mapId:MapId)=>unifiedWorldMapIds.has(mapId);

export function applyUnifiedWorldCamera<T extends object>(options:T){
  return {
    ...options,
    ...SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.camera,
    characterHeight:SEJONG_ARTS_CENTER_NAVIGATION_PROFILE.character.height,
    // These authored constraints made the camera stop while the character
    // kept moving, which changed their apparent distance from map to map.
    cameraHorizontalDistance:undefined,
    cameraFollowBounds:undefined,
    cameraDownScreenLimitZ:undefined,
  };
}
