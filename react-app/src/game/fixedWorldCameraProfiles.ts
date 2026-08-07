import type {MapId} from '../../shared/socket-events';

export type FixedWorldCameraProfile={
  mapId:MapId;
  characterHeight:number;
  cameraElevationDeg:number;
  cameraAzimuthDeg:number;
  cameraDistance:number;
  cameraTargetHeight:number;
  cameraFov:number;
};

// 2026-08-07 운영 카메라 편집기에서 승인·저장된 최종 값입니다.
// 고정된 맵은 이후 공용 DB 값이나 브라우저 임시값으로 덮어쓰지 않습니다.
export const FIXED_WORLD_CAMERA_PROFILES={
  'arts-center':{mapId:'arts-center',characterHeight:142,cameraElevationDeg:30,cameraAzimuthDeg:180,cameraDistance:1410,cameraTargetHeight:95,cameraFov:46},
  'food-experience':{mapId:'food-experience',characterHeight:134,cameraElevationDeg:34,cameraAzimuthDeg:180,cameraDistance:1290,cameraTargetHeight:110,cameraFov:46},
  'festival-experience':{mapId:'festival-experience',characterHeight:120,cameraElevationDeg:30,cameraAzimuthDeg:180,cameraDistance:930,cameraTargetHeight:90,cameraFov:46},
  campus:{mapId:'campus',characterHeight:72,cameraElevationDeg:27,cameraAzimuthDeg:-1,cameraDistance:780,cameraTargetHeight:50,cameraFov:40},
  'project-room':{mapId:'project-room',characterHeight:150,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46},
  'recruitment-center':{mapId:'recruitment-center',characterHeight:142,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46},
  'student-hall':{mapId:'student-hall',characterHeight:138,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1300,cameraTargetHeight:75,cameraFov:46},
  'club-street-festival':{mapId:'club-street-festival',characterHeight:150,cameraElevationDeg:34,cameraAzimuthDeg:180,cameraDistance:1750,cameraTargetHeight:75,cameraFov:46},
  government:{mapId:'government',characterHeight:65,cameraElevationDeg:27,cameraAzimuthDeg:18,cameraDistance:770,cameraTargetHeight:55,cameraFov:47},
  'sejong-smart-city':{mapId:'sejong-smart-city',characterHeight:136,cameraElevationDeg:29,cameraAzimuthDeg:0,cameraDistance:1290,cameraTargetHeight:75,cameraFov:46},
} as const satisfies Partial<Record<MapId,FixedWorldCameraProfile>>;

export const FIXED_WORLD_CAMERA_MAP_IDS=Object.keys(FIXED_WORLD_CAMERA_PROFILES) as Array<keyof typeof FIXED_WORLD_CAMERA_PROFILES>;
const fixedWorldCameraMapIds=new Set<MapId>(FIXED_WORLD_CAMERA_MAP_IDS);
export const isFixedWorldCameraMap=(mapId:MapId)=>fixedWorldCameraMapIds.has(mapId);
export const fixedWorldCameraProfileFor=(mapId:MapId)=>FIXED_WORLD_CAMERA_PROFILES[mapId as keyof typeof FIXED_WORLD_CAMERA_PROFILES] as FixedWorldCameraProfile|undefined;
