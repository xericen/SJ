import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';
import villageModelUrl from '../../assets/maps/sejong-lake-park.glb?url';
import bearTreeParkModelUrl from '../../assets/maps/new-beartree.glb?url';
import bearPlayZoneModelUrl from '../../assets/maps/park-landscape.glb?url';
import gardenModelUrl from '../../assets/maps/garden.glb?url';
import campusModelUrl from '../../assets/maps/new-campus-floor.glb?url';
import studentHallModelUrl from '../../assets/maps/student-hall.glb?url';
import recruitmentCenterModelUrl from '../../assets/maps/recruitment-center.glb?url';
import projectRoomModelUrl from '../../assets/maps/project-room.glb?url';
import projectLobbyModelUrl from '../../assets/maps/project-lobby.glb?url';
import governmentModelUrl from '../../assets/maps/sejong-gov.glb?url';
import governmentCentralPlazaModelUrl from '../../assets/maps/government-central-plaza.glb?url';
import observatoryModelUrl from '../../assets/maps/observatory-interior.glb?url';
import sejongSmartCityModelUrl from '../../assets/maps/sejong-smartcity-exhibition.glb?url';
import sejongArtsCenterModelUrl from '../../assets/maps/sejong-arts-center.glb?url';
import festivalExperienceModelUrl from '../../assets/maps/festival-experience-map.glb?url';
import foodExperienceModelUrl from '../../assets/maps/food-experience-map.glb?url';
import clubStreetFestivalModelUrl from '../../assets/maps/club-street-festival-map.glb?url';
import personalFarmModelUrl from '../../assets/objects/personal-space-cottage.glb?url';
import bearModelUrl from '../../assets/characters/bear.glb?url';
import chungnyeongIdleUrl from '../../assets/characters/chungnyeong_idle.glb?url';
import chungnyeongWalkUrl from '../../assets/characters/chungnyeong_walk.glb?url';
import chungnyeongRunUrl from '../../assets/characters/chungnyeong_run.glb?url';
import girlUrl from '../../assets/characters/girl_metaverse_animated.glb?url';
import boyUrl from '../../assets/characters/boy_metaverse.glb?url';
import clothsUrl from '../../assets/characters/men_total.glb?url';
import womenUrl from '../../assets/characters/women_total.glb?url';
import type { CharacterModel,CharacterParts,UserProfile } from '../../types';
import { WORLD_GUIDE_PORTAL_POSITIONS } from '../worldGuideEntryPoints';
import { GARDEN_SAFE_ARRIVAL } from '../worldPortalArrivals';
import { FIXED_LAKE_RESPAWN,type BearTreePortalPositions,type CampusFeaturePortalId,type CampusFeaturePortalPosition,type CharacterEmote,type LakeExperienceId,type LakeExperiencePosition,type MapId,type MotionState,type PortalPosition,type WorldInteractionPosition } from '../../../shared/socket-events';
import { gameEvents } from '../events';
import { characterSettings } from '../character/characterSettings';
import { canAccessPersonalFarmPortal } from '../../services/personalFarmPortalAccess';
import {getCachedPersonalFarmProgress} from '../../services/personalFarmApi';
import {BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,type BearFeedId,type GardenFlowerId,type PersonalFarmProgressDto} from '../../../shared/personal-farm';
import { applyColorsToThreeScene } from '../../utils/modelColorizer';
import {createGltfLoader,loadValidatedGlb} from '../../utils/createGltfLoader';
import { greenhousePlants,GREENHOUSE_MEMORY_TREE_OBJECT,GREENHOUSE_PLANT_TOTAL,greenhousePlantIdByObjectName } from '../../data/greenhouse-plants';
import { CAMPUS_FRIEND_NPCS } from '../../data/campusNpc';
import { PROJECT_ROOM_NPC } from '../../data/projectRoomNpc';
import { STUDENT_HALL_NPCS } from '../../data/studentHallNpc';
import { FESTIVAL_NPCS } from '../../data/festivalNpc';
import { PROJECT_ROOM_INTERACTIONS,isProjectRoomKioskInteraction,type ProjectRoomInteractionId,type ProjectRoomKioskInteractionId } from '../projectRoomInteractions';
import { GOVERNMENT_CENTRAL_PLAZA_WEB_UI,type GovernmentCentralPlazaWebUiId } from '../governmentCentralPlazaWebUi';
import { ARTS_CENTER_PERFORMANCES,artsCenterPerformanceImageUrl,type ArtsCenterPerformance } from '../artsCenterPerformances';
import {createBearStatueObject} from '../../services/bearStatueAssetFactory';
import {createFlowerObjectById} from '../../services/flowerAssetFactory';
import { SmartCityHologram,type SmartCityTechnologyId } from './SmartCityHologram';
import { LAKE_PARK_PORTALS } from '../lakeParkPortals';
import { CAMPUS_FEATURE_PORTALS,CAMPUS_FEATURE_PORTAL_DESTINATIONS,type CampusFeaturePortalConfig } from '../campusFeaturePortals';
import { isPortalChargePositionHeld,PortalTravelGate } from '../portalTravelGate';
import { ARTS_CENTER_CHARACTER_FOOT_LIFT,ARTS_CENTER_MAX_JUMP_STEP_HEIGHT,characterVisualY,DEFAULT_MAX_STEP_HEIGHT,isGroundFootprintCoherent,JUMP_COLLISION_CLEARANCE,reachableStepHeight } from '../groundTraversal';
import { clampCameraBehindLimit,LAKE_PARK_CAMERA_ELEVATION_DEG,LAKE_PARK_CAMERA_ZOOM,LAKE_PARK_FOLLOW_CAMERA_DISTANCE,orthographicZoomForCameraDistance,SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE } from '../cameraFollow';
import { DEFAULT_BEAR_PHOTO_PORTAL_POSITION } from '../bearPhotoZonePosition';
import {GARDEN_NAVIGATION_PROFILE,personalFarmCameraDistance} from '../worldNavigationProfile';
import {withUnifiedWorldPortalVisual} from '../worldPortalVisual';
import {portalVisualScaleForMap} from '../campusPortalVisual';
import type {WorldCameraProfile} from '../../services/worldCameraProfiles';

const WORLD_WIDTH=2400;
const WORLD_HEIGHT=1900;
export const PROJECT_ROOM_WORLD_WIDTH=4700;
export const PROJECT_ROOM_WORLD_HEIGHT=2400;
export const RECRUITMENT_CENTER_WORLD_HEIGHT=2200;
export const SEJONG_SMART_CITY_WORLD_HEIGHT=2800;
const CAMERA_ELEVATION=THREE.MathUtils.degToRad(33);
const OVERVIEW_CAMERA_ELEVATION=THREE.MathUtils.degToRad(58);
const GROUND_PROJECTION=Math.sin(CAMERA_ELEVATION);
const CAMERA_DISTANCE=900;
const CHARACTER_HEIGHT=94;
const CHARACTER_GROUND_CLEARANCE=4;
const MAX_STEP_HEIGHT=DEFAULT_MAX_STEP_HEIGHT;
const MAX_DROP_HEIGHT=180;
const MIN_WALKABLE_NORMAL=.68;
const COLLISION_RADIUS=16;
const GUIDE_CHARACTER_HEIGHT=132;
const GUIDE_TALK_DISTANCE=145;
const GUIDE_TALK_EXIT_DISTANCE=175;
const GUIDE_WALK_SPEED=58;
const GUIDE_PAUSE_SECONDS=4;
const RESIDENT_WALK_SPEED=34;
const DEFAULT_MAP_SIGN_POSITION={x:2090,z:1185} as const;
const MAP_SIGN_OPEN_DISTANCE=78;
const MAP_SIGN_EXIT_DISTANCE=105;
const PORTAL_OPEN_DISTANCE=62;
const PORTAL_EXIT_DISTANCE=78;
const KEY_PORTAL_OPEN_DISTANCE=100;
const KEY_PORTAL_EXIT_DISTANCE=122;
const INTERACTION_OPEN_DISTANCE=88;
const INTERACTION_EXIT_DISTANCE=110;
const STUDENT_HALL_AI_TREE_OPEN_DISTANCE=190;
const PORTAL_ARRIVAL_CLEARANCE=Math.max(KEY_PORTAL_EXIT_DISTANCE,INTERACTION_EXIT_DISTANCE)+18;
const LAKE_EXPERIENCE_OPEN_DISTANCE=92;
const LAKE_EXPERIENCE_EXIT_DISTANCE=118;
const GREENHOUSE_OPEN_DISTANCE=210;
const GREENHOUSE_EXIT_DISTANCE=245;
const BEAR_PHOTO_STAGE_FRONT_INSET=10;
const BEAR_PHOTO_CAMERA_YAW=0;
const BEAR_PHOTO_STAGE_NAME='tripo_node_816cfa46-0ef3-4a12-be52-0dae3d331bff';
const RENDER_INTERVAL=1/45;
const CAMERA_ZOOM=1.28;
export const WORLD_RENDERER_LAYOUT_TOKEN={};
// Adaptive quality needs room below native resolution on slower GPUs.
const MIN_PIXEL_RATIO=.75;
const MAX_PIXEL_RATIO=Math.min(window.devicePixelRatio||1,2);
let textureAnisotropy=4;
const worldMapDownloads=new Map<string,Promise<void>>();
function preloadWorldMapDownload(url:string,label:string){
  let pending=worldMapDownloads.get(url);
  if(!pending){
    pending=fetch(url,{cache:'force-cache'}).then(response=>{
    if(!response.ok)throw new Error(`${label} preload failed: ${response.status}`);
    return response.arrayBuffer();
    }).then(()=>undefined).catch(error=>{worldMapDownloads.delete(url);throw error});
    worldMapDownloads.set(url,pending);
  }
  return pending;
}
export const preloadCampusDownload=()=>preloadWorldMapDownload(campusModelUrl,'Campus');
export const preloadBearTreeParkDownload=()=>preloadWorldMapDownload(bearTreeParkModelUrl,'Bear Tree Park');
export const preloadBearPlayZoneDownload=()=>preloadWorldMapDownload(bearPlayZoneModelUrl,'Bear Play Zone');
export const LAKE_PARK_SPAWN:{x:number;z:number;yaw:number}={...FIXED_LAKE_RESPAWN};
export const BEAR_TREE_PARK_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1610,yaw:Math.PI};
export const BEAR_PLAY_ZONE_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1570,yaw:Math.PI};
export const GARDEN_SPAWN:{x:number;z:number;yaw:number}={...GARDEN_SAFE_ARRIVAL};
export const CAMPUS_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1500,yaw:Math.PI};
export const STUDENT_HALL_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1510,yaw:Math.PI};
const STUDENT_HALL_CAMERA_DOWN_LIMIT_Z=1380;
export const RECRUITMENT_CENTER_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1535,yaw:Math.PI};
export const PROJECT_ROOM_SPAWN:{x:number;z:number;yaw:number}={x:1220,z:1690,yaw:Math.PI};
export const GOVERNMENT_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1500,yaw:Math.PI};
export const GOVERNMENT_CENTRAL_PLAZA_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1530,yaw:0};
export const GOVERNMENT_OBSERVATORY_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1380,yaw:Math.PI};
export const SEJONG_SMART_CITY_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1580,yaw:Math.PI};
// Spawn on the authored lobby floor. z=370 is outside the building on the
// black GLB background, where there is no walkable surface for the character.
export const SEJONG_ARTS_CENTER_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:780,yaw:0};
// Keep the lobby entrance as the lowest camera-follow point.
const SEJONG_ARTS_CENTER_CAMERA_DOWN_LIMIT_Z=SEJONG_ARTS_CENTER_SPAWN.z;
export const FESTIVAL_EXPERIENCE_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1530,yaw:Math.PI};
export const FOOD_EXPERIENCE_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1193,yaw:Math.PI};
export const CLUB_STREET_FESTIVAL_SPAWN:{x:number;z:number;yaw:number}={x:1200,z:1510,yaw:Math.PI};
const CLUB_STREET_BOOTH_ANCHORS_FRONT_TO_BACK=[
  'ClubBooth_L5_CanvasRoof','ClubBooth_R5_CanvasRoof',
  'ClubBooth_L4_CanvasRoof','ClubBooth_R4_CanvasRoof',
  'ClubBooth_L3_CanvasRoof','ClubBooth_R3_CanvasRoof',
  'ClubBooth_L2_CanvasRoof','ClubBooth_R2_CanvasRoof',
  'ClubBooth_L1_CanvasRoof','ClubBooth_R1_CanvasRoof',
] as const;
// Change these x/z values to move the lake-park return portal in the festival map.
export const FESTIVAL_LAKE_RETURN_PORTAL_POSITION=WORLD_GUIDE_PORTAL_POSITIONS['festival-experience'];
export const FOOD_LAKE_RETURN_PORTAL_POSITION=WORLD_GUIDE_PORTAL_POSITIONS['food-experience'];
export const FESTIVAL_EXPERIENCE_CAMERA_DISTANCE=1020;
const FOOD_EXPERIENCE_CAMERA_DOWN_LIMIT_Z=FOOD_LAKE_RETURN_PORTAL_POSITION.z;
const LAKE_PARK_GUIDE={x:2045,z:1138,yaw:-.78} as const;
const LAKE_GUIDE_INTRO_DURATION_MS=2600;
const GUIDE_PATROL_POINTS=([
  [LAKE_PARK_GUIDE.x,LAKE_PARK_GUIDE.z],[2050,1150],[2000,1150],[2000,750],[1900,750],[1900,500],
  [1400,500],[1400,350],[1350,350],[1350,200],[350,200],[350,250],[300,250],[300,400],[350,400],
  [350,950],[900,950],[700,950],[700,1250],[1050,1250],[1050,1200],[1150,1200],[1150,1150],
  [1250,1150],[1250,900],[1150,900],[1150,950],[1100,950],[1100,1000],[1000,1000],[1000,1100],
  [950,1100],[950,1150],[900,1150],[900,1200],[750,1200],[750,1250],[700,1250],[700,1100],
  [900,1100],[900,1050],[950,1050],[950,950],[1050,950],[1050,900],[1100,900],[1100,800],
  [1150,800],[1150,750],[1300,750],[1300,700],[1400,700],[1400,750],[1550,750],[1550,700],
  [1600,700],[1600,600],[2000,600],[2000,850],[1950,850],[1950,950],[2000,950],[2000,1200],
  [1900,1200],[1900,1250],[1450,1250],[1450,750],[1400,750],[1400,700],[1100,700],[1100,900],
  [700,900],[700,1250],[900,1250],[300,1250],[300,1600],[650,1600],[650,1650],[850,1650],
  [850,1750],[1950,1750],[1950,1650],[1850,1650],[1850,1600],[1800,1600],[1800,1250],
  [2100,1250],[2100,1200],[2050,1200],[2050,1150],
] as const).map(([x,z])=>({x,z}));
const GUIDE_PATROL_STOPS=new Set(['2045,1138','1900,500','1350,200','300,400','350,950','1250,900','1550,700','1950,950','1450,1250','900,1250','300,1600','850,1750','1950,1650','1800,1250','2050,1150']);
type CharacterState={scene:THREE.Object3D;mixer?:THREE.AnimationMixer;action?:THREE.AnimationAction};
type GroundSample={height:number;normal:THREE.Vector3;objectName?:string};
type PersonalFarmMode='outdoor'|'indoor';
type ArtsCenterSeat={id:string;x:number;z:number;seatHeight:number;yaw:number};
type ProjectRoomSeat=ArtsCenterSeat&{standX:number;standZ:number;opensCollaborationTable?:boolean};
type PlazaSofaSeat=ArtsCenterSeat&{standX:number;standZ:number};
type PersonalFarmSeat=PlazaSofaSeat&{kind:'chair'|'sofa';label:string};
type PersonalFarmBed=ArtsCenterSeat&{standX:number;standZ:number;cameraX:number;cameraZ:number};
type RemoteGroundSample=GroundSample&{x:number;z:number};
type GuidePosition={x:number;z:number;yaw:number};
type GuidePatrolFrame=GuidePosition&{motion:Extract<MotionState,'idle'|'walk'>};
type LocalNpcConfig={
  id:string;
  nickname:string;
  status:string;
  x:number;
  z:number;
  yaw:number;
  model:CharacterModel;
  appearance:CharacterParts;
  height?:number;
  staticPose?:boolean;
  walkSpeed?:number;
  patrol?:readonly {x:number;z:number}[];
  interactionRadius?:number;
  collisionRadius?:number;
};
type LocalNpcState={
  character:WorldCharacter;
  position:THREE.Vector3;
  normal:THREE.Vector3;
  config:LocalNpcConfig;
  x:number;
  z:number;
  ground:number;
  targetIndex:number;
  blockedSeconds:number;
};
type PortalConfig={x:number;z:number;destination:PortalPosition['destination'];label:string;appearance?:'standing'|'white-circle'|'energy-rift';fixedPosition?:boolean;theme?:'mint'|'blue'|'orange';chargeSeconds?:number;activationRadius?:number;sharedPosition?:boolean;positionEditable?:boolean;hideMarker?:boolean;arrivalDirection?:{x:number;z:number};arrivalClearance?:number};
type InteractionConfig={x:number;z:number;destination:WorldInteractionPosition['destination'];label:string;buttonLabel:string;fixedPosition?:boolean;chargeSeconds?:number;positionEditable?:boolean};
type LakeExperienceConfig={id:LakeExperienceId;x:number;z:number;label:string;description:string;color:number;radius?:number};
type StudentHallFeatureTarget={id:CampusFeaturePortalId;x:number;z:number;radius:number;label:string;description:string};
type StudentHallBoardId='occupancy'|'activity';
type StudentHallBoardScreenRect={left:number;top:number;width:number;height:number;quad?:readonly [{x:number;y:number},{x:number;y:number},{x:number;y:number},{x:number;y:number}]};
type ProjectLobbyBoardScreenRect=StudentHallBoardScreenRect;
type ResidentConfig={modelUrl:string;format?:'gltf'|'fbx';x:number;z:number;height:number;yaw:number;stationary?:boolean;patrol?:readonly {x:number;z:number}[];walkSpeed?:number};
type BearFeedingAnchor={x:number;z:number;radius?:number};
type WildlifeClueConfig={id:'bearA'|'bearB'|'cave'|'food'|'water';x:number;z:number;icon:string;label:string};
type FeedSpotAnchorConfig={id:`BEAR_FEED_SPOT_0${1|2|3|4|5}`;x:number;z:number};
type LowQualityFallback={maxTextureSize:number;performancePixelRatio:number;performanceFrameRate:number;balancedTextureQuality:boolean};
type HabitatResourceId=Extract<WildlifeClueConfig['id'],'cave'|'food'|'water'>;
type FoodTruckWindow={id:'local'|'street'|'dessert';label:string;x:number;z:number;approachX:number;approachZ:number};
type GreenhouseTarget={id:string;objects:THREE.Object3D[];bounds:THREE.Box3;center:THREE.Vector3;marker:THREE.Sprite;kind:'plant'|'memory-tree'};
const normalizedModelObjectName=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
const artsCenterPosterIndex=(name:string)=>{
  const normalized=normalizedModelObjectName(name),match=/^posterart(\d{3})?$/.exec(normalized);
  if(!match)return -1;return match[1]?Number(match[1]):0;
};
export type WorldMapRendererOptions={
  mapId?:MapId;
  modelUrl:string;
  companionModelUrl?:string;
  mapName:string;
  spawn:{x:number;z:number;yaw:number};
  hideCharacters?:boolean;
  previewNavigation?:boolean;
  previewDragRotate?:boolean;
  guide?:boolean;
  mapSign?:boolean;
  overview?:boolean;
  portal?:PortalConfig;
  fixedPortals?:PortalConfig[];
  campusFeaturePortals?:CampusFeaturePortalConfig[];
  interaction?:InteractionConfig;
  lakeExperiences?:LakeExperienceConfig[];
  lakeExperienceObjectNames?:Partial<Record<LakeExperienceId,string>>;
  resident?:ResidentConfig;
  residentDecor?:ResidentConfig[];
  wildlifeClues?:WildlifeClueConfig[];
  feedSpotAnchors?:readonly FeedSpotAnchorConfig[];
  bearFeedingAnchor?:BearFeedingAnchor;
  bearCollisionRadius?:number;
  lowQualityFallback?:LowQualityFallback;
  cameraScreenOffsetY?:number;
  cameraElevationDeg?:number;
  cameraAzimuthDeg?:number;
  cameraZoom?:number;
  perspectiveCamera?:boolean;
  fixedCameraTarget?:boolean;
  centerInWorldCoordinates?:boolean;
  cameraDistance?:number;
  cameraHorizontalDistance?:number;
  cameraFov?:number;
  cameraTargetHeight?:number;
  cameraFollowBounds?:{minX?:number;maxX?:number;minZ?:number;maxZ?:number};
  flatGroundExtension?:{minX:number;maxX:number;minZ:number;maxZ:number};
  cameraDownScreenLimitZ?:number;
  characterHeight?:number;
  nameplateScale?:number;
  characterGroundClearance?:number;
  characterFootLift?:number;
  mapScaleMultiplier?:number;
  mapRotationY?:number;
  groundFillColor?:number;
  greenhouse?:boolean;
  performanceMode?:boolean;
  adaptivePixelRatio?:boolean;
  antialias?:boolean;
  balancedTextureQuality?:boolean;
  maxTextureSize?:number;
  prioritizeGroundTextures?:boolean;
  performanceFrameRate?:number;
  minPixelRatio?:number;
  performancePixelRatio?:number;
  maxPixelRatio?:number;
  toneMappingExposure?:number;
  lightingIntensityMultiplier?:number;
  sceneBackgroundColor?:THREE.ColorRepresentation;
  geometrySimplificationRatio?:number;
  groundGeometrySimplificationRatio?:number;
  groundingShadows?:boolean;
  simplifiedCollision?:boolean;
  maxJumpStepHeight?:number;
  fastGroundSampling?:boolean;
  stableCharacterGrounding?:boolean;
  collisionExcludePrefixes?:string[];
  collisionObjectPrefixes?:string[];
  hiddenObjectPrefixes?:string[];
  groundObjectPrefixes?:string[];
  bearPhotoZone?:boolean;
  projectRoomInteractions?:boolean;
  smartCityWebUi?:boolean;
  governmentCentralPlazaWebUi?:boolean;
  centralPlazaSofaSeats?:boolean;
  recruitmentKioskWeb?:boolean;
  studentHallFeatures?:boolean;
  observatoryTelescopeInteraction?:boolean;
  artsCenterPosterWeb?:boolean;
  foodTruckExperience?:boolean;
  localNpcs?:readonly LocalNpcConfig[];
  personalFarm?:boolean;
};

/**
 * Places a traveller just inside the portal that leads back to the map they
 * left. Spawning outside the portal's exit radius lets the anti-bounce lock
 * clear immediately, so walking back into the portal always works.
 */
export function portalArrivalSpawn(options:WorldMapRendererOptions,sourceMapId:MapId){
  const campusEntrances=options.campusFeaturePortals??[];
  const entrances=[options.portal,...(options.fixedPortals??[]),options.interaction,...campusEntrances];
  const entrance=entrances.find(candidate=>candidate?.destination===sourceMapId)
    // Some maps are entered from more than one parent map but expose a single
    // shared return portal. In that case it is also the canonical entrance.
    ??options.portal
    ??options.interaction
    ??options.fixedPortals?.[0]
    ??campusEntrances[0];
  if(!entrance)return undefined;
  const isProjectRoom=options.mapName==='프로젝트실';
  const centerX=(isProjectRoom?PROJECT_ROOM_WORLD_WIDTH:WORLD_WIDTH)/2;
  const centerZ=(isProjectRoom?PROJECT_ROOM_WORLD_HEIGHT:WORLD_HEIGHT)/2;
  const arrivalDirection='arrivalDirection' in entrance?entrance.arrivalDirection:undefined;
  const arrivalClearance='arrivalClearance' in entrance?entrance.arrivalClearance:undefined;
  let dx=arrivalDirection?.x??centerX-entrance.x;
  let dz=arrivalDirection?.z??centerZ-entrance.z;
  const length=Math.hypot(dx,dz);
  if(length<1){dx=0;dz=1}else{dx/=length;dz/=length}
  const clearance=Math.max(PORTAL_ARRIVAL_CLEARANCE,arrivalClearance??0);
  return {
    x:entrance.x+dx*clearance,
    z:entrance.z+dz*clearance,
    yaw:Math.atan2(dx,dz),
  };
}
const [LAKE_PARK_PRIMARY_PORTAL,...LAKE_PARK_FIXED_PORTALS]=LAKE_PARK_PORTALS;
export const LAKE_PARK_RENDERER_OPTIONS:WorldMapRendererOptions={modelUrl:villageModelUrl,mapName:'세종호수공원',spawn:LAKE_PARK_SPAWN,guide:true,mapSign:true,overview:true,cameraZoom:LAKE_PARK_CAMERA_ZOOM,cameraDistance:LAKE_PARK_FOLLOW_CAMERA_DISTANCE,cameraElevationDeg:LAKE_PARK_CAMERA_ELEVATION_DEG,characterHeight:CHARACTER_HEIGHT,performanceMode:true,adaptivePixelRatio:false,balancedTextureQuality:true,performancePixelRatio:1.1,portal:{...LAKE_PARK_PRIMARY_PORTAL},fixedPortals:LAKE_PARK_FIXED_PORTALS.map(config=>({...config}))};
export const BEAR_TREE_PARK_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:bearTreeParkModelUrl,mapName:'베어트리파크',spawn:BEAR_TREE_PARK_SPAWN,
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS['bear-tree-park'],destination:'town',label:'세종호수공원',theme:'blue',fixedPosition:false,chargeSeconds:3,sharedPosition:true,positionEditable:true},
  fixedPortals:[
    {x:767,z:751,destination:'garden',label:'세종수목원',appearance:'white-circle',fixedPosition:false,chargeSeconds:3,sharedPosition:true,positionEditable:true},
  ],
  interaction:{x:1482,z:661,destination:'bear-play-zone',label:'곰 체험소',buttonLabel:'곰 체험소 둘러보기',fixedPosition:false,chargeSeconds:3,positionEditable:true},
  nameplateScale:1.25,groundFillColor:0xc9bc98,sceneBackgroundColor:'#c8ddcf',toneMappingExposure:1.12,
  lightingIntensityMultiplier:1.08,performanceMode:true,adaptivePixelRatio:false,antialias:true,balancedTextureQuality:true,maxTextureSize:2048,
  performancePixelRatio:1.25,simplifiedCollision:false,bearPhotoZone:true,
};
export const BEAR_PLAY_ZONE_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:bearPlayZoneModelUrl,mapName:'곰 체험소',spawn:BEAR_PLAY_ZONE_SPAWN,
  interaction:{...WORLD_GUIDE_PORTAL_POSITIONS['bear-play-zone'],destination:'bear-tree-park',label:'베어트리파크',buttonLabel:'탐험 마치고 돌아가기',fixedPosition:true,chargeSeconds:3},
  resident:{modelUrl:bearModelUrl,format:'gltf',x:1145,z:1390,height:170,yaw:Math.PI,stationary:true},
  residentDecor:[{modelUrl:bearModelUrl,format:'gltf',x:1295,z:1390,height:170,yaw:Math.PI,stationary:true}],
  feedSpotAnchors:[
    {id:'BEAR_FEED_SPOT_01',x:1100,z:1450},{id:'BEAR_FEED_SPOT_02',x:880,z:1260},{id:'BEAR_FEED_SPOT_03',x:720,z:1000},
    {id:'BEAR_FEED_SPOT_04',x:1560,z:1250},{id:'BEAR_FEED_SPOT_05',x:1690,z:960},
  ],
  bearFeedingAnchor:{x:1220,z:1390,radius:190},bearCollisionRadius:78,
  cameraZoom:.86,characterHeight:140,groundFillColor:0xead9ad,performanceMode:true,balancedTextureQuality:true,performancePixelRatio:1.1,
};
const PERSONAL_FARM_WALKABLE_PREFIXES=['ENV_Grass_Island','ENV_Stepping_Stone_','ENV_Fountain_Piazza','ARCH_Porch_Step_','ARCH_Interior_Floor'] as const;
const PERSONAL_FARM_COLLIDER_PREFIXES=[
  'ARCH_Back_Wall','ARCH_Left_Wall','ARCH_Right_Wall','ARCH_Main_Door','ARCH_Bedroom_Partition',
  'ARCH_Back_Post_','ARCH_Side_Front_Post_','ARCH_Back_Top_Beam','ARCH_Side_Top_Beam_','ARCH_Chimney_',
  'EXTERIOR_Front_Wall_','EXTERIOR_Entry_Door','EXTERIOR_Front_Door_','EXTERIOR_Front_Top_Beam',
  'ENV_Fountain_Foundation','ENV_Fountain_Lower_Basin','ENV_Fountain_Lower_Rim','ENV_Fountain_Pedestal','ENV_Fountain_Middle_Basin','ENV_Fountain_Middle_Rim','ENV_Fountain_Upper_Basin','ENV_Fountain_Upper_Stem',
  'ENV_Bush_','ENV_Tree_Trunk_','ENV_Tree_Stone_Collar_','ENV_Mailbox_',
  'FURN_Bed_','FURN_Mattress','FURN_Bedside_','FURN_Sofa_','FURN_Coffee_Table_','FURN_Lamp_',
  'FURN_Kitchen_','FURN_Stove','FURN_Fridge_','FURN_Dining_Table','FURN_Dining_Leg_','FURN_Dining_Chair_','FURN_Bookcase_',
  'DECOR_Bookcase_Plant_',
] as const;
const PERSONAL_FARM_FLOWER_SLOTS=([
  {slotId:'FARM_FLOWER_SLOT_01',x:930,z:1395,rotationY:-.18,targetHeight:92},
  {slotId:'FARM_FLOWER_SLOT_02',x:1010,z:1395,rotationY:.22,targetHeight:92},
  {slotId:'FARM_FLOWER_SLOT_03',x:1090,z:1395,rotationY:-.08,targetHeight:92},
  {slotId:'FARM_FLOWER_SLOT_04',x:970,z:1460,rotationY:.35,targetHeight:92},
  {slotId:'FARM_FLOWER_SLOT_05',x:1050,z:1460,rotationY:-.3,targetHeight:92},
] as const);
export const PERSONAL_FARM_SPAWN={x:1050,z:1510,yaw:Math.PI} as const;
export const PERSONAL_FARM_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:personalFarmModelUrl,mapName:'마이홈',spawn:PERSONAL_FARM_SPAWN,personalFarm:true,
  hiddenObjectPrefixes:['ENV_Bush_01_','ENV_Bush_02_','ENV_Bush_03_','ENV_Bush_04_'],
  residentDecor:[],
  perspectiveCamera:true,cameraElevationDeg:37,cameraAzimuthDeg:0,cameraDistance:1280,cameraFov:47,cameraScreenOffsetY:0,cameraTargetHeight:120,
  cameraFollowBounds:{minX:590,maxX:1810,minZ:690,maxZ:1660},characterHeight:105,mapScaleMultiplier:.92,
  groundFillColor:0x6f9c50,sceneBackgroundColor:'#a9cbb5',toneMappingExposure:1.02,lightingIntensityMultiplier:.9,
  groundingShadows:true,performanceMode:true,balancedTextureQuality:true,performancePixelRatio:1,
  collisionObjectPrefixes:[...PERSONAL_FARM_COLLIDER_PREFIXES],groundObjectPrefixes:[...PERSONAL_FARM_WALKABLE_PREFIXES],
};
export const GARDEN_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:gardenModelUrl,
  mapName:'수목원',
  spawn:GARDEN_SPAWN,
  // Match the lake park's higher, steadier overview so the central memory
  // tree does not block the garden paths in front of the character.
  perspectiveCamera:false,
  cameraElevationDeg:LAKE_PARK_CAMERA_ELEVATION_DEG,
  cameraDistance:GARDEN_NAVIGATION_PROFILE.cameraDistance,
  cameraZoom:GARDEN_NAVIGATION_PROFILE.cameraZoom,
  characterHeight:GARDEN_NAVIGATION_PROFILE.characterHeight,
  groundFillColor:0xdfe3c4,
  sceneBackgroundColor:'#b8d9c3',
  performanceMode:true,
  antialias:true,
  balancedTextureQuality:true,
  maxTextureSize:2048,
  minPixelRatio:1,
  performancePixelRatio:1.2,
  maxPixelRatio:1.5,
  geometrySimplificationRatio:0,
  prioritizeGroundTextures:true,
  groundingShadows:true,
  toneMappingExposure:.98,
  lightingIntensityMultiplier:1.02,
  lowQualityFallback:{maxTextureSize:512,performancePixelRatio:.75,performanceFrameRate:30,balancedTextureQuality:false},
  fixedPortals:[{
    x:1218,
    z:1585,
    destination:'bear-tree-park',
    label:'베어트리파크',
    appearance:'white-circle',
    fixedPosition:true,
    chargeSeconds:3,
    arrivalDirection:{x:0,z:1},
  },{
    x:1196,
    z:258,
    destination:'personal-farm',
    label:'마이홈으로 이동',
    appearance:'white-circle',
    fixedPosition:true,
    chargeSeconds:3,
  }],
  greenhouse:true,
};
export const CAMPUS_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:campusModelUrl,
  mapName:'공동캠퍼스',
  spawn:CAMPUS_SPAWN,
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS.campus,destination:'town',label:'세종호수공원',theme:'blue',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  fixedPortals:[{x:368,z:899,destination:'government',label:'정부청사',appearance:'standing',theme:'blue',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false}],
  campusFeaturePortals:CAMPUS_FEATURE_PORTALS.map(config=>({...config})),
  // Preserve the authored campus perspective. The orthographic overview made
  // the buildings look flattened and exposed too much of the bright ground.
  perspectiveCamera:true,
  fixedCameraTarget:false,
  cameraElevationDeg:30,
  cameraDistance:1100,
  cameraFov:42,
  characterHeight:CHARACTER_HEIGHT,
  // Keep the large campus efficient without sacrificing the clarity of its
  // buildings, paths, or character silhouettes at the normal quality tier.
  toneMappingExposure:.94,
  lightingIntensityMultiplier:.9,
  performanceMode:true,
  antialias:true,
  balancedTextureQuality:true,
  maxTextureSize:1024,
  performanceFrameRate:45,
  minPixelRatio:.85,
  performancePixelRatio:1,
  maxPixelRatio:1,
  geometrySimplificationRatio:0,
  lowQualityFallback:{maxTextureSize:512,performancePixelRatio:.8,performanceFrameRate:30,balancedTextureQuality:false},
  simplifiedCollision:true,
  fastGroundSampling:true,
};
export const CLUB_STREET_FESTIVAL_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:clubStreetFestivalModelUrl,
  mapName:'동아리 거리제',
  spawn:CLUB_STREET_FESTIVAL_SPAWN,
  mapRotationY:Math.PI,
  mapScaleMultiplier:1.08,
  groundObjectPrefixes:['Central_Pedestrian_Plaza','PaverAccent_','Ground_Base','Garden_','CentralPlanter_'],
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS['club-street-festival'],destination:'campus',label:'공동캠퍼스로 돌아가기',appearance:'white-circle',theme:'orange',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:34,
  cameraAzimuthDeg:180,
  cameraDistance:1750,
  cameraFov:46,
  characterHeight:150,
  characterGroundClearance:4,
  groundFillColor:0x496f32,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
  // Booths, planters, street furniture and other authored props must block
  // the avatar capsule instead of being treated as walkable ground only.
  simplifiedCollision:false,
};
export const STUDENT_HALL_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:studentHallModelUrl,
  mapName:'학생회관',
  spawn:STUDENT_HALL_SPAWN,
  studentHallFeatures:true,
  portal:{
    ...WORLD_GUIDE_PORTAL_POSITIONS['student-hall'],
    destination:'campus',
    label:'공동캠퍼스로 돌아가기',
    appearance:'white-circle',
    theme:'mint',
    chargeSeconds:3,
    fixedPosition:true,
    sharedPosition:false,
  },
  perspectiveCamera:true,
  fixedCameraTarget:false,
  cameraFollowBounds:{maxZ:STUDENT_HALL_CAMERA_DOWN_LIMIT_Z},
  cameraElevationDeg:24,
  cameraDistance:1250,
  cameraFov:48,
  cameraTargetHeight:120,
  characterHeight:150,
  groundFillColor:0xd9d4c9,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
};
export const RECRUITMENT_CENTER_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:recruitmentCenterModelUrl,
  mapName:'모집센터',
  spawn:RECRUITMENT_CENTER_SPAWN,
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS['recruitment-center'],destination:'campus',label:'공동 캠퍼스로 돌아가기',appearance:'energy-rift',theme:'mint',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  localNpcs:[{
    id:'recruitment-center-guide-chungnyeong',
    nickname:'충녕이',
    status:'모집센터의 동행 모집과 참가 신청을 안내하는 중',
    x:990,
    z:1240,
    yaw:0,
    model:'chungnyeong',
    appearance:{hair:'',face:'',top:'',bottom:'',shoes:''},
    height:210,
    staticPose:true,
    interactionRadius:380,
  }],
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:27,
  cameraDistance:1450,
  cameraHorizontalDistance:1600,
  cameraFov:44,
  cameraScreenOffsetY:0,
  flatGroundExtension:{minX:320,maxX:2080,minZ:1180,maxZ:RECRUITMENT_CENTER_WORLD_HEIGHT-35},
  characterHeight:150,
  characterGroundClearance:4,
  groundFillColor:0x8f7457,
  toneMappingExposure:.88,
  lightingIntensityMultiplier:.82,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1.5,
  antialias:true,
  simplifiedCollision:false,
  recruitmentKioskWeb:true,
  groundObjectPrefixes:['Ground_RecruitmentCenter','Walkable_Oak_Platform','Platform_Stone_Inlay','Platform_Oak_Center'],
  collisionExcludePrefixes:['Backwall_Warm_LED_Arch','Downlight_','Recruitment_Logo_'],
  collisionObjectPrefixes:['Recruitment_Reception_Desk','Recruitment_Brochure_Rack','Luxury_Side_Console_','Recruitment_Info_Kiosk','Plant_Tall_Left'],
};
export const PROJECT_ROOM_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:projectRoomModelUrl,
  companionModelUrl:projectLobbyModelUrl,
  mapName:'프로젝트실',
  spawn:PROJECT_ROOM_SPAWN,
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS['project-room'],destination:'campus',label:'공동캠퍼스로 돌아가기',appearance:'energy-rift',theme:'orange',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false},
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  projectRoomInteractions:true,
  hiddenObjectPrefixes:['Project_Touch_Kiosk'],
  // Use a slightly elevated, longer-lens view so the wide room does not feel
  // flattened across the screen. The added distance preserves useful context.
  cameraElevationDeg:30,
  cameraDistance:1850,
  cameraFov:39,
  cameraTargetHeight:75,
  cameraFollowBounds:{maxZ:PROJECT_ROOM_SPAWN.z},
  characterHeight:170,
  groundFillColor:0x484945,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1.1,
};
export const GOVERNMENT_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:governmentModelUrl,
  mapName:'정부청사',
  spawn:GOVERNMENT_SPAWN,
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS.government,destination:'campus',label:'공동캠퍼스',theme:'orange',chargeSeconds:3,fixedPosition:false,sharedPosition:true,positionEditable:true},
  fixedPortals:[
    {x:720,z:1010,destination:'government-central-plaza',label:'중앙광장 · AI 세종 추천센터',appearance:'standing',theme:'blue',chargeSeconds:3,fixedPosition:false,sharedPosition:true,positionEditable:true},
    // The former observatory point intersected the high government roof.
    // This point is on the open ground beyond the right-hand building row.
    {x:1900,z:1350,destination:'government-observatory',label:'전망대',appearance:'standing',theme:'orange',chargeSeconds:3,fixedPosition:true,sharedPosition:false,positionEditable:false},
    // Keep Smart City far to the left of the central-plaza portal on a flat,
    // reachable part of the government grounds.
    {x:260,z:1190,destination:'sejong-smart-city',label:'세종 스마트시티 국가시범도시',appearance:'standing',theme:'blue',chargeSeconds:3,fixedPosition:true,sharedPosition:false,positionEditable:false},
  ],
  cameraElevationDeg:38,
  cameraZoom:1.05,
  characterHeight:CHARACTER_HEIGHT,
  performanceMode:true,
  antialias:false,
  performanceFrameRate:30,
  minPixelRatio:.65,
  performancePixelRatio:.7,
  balancedTextureQuality:true,
  simplifiedCollision:true,
  fastGroundSampling:true,
  stableCharacterGrounding:true,
  lowQualityFallback:{maxTextureSize:512,performancePixelRatio:.55,performanceFrameRate:24,balancedTextureQuality:false},
};
export const GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:governmentCentralPlazaModelUrl,
  mapName:'중앙광장',
  spawn:GOVERNMENT_CENTRAL_PLAZA_SPAWN,
  portal:{
    ...WORLD_GUIDE_PORTAL_POSITIONS['government-central-plaza'],
    destination:'government',
    label:'정부청사로 돌아가기',
    appearance:'white-circle',
    theme:'blue',
    fixedPosition:true,
    sharedPosition:false,
    positionEditable:true,
    chargeSeconds:3,
  },
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  // A slightly higher view keeps the circular plaza and hologram table from
  // reading as horizontally squashed on wide desktop viewports.
  cameraElevationDeg:36,
  cameraAzimuthDeg:180,
  cameraDistance:1550,
  cameraFov:46,
  characterHeight:150,
  groundFillColor:0xd9d9d5,
  // The plaza has several large glass surfaces and three embedded web panels.
  // Keep the authored materials, but leave enough GPU headroom for the
  // hologram and three embedded web panels that are rendered over this map.
  // This map is substantially heavier than the other government scenes.
  groundingShadows:false,
  performanceMode:true,
  adaptivePixelRatio:true,
  antialias:false,
  balancedTextureQuality:true,
  prioritizeGroundTextures:true,
  maxTextureSize:2048,
  minPixelRatio:.75,
  performancePixelRatio:.85,
  maxPixelRatio:.95,
  performanceFrameRate:30,
  geometrySimplificationRatio:.18,
  groundGeometrySimplificationRatio:.12,
  toneMappingExposure:1.18,
  lightingIntensityMultiplier:1.12,
  sceneBackgroundColor:'#b9d7d8',
  simplifiedCollision:true,
  fastGroundSampling:true,
  // Remove the two GLB kiosks placed between the side Web UI panels and the
  // center panel. The outer kiosks remain available as plaza decoration.
  hiddenObjectPrefixes:[
    'Kiosk_Rear_Left_','Kiosk_Rear_Right_',
    // Replace the large authored globe with the staged AI analysis experience.
    'AI_Beam','AI_Globe','AI_Orbit_Node_',
  ],
  // The generated GLB groups the five planters and sofa instances under two
  // opaque node prefixes. Give both sets padded authored collision bounds.
  collisionObjectPrefixes:[
    'tripo_node_7c513070-600e-4a04-889e-a8c3c6e2d596',
    'tripo_node_d2b5f472-a753-44d7-9b9f-42e02b7542d3',
  ],
  cameraFollowBounds:{maxZ:1530},
  governmentCentralPlazaWebUi:true,
  centralPlazaSofaSeats:true,
};
export const GOVERNMENT_OBSERVATORY_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:observatoryModelUrl,
  mapName:'전망대',
  spawn:GOVERNMENT_OBSERVATORY_SPAWN,
  portal:{
    ...WORLD_GUIDE_PORTAL_POSITIONS['government-observatory'],
    destination:'government',
    label:'정부청사로 돌아가기',
    appearance:'white-circle',
    theme:'blue',
    fixedPosition:true,
    sharedPosition:false,
    chargeSeconds:3,
  },
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:25,
  cameraAzimuthDeg:0,
  cameraDistance:1880,
  cameraFov:46,
  characterHeight:170,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
  simplifiedCollision:true,
  collisionExcludePrefixes:['Roof_','Ceiling_'],
  hiddenObjectPrefixes:['Rear_','Entry_'],
  cameraFollowBounds:{minX:900,maxX:1500,minZ:900,maxZ:1380},
  observatoryTelescopeInteraction:true,
};
export const SEJONG_SMART_CITY_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:sejongSmartCityModelUrl,
  mapName:'세종 스마트시티 국가시범도시',
  spawn:SEJONG_SMART_CITY_SPAWN,
  portal:{
    ...WORLD_GUIDE_PORTAL_POSITIONS['sejong-smart-city'],
    destination:'government',
    label:'정부청사로 돌아가기',
    appearance:'white-circle',
    theme:'blue',
    chargeSeconds:3,
    fixedPosition:true,
    sharedPosition:false,
    positionEditable:true,
  },
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:27,
  cameraAzimuthDeg:0,
  cameraDistance:1650,
  cameraFov:46,
  // Keep the current exhibition framing when the player walks into the large
  // foreground plaza; only the avatar continues toward the bottom edge.
  cameraFollowBounds:{maxZ:SEJONG_SMART_CITY_SPAWN.z+220},
  characterHeight:150,
  // The authored showroom floor stops just past the entrance even though the
  // foreground plaza remains visible. Treat that plaza as a continuation of
  // the entrance floor so players can walk toward the bottom of the screen.
  flatGroundExtension:{minX:35,maxX:WORLD_WIDTH-35,minZ:1500,maxZ:SEJONG_SMART_CITY_WORLD_HEIGHT-35},
  groundFillColor:0x686969,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
  smartCityWebUi:true,
  // Keep every structural wall in the authored GLB. Only the graphics and
  // dashboard contents attached to those walls are replaced by HTML.
  simplifiedCollision:false,
  hiddenObjectPrefixes:[
    'Main_Title_Backdrop',
    'Back_Wall_Skyline',
    'Future_Map_',
    'Map_Theme_',
    'Wall_City_',
    'AI_Icon_',
    'AI_Screen',
    'Mobility_Screen',
    'Mobility_UI_',
    'Mobility_Bullet_',
    'Mobility_BulletLine_',
    'Energy_Screen',
    'Energy_UI_',
    'Energy_Bullet_',
    'Energy_BulletLine_',
    'Energy_Panel_',
    'Energy_Turbine_',
    'Energy_Hub_',
    'Table_Map_',
    'Screen_BRT',
    'UAM_',
  ],
};
export const SEJONG_ARTS_CENTER_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:sejongArtsCenterModelUrl,
  mapName:'세종예술의전당',
  spawn:SEJONG_ARTS_CENTER_SPAWN,
  // Keep the return portal visible and reachable in the entrance lobby.
  portal:{...WORLD_GUIDE_PORTAL_POSITIONS['arts-center'],destination:'town',label:'세종호수공원으로 돌아가기',appearance:'standing',theme:'orange',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  // Look inward from the entrance. The previous 40-degree azimuth placed the
  // camera on the poster-wall side and looked out into the open GLB boundary.
  cameraElevationDeg:29,
  cameraAzimuthDeg:180,
  cameraDistance:SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE,
  cameraFov:46,
  cameraTargetHeight:75,
  // Preserve the approved view direction and stop only downward screen follow.
  cameraDownScreenLimitZ:SEJONG_ARTS_CENTER_CAMERA_DOWN_LIMIT_Z,
  characterHeight:150,
  // Keep the collision/camera ground baseline unchanged while lifting only
  // the character visual above the authored lobby floor finish.
  characterGroundClearance:4,
  characterFootLift:ARTS_CENTER_CHARACTER_FOOT_LIFT,
  // Blender exports spaces as underscores. These names must match the GLB
  // exactly or the spawn ground probe falls back to y=0 below the lobby.
  groundObjectPrefixes:['Lobby_matte_stone_floor','Auditorium_floor','Audience_riser','Stage','Building_foundation'],
  hiddenObjectPrefixes:['Luminous_gallery_cornice'],
  groundFillColor:0x17151c,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
  // The auditorium has a raised threshold and stepped seating. Full collision
  // keeps the avatar capsule from passing through their vertical faces. The
  // entrance floor is slightly higher than a normal step, so a real jump may
  // clear that brown threshold without making the stage itself reachable.
  simplifiedCollision:false,
  maxJumpStepHeight:ARTS_CENTER_MAX_JUMP_STEP_HEIGHT,
  artsCenterPosterWeb:true,
};
export const FESTIVAL_EXPERIENCE_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:festivalExperienceModelUrl,
  localNpcs:FESTIVAL_NPCS,
  mapName:'축제부스',
  hiddenObjectPrefixes:['PortalCore'],
  spawn:FESTIVAL_EXPERIENCE_SPAWN,
  mapRotationY:Math.PI,
  mapScaleMultiplier:1.2,
  // Keep the character grounded on the authored festival floor layers. In
  // particular, Festival_Lawn must win the downward ground probe instead of
  // nearby flat props such as booth counters or stage pieces.
  groundObjectPrefixes:['Festival_Lawn','Promenade','Island_Base'],
  // Use stable root groups from the GLB as padded collision volumes so thin
  // booth walls, tables and fixtures cannot be skipped by mesh raycasts.
  collisionObjectPrefixes:[
    'Blue_Experience_Tent','Red_Experience_Tent','Main_Stage','PicnicTable_',
    'MapKiosk','Bin_','EntryBollard_','LampPost_',
  ],
  lakeExperiences:[
    {id:'activity-zone',x:1200,z:520,label:'세종 축제 영상',description:'E를 눌러 축제 영상을 큰 화면으로 감상하세요.',color:0x7c5de8,radius:400},
    {id:'food-shop-zone',x:760,z:1080,label:'세종 축제 탐색관',description:'E를 눌러 현재·예정 축제를 탐색하세요.',color:0x3d9fc4,radius:280},
    {id:'central-plaza',x:1640,z:1080,label:'세종 축제 한눈에 보기',description:'E를 눌러 실제 방문 정보를 확인하세요.',color:0xe75b4f,radius:280},
  ],
  lakeExperienceObjectNames:{'activity-zone':'StageBack','food-shop-zone':'Blue_Experience_Tent_Roof','central-plaza':'Red_Experience_Tent_Roof'},
  portal:{...FESTIVAL_LAKE_RETURN_PORTAL_POSITION,destination:'town',label:'세종호수공원으로 돌아가기',appearance:'white-circle',theme:'orange',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:31,
  cameraAzimuthDeg:180,
  cameraDistance:FESTIVAL_EXPERIENCE_CAMERA_DISTANCE,
  cameraFov:46,
  characterHeight:150,
  // The avatar models are normalized to a zero-foot baseline, so only retain
  // the small anti-z-fighting clearance used by the other grounded maps.
  characterGroundClearance:4,
  groundFillColor:0xbfd6c2,
  // This map contains many separate booth/stage meshes. Rendering all of them
  // into a shadow map is disproportionately expensive and is barely visible
  // under the bright festival lighting.
  groundingShadows:false,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:.9,
  // Booths, tables, trees, light poles and the stage are physical obstacles.
  // Full body collision prevents the avatar capsule from passing through the
  // prop side faces while the authored lawn remains the only walkable floor.
  simplifiedCollision:false,
};
export const FOOD_EXPERIENCE_RENDERER_OPTIONS:WorldMapRendererOptions={
  modelUrl:foodExperienceModelUrl,
  mapName:'먹거리 부스',
  hiddenObjectPrefixes:['PortalCore'],
  spawn:FOOD_EXPERIENCE_SPAWN,
  mapRotationY:Math.PI,
  mapScaleMultiplier:1.6,
  groundObjectPrefixes:['Map_island','Grass_island','Central_plaza','Plaza_paving_ring','North_walkway','South_walkway'],
  portal:{...FOOD_LAKE_RETURN_PORTAL_POSITION,destination:'town',label:'세종호수공원으로 돌아가기',appearance:'energy-rift',theme:'orange',chargeSeconds:3,fixedPosition:true,sharedPosition:false},
  perspectiveCamera:true,
  fixedCameraTarget:false,
  centerInWorldCoordinates:true,
  cameraElevationDeg:31,
  cameraAzimuthDeg:180,
  cameraDistance:1700,
  cameraFov:46,
  // Keep the lake-return portal fully in view when the player walks farther
  // toward the lower edge of the authored food-booth island.
  cameraDownScreenLimitZ:FOOD_EXPERIENCE_CAMERA_DOWN_LIMIT_Z,
  characterHeight:150,
  characterGroundClearance:12,
  groundFillColor:0xbfd6c2,
  groundingShadows:true,
  performanceMode:true,
  balancedTextureQuality:true,
  performancePixelRatio:1,
  // Food trucks, counters, tables, chairs and light poles must block the
  // character capsule so the avatar cannot walk through or overlap props.
  simplifiedCollision:false,
  foodTruckExperience:true,
};
type LoadedModel=Awaited<ReturnType<GLTFLoader['loadAsync']>>;
const modelAssetCache=new Map<string,Promise<LoadedModel>>();
const createModelLoader=createGltfLoader;
const loadModel=(url:string)=>{
  let pending=modelAssetCache.get(url);
  if(!pending){
    // Reject an incomplete cached BearTree response before GLTFLoader parses it.
    pending=(url.includes('new-beartree-')?loadValidatedGlb(url):createModelLoader().loadAsync(url)).catch(error=>{
      modelAssetCache.delete(url);
      throw error;
    });
    modelAssetCache.set(url,pending);
  }
  return pending;
};
const guidePatrolLegs=GUIDE_PATROL_POINTS.map((from,index)=>{
  const to=GUIDE_PATROL_POINTS[(index+1)%GUIDE_PATROL_POINTS.length],distance=Math.hypot(to.x-from.x,to.z-from.z);
  const pauseSeconds=GUIDE_PATROL_STOPS.has(`${from.x},${from.z}`)?GUIDE_PAUSE_SECONDS:0;
  return {from,to,distance,pauseSeconds,walkSeconds:distance/GUIDE_WALK_SPEED,yaw:Math.atan2(to.x-from.x,to.z-from.z)};
});
const GUIDE_PATROL_CYCLE_SECONDS=guidePatrolLegs.reduce((total,leg)=>total+leg.pauseSeconds+leg.walkSeconds,0);
function guidePatrolFrame(now:number):GuidePatrolFrame{
  let elapsed=(now/1000)%GUIDE_PATROL_CYCLE_SECONDS;
  for(const leg of guidePatrolLegs){
    if(elapsed<leg.pauseSeconds)return {...leg.from,yaw:leg.yaw,motion:'idle'};
    elapsed-=leg.pauseSeconds;
    if(elapsed<leg.walkSeconds){
      const progress=elapsed/leg.walkSeconds;
      return {x:THREE.MathUtils.lerp(leg.from.x,leg.to.x,progress),z:THREE.MathUtils.lerp(leg.from.z,leg.to.z,progress),yaw:leg.yaw,motion:'walk'};
    }
    elapsed-=leg.walkSeconds;
  }
  return {...LAKE_PARK_GUIDE,motion:'idle'};
}

function sharpenObjectTextures(object:THREE.Object3D,reduced=false,balanced=false){
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    const materials=Array.isArray(child.material)?child.material:[child.material];
    materials.forEach(material=>{
      for(const value of Object.values(material)){
        if(value instanceof THREE.Texture){
          value.anisotropy=reduced&&!balanced?2:Math.min(balanced?4:textureAnisotropy,textureAnisotropy);
          value.magFilter=THREE.LinearFilter;
          value.minFilter=reduced&&!balanced?THREE.LinearFilter:THREE.LinearMipmapLinearFilter;
          value.generateMipmaps=!reduced||balanced;
          value.needsUpdate=true;
        }
      }
    });
  });
}

function prioritizeGroundTextureQuality(object:THREE.Object3D){
  const candidates:{mesh:THREE.Mesh;footprint:number;flatness:number}[]=[];
  object.updateMatrixWorld(true);
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    const size=new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
    candidates.push({mesh:child,footprint:size.x*size.z,flatness:size.y/Math.max(1,size.x,size.z)});
  });
  const ground=candidates.filter(candidate=>candidate.flatness<.16).sort((a,b)=>b.footprint-a.footprint)[0]?.mesh;
  if(!ground)return;
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    const materials=Array.isArray(child.material)?child.material:[child.material];
    materials.forEach(material=>{
      const standard=material as THREE.MeshStandardMaterial;
      if(child===ground){
        for(const value of Object.values(material)){
          if(!(value instanceof THREE.Texture))continue;
          value.anisotropy=textureAnisotropy;
          value.magFilter=THREE.LinearFilter;
          value.minFilter=THREE.LinearMipmapLinearFilter;
          value.generateMipmaps=true;
          value.needsUpdate=true;
        }
      }else{
        // Keep every authored building map so lighting and color stay intact.
        // Lower anisotropy only affects fine detail at oblique angles.
        for(const value of Object.values(material)){
          if(!(value instanceof THREE.Texture))continue;
          value.anisotropy=2;
          value.minFilter=THREE.LinearMipmapLinearFilter;
          value.needsUpdate=true;
        }
        standard.needsUpdate=true;
      }
    });
  });
}

function largestFlatMesh(object:THREE.Object3D){
  const candidates:{mesh:THREE.Mesh;footprint:number;flatness:number}[]=[];
  object.updateMatrixWorld(true);
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    const size=new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
    candidates.push({mesh:child,footprint:size.x*size.z,flatness:size.y/Math.max(1,size.x,size.z)});
  });
  return candidates.filter(candidate=>candidate.flatness<.16).sort((a,b)=>b.footprint-a.footprint)[0]?.mesh;
}

async function simplifyMapGeometry(object:THREE.Object3D,ratio:number,groundRatio=ratio){
  await MeshoptSimplifier.ready;
  const meshes:THREE.Mesh[]=[];
  object.updateMatrixWorld(true);
  object.traverse(child=>{if(child instanceof THREE.Mesh)meshes.push(child)});
  const ground=largestFlatMesh(object);
  let before=0,after=0;
  for(const mesh of meshes){
    const geometry=mesh.geometry,index=geometry.index,position=geometry.getAttribute('position');
    if(!index||!position||position.itemSize!==3||position instanceof THREE.InterleavedBufferAttribute)continue;
    const sourceIndices=Uint32Array.from(index.array as ArrayLike<number>);
    const sourcePositions=position.array instanceof Float32Array?position.array:Float32Array.from(position.array as ArrayLike<number>);
    const targetRatio=mesh===ground?groundRatio:ratio;
    if(targetRatio>=.999)continue;
    const targetCount=Math.max(3,Math.floor(sourceIndices.length*targetRatio/3)*3);
    const [simplified]=MeshoptSimplifier.simplify(sourceIndices,sourcePositions,3,targetCount,.01,['LockBorder']);
    before+=sourceIndices.length/3;after+=simplified.length/3;
    geometry.setIndex(new THREE.BufferAttribute(simplified,1));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }
  if(import.meta.env.DEV)console.info('[map geometry simplified]',{before,after,reduction:before?Math.round((1-after/before)*100):0});
}

function savedMapSignPosition(){
  return {...DEFAULT_MAP_SIGN_POSITION};
}

function savedPortalPosition(config:PortalConfig,mapName:string){
  if(config.positionEditable){
    try{
      const saved=JSON.parse(localStorage.getItem(`world-portal-position-${mapName}-${config.destination}`)??'null') as {x?:unknown;z?:unknown}|null;
      if(saved&&typeof saved.x==='number'&&typeof saved.z==='number')return {x:saved.x,z:saved.z};
    }catch{/* Use the authored fallback position when saved data is invalid. */}
  }
  return {x:config.x,z:config.z};
}

function limitObjectTextureResolution(object:THREE.Object3D,maxSize:number){
  const processed=new Set<THREE.Texture>();
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    const materials=Array.isArray(child.material)?child.material:[child.material];
    materials.forEach(material=>Object.values(material).forEach(value=>{
      if(!(value instanceof THREE.Texture)||processed.has(value))return;
      processed.add(value);
      const image=value.image as {width?:number;height?:number}|undefined;
      const width=image?.width??0,height=image?.height??0,longest=Math.max(width,height);
      if(!width||!height||longest<=maxSize)return;
      const scale=maxSize/longest,canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
      const context=canvas.getContext('2d');
      if(!context)return;
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality='low';
      try{context.drawImage(value.image as CanvasImageSource,0,0,canvas.width,canvas.height)}catch{return}
      value.image=canvas;value.needsUpdate=true;
    }));
  });
}

function savedInteractionPosition(config:InteractionConfig,mapName:string){
  if(config.positionEditable){
    try{
      const saved=JSON.parse(localStorage.getItem(`world-interaction-position-${mapName}-${config.destination}`)??'null') as {x?:unknown;z?:unknown}|null;
      if(saved&&typeof saved.x==='number'&&typeof saved.z==='number')return {x:saved.x,z:saved.z};
    }catch{/* Use the authored fallback position when saved data is invalid. */}
  }
  return {x:config.x,z:config.z};
}

function savedLakeExperiencePosition(config:LakeExperienceConfig){
  return {x:config.x,z:config.z};
}

function savedCampusFeaturePortalPosition(config:CampusFeaturePortalConfig){
  return {...config};
}

const modelConfig:Record<Exclude<CharacterModel,'custom'>,{urls:Record<MotionState,string>;clips:Record<MotionState,string>}>= {
  chungnyeong:{urls:{idle:chungnyeongIdleUrl,walk:chungnyeongWalkUrl,run:chungnyeongRunUrl},clips:{idle:'NlaTrack',walk:'NlaTrack',run:'NlaTrack'}},
  girl1:{urls:{idle:girlUrl,walk:girlUrl,run:girlUrl},clips:{idle:'NlaTrack.002',walk:'NlaTrack.001',run:'NlaTrack'}},
  boy1:{urls:{idle:boyUrl,walk:boyUrl,run:boyUrl},clips:{idle:'NlaTrack',walk:'NlaTrack.002',run:'NlaTrack.001'}},
  cloths:{urls:{idle:clothsUrl,walk:clothsUrl,run:clothsUrl},clips:{idle:'standing',walk:'walking',run:'running'}},
  women:{urls:{idle:womenUrl,walk:womenUrl,run:womenUrl},clips:{idle:'standing',walk:'walking',run:'running'}}
};
const FEMALE_MOTION_DURATION:Record<'walk'|'run',number>={walk:2.375,run:1.292};
const motionDurationByModel:Partial<Record<Exclude<CharacterModel,'custom'>,Record<'walk'|'run',number>>>={
  cloths:{walk:1.167,run:.667},
  women:{walk:1.167,run:.667},
};

function femaleMatchedWorldTimeScale(model:Exclude<CharacterModel,'custom'>,motion:MotionState){
  if(motion==='idle')return 1;
  const configured=motion==='walk'?characterSettings.walkAnimationTimeScale:characterSettings.runAnimationTimeScale;
  const duration=motionDurationByModel[model]?.[motion];
  return duration?configured*duration/FEMALE_MOTION_DURATION[motion]:configured;
}

function inPlaceCharacterClip(source:THREE.AnimationClip){
  const clip=source.clone();
  clip.tracks.forEach(track=>{
    const name=track.name.toLowerCase();
    const rootPosition=name==='root.position'||name.endsWith('root.x.position')||name.includes('bones[root.x].position');
    const hipsPosition=name.endsWith('hips.position')||name.includes('bones[hips].position');
    if(!rootPosition&&!hipsPosition)return;
    const values=track.values;
    if(values.length<3)return;
    const firstX=values[0],firstZ=values[2];
    const lastX=values[values.length-3],lastZ=values[values.length-1];
    // The extended models store forward locomotion on mixamorigHips instead
    // of a conventional root bone. Letting that translation loop makes the
    // mesh jump backward at the end of every walk cycle. Preserve vertical
    // hip motion for the gait, but remove only meaningful horizontal drift.
    if(hipsPosition&&Math.hypot(lastX-firstX,lastZ-firstZ)<.05)return;
    for(let index=0;index<values.length;index+=3){values[index]=firstX;values[index+2]=firstZ}
  });
  return clip;
}

// The boy rig needs one rest-pose correction, but extra locomotion-specific
// pitch lifts its chin above the girl1 reference. Keep the neutral idle angle
// for every motion so walking and running retain the same natural head level.
const BOY_HEAD_PITCH_CORRECTION:Record<MotionState,number>={idle:15,walk:15,run:15};

function correctedBoyHeadClip(source:THREE.AnimationClip,motion:MotionState){
  const clip=source.clone();
  const correction=new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1,0,0),
    THREE.MathUtils.degToRad(BOY_HEAD_PITCH_CORRECTION[motion])
  );
  clip.tracks.forEach(track=>{
    const name=track.name.toLowerCase();
    if(!name.endsWith('head.quaternion')&&!name.includes('bones[head].quaternion'))return;
    const values=track.values;
    for(let index=0;index<values.length;index+=4){
      const animated=new THREE.Quaternion(values[index],values[index+1],values[index+2],values[index+3]);
      animated.premultiply(correction).normalize();
      values[index]=animated.x;values[index+1]=animated.y;values[index+2]=animated.z;values[index+3]=animated.w;
    }
  });
  return clip;
}

function characterClip(source:THREE.AnimationClip|null|undefined,model:Exclude<CharacterModel,'custom'>,motion:MotionState){
  if(!source)return undefined;
  if(model==='cloths'||model==='women')return inPlaceCharacterClip(source);
  if(model==='boy1')return correctedBoyHeadClip(source,motion);
  return source;
}

class WorldCharacter{
  readonly root=new THREE.Group();
  readonly ready:Promise<void>;
  private nameplate:THREE.Sprite;
  private states=new Map<MotionState,CharacterState>();
  private emoteActions=new Map<CharacterEmote,THREE.AnimationAction>();
  private activeEmote?:CharacterEmote;
  private activeEmoteLoop=false;
  private active:MotionState='idle';
  private photoAction?:THREE.AnimationAction;
  private photoPoseActive=false;
  private targetQuaternion=new THREE.Quaternion();
  private tiltQuaternion=new THREE.Quaternion();
  private turnQuaternion=new THREE.Quaternion();
  private lyingQuaternion=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
  private upVector=new THREE.Vector3(0,1,0);
  private height:number;
  private seated=false;
  private lying=false;

  constructor(private scene:THREE.Scene,name:string,private model:CharacterModel,private parts:CharacterParts,height=CHARACTER_HEIGHT,private idleOnly=false,private staticPose=false,disabled=false,private nameplateScale=1){
    this.height=height;
    this.root.name=`world-character-${name}`;
    scene.add(this.root);
    if(disabled){this.nameplate=new THREE.Sprite();this.root.visible=false;this.ready=Promise.resolve();return}
    this.nameplate=this.createNameplate(name);this.root.add(this.nameplate);
    if(model==='custom'){this.createFallback(parts);this.ready=Promise.resolve()}
    else this.ready=this.loadModels(model);
  }

  private async loadModels(model:Exclude<CharacterModel,'custom'>){
    const config=modelConfig[model];
    try{
      const femaleReference=model==='cloths'||model==='women'?undefined:await loadModel(girlUrl);
      const sourceAnimation=(gltf:LoadedModel,motion:MotionState)=>{
        const animations=femaleReference?.animations??gltf.animations;
        const clipName=femaleReference?modelConfig.girl1.clips[motion]:config.clips[motion];
        return THREE.AnimationClip.findByName(animations,clipName);
      };
      if(this.idleOnly){
        const gltf=await loadModel(config.urls.idle),visual=cloneSkeleton(gltf.scene);
        applyColorsToThreeScene(visual,model,this.parts);
        sharpenObjectTextures(visual);
        visual.updateMatrixWorld(true);
        const bounds=new THREE.Box3().setFromObject(visual),size=bounds.getSize(new THREE.Vector3()),scale=this.height/Math.max(size.y,.001);
        visual.scale.setScalar(scale);visual.position.y=-bounds.min.y*scale;
        this.prepareVisual(visual);
        const mixer=gltf.animations.length?new THREE.AnimationMixer(visual):undefined,sourceClip=sourceAnimation(gltf,'idle'),clip=characterClip(sourceClip,model,'idle'),action=mixer&&clip?mixer.clipAction(clip):undefined;
        action?.play();this.root.add(visual);this.states.set('idle',{scene:visual,mixer,action});if(mixer)this.registerExtendedEmotes(gltf,mixer);this.setMotion('idle');if(this.staticPose)mixer?.setTime(0);return;
      }
      if(new Set(Object.values(config.urls)).size===1){
        const gltf=await loadModel(config.urls.idle),visual=cloneSkeleton(gltf.scene);
        applyColorsToThreeScene(visual,model,this.parts);
        sharpenObjectTextures(visual);
        visual.updateMatrixWorld(true);
        const bounds=new THREE.Box3().setFromObject(visual),size=bounds.getSize(new THREE.Vector3()),scale=this.height/Math.max(size.y,.001);
        visual.scale.setScalar(scale);visual.position.y=-bounds.min.y*scale;
        this.prepareVisual(visual);
        const mixer=new THREE.AnimationMixer(visual);this.root.add(visual);
        for(const motion of ['idle','walk','run'] as MotionState[]){const sourceClip=sourceAnimation(gltf,motion);const clip=characterClip(sourceClip,model,motion);const action=clip?mixer.clipAction(clip):undefined;this.states.set(motion,{scene:visual,mixer,action})}
        this.registerExtendedEmotes(gltf,mixer);
        if(model==='women'||model==='cloths'){
          const hiSource=THREE.AnimationClip.findByName(gltf.animations,'hi');
          if(hiSource)this.photoAction=mixer.clipAction(inPlaceCharacterClip(hiSource));
        }
        this.setMotion(this.active);return;
      }
      const loadedStates=await Promise.all((['idle','walk','run'] as MotionState[]).map(async motion=>{
        const gltf=await loadModel(config.urls[motion]);
        const visual=cloneSkeleton(gltf.scene);
        applyColorsToThreeScene(visual,model,this.parts);
        sharpenObjectTextures(visual);
        visual.updateMatrixWorld(true);
        const bounds=new THREE.Box3().setFromObject(visual),size=bounds.getSize(new THREE.Vector3()),scale=this.height/Math.max(size.y,.001);
        visual.scale.setScalar(scale);
        visual.position.y=-bounds.min.y*scale;
        this.prepareVisual(visual);
        const mixer=gltf.animations.length?new THREE.AnimationMixer(visual):undefined;
        const sourceClip=sourceAnimation(gltf,motion);
        const clip=characterClip(sourceClip,model,motion);
        const action=mixer&&clip?mixer.clipAction(clip):undefined;
        action?.play();
        visual.visible=motion==='idle';
        return {motion,visual,mixer,action};
      }));
      for(const {motion,visual,mixer,action} of loadedStates){
        this.root.add(visual);
        this.states.set(motion,{scene:visual,mixer,action});
      }
      this.setMotion(this.active);
      }catch(error){console.error('[World character] GLB load error',{model,error});this.createFallback({hair:'',face:'',top:'',bottom:'',shoes:''})}
  }

  private prepareVisual(visual:THREE.Object3D){
    visual.traverse(object=>{
      if(!(object instanceof THREE.Mesh))return;
      object.castShadow=true;object.receiveShadow=false;
      object.frustumCulled=true;
    });
  }

  private registerExtendedEmotes(gltf:LoadedModel,mixer:THREE.AnimationMixer){
    if(this.model!=='cloths'&&this.model!=='women')return;
    const names:Record<CharacterEmote,string[]>={
      hi:['hi'],
      clapping:['clapping'],
      talking:this.model==='cloths'?['Talking','talking']:['talking','Talking'],
    };
    (Object.keys(names) as CharacterEmote[]).forEach(emote=>{
      const source=names[emote].map(name=>THREE.AnimationClip.findByName(gltf.animations,name)).find(Boolean);
      if(source)this.emoteActions.set(emote,mixer.clipAction(inPlaceCharacterClip(source)));
    });
  }

  private createFallback(_parts:CharacterParts){
    const material=new THREE.MeshStandardMaterial({color:0x3f947d,roughness:.75});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(24,50,8,16),material);
    body.position.y=55;body.castShadow=true;body.userData.ownedResource=true;
    const head=new THREE.Mesh(new THREE.SphereGeometry(23,20,16),new THREE.MeshStandardMaterial({color:0xf1c7a4,roughness:.8}));
    head.position.y=108;head.castShadow=true;head.userData.ownedResource=true;
    this.root.add(body,head);this.height=132;
  }

  private createNameplate(name:string){
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
    const context=canvas.getContext('2d')!,[displayName,role]=name.split(' · ',2);
    context.shadowColor='rgba(7,31,25,.28)';context.shadowBlur=16;context.shadowOffsetY=8;
    context.fillStyle='rgba(255,255,255,.99)';context.strokeStyle='rgba(22,77,63,.72)';context.lineWidth=8;
    context.beginPath();context.roundRect(12,10,744,164,82);context.fill();context.stroke();
    context.shadowColor='transparent';context.shadowBlur=0;context.shadowOffsetY=0;
    context.fillStyle='#35b87e';context.beginPath();context.arc(76,92,22,0,Math.PI*2);context.fill();
    context.fillStyle='#123d33';context.textBaseline='middle';
    if(role){
      context.font='900 72px "Noto Sans KR", sans-serif';context.textAlign='left';context.fillText(displayName,116,93,300);
      context.font='900 43px "Noto Sans KR", sans-serif';const roleWidth=Math.min(context.measureText(role).width+54,310),roleX=724-roleWidth;
      context.fillStyle='#ccefe0';context.strokeStyle='#4b9b7c';context.lineWidth=4;context.beginPath();context.roundRect(roleX,42,roleWidth,100,50);context.fill();context.stroke();
      context.fillStyle='#123f34';context.textAlign='center';context.fillText(role,roleX+roleWidth/2,94,roleWidth-34);
    }else{
      context.font='900 68px "Noto Sans KR", sans-serif';context.textAlign='center';context.fillText(displayName,424,94,570);
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
    const isChungnyeong=this.model==='chungnyeong';
    sprite.position.y=this.height+(isChungnyeong?58:this.height>CHARACTER_HEIGHT?46:34);
    sprite.scale.set((isChungnyeong?120:this.height>CHARACTER_HEIGHT?150:120)*this.nameplateScale,(isChungnyeong?30:this.height>CHARACTER_HEIGHT?38:30)*this.nameplateScale,1);
    sprite.renderOrder=100;return sprite;
  }

  setMotion(motion:MotionState,fadeDuration=.12){
    this.active=motion;
    if(this.activeEmote)return;
    const activeState=this.states.get(motion),scenes=new Set([...this.states.values()].map(state=>state.scene));
    scenes.forEach(scene=>{scene.visible=scene===activeState?.scene});
    this.states.forEach((state,key)=>{const action=state.action;if(key===motion&&action){action.reset();action.setEffectiveTimeScale(femaleMatchedWorldTimeScale(this.model as Exclude<CharacterModel,'custom'>,motion));action.fadeIn(fadeDuration);action.play()}else if(action)action.fadeOut(fadeDuration)});
  }

  playEmote(emote:CharacterEmote,loop=false){
    const action=this.emoteActions.get(emote);
    if(!action)return false;
    if(this.activeEmote===emote&&this.activeEmoteLoop===loop)return true;
    this.states.forEach(state=>state.action?.fadeOut(.12));
    this.emoteActions.forEach(other=>other.fadeOut(.12));
    action.reset();action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);action.fadeIn(.12);action.play();
    action.clampWhenFinished=!loop;
    this.activeEmote=emote;this.activeEmoteLoop=loop;
    return true;
  }

  stopEmote(){
    if(!this.activeEmote)return;
    this.emoteActions.get(this.activeEmote)?.fadeOut(.34);
    this.activeEmote=undefined;this.activeEmoteLoop=false;
    this.setMotion('idle',.34);
  }

  update(position:THREE.Vector3,normal:THREE.Vector3,yaw:number,motion:MotionState,delta:number){
    if(!this.photoPoseActive&&!this.activeEmote&&motion!==this.active)this.setMotion(motion);
    this.root.position.copy(position);
    this.tiltQuaternion.setFromUnitVectors(this.upVector,normal);
    this.turnQuaternion.setFromAxisAngle(normal,yaw);
    this.targetQuaternion.copy(this.turnQuaternion).multiply(this.tiltQuaternion);
    if(this.lying)this.targetQuaternion.multiply(this.lyingQuaternion);
    this.root.quaternion.slerp(this.targetQuaternion,1-Math.exp(-12*delta));
    if(!this.staticPose)this.states.get(this.active)?.mixer?.update(delta);
    if(this.seated)this.applySeatedPose();
  }

  setSeated(seated:boolean){
    if(this.seated===seated)return;
    this.seated=seated;
    if(seated){this.lying=false;this.nameplate.visible=true}
    if(!seated)this.setMotion('idle',0);
  }

  setLying(lying:boolean){
    if(this.lying===lying)return;
    this.lying=lying;
    if(lying)this.seated=false;
    this.nameplate.visible=!lying;
    this.setMotion('idle',0);
  }

  private applySeatedPose(){
    const visual=this.states.get(this.active)?.scene;
    if(!visual)return;
    const bone=(...names:string[])=>names.map(name=>visual.getObjectByName(name)).find(Boolean);
    const leftThigh=bone('mixamorigLeftUpLeg','mixamorig:LeftUpLeg','L_Thigh'),rightThigh=bone('mixamorigRightUpLeg','mixamorig:RightUpLeg','R_Thigh');
    const leftCalf=bone('mixamorigLeftLeg','mixamorig:LeftLeg','L_Calf'),rightCalf=bone('mixamorigRightLeg','mixamorig:RightLeg','R_Calf');
    const leftArm=bone('mixamorigLeftArm','mixamorig:LeftArm','L_Upperarm'),rightArm=bone('mixamorigRightArm','mixamorig:RightArm','R_Upperarm');
    // The character models face their local +Z direction. Negative X rotation
    // folded the legs behind that direction, so the face and knees appeared to
    // point opposite ways. Fold the thighs toward the character's front and
    // bend the calves back down from the knees.
    const thighAngle=1.38,calfAngle=-1.38;
    // Apply after the mixer so every supported rig keeps a stable chair pose.
    leftThigh?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),thighAngle));
    rightThigh?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),thighAngle));
    leftCalf?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),calfAngle));
    rightCalf?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),calfAngle));
    leftArm?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-.16));
    rightArm?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),.16));
  }

  showAllForWarmup(){
    const visibility=[...this.states.values()].map(state=>[state.scene,state.scene.visible] as const);
    visibility.forEach(([visual])=>{visual.visible=true});
    return()=>visibility.forEach(([visual,visible])=>{visual.visible=visible});
  }

  setNameplateVisible(visible:boolean){this.nameplate.visible=visible}

  setHeight(height:number){
    if(!Number.isFinite(height)||height<=0||Math.abs(height-this.height)<.001)return;
    this.root.scale.multiplyScalar(height/this.height);this.height=height;
  }

  setPhotoPose(active:boolean){
    if(!this.photoAction)return;
    this.photoPoseActive=active;
    if(active){
      this.states.forEach(state=>state.action?.fadeOut(.12));
      this.photoAction.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.12).play();
    }else{
      this.photoAction.fadeOut(.12);
      this.setMotion('idle');
    }
  }

  destroy(){
    this.scene.remove(this.root);
    this.root.traverse(object=>{if(object instanceof THREE.Mesh&&object.userData.ownedResource){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose())}if(object instanceof THREE.Sprite){object.material.map?.dispose();object.material.dispose()}});
  }
}

export class VillageMapRenderer{
  readonly ready:Promise<void>;
  private renderer:THREE.WebGLRenderer;
  private scene=new THREE.Scene();
  private camera:THREE.OrthographicCamera|THREE.PerspectiveCamera;
  private previewControls?:OrbitControls;
  private previewCameraInitialized=false;
  private parent:HTMLElement;
  private width=1;
  private height=1;
  private destroyed=false;
  private mapReady=false;
  private inputLocked=false;
  private renderAccumulator=0;
  private pixelRatio=MAX_PIXEL_RATIO;
  private qualityElapsed=0;
  private qualityFrameTime=0;
  private qualityFrames=0;
  private get characterGroundClearance(){return this.options.characterGroundClearance??CHARACTER_GROUND_CLEARANCE}
  private get characterFootLift(){return this.options.characterFootLift??0}
  private renderInterval=RENDER_INTERVAL;
  private mapMeshes:THREE.Mesh[]=[];
  private mapMeshBounds=new Map<THREE.Mesh,THREE.Box3>();
  private authoredCollisionZones:Array<{minX:number;maxX:number;minZ:number;maxZ:number}>=[];
  private mapBounds=new THREE.Box3();
  private blockedMaterials=new WeakSet<THREE.Material>();
  private raycaster=new THREE.Raycaster();
  private bodyRaycaster=new THREE.Raycaster();
  private localCharacter:WorldCharacter;
  private authoredCameraProfile:WorldCameraProfile;
  private cameraProfileOverride?:WorldCameraProfile;
  private guideNpc?:WorldCharacter;
  private guideNpcPosition=new THREE.Vector3();
  private readonly guideNpcUprightNormal=new THREE.Vector3(0,1,0);
  private localNpcs:LocalNpcState[]=[];
  private foodTruckWindows:FoodTruckWindow[]=[];
  private nearbyFoodTruckId?:FoodTruckWindow['id'];
  private foodTruckScreens=new Map<FoodTruckWindow['id'],THREE.Mesh>();
  private foodTruckPlazaCenter?:THREE.Vector3;
  private foodTruckKioskId?:FoodTruckWindow['id'];
  private foodTruckKioskView?:{target:THREE.Vector3;camera:THREE.Vector3};
  private foodTruckKioskTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private foodTruckKioskMapTransform?:{scaleZ:number;positionZ:number;plazaZ?:number};
  private localNpcNearbyId?:string;
  private focusedLocalNpcId?:string;
  private talkingLocalNpcId?:string;
  private lastLocalNpcScreenPublish=0;
  private guidePosition:GuidePosition={...LAKE_PARK_GUIDE};
  private guideGround=0;
  private worldClockOffset=0;
  private guideNearby=false;
  private guideIntroActive=false;
  private guideIntroStartedAt=0;
  private guideIntroArrived=false;
  private guideIntroStart:{x:number;z:number}={x:LAKE_PARK_GUIDE.x,z:LAKE_PARK_GUIDE.z};
  private guideIntroEnd:{x:number;z:number}={x:LAKE_PARK_SPAWN.x+55,z:LAKE_PARK_SPAWN.z-12};
  private mapSignNearby=false;
  private portalNearby=false;
  private portalEntryArmed=true;
  private portalTravelGate=new PortalTravelGate();
  private interactionNearby=false;
  private interactionEntryArmed=true;
  private interactionTravelGate=new PortalTravelGate();
  private interactionPosition?:{x:number;z:number};
  private interactionRoot?:THREE.Group;
  private lakeExperienceNearby?:LakeExperienceId;
  private lakeBoothCompletion:Partial<Record<LakeExperienceId,boolean>>={};
  private lakeExperiencePositions=new Map<LakeExperienceId,{x:number;z:number}>();
  private lakeExperienceRoots=new Map<LakeExperienceId,THREE.Group>();
  private festivalStageBackdrop?:THREE.Mesh;
  private lastFestivalStageScreenRect?:{left:number;top:number;width:number;height:number};
  private festivalStageFocusView?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number};
  private festivalStageFocusTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private campusFeaturePortalRoots=new Map<CampusFeaturePortalId,THREE.Group>();
  private campusFeaturePortalNearby?:CampusFeaturePortalId;
  private studentHallFeatureTargets:StudentHallFeatureTarget[]=[];
  private studentHallAiTreeEffect?:THREE.Group;
  private studentHallBoardScreens=new Map<StudentHallBoardId,THREE.Mesh>();
  private lastStudentHallBoardRects=new Map<StudentHallBoardId,StudentHallBoardScreenRect>();
  private projectLobbyBoardScreen?:THREE.Mesh;
  private lastProjectLobbyBoardRect?:ProjectLobbyBoardScreenRect;
  private smartCityScreen?:THREE.Mesh;
  private lastSmartCityScreenRect?:ProjectLobbyBoardScreenRect;
  private smartCityWallScreens=new Map<'city'|'future'|'connected',THREE.Mesh>();
  private lastSmartCityWallRects=new Map<'city'|'future'|'connected',ProjectLobbyBoardScreenRect>();
  private smartCityTableNearby=false;
  private smartCityTablePosition?:{x:number;z:number;radius:number};
  private smartCityHologram?:SmartCityHologram;
  private smartCityTechnology:SmartCityTechnologyId='brt';
  private smartCityExperienceActive=false;
  private smartCityFocusView?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number};
  private smartCityFocusTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private projectLobbyBoardPosition?:{x:number;z:number;radius:number};
  private projectLobbyBoardNearby=false;
  private projectLobbyBoardFocused=false;
  private projectLobbyBoardFocusView?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number};
  private projectLobbyBoardFocusTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private studentHallBoardActive?:StudentHallBoardId;
  private studentHallBoardFocusView?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number};
  private studentHallBoardFocusTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private projectRoomInteractionNearby?:ProjectRoomInteractionId;
  private projectRoomInteractionOutlines=new Map<ProjectRoomInteractionId,THREE.Box3Helper>();
  private projectRoomInteractionPositions=new Map<ProjectRoomInteractionId,{x:number;z:number;radius:number}>();
  private projectRoomDoorMeshes:THREE.Mesh[]=[];
  private projectRoomDoorUnlocked=false;
  private projectRoomDoorEntrySide=0;
  private projectRoomCameraAzimuthDeg?:number;
  private projectRoomScreenTextures:THREE.CanvasTexture[]=[];
  private projectRoomHologram?:THREE.Group;
  private projectRoomFocus?:ProjectRoomInteractionId;
  private projectRoomKioskScreens=new Map<ProjectRoomKioskInteractionId,THREE.Mesh>();
  private projectRoomKioskViews=new Map<ProjectRoomKioskInteractionId,{target:THREE.Vector3;camera:THREE.Vector3}>();
  private projectRoomKioskView?:{target:THREE.Vector3;camera:THREE.Vector3};
  private projectRoomKioskTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private projectRoomKioskScreen?:THREE.Mesh;
  private lastProjectRoomKioskScreenRect?:{left:number;top:number;width:number;height:number};
  private projectRoomSeats:ProjectRoomSeat[]=[];
  private projectRoomSeatNearby?:ProjectRoomSeat;
  private projectRoomActiveSeat?:ProjectRoomSeat;
  private centralPlazaSofaSeats:PlazaSofaSeat[]=[];
  private centralPlazaSofaSeatNearby?:PlazaSofaSeat;
  private centralPlazaSofaActiveSeat?:PlazaSofaSeat;
  private governmentWebUiNearby?:GovernmentCentralPlazaWebUiId;
  private governmentWebUiActive?:GovernmentCentralPlazaWebUiId;
  private governmentAiCenterPosition?:{x:number;z:number;radius:number};
  private governmentAiPlatformSurface?:{x:number;z:number;radius:number;height:number};
  private governmentAiPlatformGrounded=false;
  private governmentAiCenterNearby=false;
  private governmentAiCenterActive=false;
  private governmentAiHologram?:{root:THREE.Group;beam:THREE.Mesh;particles:THREE.Points;core:THREE.Mesh;city:THREE.Group;route:THREE.Group;stage:number;elapsed:number};
  private governmentWebUiScreens=new Map<GovernmentCentralPlazaWebUiId,THREE.Mesh>();
  private governmentWebUiPositions=new Map<GovernmentCentralPlazaWebUiId,{x:number;z:number;radius:number}>();
  private governmentWebUiViews=new Map<GovernmentCentralPlazaWebUiId,{target:THREE.Vector3;camera:THREE.Vector3;fov:number}>();
  private governmentWebUiOutlines=new Map<GovernmentCentralPlazaWebUiId,THREE.Box3Helper>();
  private governmentWebUiTextures:THREE.CanvasTexture[]=[];
  private governmentWebUiTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private lastGovernmentWebUiRect?:{left:number;top:number;width:number;height:number};
  private recruitmentKioskNearby=false;
  private recruitmentKioskPosition?:{x:number;z:number;radius:number};
  private recruitmentKioskTexture?:THREE.CanvasTexture;
  private recruitmentKioskScreen?:THREE.Mesh;
  private recruitmentKioskActive=false;
  private recruitmentKioskView?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number};
  private recruitmentKioskTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private lastRecruitmentKioskRect?:{left:number;top:number;width:number;height:number};
  private artsCenterPosterScreens:THREE.Mesh[]=[];
  private artsCenterPosterTextures:THREE.CanvasTexture[]=[];
  private artsCenterPosterNearby?:THREE.Mesh;
  private artsCenterPosterActive?:THREE.Mesh;
  private artsCenterPosterWebReady=false;
  private lastArtsCenterPosterScreenRect?:{left:number;top:number;width:number;height:number};
  private artsCenterPosterFocusView?:{target:THREE.Vector3;camera:THREE.Vector3};
  private artsCenterPosterFocusTransition?:{target:THREE.Vector3;camera:THREE.Vector3;elapsed:number};
  private artsCenterSeats:ArtsCenterSeat[]=[];
  private artsCenterSeatMeshes:THREE.Mesh[]=[];
  private artsCenterSeatByMesh=new Map<THREE.Mesh,ArtsCenterSeat>();
  private artsCenterSeatNearby?:ArtsCenterSeat;
  private artsCenterActiveSeat?:ArtsCenterSeat;
  private foodSeats:ArtsCenterSeat[]=[];
  private foodSeatNearby?:ArtsCenterSeat;
  private foodActiveSeat?:ArtsCenterSeat;
  private artsCenterStageBackdrop?:THREE.Mesh;
  private lastArtsCenterStageScreenRect?:{left:number;top:number;width:number;height:number};
  private observatoryTelescopeNearby=false;
  private observatoryTelescopeActive=false;
  private observatoryTelescopePosition?:{x:number;z:number;radius:number};
  private observatoryTelescopeView?:{target:THREE.Vector3;camera:THREE.Vector3};
  private observatoryTelescopeTransition?:{target:THREE.Vector3;camera:THREE.Vector3;fov:number;elapsed:number};
  private observatoryTelescopeOutline?:THREE.Box3Helper;
  private natureChapterCompletion={garden:false,photo:false};
  private portalRoot?:THREE.Group;
  private fixedPortalRoots:THREE.Group[]=[];
  private activePortal?:PortalConfig;
  private residentRoot?:THREE.Group;
  private residentDecorRoots:THREE.Group[]=[];
  private residentDecorMixers:THREE.AnimationMixer[]=[];
  private residentDecorBearActors:Array<{root:THREE.Group;mixer:THREE.AnimationMixer;movementAction?:THREE.AnimationAction;begAction?:THREE.AnimationAction;rewardActions:THREE.AnimationAction[];celebrating:boolean}>=[];
  private residentMixer?:THREE.AnimationMixer;
  private residentMovementAction?:THREE.AnimationAction;
  private residentBegAction?:THREE.AnimationAction;
  private residentRewardActions:THREE.AnimationAction[]=[];
  private residentSpecialAction?:THREE.AnimationAction;
  private residentBehavior:'patrol'|'begging'|'celebrating'='patrol';
  private residentCelebrationRemaining=0;
  private residentStatusLabel?:THREE.Sprite;
  private residentGround=0;
  private residentX=0;
  private residentZ=0;
  private residentPatrolTarget=1;
  private portalPosition?:{x:number;z:number};
  private overviewActive=false;
  private mapSignPosition=savedMapSignPosition();
  private remotes=new Map<string,WorldCharacter>();
  private remoteGrounds=new Map<string,RemoteGroundSample>();
  private hiddenCharacterIds=new Set<string>();
  private localX:number;
  private localZ:number;
  private localGround=0;
  private localNormal=new THREE.Vector3(0,1,0);
  private cameraTarget:THREE.Vector3;
  private greenhouseTargets=new Map<string,GreenhouseTarget>();
  private greenhouseObjectIds=new WeakMap<THREE.Object3D,string>();
  private greenhouseNearby?:GreenhouseTarget;
  private greenhouseCollected=new Set<string>();
  private greenhouseUnlocked=false;
  private greenhouseTreeStage:0|1|2|3=0;
  private greenhouseClock=0;
  private memoryTreeEffect?:THREE.Group;
  private memoryTreeGlowMaterials:Array<THREE.MeshStandardMaterial|THREE.MeshLambertMaterial|THREE.MeshPhongMaterial>=[];
  private bearPhotoPortalPosition:{x:number;z:number}={...DEFAULT_BEAR_PHOTO_PORTAL_POSITION};
  private bearPhotoPortalRoot?:THREE.Group;
  private bearPhotoDestination?:{x:number;z:number;groundHeight:number};
  private bearPhotoNearby=false;
  private pendingTeleport?:{x:number;z:number;groundHeight?:number};
  private bearPhotoMode=false;
  private bearPhotoReturn?:{x:number;z:number;groundHeight:number};
  private mapModel?:THREE.Object3D;
  private personalFarmInterior=false;
  private personalFarmShell:THREE.Object3D[]=[];
  private personalFarmDoorNearby=false;
  private personalFarmSeats:PersonalFarmSeat[]=[];
  private personalFarmSeatNearby?:PersonalFarmSeat;
  private personalFarmActiveSeat?:PersonalFarmSeat;
  private personalFarmBed?:PersonalFarmBed;
  private personalFarmBedNearby=false;
  private personalFarmSleeping=false;
  private personalFarmOccluders:THREE.Mesh[]=[];
  private personalFarmOccluderOpacity=new Map<THREE.Material,number>();
  private personalFarmPlantAnchorNearby=false;
  private personalFarmFlowerNearby?:GardenFlowerId;
  private personalFarmFlowerRoot?:THREE.Group;
  private personalFarmFlowerRenderToken=0;
  private personalFarmFlowerSlots:Array<{slotId:string;x:number;z:number;rotationY:number;targetHeight:number}>=PERSONAL_FARM_FLOWER_SLOTS.map(slot=>({...slot}));
  private personalFarmFlowerSlotMarkers?:THREE.Group;
  private personalFarmFlowerSlotNearby?:1|2|3|4|5;
  private personalFarmRewardsRoot?:THREE.Group;
  private personalFarmBearStatueRoot?:THREE.Group;
  private personalFarmBearStatueRenderToken=0;
  private personalFarmBearStatueUnlocked=false;
  private personalFarmBearStatueAnchor={x:760,z:1395};
  private personalFarmFlowerSignature='';
  private personalFarmFlowerObjects=new Map<number,THREE.Object3D>();
  private personalFarmProgress?:PersonalFarmProgressDto;
  private clubBoothCardAnchors:THREE.Object3D[]=[];
  private bearPhotoStage?:THREE.Object3D;
  private wildlifeClueRoots=new Map<string,THREE.Group>();
  private wildlifeClueNearby?:string;
  private feedSpotRoots=new Map<FeedSpotAnchorConfig['id'],THREE.Group>();
  private feedSpotNearby?:FeedSpotAnchorConfig['id'];
  private bearFeedingNearby=false;
  private pendingHabitatResource?:HabitatResourceId;
  private localRenderPosition=new THREE.Vector3();
  private visualGroundHeight?:number;
  private remoteRenderPosition=new THREE.Vector3();
  private followTarget=new THREE.Vector3();
  private boundsCenter=new THREE.Vector3();
  private layoutDecorationRoots:THREE.Object3D[]=[];
  private diagnosticFrames=0;
  private diagnosticStartedAt=performance.now();

  constructor(parent:HTMLElement,profile:UserProfile,private options:WorldMapRendererOptions=LAKE_PARK_RENDERER_OPTIONS){
    const navigatorWithMemory=navigator as Navigator&{deviceMemory?:number};
    const lowEndDevice=(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||(navigatorWithMemory.deviceMemory!==undefined&&navigatorWithMemory.deviceMemory<=4);
    const qualityOverride=lowEndDevice&&options.lowQualityFallback?options.lowQualityFallback:{};
    options=this.options={...options,...qualityOverride,wildlifeClues:options.wildlifeClues?.map(config=>({...config})),feedSpotAnchors:options.feedSpotAnchors?.map(config=>({...config}))};
    this.authoredCameraProfile={
      mapId:options.mapId??'town',
      characterHeight:options.characterHeight??CHARACTER_HEIGHT,
      cameraElevationDeg:options.cameraElevationDeg??33,
      cameraAzimuthDeg:options.cameraAzimuthDeg??0,
      cameraDistance:options.personalFarm?personalFarmCameraDistance(false):(options.cameraDistance??CAMERA_DISTANCE),
      cameraTargetHeight:options.cameraTargetHeight??0,
      cameraFov:options.cameraFov??42,
    };
    if(options.personalFarm||options.feedSpotAnchors||options.bearFeedingAnchor)this.personalFarmProgress=getCachedPersonalFarmProgress();
    // The lake is the busiest hub. Avoid the expensive body-path raycast grid
    // and start slightly below native resolution; adaptive quality can still
    // raise or lower it from here based on measured frame time.
    if(options.guide){
      options.simplifiedCollision=true;
      options.performancePixelRatio=.9;
    }
    const minPixelRatio=options.minPixelRatio??MIN_PIXEL_RATIO;
    this.pixelRatio=Math.max(minPixelRatio,Math.min(window.devicePixelRatio||1,options.maxPixelRatio??MAX_PIXEL_RATIO));
    this.camera=options.perspectiveCamera
      ?new THREE.PerspectiveCamera(options.cameraFov??42,1,.1,5000)
      :new THREE.OrthographicCamera();
    this.parent=parent;
    // First-time guidance is presented as a focused tutorial card in GamePage.
    // Keep Chungnyeong on the normal patrol instead of approaching for chat.
    this.guideIntroActive=false;
    if(options.performanceMode){this.pixelRatio=Math.min(MAX_PIXEL_RATIO,Math.max(minPixelRatio,options.performancePixelRatio??1));this.renderInterval=1/(options.performanceFrameRate??30)}
    this.localX=options.spawn.x;
    this.localZ=options.spawn.z;
    this.portalPosition=options.portal?savedPortalPosition(options.portal,options.mapName):undefined;
    if(this.portalPosition&&Math.hypot(options.spawn.x-this.portalPosition.x,options.spawn.z-this.portalPosition.z)<PORTAL_EXIT_DISTANCE)this.portalEntryArmed=false;
    this.interactionPosition=options.interaction?savedInteractionPosition(options.interaction,options.mapName):undefined;
    if(this.interactionPosition&&Math.hypot(options.spawn.x-this.interactionPosition.x,options.spawn.z-this.interactionPosition.z)<INTERACTION_EXIT_DISTANCE)this.interactionEntryArmed=false;
    options.lakeExperiences?.forEach(config=>this.lakeExperiencePositions.set(config.id,savedLakeExperiencePosition(config)));
    this.cameraTarget=new THREE.Vector3(options.spawn.x,0,this.worldToSceneZ(options.spawn.z));
    this.renderer=new THREE.WebGLRenderer({antialias:options.antialias??!options.performanceMode,alpha:false,powerPreference:'high-performance'});
    this.renderer.domElement.className='village-map-canvas';
    textureAnisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled=!options.performanceMode||!!options.groundingShadows;
    this.renderer.shadowMap.type=THREE.PCFShadowMap;
    if(options.groundingShadows||options.toneMappingExposure!==undefined){
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=options.toneMappingExposure??1.04;
    }
    this.renderer.sortObjects=true;
    this.scene.background=new THREE.Color(options.sceneBackgroundColor??'#b9d7c2');
    if(options.groundFillColor!==undefined){
      const groundFill=new THREE.Mesh(
        new THREE.PlaneGeometry(8000,8000),
        new THREE.MeshBasicMaterial({color:options.groundFillColor,side:THREE.DoubleSide}),
      );
      groundFill.name='world-ground-extension';
      groundFill.rotation.x=-Math.PI/2;
      groundFill.position.set(WORLD_WIDTH/2,-8,WORLD_HEIGHT/2);
      groundFill.renderOrder=-10;
      this.scene.add(groundFill);
    }
    const lightingMultiplier=options.lightingIntensityMultiplier??1;
    this.scene.add(new THREE.HemisphereLight(options.groundingShadows?0xffffff:0xf4fbff,options.groundingShadows?0x82947f:0x617760,(options.groundingShadows?1.48:1.8)*lightingMultiplier));
    const sun=new THREE.DirectionalLight(0xfff4dc,(options.groundingShadows?2.3:3.1)*lightingMultiplier);
    const shadowSize=options.groundingShadows?1024:512;
    sun.position.set(1900,1400,1850);sun.target.position.set(WORLD_WIDTH/2,0,WORLD_HEIGHT/2);sun.castShadow=true;sun.shadow.mapSize.set(shadowSize,shadowSize);sun.shadow.camera.near=10;sun.shadow.camera.far=4000;
    sun.shadow.camera.left=-1300;sun.shadow.camera.right=1300;sun.shadow.camera.top=1100;sun.shadow.camera.bottom=-1100;sun.shadow.bias=-.00015;
    if(options.groundingShadows){sun.shadow.normalBias=.65;sun.shadow.radius=2}
    this.scene.add(sun,sun.target);
    this.camera.up.set(0,1,0);this.camera.near=.1;this.camera.far=5000;
    parent.prepend(this.renderer.domElement);
    this.resize();
    this.localCharacter=new WorldCharacter(this.scene,profile.nickname,profile.model,profile.character,options.characterHeight??CHARACTER_HEIGHT,false,false,!!options.hideCharacters,options.nameplateScale??1);
    if(options.overview)gameEvents.on('map-overview-toggle',this.onMapOverviewToggle);
    if(options.mapName==='베어트리파크')gameEvents.on('nature-chapter-progress-changed',this.onNatureChapterProgressChanged);
    if(options.bearPhotoZone)gameEvents.on('bear-photo-enter',this.onBearPhotoEnter);
    if(options.bearPhotoZone){gameEvents.on('bear-photo-capture',this.onBearPhotoCapture);gameEvents.on('bear-photo-exit',this.onBearPhotoExit)}
    if(options.lakeExperiences){
      gameEvents.on('lake-booth-completion-changed',this.onLakeBoothCompletionChanged);
    }
    if(options.greenhouse){
      this.parent.addEventListener('pointerdown',this.onGreenhousePointerDown);
      gameEvents.on('greenhouse-progress-changed',this.onGreenhouseProgressChanged);
    }
    if(options.personalFarm||options.greenhouse||options.feedSpotAnchors)gameEvents.on('personal-farm-progress-changed',this.onPersonalFarmProgressChanged);
    if(options.personalFarm){
      gameEvents.on('personal-farm-door-toggle',this.togglePersonalFarmInterior);
      gameEvents.on('personal-farm-seat-toggle',this.togglePersonalFarmSeat);
      gameEvents.on('personal-farm-bed-toggle',this.togglePersonalFarmBed);
    }
    if(options.wildlifeClues){
      gameEvents.on('habitat-resource-position-set',this.onHabitatResourcePositionSet);
      gameEvents.on('habitat-resource-position-place',this.onHabitatResourcePositionPlace);
      gameEvents.on('habitat-resource-placement-arm',this.onHabitatResourcePlacementArm);
    }
    if(options.campusFeaturePortals){
      gameEvents.on('campus-building-fast-travel',this.onCampusBuildingFastTravel);
    }
    if(options.studentHallFeatures)gameEvents.on('student-hall-board-focus-close',this.exitStudentHallBoardFocus);
    gameEvents.on('game-input-lock',this.onGameInputLock);
    gameEvents.on('map-travel-failed',this.onMapTravelFailed);
    if(options.mapName==='축제부스')gameEvents.on('festival-stage-focus-changed',this.onFestivalStageFocusChanged);
    if(options.portal?.positionEditable)gameEvents.on('primary-portal-place-at-player',this.onPrimaryPortalPlaceAtPlayer);
    gameEvents.on('local-npc-encounter-focus',this.onLocalNpcEncounterFocus);
    gameEvents.on('local-npc-talking',this.onLocalNpcTalking);
    if(options.projectRoomInteractions)gameEvents.on('project-room-focus-changed',this.onProjectRoomFocusChanged);
    if(options.projectRoomInteractions)gameEvents.on('project-room-kiosk-activate',this.enterProjectRoomKiosk);
    if(options.projectRoomInteractions)gameEvents.on('project-lobby-board-focus-open',this.enterProjectLobbyBoardFocus);
    if(options.projectRoomInteractions)gameEvents.on('project-room-seat-toggle',this.toggleProjectRoomSeat);
    if(options.centralPlazaSofaSeats)gameEvents.on('central-plaza-sofa-seat-toggle',this.toggleCentralPlazaSofaSeat);
    if(options.projectRoomInteractions)gameEvents.on('project-room-door-unlock',this.unlockProjectRoomDoor);
    if(options.projectRoomInteractions)gameEvents.on('project-room-instance-enter',this.onProjectRoomInstanceEnter);
    if(options.projectRoomInteractions)window.addEventListener('pointerdown',this.onProjectRoomKioskPointerDown,true);
    if(options.governmentCentralPlazaWebUi)gameEvents.on('government-webui-open',this.enterGovernmentWebUi);
    if(options.governmentCentralPlazaWebUi)gameEvents.on('government-webui-close',this.exitGovernmentWebUi);
    if(options.governmentCentralPlazaWebUi)gameEvents.on('government-ai-center-mode-changed',this.onGovernmentAiCenterModeChanged);
    if(options.governmentCentralPlazaWebUi)gameEvents.on('government-ai-center-stage-changed',this.onGovernmentAiCenterStageChanged);
    if(options.recruitmentKioskWeb)gameEvents.on('recruitment-kiosk-open',this.enterRecruitmentKiosk);
    if(options.recruitmentKioskWeb)gameEvents.on('recruitment-kiosk-close',this.exitRecruitmentKiosk);
    if(options.observatoryTelescopeInteraction)gameEvents.on('observatory-telescope-enter',this.enterObservatoryTelescope);
    if(options.observatoryTelescopeInteraction)gameEvents.on('observatory-telescope-exit',this.exitObservatoryTelescope);
    if(options.artsCenterPosterWeb)gameEvents.on('arts-center-seat-toggle',this.toggleArtsCenterSeat);
    if(options.artsCenterPosterWeb)gameEvents.on('arts-center-poster-focus-close',this.exitArtsCenterPosterFocus);
    if(options.foodTruckExperience)gameEvents.on('food-truck-kiosk-activate',this.enterFoodTruckKiosk);
    if(options.foodTruckExperience)gameEvents.on('food-truck-kiosk-close',this.exitFoodTruckKiosk);
    if(options.foodTruckExperience)gameEvents.on('food-seat-toggle',this.toggleFoodSeat);
    if(options.smartCityWebUi){
      gameEvents.on('smart-city-technology-changed',this.onSmartCityTechnologyChanged);
      gameEvents.on('smart-city-experience-active-changed',this.onSmartCityExperienceActiveChanged);
    }
    window.addEventListener('keydown',this.onWorldPortalKeyDown);
    if(options.previewNavigation)gameEvents.on('map-preview-camera-reset',this.onPreviewCameraReset);
    this.ready=this.loadVillage();
  }

  private onPreviewCameraReset=()=>{
    this.previewControls?.dispose();
    this.previewControls=undefined;
    this.previewCameraInitialized=false;
  };

  private initializePreviewCamera(){
    const groundPosition=this.followTarget.set(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
    this.followCharacter(groundPosition,0,true);
    const controls=this.previewControls=new OrbitControls(this.camera,this.renderer.domElement);
    controls.target.copy(this.cameraTarget);
    controls.enableDamping=true;
    controls.dampingFactor=.1;
    controls.enablePan=true;
    controls.enableRotate=true;
    controls.enableZoom=true;
    controls.screenSpacePanning=false;
    controls.panSpeed=1.25;
    controls.rotateSpeed=.7;
    controls.zoomSpeed=1.1;
    controls.minPolarAngle=THREE.MathUtils.degToRad(12);
    controls.maxPolarAngle=THREE.MathUtils.degToRad(82);
    controls.minDistance=180;
    controls.maxDistance=4200;
    controls.minZoom=.35;
    controls.maxZoom=4;
    controls.mouseButtons.LEFT=this.options.previewDragRotate?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
    controls.mouseButtons.MIDDLE=THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT=this.options.previewDragRotate?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;
    controls.touches.ONE=this.options.previewDragRotate?THREE.TOUCH.ROTATE:THREE.TOUCH.PAN;
    controls.touches.TWO=this.options.previewDragRotate?THREE.TOUCH.DOLLY_PAN:THREE.TOUCH.DOLLY_ROTATE;
    controls.update();
    this.previewCameraInitialized=true;
  }

  updatePreviewCamera(screenX:number,screenY:number,fast:boolean,delta:number){
    if(!this.mapReady)return;
    if(!this.previewCameraInitialized)this.initializePreviewCamera();
    const controls=this.previewControls;
    if(!controls)return;
    if(screenX||screenY){
      const viewDirection=this.cameraTarget.copy(controls.target).sub(this.camera.position);
      viewDirection.y=0;
      if(viewDirection.lengthSq()<.001)viewDirection.set(0,0,-1);else viewDirection.normalize();
      const right=this.boundsCenter.crossVectors(viewDirection,this.camera.up).normalize();
      const scale=(fast?900:520)*delta*(this.camera instanceof THREE.OrthographicCamera?1/Math.max(.35,this.camera.zoom):Math.max(.7,this.camera.position.distanceTo(controls.target)/1400));
      const offset=this.followTarget.copy(right).multiplyScalar(screenX*scale).addScaledVector(viewDirection,-screenY*scale);
      controls.target.add(offset);
      this.camera.position.add(offset);
    }
    controls.update();
    this.smartCityHologram?.update(delta);
    this.cameraTarget.copy(controls.target);
    this.adjustQuality(delta);
    this.renderAccumulator+=delta;
    if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
  }

  private async loadVillage(){
    try{
      const [gltf,companionGltf]=await Promise.all([
        loadModel(this.options.modelUrl),
        this.options.companionModelUrl?loadModel(this.options.companionModelUrl):Promise.resolve(undefined),
      ]);
      if(this.destroyed)return;
      // Cached GLTF scenes are mutable. Always transform a fresh clone so a
      // renderer recreated after HMR or navigation cannot scale the map twice.
      const model=companionGltf?new THREE.Group():cloneSkeleton(gltf.scene);
      if(companionGltf){
        model.name=`${gltf.scene.name || this.options.mapName}_WithCompanion`;
        const primary=cloneSkeleton(gltf.scene);
        if(this.options.mapName==='프로젝트실'){
          // Keep the authored project room intact, but place it to the lobby's
          // right and rotate its existing entrance toward the new side door.
          primary.rotation.y=-Math.PI/2;
          primary.position.set(20,0,13.5);
        }
        model.add(primary,cloneSkeleton(companionGltf.scene));
      }
      model.rotation.y=this.options.mapRotationY??0;
      if(this.options.projectRoomInteractions)this.resizeProjectRoomFurniture(model);
      model.updateMatrixWorld(true);
      let hasArtsCenterPosterScreens=false;
      model.traverse(object=>{if(artsCenterPosterIndex(object.name)>=0)hasArtsCenterPosterScreens=true});
      if(hasArtsCenterPosterScreens){
        const posterTitleNames=new Set([
          'signartsgala','signdancelight','signnightconcert',
          'signsejongorchestra','signspringfestival',
        ]);
        model.traverse(object=>{
          const normalizedName=normalizedModelObjectName(object.name);
          const isPosterScreen=normalizedName.startsWith('posterart')||normalizedName.startsWith('posterframe');
          const isPosterText=posterTitleNames.has(normalizedName)||normalizedName.startsWith('signsejongartscenter');
          if(isPosterScreen)object.scale.multiplyScalar(2);
          if(isPosterText)object.visible=false;
        });
        model.updateMatrixWorld(true);
      }
      if(this.options.geometrySimplificationRatio)await simplifyMapGeometry(model,this.options.geometrySimplificationRatio,this.options.groundGeometrySimplificationRatio);
      if(this.options.maxTextureSize)limitObjectTextureResolution(model,this.options.maxTextureSize);
      sharpenObjectTextures(model,this.options.performanceMode,this.options.balancedTextureQuality);
      if(this.options.prioritizeGroundTextures)prioritizeGroundTextureQuality(model);
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      const mapWorldWidth=this.movementWorldWidth(),mapWorldHeight=this.movementWorldHeight();
      const scale=Math.min((mapWorldWidth-180)/size.x,(mapWorldHeight-120)/size.z)*(this.options.mapScaleMultiplier??1),depthScale=scale/GROUND_PROJECTION;
      const mapCenterZ=this.options.mapName==='프로젝트실'
        ?mapWorldHeight/2
        :this.options.centerInWorldCoordinates?mapWorldHeight/(2*GROUND_PROJECTION):mapWorldHeight/2;
      model.position.set(mapWorldWidth/2-center.x*scale,-bounds.min.y*scale,mapCenterZ-center.z*depthScale);model.scale.set(scale,scale,depthScale);
      if(this.options.mapName==='세종호수공원'){
        const centerX=mapWorldWidth/2,centerZ=mapWorldHeight/2;
        model.traverse(object=>{if(!object.name)return;const name=object.name.toLowerCase();if(name.includes('lake')||name.includes('water')||name.includes('pond')){object.position.x+=(centerX-object.position.x)*.18;object.position.z+=(centerZ-object.position.z)*.18;object.scale.x*=.78;object.scale.z*=.78}});
      }
      model.updateMatrixWorld(true);
      Object.entries(this.options.lakeExperienceObjectNames??{}).forEach(([id,objectName])=>{
        const object=objectName?model.getObjectByName(objectName):undefined;
        if(!object)return;
        const objectCenter=new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
        this.lakeExperiencePositions.set(id as LakeExperienceId,{x:objectCenter.x,z:this.sceneToWorldZ(objectCenter.z)});
        if(this.options.mapName==='축제부스'&&id==='activity-zone'){
          const stageScreen=model.getObjectByName('Stage_LED');
          if(stageScreen instanceof THREE.Mesh)this.festivalStageBackdrop=stageScreen;
          else if(object instanceof THREE.Mesh)this.festivalStageBackdrop=object;
          else object.traverse(child=>{if(!this.festivalStageBackdrop&&child instanceof THREE.Mesh)this.festivalStageBackdrop=child});
        }
      });
      this.mapBounds.setFromObject(model);
      const collisionPrefixes=this.options.collisionObjectPrefixes;
      if(collisionPrefixes?.length){
        const padding=COLLISION_RADIUS*.9;
        model.traverse(object=>{
          const authoredCollider=collisionPrefixes.some(prefix=>object.name.startsWith(prefix));
          if(!authoredCollider||object.parent!==model&&!this.options.personalFarm)return;
          const bounds=new THREE.Box3().setFromObject(object);
          if(bounds.isEmpty())return;
          this.authoredCollisionZones.push({minX:bounds.min.x-padding,maxX:bounds.max.x+padding,minZ:bounds.min.z-padding,maxZ:bounds.max.z+padding});
        });
      }
      const groundMesh=this.options.groundingShadows?largestFlatMesh(model):undefined;
      model.traverse(object=>{if(object instanceof THREE.Mesh){
        const hidden=this.options.hiddenObjectPrefixes?.some(prefix=>{let current:THREE.Object3D|null=object;while(current&&current!==model){if(current.name.startsWith(prefix))return true;current=current.parent}return false});
        if(hidden)object.visible=false;
        object.castShadow=!hidden&&(this.options.groundingShadows?object!==groundMesh:false);object.receiveShadow=this.options.groundingShadows||!this.options.performanceMode;
        const collisionExcluded=this.options.collisionExcludePrefixes?.some(prefix=>object.name.startsWith(prefix));
        const farmCollisionMesh=!this.options.personalFarm
          ||PERSONAL_FARM_WALKABLE_PREFIXES.some(prefix=>object.name.startsWith(prefix))
          ||PERSONAL_FARM_COLLIDER_PREFIXES.some(prefix=>object.name.startsWith(prefix));
        if(!collisionExcluded&&!hidden&&farmCollisionMesh){object.geometry.computeBoundingBox();object.geometry.computeBoundingSphere();this.mapMeshes.push(object);this.mapMeshBounds.set(object,new THREE.Box3().setFromObject(object))}
      }});
      if(this.mapMeshes.length>1)this.mapMeshes.forEach(mesh=>{const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(material=>this.classifyMaterial(material))});
      this.scene.add(model);
      this.mapModel=model;
      this.createMapLayoutEnhancements();
      if(this.options.personalFarm){
        model.traverse(object=>{
          if(object.name.startsWith('EXTERIOR_Roof')||object.name.startsWith('EXTERIOR_Front_')||object.name.startsWith('EXTERIOR_Entry_Door'))this.personalFarmShell.push(object);
          if(object instanceof THREE.Mesh&&(object.name.startsWith('EXTERIOR_Roof')||object.name.startsWith('ENV_Tree_Crown_'))){
            const materials=(Array.isArray(object.material)?object.material:[object.material]).map(material=>material.clone());
            object.material=Array.isArray(object.material)?materials:materials[0];materials.forEach(material=>this.personalFarmOccluderOpacity.set(material,material.opacity));this.personalFarmOccluders.push(object);
          }
        });
        this.setupPersonalFarmSeats(model);
        this.setupPersonalFarmBed(model);
      }
      if(this.options.smartCityWebUi)this.setupSmartCityWebUi(model);
      if(this.options.studentHallFeatures)this.setupStudentHallFeatures(model);
      if(this.options.mapName==='동아리 거리제'){
        // The creator booth is always index 0 in ClubStreetExperience. Keep
        // that index on the authored south entrance row instead of deriving it
        // from the movable return portal, which can be placed anywhere.
        this.clubBoothCardAnchors=CLUB_STREET_BOOTH_ANCHORS_FRONT_TO_BACK.map(name=>model.getObjectByName(name)).filter((object):object is THREE.Object3D=>!!object);
      }
      if(this.options.foodTruckExperience){this.setupFoodTruckWindows(model);this.setupFoodSeats(model)}
      if(this.options.projectRoomInteractions){
        this.setupProjectRoomScreens(model);
        this.setupProjectRoomHologram(model);
        this.setupProjectRoomInteractionOutlines(model);
        this.setupProjectRoomSeats(model);
      }
      if(this.options.governmentCentralPlazaWebUi)this.setupGovernmentWebUi(model);
      if(this.options.centralPlazaSofaSeats)this.setupCentralPlazaSofaSeats(model);
      if(this.options.recruitmentKioskWeb)this.setupRecruitmentKioskWeb(model);
      if(this.options.observatoryTelescopeInteraction)this.setupObservatoryTelescope(model);
      if(hasArtsCenterPosterScreens){
        this.setupArtsCenterPosterWeb(model);
        this.setupArtsCenterSeats(model);
        this.parent.addEventListener('pointerdown',this.onArtsCenterPosterPointerDown);
      }
      if(this.options.bearPhotoZone){
        const photoStage=model.getObjectByName(BEAR_PHOTO_STAGE_NAME);
        if(photoStage){
          this.scene.attach(photoStage);this.bearPhotoStage=photoStage;
          const stageBounds=new THREE.Box3().setFromObject(photoStage),stageCenter=stageBounds.getCenter(new THREE.Vector3());
          const destinationZ=this.sceneToWorldZ(stageBounds.max.z-BEAR_PHOTO_STAGE_FRONT_INSET);
          const stageGround=this.sampleExperienceGround(stageCenter.x,destinationZ,true);
          this.bearPhotoDestination={x:stageCenter.x,z:destinationZ,groundHeight:stageGround?.height??stageBounds.min.y+20};
        }
        const photoPortalGround=this.sampleExperienceGround(this.bearPhotoPortalPosition.x,this.bearPhotoPortalPosition.z);
        if(photoPortalGround){
          this.bearPhotoPortalRoot=this.createLakeExperienceCircle({id:'central-plaza',...this.bearPhotoPortalPosition,label:'곰 가족 포토존',description:'곰 가족과 사진을 찍어요',color:0xff8a24},photoPortalGround.height);
          this.bearPhotoPortalRoot.name='bear-photo-experience-circle-v2';
          this.bearPhotoPortalRoot.userData.natureJourney='photo';
          this.applyNatureJourneyHighlight(this.bearPhotoPortalRoot,'photo');
        }
      }
      if(this.options.greenhouse)this.setupGreenhouse(model);
      if(this.options.personalFarm)this.setupPersonalFarmGardenLayout(model);
      const safeSpawn=this.options.personalFarm
        ?this.findSafeSpawn(this.localX,this.localZ,'outdoor')??this.findSafeSpawn(PERSONAL_FARM_SPAWN.x,PERSONAL_FARM_SPAWN.z,'outdoor')
        :this.findSafeSpawn(this.localX,this.localZ);
      if(safeSpawn){
        this.localX=safeSpawn.x;this.localZ=safeSpawn.z;
        this.localGround=safeSpawn.ground.height;this.visualGroundHeight=this.localGround;this.localNormal.copy(safeSpawn.ground.normal);
        // WorldScene owns the persisted 2D coordinates. When a restored farm
        // position is corrected here, feed the resolved coordinate back on the
        // first playable frame instead of letting the stale value overwrite it.
        if(this.options.personalFarm)this.pendingTeleport={x:safeSpawn.x,z:safeSpawn.z,groundHeight:safeSpawn.ground.height};
      }
      if(this.options.personalFarm&&import.meta.env.DEV){
        const walkable=this.mapMeshes.filter(mesh=>PERSONAL_FARM_WALKABLE_PREFIXES.some(prefix=>mesh.name.startsWith(prefix))).map(mesh=>mesh.name);
        const colliders=this.mapMeshes.filter(mesh=>PERSONAL_FARM_COLLIDER_PREFIXES.some(prefix=>mesh.name.startsWith(prefix))).map(mesh=>mesh.name);
        console.info('[personal-farm debug]',{
          modelBounds:{min:this.mapBounds.min.toArray(),max:this.mapBounds.max.toArray()},modelTransform:{position:model.position.toArray(),scale:model.scale.toArray()},
          spawn:{x:this.localX,y:this.localGround,z:this.localZ,groundObject:safeSpawn?.ground.objectName,escapeDirections:this.personalFarmEscapeDirections(this.localX,this.localZ,this.localGround)},
          overlappingColliders:this.personalFarmOverlappingColliders(this.localX,this.localZ,this.localGround),movementRayBlocks:this.personalFarmMovementRayBlocks(this.localX,this.localZ,this.localGround),
          movementLocked:this.inputLocked,indoorMode:this.personalFarmInterior,walkableMeshes:walkable,colliderMeshes:colliders,
        });
      }
      if(this.options.guide){
        if(this.guideIntroActive){
          const endX=THREE.MathUtils.clamp(this.localX+55,35,this.movementWorldWidth()-35),endZ=THREE.MathUtils.clamp(this.localZ-12,35,this.movementWorldHeight()-35);
          const startX=THREE.MathUtils.clamp(this.localX+175,35,this.movementWorldWidth()-35),startZ=THREE.MathUtils.clamp(this.localZ-42,35,this.movementWorldHeight()-35);
          const safeEnd=this.findSafeSpawn(endX,endZ),safeStart=this.findSafeSpawn(startX,startZ);
          this.guideIntroEnd=safeEnd?{x:safeEnd.x,z:safeEnd.z}:{x:endX,z:endZ};
          this.guideIntroStart=safeStart?{x:safeStart.x,z:safeStart.z}:{x:startX,z:startZ};
        }
        const initialGuide=this.guideIntroActive
          ?{...this.guideIntroStart,yaw:Math.atan2(this.guideIntroEnd.x-this.guideIntroStart.x,this.guideIntroEnd.z-this.guideIntroStart.z),motion:'walk' as const}
          :guidePatrolFrame(Date.now()+this.worldClockOffset);
        this.guidePosition={x:initialGuide.x,z:initialGuide.z,yaw:initialGuide.yaw};
        const guideGround=this.sampleGround(this.guidePosition.x,this.guidePosition.z,0,true);
        if(guideGround){
          this.guideGround=guideGround.height;
          this.guideNpcPosition.set(this.guidePosition.x,guideGround.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(this.guidePosition.z));
          this.guideNpc=new WorldCharacter(this.scene,'충녕이','chungnyeong',{hair:'',face:'',top:'',bottom:'',shoes:''},GUIDE_CHARACTER_HEIGHT);
          this.guideNpc.update(this.guideNpcPosition,this.guideNpcUprightNormal,this.guidePosition.yaw,initialGuide.motion,0);
        }
      }
      const localNpcConfigs:readonly LocalNpcConfig[]=this.options.localNpcs??(this.options.mapName==='공동캠퍼스'
        ?CAMPUS_FRIEND_NPCS
        :this.options.mapName==='학생회관'
          ?STUDENT_HALL_NPCS
        :this.options.mapName==='프로젝트실'
          ?[PROJECT_ROOM_NPC]
          :[]);
      if(localNpcConfigs.length){
        localNpcConfigs.forEach(npc=>{
          const safeSpawn=this.findSafeSpawn(npc.x,npc.z);
          if(!safeSpawn)return;
          const position=new THREE.Vector3(safeSpawn.x,safeSpawn.ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(safeSpawn.z));
          const normal=safeSpawn.ground.normal.clone();
          const character=new WorldCharacter(
            this.scene,
            `${npc.nickname} · ${npc.model==='chungnyeong'?'AI 안내 도우미':`${this.options.mapName} NPC`}`,
            npc.model,
            npc.appearance,
            npc.height??this.options.characterHeight??CHARACTER_HEIGHT,
            !npc.patrol?.length,
            npc.staticPose??false,
            false,
            this.options.nameplateScale??1,
          );
          character.update(position,normal,npc.yaw,'idle',0);
          this.localNpcs.push({
            character,
            position,
            normal,
            config:npc,
            x:safeSpawn.x,
            z:safeSpawn.z,
            ground:safeSpawn.ground.height,
            targetIndex:npc.patrol?.length&&Math.hypot(safeSpawn.x-npc.patrol[0].x,safeSpawn.z-npc.patrol[0].z)<25?1:0,
            blockedSeconds:0,
          });
        });
      }
      if(this.options.portal&&this.portalPosition){
        const portalGround=this.sampleExperienceGround(this.portalPosition.x,this.portalPosition.z,true)
          ??this.sampleVisibleSurfaceGround(this.portalPosition.x,this.portalPosition.z)
          ??this.sampleGround(this.portalPosition.x,this.portalPosition.z,0,true);
        this.portalRoot=this.createPortal({...this.options.portal,...this.portalPosition},portalGround?.height??this.localGround);
      }
      this.options.fixedPortals?.forEach(config=>{
        Object.assign(config,savedPortalPosition(config,this.options.mapName));
        const portalGround=this.sampleExperienceGround(config.x,config.z,true)
          ??this.sampleVisibleSurfaceGround(config.x,config.z)
          ??this.sampleGround(config.x,config.z,0,true);
        this.fixedPortalRoots.push(this.createPortal(config,portalGround?.height??0));
      });
      if(this.options.interaction&&this.interactionPosition){
        const interactionGround=this.sampleExperienceGround(this.interactionPosition.x,this.interactionPosition.z);
        if(interactionGround){
          this.interactionRoot=this.createPortal(withUnifiedWorldPortalVisual({...this.options.interaction,...this.interactionPosition}),interactionGround.height);
          this.interactionRoot.name=`world-portal-${this.options.interaction.destination}`;
        }
      }
      this.options.lakeExperiences?.forEach(config=>{
        const position=this.lakeExperiencePositions.get(config.id)??config;
        const ground=this.sampleExperienceGround(position.x,position.z,true)??this.sampleVisibleSurfaceGround(position.x,position.z);
        this.lakeExperienceRoots.set(config.id,this.createLakeExperienceCircle({...config,...position},ground?.height??0));
      });
      this.options.campusFeaturePortals?.forEach((original,index)=>{
        const config=savedCampusFeaturePortalPosition(original);
        Object.assign(original,{x:config.x,z:config.z});
        const ground=this.sampleExperienceGround(config.x,config.z,true)??this.sampleVisibleSurfaceGround(config.x,config.z)??this.sampleGround(config.x,config.z,0,true);
        this.campusFeaturePortalRoots.set(config.id,this.createCampusFeaturePortal(config,ground?.height??0,index));
      });
      this.options.wildlifeClues?.forEach((config,index)=>{
        const groundHeight=(this.sampleExperienceGround(config.x,config.z,true)
          ??this.sampleVisibleSurfaceGround(config.x,config.z))?.height
          ??this.localGround;
        const root=this.createInteractionCircle(config,groundHeight);
        root.name=`bear-wildlife-clue-${config.id}`;root.userData.phase=index*Math.PI*.66;root.userData.journeyActive=true;
        const colors=[0xd79b4a,0xc77b4f,0x8c7a65,0x78a665,0x5d9daf];
        const color=new THREE.Color(colors[index%colors.length]);
        for(const key of ['center','ring','middleRing','innerRing','pulseRing'] as const){
          const mesh=root.userData[key] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
          mesh.material.color.copy(color);
        }
        const light=root.userData.light as THREE.PointLight;light.color.copy(color);light.intensity=4.8;light.distance=210;
        root.userData.clueLabel=this.createWildlifeClueLabel(config,groundHeight,color);
        this.wildlifeClueRoots.set(config.id,root);
      });
      this.options.feedSpotAnchors?.forEach(config=>{
        const candidates=[{x:config.x,z:config.z,distance:0}];
        for(const radius of [55,90,130,175])for(let index=0;index<16;index++){const angle=index/16*Math.PI*2;candidates.push({x:config.x+Math.cos(angle)*radius,z:config.z+Math.sin(angle)*radius,distance:radius})}
        const resolved=candidates.map(candidate=>({candidate,ground:this.sampleExperienceGround(candidate.x,candidate.z,false)??this.sampleGround(candidate.x,candidate.z,0,true,1200)})).filter((entry):entry is {candidate:{x:number;z:number;distance:number};ground:GroundSample}=>Boolean(entry.ground&&entry.ground.normal.y>=.78&&this.spawnSpaceClear(entry.candidate.x,entry.candidate.z,entry.ground.height))).sort((a,b)=>a.candidate.distance-b.candidate.distance)[0];
        if(!resolved)return;
        Object.assign(config,{x:resolved.candidate.x,z:resolved.candidate.z});
        const anchor=new THREE.Group();anchor.name=config.id;anchor.position.set(config.x,resolved.ground.height+1.2,this.worldToSceneZ(config.z));anchor.userData.feedSpotId=config.id;
        const pickup=BEAR_FEED_PICKUPS[config.id],visual=this.createBearFeedPickupVisual(pickup.feedId);visual.position.y=25;anchor.userData.pickupVisual=visual;
        const material=new THREE.MeshBasicMaterial({color:0xffd56f,transparent:true,opacity:.72,depthTest:false,depthWrite:false});
        const ring=new THREE.Mesh(new THREE.RingGeometry(28,39,40),material);ring.rotation.x=-Math.PI/2;ring.renderOrder=95;
        const canvas=document.createElement('canvas');canvas.width=420;canvas.height=160;const context=canvas.getContext('2d')!;
        context.fillStyle='rgba(36,48,31,.94)';context.beginPath();context.roundRect(8,8,404,144,58);context.fill();
        context.strokeStyle='#ffd56f';context.lineWidth=8;context.stroke();context.textAlign='center';context.textBaseline='middle';
        context.font='900 46px "Noto Sans KR",sans-serif';context.fillStyle='#fff8df';context.fillText(`${pickup.emoji} ${pickup.name} 줍기`,210,82);
        const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;
        const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
        label.position.set(0,96,0);label.scale.set(126,48,1);label.renderOrder=125;label.frustumCulled=false;
        anchor.add(ring,visual,label);this.scene.add(anchor);this.feedSpotRoots.set(config.id,anchor);
      });
      const residentReady=this.options.resident?this.createResident(this.options.resident):Promise.resolve();
      const residentDecorReady=Promise.all((this.options.residentDecor??[]).map((config,index)=>this.createResidentDecor(config,index)));
      const startGroundPosition=new THREE.Vector3(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
      const startCharacterPosition=startGroundPosition.clone();
      startCharacterPosition.y=characterVisualY(this.localGround,this.characterGroundClearance,this.characterFootLift);
      this.localCharacter.update(startCharacterPosition,this.localNormal,this.options.spawn.yaw,'idle',0);
      await Promise.all([this.localCharacter.ready,this.guideNpc?.ready,...this.localNpcs.map(npc=>npc.character.ready),residentReady,residentDecorReady]);
      if(this.destroyed)return;
      const latestPersonalFarmProgress=getCachedPersonalFarmProgress()??this.personalFarmProgress;
      if(latestPersonalFarmProgress){this.personalFarmProgress=latestPersonalFarmProgress;this.applyPersonalFarmProgress(latestPersonalFarmProgress)}
      this.followCharacter(startGroundPosition,0,true);
      const restoreVisibility=[this.localCharacter.showAllForWarmup(),this.guideNpc?.showAllForWarmup(),...this.localNpcs.map(npc=>npc.character.showAllForWarmup())].filter((restore):restore is ()=>void=>!!restore);
      try{
        await this.renderer.compileAsync(this.scene,this.camera);
        // compileAsync prepares shader programs, but GL buffers and textures
        // for motion-only character meshes may still upload on the first walk.
        // Pay that one-time cost behind the festival loading screen instead of
        // stalling the player's first few movement frames.
        if(this.options.mapName==='축제부스'){
          this.renderer.render(this.scene,this.camera);
          this.renderer.getContext().finish();
        }
      }catch{
        this.renderer.compile(this.scene,this.camera);
      }finally{
        restoreVisibility.forEach(restore=>restore());
      }
      if(this.destroyed)return;
      this.mapReady=true;
      if(this.guideIntroActive)this.guideIntroStartedAt=performance.now();
      this.render();
      console.log(`[${this.options.mapName} world] unified 3D scene ready`,{meshes:this.mapMeshes.length,scale});
    }catch(error){
      console.error(`[${this.options.mapName} world] GLB load error`,error);
      throw error;
    }
  }

  private greenhouseMarkerTexture(label:string,complete=false){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const context=canvas.getContext('2d')!;
    context.shadowColor='rgba(20,60,48,.28)';context.shadowBlur=12;
    context.fillStyle=complete?'#f6c956':'#ffffff';context.beginPath();context.arc(64,64,42,0,Math.PI*2);context.fill();
    context.shadowBlur=0;context.strokeStyle=complete?'#9b7420':'#3d9279';context.lineWidth=6;context.stroke();
    context.font='52px "Segoe UI Emoji",sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillStyle='#245c4d';context.fillText(label,64,67);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }

  private setupGreenhouse(model:THREE.Object3D){
    model.updateMatrixWorld(true);
    const byName=new Map<string,THREE.Object3D>();
    model.traverse(object=>byName.set(object.name,object));
    if(import.meta.env.DEV){
      const rows:{name:string;type:string;parent:string;position:string;bounds:string;materials:string}[]=[];
      model.traverse(object=>{
        const box=new THREE.Box3().setFromObject(object),position=object.getWorldPosition(new THREE.Vector3());
        const mesh=object instanceof THREE.Mesh?object:undefined,materials=mesh?(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(item=>item.name).join(', '):'';
        rows.push({name:object.name,type:object.type,parent:object.parent?.name??'-',position:`${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}`,bounds:box.isEmpty()?'-':`${box.min.toArray().map(value=>value.toFixed(1)).join('/')} → ${box.max.toArray().map(value=>value.toFixed(1)).join('/')}`,materials});
      });
      console.groupCollapsed('[수목원 GLB] 실제 오브젝트 구조');console.table(rows);console.groupEnd();
    }
    for(const definition of greenhousePlants){
      const objects=definition.objectNames.map(name=>byName.get(name)??byName.get(THREE.PropertyBinding.sanitizeNodeName(name))).filter((object):object is THREE.Object3D=>!!object);
      if(!objects.length){console.warn('[수목원 식물 매핑 누락]',definition.id,definition.objectNames);continue}
      const bounds=objects.reduce((box,object)=>box.union(new THREE.Box3().setFromObject(object)),new THREE.Box3());
      const center=bounds.getCenter(new THREE.Vector3());center.y=bounds.max.y+34;
      const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:this.greenhouseMarkerTexture('🍃'),transparent:true,depthTest:false,depthWrite:false}));
      marker.name=`greenhouse-marker-${definition.id}`;marker.position.copy(center);marker.scale.set(58,58,1);marker.visible=false;marker.renderOrder=80;this.scene.add(marker);
      const target:GreenhouseTarget={id:definition.id,objects,bounds,center,marker,kind:'plant'};this.greenhouseTargets.set(definition.id,target);
      objects.forEach(object=>{this.greenhouseObjectIds.set(object,definition.id);object.userData.greenhousePlantId=definition.id});
    }
    const treeObject=byName.get(GREENHOUSE_MEMORY_TREE_OBJECT);
    if(treeObject){
      treeObject.traverse(object=>{
        if(!(object instanceof THREE.Mesh))return;
        const original=Array.isArray(object.material)?object.material:[object.material];
        const cloned=original.map(material=>material.clone());
        object.material=Array.isArray(object.material)?cloned:cloned[0];
        cloned.forEach(material=>{
          if(material instanceof THREE.MeshStandardMaterial||material instanceof THREE.MeshLambertMaterial||material instanceof THREE.MeshPhongMaterial)this.memoryTreeGlowMaterials.push(material);
        });
      });
      const bounds=new THREE.Box3().setFromObject(treeObject),center=bounds.getCenter(new THREE.Vector3());center.y=bounds.max.y+46;
      const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:this.greenhouseMarkerTexture('🔒'),transparent:true,depthTest:false,depthWrite:false}));
      marker.name='greenhouse-marker-memory-tree';marker.position.copy(center);marker.scale.set(68,68,1);marker.visible=false;marker.renderOrder=80;this.scene.add(marker);
      const target:GreenhouseTarget={id:'memory-tree',objects:[treeObject],bounds,center,marker,kind:'memory-tree'};this.greenhouseTargets.set(target.id,target);this.greenhouseObjectIds.set(treeObject,target.id);treeObject.userData.greenhousePlantId=target.id;
      const effect=new THREE.Group();effect.position.set(center.x,bounds.min.y+25,center.z);effect.visible=false;
      const positions:number[]=[];for(let index=0;index<42;index++){const angle=index/42*Math.PI*2,radius=55+(index%7)*12;positions.push(Math.cos(angle)*radius,(index%6)*18+12,Math.sin(angle)*radius)}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      const particles=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xffd86b,size:9,transparent:true,opacity:.8,depthWrite:false}));
      const rings=new THREE.Group();
      for(let index=0;index<3;index++){
        const ring=new THREE.Mesh(
          new THREE.TorusGeometry(72+index*25,2.2-index*.35,8,72),
          new THREE.MeshBasicMaterial({color:0xffd86b,transparent:true,opacity:.7-index*.12,depthWrite:false,depthTest:false}),
        );
        ring.rotation.x=Math.PI/2;ring.position.y=4+index*3;ring.visible=false;ring.renderOrder=79;rings.add(ring);
      }
      const light=new THREE.PointLight(0xffd875,2.2,300);light.position.y=90;effect.add(particles,rings,light);effect.userData.particles=particles;effect.userData.rings=rings;effect.userData.light=light;this.scene.add(effect);this.memoryTreeEffect=effect;this.applyMemoryTreeStageVisuals();
    }else console.warn('[수목원 기억나무 매핑 누락]',GREENHOUSE_MEMORY_TREE_OBJECT);
    if(import.meta.env.DEV)console.table([...this.greenhouseTargets.values()].map(target=>({plantId:target.id,kind:target.kind,objects:target.objects.map(object=>object.name).join(', '),worldPosition:target.center.toArray().map(value=>value.toFixed(1)).join(', ')})));
  }

  private greenhouseTargetDistance(target:GreenhouseTarget,x:number,sceneZ:number){
    const nearestX=THREE.MathUtils.clamp(x,target.bounds.min.x,target.bounds.max.x);
    const nearestZ=THREE.MathUtils.clamp(sceneZ,target.bounds.min.z,target.bounds.max.z);
    return Math.hypot(x-nearestX,sceneZ-nearestZ);
  }

  private updateGreenhouseProximity(x:number,z:number){
    if(!this.options.greenhouse)return;
    const sceneZ=this.worldToSceneZ(z);
    const ranked=[...this.greenhouseTargets.values()].map(target=>({target,distance:this.greenhouseTargetDistance(target,x,sceneZ)})).sort((a,b)=>a.distance-b.distance);
    ranked.forEach(({target,distance})=>{target.marker.visible=distance<GREENHOUSE_EXIT_DISTANCE});
    const closest=ranked[0];
    const same=closest?.target===this.greenhouseNearby;
    const next=closest&&closest.distance<(same?GREENHOUSE_EXIT_DISTANCE:GREENHOUSE_OPEN_DISTANCE)?closest.target:undefined;
    if(next!==this.greenhouseNearby){
      this.greenhouseNearby=next;
      gameEvents.emit('greenhouse-nearby-changed',next?{kind:next.kind,plantId:next.kind==='plant'?next.id:undefined,distance:Math.round(closest.distance)}:null);
    }
    ranked.forEach(({target,distance})=>{if(distance>=GREENHOUSE_EXIT_DISTANCE)return;const marker=target.marker,pulse=target===this.greenhouseNearby?1+Math.sin(this.greenhouseClock*4)*.08:1;marker.scale.setScalar((target.kind==='memory-tree'?68:58)*pulse);marker.scale.z=1});
  }

  private applyMemoryTreeStageVisuals(){
    this.memoryTreeGlowMaterials.forEach(material=>{
      material.emissive.setHex(this.greenhouseTreeStage===3?0xffd86b:this.greenhouseTreeStage===2?0x5f281e:this.greenhouseTreeStage===1?0x17351d:0x000000);
      material.emissiveIntensity=this.greenhouseTreeStage===3?1.35:this.greenhouseTreeStage===2?.35:this.greenhouseTreeStage===1?.16:0;
      material.needsUpdate=true;
    });
    if(!this.memoryTreeEffect)return;
    this.memoryTreeEffect.visible=this.greenhouseTreeStage>0;
    const particles=this.memoryTreeEffect.userData.particles as THREE.Points|undefined;
    const rings=this.memoryTreeEffect.userData.rings as THREE.Group|undefined;
    const particleMaterial=particles?.material as THREE.PointsMaterial|undefined;
    const light=this.memoryTreeEffect.userData.light as THREE.PointLight|undefined;
    const stageColor=this.greenhouseTreeStage===3?0xffffff:this.greenhouseTreeStage===2?0xff8fb7:0xffd86b;
    if(particleMaterial){
      particleMaterial.color.setHex(stageColor);
      particleMaterial.size=this.greenhouseTreeStage===3?15:this.greenhouseTreeStage===2?11:8;
      particleMaterial.opacity=this.greenhouseTreeStage===3?1:this.greenhouseTreeStage===2?.95:.65;
      particleMaterial.blending=this.greenhouseTreeStage===3?THREE.AdditiveBlending:THREE.NormalBlending;
      particleMaterial.needsUpdate=true;
    }
    rings?.children.forEach((ring,index)=>{
      ring.visible=index<this.greenhouseTreeStage;
      const material=(ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.color.setHex(stageColor);
      material.opacity=this.greenhouseTreeStage===3?.95:this.greenhouseTreeStage===2?.72:.5;
      material.blending=this.greenhouseTreeStage===3?THREE.AdditiveBlending:THREE.NormalBlending;
      material.needsUpdate=true;
    });
    if(light){
      light.color.setHex(this.greenhouseTreeStage===3?0xfff4c7:this.greenhouseTreeStage===2?0xff9fc4:0xffd875);
      light.intensity=this.greenhouseTreeStage===3?5:this.greenhouseTreeStage===2?3:1.5;
      light.distance=this.greenhouseTreeStage===3?430:this.greenhouseTreeStage===2?380:260;
    }
  }

  private onGreenhouseProgressChanged=({collectedIds,unlocked,blooming=false,complete=false,count}:{collectedIds:string[];unlocked:boolean;blooming?:boolean;complete?:boolean;count?:number})=>{
    this.greenhouseCollected=new Set(collectedIds);this.greenhouseUnlocked=unlocked;
    const collectedCount=Math.max(count??0,collectedIds.length);
    this.greenhouseTreeStage=collectedCount>=GREENHOUSE_PLANT_TOTAL||complete?3:collectedCount>=10||blooming?2:unlocked?1:0;
    for(const target of this.greenhouseTargets.values()){
      const complete=target.kind==='plant'&&this.greenhouseCollected.has(target.id);
      const treeLabel=this.greenhouseTreeStage===3?'✨':this.greenhouseTreeStage===2?'🌸':this.greenhouseTreeStage===1?'🌱':'🔒';
      const label=target.kind==='memory-tree'?treeLabel:(complete?'✓':'🍃');
      const material=target.marker.material;material.map?.dispose();material.map=this.greenhouseMarkerTexture(label,complete||unlocked);material.needsUpdate=true;
    }
    this.applyMemoryTreeStageVisuals();
  };

  private createArtsCenterPosterTexture(performance:ArtsCenterPerformance,index:number){
    const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1080;
    const context=canvas.getContext('2d')!;
    const roundedRect=(x:number,y:number,width:number,height:number,radius:number)=>{context.beginPath();context.roundRect(x,y,width,height,radius);context.fill()};
    const wrappedText=(text:string,x:number,y:number,maxWidth:number,lineHeight:number,maxLines=3)=>{
      const words=text.split(' '),lines:string[]=[];let line='';
      words.forEach(word=>{const next=line?`${line} ${word}`:word;if(context.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next});if(line)lines.push(line);
      lines.slice(0,maxLines).forEach((value,lineIndex)=>context.fillText(value,x,y+lineIndex*lineHeight));
    };
    context.fillStyle='#ffffff';context.fillRect(0,0,720,1080);
    context.fillStyle=performance.color;context.fillRect(0,0,720,610);
    context.fillStyle=performance.accent;context.font='800 21px "Noto Sans KR", "Malgun Gothic", sans-serif';context.fillText('세종예술의전당 공식 공연',44,58);
    context.textAlign='right';context.font='700 17px Arial, sans-serif';context.fillText(`SEJONG · 0${index+1}`,676,57);context.textAlign='left';
    // Each screen gets its own poster-like visual language.
    if(index===0){
      context.fillStyle='rgba(255,255,255,.78)';for(let i=0;i<24;i++){context.beginPath();context.arc(80+(i*83)%600,120+(i*67)%330,12+(i%4)*7,0,Math.PI*2);context.fill()}
      context.fillStyle=performance.accent;context.font='900 96px "Noto Serif KR",serif';context.fillText('西便制',188,355);context.font='800 28px "Noto Sans KR",sans-serif';context.fillText('소리로 이어지는 삶의 노래',190,410);
    }else if(index===1){
      context.fillStyle=performance.accent;context.font='900 115px "Noto Sans KR",sans-serif';context.fillText('렁',86,310);context.fillText('스',246,430);
      context.fillStyle='#36a58c';context.beginPath();context.arc(505,230,72,0,Math.PI*2);context.fill();context.fillRect(455,305,105,105);
      context.fillStyle='#ffffff';context.beginPath();context.arc(560,410,48,0,Math.PI*2);context.fill();
    }else if(index===2){
      context.fillStyle='#15392f';context.font='900 116px Arial,sans-serif';context.fillText('19:00',120,280);context.font='900 54px "Noto Sans KR",sans-serif';context.fillText('야민락 콘서트',118,355);
      context.strokeStyle=performance.accent;context.lineWidth=5;context.beginPath();context.moveTo(84,435);context.lineTo(636,435);context.stroke();
      context.fillStyle='rgba(21,57,47,.75)';context.font='700 22px "Noto Sans KR",sans-serif';context.fillText('음악으로 쉬어가는 세종의 저녁',155,490);
    }else if(index===3){
      context.fillStyle=performance.accent;context.font='900 130px "Noto Serif KR",serif';context.fillText('樂',236,300);
      context.lineWidth=8;context.strokeStyle=performance.accent;context.beginPath();context.arc(360,310,185,.15,Math.PI*1.82);context.stroke();
      context.font='800 31px "Noto Sans KR",sans-serif';context.fillText('연희 · 판',286,500);
    }else{
      const gradient=context.createRadialGradient(360,290,30,360,290,260);gradient.addColorStop(0,'#ffffff');gradient.addColorStop(1,performance.color);context.fillStyle=gradient;context.fillRect(0,80,720,500);
      context.strokeStyle=performance.accent;context.lineWidth=12;for(let i=0;i<4;i++){context.beginPath();context.arc(360,300,80+i*46,0,Math.PI*2);context.stroke()}
      context.fillStyle=performance.accent;context.font='900 43px "Noto Sans KR",sans-serif';context.fillText('WEDNESDAY OFF',155,315);
    }
    context.fillStyle=performance.accent;roundedRect(44,520,235,56,28);context.fillStyle='#ffffff';context.font='800 23px "Noto Sans KR",sans-serif';context.fillText(performance.category,70,557);
    context.fillStyle='#9c7843';context.font='700 18px "Noto Sans KR",sans-serif';context.fillText('세종예술의전당 공식 공연',44,660);
    context.fillStyle='#1e302c';context.font='900 38px "Noto Sans KR", "Malgun Gothic", sans-serif';wrappedText(performance.title,44,720,630,48,2);
    context.fillStyle='#64726e';context.font='500 23px "Noto Sans KR", "Malgun Gothic", sans-serif';wrappedText(performance.description,44,820,630,34,2);
    context.fillStyle='#89938f';context.font='700 18px "Noto Sans KR",sans-serif';context.fillText('일정',44,866);context.fillText('장소',44,900);
    context.fillStyle='#31433e';context.font='700 20px "Noto Sans KR",sans-serif';context.fillText(performance.date,122,866);context.fillText(performance.venue,122,900);
    context.fillStyle='#f8fbfa';roundedRect(44,930,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
    context.textAlign='center';context.fillStyle='#54746b';context.font='800 18px "Noto Sans KR",sans-serif';context.fillText('▶  영상 선택',360,955);
    context.fillStyle='#f8fbfa';roundedRect(44,976,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
    context.fillStyle='#54746b';context.fillText('♡  관심 있어요',360,1001);
    context.fillStyle='#f8fbfa';roundedRect(44,1022,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
    context.fillStyle='#54746b';context.fillText('ⓘ  자세히 보기',360,1047);context.textAlign='left';
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;texture.needsUpdate=true;
    const posterImage=new Image();
    posterImage.decoding='async';
    posterImage.onload=()=>{
      const sourceRatio=posterImage.width/posterImage.height,targetRatio=720/610;
      let sx=0,sy=0,sw=posterImage.width,sh=posterImage.height;
      if(sourceRatio>targetRatio){sw=posterImage.height*targetRatio;sx=(posterImage.width-sw)/2}
      else{sh=posterImage.width/targetRatio;sy=(posterImage.height-sh)/2}
      context.fillStyle='#ffffff';context.fillRect(0,0,720,1080);
      context.drawImage(posterImage,sx,sy,sw,sh,0,0,720,610);
      context.fillStyle=performance.accent;roundedRect(44,520,235,56,28);
      context.fillStyle='#ffffff';context.font='800 23px "Noto Sans KR",sans-serif';context.fillText(performance.category,70,557);
      context.fillStyle='#9c7843';context.font='700 18px "Noto Sans KR",sans-serif';context.fillText('세종예술의전당 공식 공연',44,660);
      context.fillStyle='#1e302c';context.font='900 38px "Noto Sans KR", "Malgun Gothic", sans-serif';wrappedText(performance.title,44,720,630,48,2);
      context.fillStyle='#64726e';context.font='500 23px "Noto Sans KR", "Malgun Gothic", sans-serif';wrappedText(performance.description,44,820,630,34,2);
      context.fillStyle='#89938f';context.font='700 18px "Noto Sans KR",sans-serif';context.fillText('일정',44,866);context.fillText('장소',44,900);
      context.fillStyle='#31433e';context.font='700 20px "Noto Sans KR",sans-serif';context.fillText(performance.date,122,866);context.fillText(performance.venue,122,900);
      context.fillStyle='#f8fbfa';roundedRect(44,930,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
      context.textAlign='center';context.fillStyle='#54746b';context.font='800 18px "Noto Sans KR",sans-serif';context.fillText('▶  영상 선택',360,955);
      context.fillStyle='#f8fbfa';roundedRect(44,976,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
      context.fillStyle='#54746b';context.fillText('♡  관심 있어요',360,1001);
      context.fillStyle='#f8fbfa';roundedRect(44,1022,632,38,14);context.strokeStyle='#cbd8d4';context.lineWidth=2;context.stroke();
      context.fillStyle='#54746b';context.fillText('ⓘ  자세히 보기',360,1047);context.textAlign='left';
      texture.needsUpdate=true;
      if(this.artsCenterPosterWebReady&&this.artsCenterPosterActive?.userData.artsCenterPerformanceIndex===index){
        gameEvents.emit('arts-center-poster-focus-mode-changed',{active:true,index,ready:true,posterDataUrl:canvas.toDataURL('image/png')});
      }
    };
    posterImage.onerror=()=>{if(import.meta.env.DEV)console.warn('[예술의전당 포스터] 원본 이미지 로드 실패',{title:performance.title,src:posterImage.src})};
    posterImage.src=artsCenterPerformanceImageUrl(performance);
    this.artsCenterPosterTextures.push(texture);return texture;
  }

  private createArtsCenterPosterKeyTexture(){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=160;
    const context=canvas.getContext('2d')!;
    context.clearRect(0,0,640,160);
    context.fillStyle='rgba(9,48,41,.96)';context.beginPath();context.roundRect(5,5,630,150,52);context.fill();
    context.strokeStyle='rgba(206,240,230,.95)';context.lineWidth=8;context.stroke();
    context.fillStyle='#ffffff';context.beginPath();context.roundRect(42,31,98,98,25);context.fill();
    context.fillStyle='#123f36';context.textAlign='center';context.textBaseline='middle';context.font='900 58px Arial,sans-serif';context.fillText('E',91,82);
    context.fillStyle='#ffffff';context.textAlign='left';context.font='900 43px "Noto Sans KR","Malgun Gothic",sans-serif';context.fillText('자세히 보기',174,84);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;texture.needsUpdate=true;
    this.artsCenterPosterTextures.push(texture);return texture;
  }

  private setupArtsCenterPosterWeb(model:THREE.Object3D){
    const screensByIndex=new Map<number,THREE.Mesh>();
    model.traverse(object=>{const index=artsCenterPosterIndex(object.name);if(index>=0&&index<ARTS_CENTER_PERFORMANCES.length&&object instanceof THREE.Mesh)screensByIndex.set(index,object)});
    const screens=ARTS_CENTER_PERFORMANCES.map((performance,index)=>{
      const poster=screensByIndex.get(index);if(!poster)return undefined;
      // The GLB poster mesh uses an atlas UV that also covers its side faces.
      // Applying a full web card to that mesh tears the card into vertical strips,
      // so render the card on a dedicated plane just in front of the poster instead.
      const screen=new THREE.Mesh(
        new THREE.PlaneGeometry(1.38,2.48),
        new THREE.MeshBasicMaterial({
          map:this.createArtsCenterPosterTexture(performance,index),
          side:THREE.DoubleSide,
          toneMapped:false,
          polygonOffset:true,
          polygonOffsetFactor:-2,
          polygonOffsetUnits:-2,
        }),
      );
      screen.name=`arts-center-web-poster-${index}`;
      screen.position.set(0,0,.032);
      screen.renderOrder=5;
      screen.userData.artsCenterPerformanceIndex=index;screen.userData.artsCenterPerformanceTitle=performance.title;
      poster.add(screen);
      return screen;
    }).filter((screen):screen is THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>=>screen!==undefined);
    this.artsCenterPosterScreens=screens;
  }

  private setupArtsCenterSeats(model:THREE.Object3D){
    const seats:ArtsCenterSeat[]=[],seatPartsBySuffix=new Map<string,THREE.Mesh[]>();
    let auditoriumFloor:THREE.Mesh|undefined;
    model.traverse(object=>{
      if(!(object instanceof THREE.Mesh))return;
      const normalized=normalizedModelObjectName(object.name);
      if(normalized==='auditoriumfloor')auditoriumFloor=object;
      if(normalized.startsWith('audienceriser')){
        object.visible=false;
        this.mapMeshes=this.mapMeshes.filter(mesh=>mesh!==object);
        this.mapMeshBounds.delete(object);
        return;
      }
      const partMatch=/^seat(?:cushion|back|frame)(\d*)$/.exec(normalized);
      if(!partMatch)return;
      const suffix=partMatch[1]||'000';
      const parts=seatPartsBySuffix.get(suffix)??[];parts.push(object);seatPartsBySuffix.set(suffix,parts);
    });
    // Remove the stepped row offsets: every complete chair stands directly on
    // the same Auditorium_floor top surface while retaining its own shape.
    if(auditoriumFloor){
      model.updateMatrixWorld(true);
      const floorTop=new THREE.Box3().setFromObject(auditoriumFloor).max.y;
      seatPartsBySuffix.forEach(parts=>{
        const bounds=parts.reduce((box,part)=>box.union(new THREE.Box3().setFromObject(part)),new THREE.Box3());
        const worldOffset=floorTop-bounds.min.y;
        parts.forEach(part=>{
          const parent=part.parent;if(!parent)return;
          const worldPosition=part.getWorldPosition(new THREE.Vector3());
          worldPosition.y+=worldOffset;
          part.position.copy(parent.worldToLocal(worldPosition));
        });
      });
      model.updateMatrixWorld(true);
    }
    seatPartsBySuffix.forEach(parts=>{
      const cushion=parts.find(part=>normalizedModelObjectName(part.name).startsWith('seatcushion'));if(!cushion)return;
      const bounds=new THREE.Box3().setFromObject(cushion),center=bounds.getCenter(new THREE.Vector3());
      const seat:ArtsCenterSeat={id:cushion.name,x:center.x,z:this.sceneToWorldZ(center.z),seatHeight:bounds.max.y,yaw:0};
      seats.push(seat);this.artsCenterSeatMeshes.push(cushion);this.artsCenterSeatByMesh.set(cushion,seat);
      parts.forEach(part=>this.mapMeshBounds.set(part,new THREE.Box3().setFromObject(part)));
    });
    this.artsCenterSeats=seats;
    let backdrop=model.getObjectByName('Stage_backdrop')??model.getObjectByName('Stage backdrop');
    if(!backdrop)model.traverse(object=>{if(!backdrop&&object.name.replaceAll(' ','_').startsWith('Stage_backdrop'))backdrop=object});
    if(backdrop instanceof THREE.Mesh)this.artsCenterStageBackdrop=backdrop;
    else backdrop?.traverse(object=>{if(!this.artsCenterStageBackdrop&&object instanceof THREE.Mesh)this.artsCenterStageBackdrop=object});
  }

  private setupPersonalFarmSeats(model:THREE.Object3D){
    const seats:PersonalFarmSeat[]=[];
    const table=model.getObjectByName('FURN_Dining_Table');
    const door=model.getObjectByName('EXTERIOR_Entry_Door');
    const tableCenter=table?new THREE.Box3().setFromObject(table).getCenter(new THREE.Vector3()):undefined;
    const doorCenter=door?new THREE.Box3().setFromObject(door).getCenter(new THREE.Vector3()):undefined;
    const addSeat=(object:THREE.Object3D,back:THREE.Object3D|undefined,target:THREE.Vector3|undefined,kind:PersonalFarmSeat['kind'],label:string)=>{
      const bounds=new THREE.Box3().setFromObject(object);if(bounds.isEmpty())return;
      const center=bounds.getCenter(new THREE.Vector3());
      const backCenter=back?new THREE.Box3().setFromObject(back).getCenter(new THREE.Vector3()):center.clone().add(new THREE.Vector3(0,0,1));
      const approach=center.clone().sub(backCenter);approach.y=0;
      if(approach.lengthSq()<.001)approach.set(0,0,-1);else approach.normalize();
      const facing=(target??center.clone().add(approach)).clone().sub(center);facing.y=0;
      if(facing.lengthSq()<.001)facing.copy(approach);else facing.normalize();
      const standScene=center.clone().addScaledVector(approach,kind==='sofa'?88:78);
      seats.push({
        id:object.name,
        kind,
        label,
        x:center.x,
        z:this.sceneToWorldZ(center.z),
        seatHeight:bounds.max.y,
        yaw:Math.atan2(facing.x,facing.z),
        standX:standScene.x,
        standZ:this.sceneToWorldZ(standScene.z),
      });
    };
    (['N','S','W','E'] as const).forEach((direction,index)=>{
      const prefix=`FURN_Dining_Chair_${direction}`;
      const seat=model.getObjectByName(`${prefix}_Seat`);if(seat)addSeat(seat,model.getObjectByName(`${prefix}_Back`),tableCenter,'chair',`식탁 의자 ${index+1}`);
    });
    const sofaBack=model.getObjectByName('FURN_Sofa_Back');
    for(let index=0;index<3;index++){
      const cushion=model.getObjectByName(`FURN_Sofa_Cushion_${index}`);if(cushion)addSeat(cushion,sofaBack,doorCenter,'sofa',`소파 ${index+1}`);
    }
    this.personalFarmSeats=seats;
    if(import.meta.env.DEV)console.info(`[personal farm seats] ${seats.length}/7 seats enabled`,seats.map(seat=>seat.id));
  }

  private setupPersonalFarmBed(model:THREE.Object3D){
    const mattress=model.getObjectByName('FURN_Mattress');
    const headboard=model.getObjectByName('FURN_Bed_Headboard');
    if(!mattress||!headboard){console.warn('[personal farm bed] mattress or headboard missing');return}
    const bounds=new THREE.Box3().setFromObject(mattress);if(bounds.isEmpty())return;
    const center=bounds.getCenter(new THREE.Vector3());
    const headCenter=new THREE.Box3().setFromObject(headboard).getCenter(new THREE.Vector3());
    const headDirection=headCenter.clone().sub(center);headDirection.y=0;
    if(headDirection.lengthSq()<.001)headDirection.set(0,0,-1);else headDirection.normalize();
    const table=model.getObjectByName('FURN_Dining_Table');
    const approach=table?new THREE.Box3().setFromObject(table).getCenter(new THREE.Vector3()).sub(center):new THREE.Vector3(-1,0,0);
    approach.y=0;if(approach.lengthSq()<.001)approach.set(-1,0,0);else approach.normalize();
    const size=bounds.getSize(new THREE.Vector3());
    const edgeDistance=Math.abs(approach.x)*size.x/2+Math.abs(approach.z)*size.z/2;
    const standScene=center.clone().addScaledVector(approach,edgeDistance+72);
    const characterHeight=this.options.characterHeight??CHARACTER_HEIGHT;
    const feetScene=center.clone().addScaledVector(headDirection,-characterHeight*.43);
    this.personalFarmBed={
      id:mattress.name,
      x:feetScene.x,
      z:this.sceneToWorldZ(feetScene.z),
      seatHeight:bounds.max.y+6,
      yaw:Math.atan2(headDirection.x,headDirection.z),
      standX:standScene.x,
      standZ:this.sceneToWorldZ(standScene.z),
      cameraX:center.x,
      cameraZ:this.sceneToWorldZ(center.z),
    };
  }

  private updatePersonalFarmBedProximity(x:number,z:number){
    const bed=this.personalFarmBed;
    if(!this.personalFarmInterior||!bed||this.personalFarmActiveSeat){
      if(this.personalFarmBedNearby){this.personalFarmBedNearby=false;gameEvents.emit('personal-farm-bed-proximity-changed',null)}
      return;
    }
    if(this.personalFarmSleeping)return;
    const nearby=Math.hypot(x-bed.standX,z-bed.standZ)<(this.personalFarmBedNearby?135:110);
    if(nearby===this.personalFarmBedNearby)return;
    this.personalFarmBedNearby=nearby;
    gameEvents.emit('personal-farm-bed-proximity-changed',nearby?{sleeping:false}:null);
  }

  private togglePersonalFarmBed=()=>{
    const bed=this.personalFarmBed;
    if(this.personalFarmSleeping){
      this.personalFarmSleeping=false;this.personalFarmBedNearby=false;this.localCharacter.setLying(false);
      if(bed)this.pendingTeleport={x:bed.standX,z:bed.standZ};
      gameEvents.emit('personal-farm-bed-proximity-changed',null);
      return;
    }
    if(!bed||!this.personalFarmBedNearby||!this.personalFarmInterior)return;
    this.personalFarmSleeping=true;this.personalFarmBedNearby=false;this.localCharacter.setLying(true);
    gameEvents.emit('personal-farm-bed-proximity-changed',{sleeping:true});
  };

  private updatePersonalFarmSeatProximity(x:number,z:number){
    if(!this.personalFarmInterior||!this.personalFarmSeats.length||this.personalFarmActiveSeat||this.personalFarmSleeping){
      if(this.personalFarmSeatNearby&&!this.personalFarmActiveSeat){this.personalFarmSeatNearby=undefined;gameEvents.emit('personal-farm-seat-proximity-changed',null)}
      return;
    }
    const nearest=this.personalFarmSeats.map(seat=>({seat,distance:Math.hypot(x-seat.standX,z-seat.standZ)})).sort((a,b)=>a.distance-b.distance)[0];
    const same=nearest?.seat.id===this.personalFarmSeatNearby?.id;
    const nearby=nearest&&nearest.distance<(same?135:110)?nearest.seat:undefined;
    if(nearby?.id===this.personalFarmSeatNearby?.id)return;
    this.personalFarmSeatNearby=nearby;
    gameEvents.emit('personal-farm-seat-proximity-changed',nearby?{id:nearby.id,kind:nearby.kind,label:nearby.label}:null);
  }

  private togglePersonalFarmSeat=()=>{
    if(this.personalFarmActiveSeat){
      const seat=this.personalFarmActiveSeat;
      this.personalFarmActiveSeat=undefined;this.personalFarmSeatNearby=undefined;this.localCharacter.setSeated(false);
      this.pendingTeleport={x:seat.standX,z:seat.standZ};
      gameEvents.emit('personal-farm-seat-proximity-changed',null);
      return;
    }
    const seat=this.personalFarmSeatNearby;if(!seat||!this.personalFarmInterior)return;
    this.personalFarmActiveSeat=seat;this.localCharacter.setSeated(true);
    gameEvents.emit('personal-farm-seat-proximity-changed',{id:seat.id,kind:seat.kind,label:seat.label,seated:true});
  };

  private updateArtsCenterSeatProximity(x:number,z:number){
    if(!this.artsCenterSeats.length||this.artsCenterActiveSeat)return;
    const nearest=this.artsCenterSeats.map(seat=>({seat,distance:Math.hypot(x-seat.x,z-seat.z)})).sort((a,b)=>a.distance-b.distance)[0];
    const nearby=nearest&&nearest.distance<92?nearest.seat:undefined;
    if(nearby?.id===this.artsCenterSeatNearby?.id)return;
    this.artsCenterSeatNearby=nearby;
    gameEvents.emit('arts-center-seat-proximity-changed',nearby?{id:nearby.id}:null);
  }

  private toggleArtsCenterSeat=()=>{
    if(this.artsCenterActiveSeat){
      const seat=this.artsCenterActiveSeat;
      this.artsCenterActiveSeat=undefined;this.localCharacter.setSeated(false);
      // Stand in the aisle in front of the chair instead of inside its frame.
      this.pendingTeleport={x:seat.x,z:seat.z+72};
      this.artsCenterSeatNearby=undefined;
      this.lastArtsCenterStageScreenRect=undefined;
      gameEvents.emit('arts-center-stage-screen-rect',null);
      gameEvents.emit('arts-center-seat-proximity-changed',null);
      return;
    }
    const seat=this.artsCenterSeatNearby;if(!seat)return;
    this.sitInArtsCenterSeat(seat);
  };

  private sitInArtsCenterSeat(seat:ArtsCenterSeat){
    this.artsCenterActiveSeat=seat;this.artsCenterSeatNearby=seat;this.localCharacter.setSeated(true);
    gameEvents.emit('arts-center-seat-proximity-changed',{id:seat.id,seated:true});
  }
  private setupProjectRoomSeats(model:THREE.Object3D){
    const tree=model.getObjectByName('Lobby_Tree_Planter');
    const treeCenter=tree?new THREE.Box3().setFromObject(tree).getCenter(new THREE.Vector3()):new THREE.Vector3();
    const table=model.getObjectByName('Collaboration_Table_Inset');
    const tableCenter=table?new THREE.Box3().setFromObject(table).getCenter(new THREE.Vector3()):new THREE.Vector3();
    const seats:ProjectRoomSeat[]=[];
    model.updateMatrixWorld(true);
    model.traverse(object=>{
      if(!(object instanceof THREE.Mesh))return;
      const isLobbySofa=/^Lobby_Sofa_Cushion_\d+$/.test(object.name);
      const isCollaborationStool=/^Stool_Seat_\d+$/.test(object.name);
      if(!isLobbySofa&&!isCollaborationStool)return;
      const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3());
      const furnitureCenter=isCollaborationStool?tableCenter:treeCenter;
      const outward=center.clone().sub(furnitureCenter);outward.y=0;
      if(outward.lengthSq()<.001)outward.set(0,0,1);else outward.normalize();
      const inward=outward.clone().negate();
      const standScene=center.clone().addScaledVector(outward,82);
      seats.push({
        id:object.name,
        x:center.x,
        z:this.sceneToWorldZ(center.z),
        seatHeight:bounds.max.y,
        yaw:Math.atan2(inward.x,inward.z),
        standX:standScene.x,
        standZ:this.sceneToWorldZ(standScene.z),
        opensCollaborationTable:isCollaborationStool,
      });
    });
    this.projectRoomSeats=seats;
  }
  private updateProjectRoomSeatProximity(x:number,z:number){
    if(!this.projectRoomSeats.length||this.projectRoomActiveSeat)return;
    const nearest=this.projectRoomSeats.map(seat=>({seat,distance:Math.hypot(x-seat.x,z-seat.z)})).sort((a,b)=>a.distance-b.distance)[0];
    const nearby=nearest&&nearest.distance<105?nearest.seat:undefined;
    if(nearby?.id===this.projectRoomSeatNearby?.id)return;
    this.projectRoomSeatNearby=nearby;
    gameEvents.emit('project-room-seat-proximity-changed',nearby?{id:nearby.id}:null);
  }
  private toggleProjectRoomSeat=()=>{
    if(this.projectRoomActiveSeat){
      const seat=this.projectRoomActiveSeat;
      this.projectRoomActiveSeat=undefined;this.projectRoomSeatNearby=undefined;this.localCharacter.setSeated(false);
      this.pendingTeleport={x:seat.standX,z:seat.standZ};
      gameEvents.emit('project-room-seat-proximity-changed',null);
      return;
    }
    const seat=this.projectRoomSeatNearby;if(!seat)return;
    this.projectRoomActiveSeat=seat;this.localCharacter.setSeated(true);
    gameEvents.emit('project-room-seat-proximity-changed',{id:seat.id,seated:true});
    if(seat.opensCollaborationTable)gameEvents.emit('project-room-interaction-open','collaboration-table');
  };
  private setupCentralPlazaSofaSeats(model:THREE.Object3D){
    // The 7c513... nodes are the five planters, despite their generated names.
    // Only the two enlarged d2b5... instances are the visible front sofas;
    // the unnumbered source instance remains hidden at the model origin.
    const sofaNames=new Set([
      'tripo_node_d2b5f472-a753-44d7-9b9f-42e02b7542d3.001',
      'tripo_node_d2b5f472-a753-44d7-9b9f-42e02b7542d3.002',
    ]);
    const platform=model.getObjectByName('AI_Platform_Base');
    const plazaCenter=platform
      ?new THREE.Box3().setFromObject(platform).getCenter(new THREE.Vector3())
      :new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
    const seats:PlazaSofaSeat[]=[];
    model.updateMatrixWorld(true);
    model.children.filter(object=>sofaNames.has(object.name)).forEach(object=>{
      const bounds=new THREE.Box3().setFromObject(object);if(bounds.isEmpty())return;
      const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
      const outward=center.clone().sub(plazaCenter);outward.y=0;
      if(outward.lengthSq()<.001)outward.set(0,0,1);else outward.normalize();
      const inward=outward.clone().negate();
      const sofaEdgeDistance=Math.abs(outward.x)*size.x*.5+Math.abs(outward.z)*size.z*.5;
      const standScene=center.clone().addScaledVector(outward,sofaEdgeDistance+46);
      seats.push({
        id:object.name,
        x:center.x,
        z:this.sceneToWorldZ(center.z),
        // The imported sofa is a single mesh, so derive the cushion level from
        // the same normalized profile used by the observatory sofa asset.
        seatHeight:bounds.min.y+size.y*.46,
        yaw:Math.atan2(inward.x,inward.z),
        standX:standScene.x,
        standZ:this.sceneToWorldZ(standScene.z),
      });
    });
    this.centralPlazaSofaSeats=seats;
  }
  private updateCentralPlazaSofaSeatProximity(x:number,z:number){
    if(!this.centralPlazaSofaSeats.length||this.centralPlazaSofaActiveSeat)return;
    // Detect the authored standing point in front of each sofa, not the model
    // center. This both keeps the prompt reachable outside the collision box
    // and prevents nearby planters from behaving like seats.
    const nearest=this.centralPlazaSofaSeats.map(seat=>({seat,distance:Math.hypot(x-seat.standX,z-seat.standZ)})).sort((a,b)=>a.distance-b.distance)[0];
    const same=nearest?.seat.id===this.centralPlazaSofaSeatNearby?.id;
    const nearby=nearest&&nearest.distance<(same?125:95)?nearest.seat:undefined;
    if(nearby?.id===this.centralPlazaSofaSeatNearby?.id)return;
    this.centralPlazaSofaSeatNearby=nearby;
    gameEvents.emit('central-plaza-sofa-seat-proximity-changed',nearby?{id:nearby.id}:null);
  }
  private toggleCentralPlazaSofaSeat=()=>{
    if(this.centralPlazaSofaActiveSeat){
      const seat=this.centralPlazaSofaActiveSeat;
      this.centralPlazaSofaActiveSeat=undefined;this.centralPlazaSofaSeatNearby=undefined;this.localCharacter.setSeated(false);
      this.pendingTeleport={x:seat.standX,z:seat.standZ};
      gameEvents.emit('central-plaza-sofa-seat-proximity-changed',null);
      return;
    }
    const seat=this.centralPlazaSofaSeatNearby;if(!seat)return;
    this.centralPlazaSofaActiveSeat=seat;this.localCharacter.setSeated(true);
    gameEvents.emit('central-plaza-sofa-seat-proximity-changed',{id:seat.id,seated:true});
  };
  arrivalSpawnFrom(sourceMapId:MapId,forcedSpawn?:{x:number;z:number;yaw:number}){
    const requestedSpawn=forcedSpawn??portalArrivalSpawn(this.options,sourceMapId);
    if(requestedSpawn){
      const safeSpawn=forcedSpawn?this.findSafeSpawn(requestedSpawn.x,requestedSpawn.z):undefined;
      const spawn=safeSpawn?{...requestedSpawn,x:safeSpawn.x,z:safeSpawn.z}:requestedSpawn;
      // The traveller must leave the arrival portal before it can activate
      // again, preventing an immediate bounce back to the previous map.
      this.localX=spawn.x;
      this.localZ=spawn.z;
      const ground=safeSpawn?.ground??this.sampleGround(spawn.x,spawn.z,this.localGround,true,1200);
      if(ground){this.localGround=ground.height;this.visualGroundHeight=this.localGround;this.localNormal.copy(ground.normal)}
      if(forcedSpawn)this.pendingTeleport={x:spawn.x,z:spawn.z,groundHeight:ground?.height};
      this.portalEntryArmed=false;
      this.interactionEntryArmed=false;
      return spawn;
    }
    return undefined;
  }

  private setupFoodSeats(model:THREE.Object3D){
    // GLTFLoader may represent a multi-material chair (for example Cube.007)
    // as a named parent node with unnamed/mesh-named children. Detect the
    // authored chair node itself instead of requiring the child to be a Mesh.
    const partsBySuffix=new Map<string,{seat?:THREE.Object3D;back?:THREE.Object3D}>();
    const combinedChairs:THREE.Object3D[]=[];
    model.updateMatrixWorld(true);
    model.traverse(object=>{
      const normalized=normalizedModelObjectName(object.name);
      const match=/^cafechair(seat|back)(\d*)$/.exec(normalized);if(!match)return;
      const suffix=match[2]||'000',parts=partsBySuffix.get(suffix)??{};
      parts[match[1] as 'seat'|'back']=object;partsBySuffix.set(suffix,parts);
      // The current food map exports each complete chair as one mesh named
      // "Cafe chair back.001" through ".008", rather than separate seat and
      // back meshes. Keep these as a fallback after handling split chairs.
      if(match[1]==='back')combinedChairs.push(object);
    });
    const splitSeats=[...partsBySuffix.entries()].flatMap(([suffix,parts])=>{
      if(!parts.seat||!parts.back)return [];
      const seatBounds=new THREE.Box3().setFromObject(parts.seat),backBounds=new THREE.Box3().setFromObject(parts.back);
      const center=seatBounds.getCenter(new THREE.Vector3()),backCenter=backBounds.getCenter(new THREE.Vector3());
      const forward=center.clone().sub(backCenter);forward.y=0;
      const yaw=forward.lengthSq()>.001?Math.atan2(forward.x,-forward.z):0;
      return [{id:`food-seat-${suffix}`,x:center.x,z:this.sceneToWorldZ(center.z),seatHeight:seatBounds.max.y,yaw}];
    });
    const authoredChairs=combinedChairs
      .filter(chair=>/^cafechairback00[1-8]$/.test(normalizedModelObjectName(chair.name)))
      .sort((a,b)=>normalizedModelObjectName(a.name).localeCompare(normalizedModelObjectName(b.name)));
    this.foodSeats=splitSeats.length?splitSeats:authoredChairs.map((chair,index)=>{
      const bounds=new THREE.Box3().setFromObject(chair),center=bounds.getCenter(new THREE.Vector3());
      // In the combined chair mesh, the cushion top sits just below the
      // vertical midpoint; the upper half is the backrest.
      const seatHeight=THREE.MathUtils.lerp(bounds.min.y,bounds.max.y,.49);
      const forward=new THREE.Vector3(0,0,-1).transformDirection(chair.matrixWorld);forward.y=0;forward.normalize();
      const yaw=Math.atan2(forward.x,-forward.z);
      return {id:`food-seat-${String(index+1).padStart(3,'0')}`,x:center.x,z:this.sceneToWorldZ(center.z),seatHeight,yaw};
    });
    if(import.meta.env.DEV)console.info(`[food seats] ${this.foodSeats.length}/8 chairs enabled`,this.foodSeats.map(seat=>seat.id));
  }

  private updateFoodSeatProximity(x:number,z:number){
    if(!this.foodSeats.length||this.foodActiveSeat)return;
    if(this.nearbyFoodTruckId){
      if(this.foodSeatNearby){this.foodSeatNearby=undefined;gameEvents.emit('food-seat-proximity-changed',null)}
      return;
    }
    const nearest=this.foodSeats.map(seat=>({seat,distance:Math.hypot(x-seat.x,z-seat.z)})).sort((a,b)=>a.distance-b.distance)[0];
    // Full prop collision keeps the avatar capsule outside the chair mesh.
    // Use a wider interaction radius than the old simplified-collision map,
    // with hysteresis so the E prompt does not flicker at the boundary.
    const nearby=nearest&&nearest.distance<(nearest.seat.id===this.foodSeatNearby?.id?175:150)?nearest.seat:undefined;
    if(nearby?.id===this.foodSeatNearby?.id)return;
    this.foodSeatNearby=nearby;gameEvents.emit('food-seat-proximity-changed',nearby?{id:nearby.id}:null);
  }

  private toggleFoodSeat=()=>{
    if(this.foodActiveSeat){
      const seat=this.foodActiveSeat;this.foodActiveSeat=undefined;this.localCharacter.setSeated(false);
      this.pendingTeleport={x:seat.x-Math.sin(seat.yaw)*68,z:seat.z-Math.cos(seat.yaw)*68};
      this.foodSeatNearby=undefined;gameEvents.emit('food-seat-proximity-changed',null);return;
    }
    const seat=this.foodSeatNearby;if(!seat)return;
    this.foodActiveSeat=seat;this.localCharacter.setSeated(true);
    gameEvents.emit('food-seat-proximity-changed',{id:seat.id,seated:true});
  };

  private enterArtsCenterPosterFocus(){
    const screen=this.artsCenterPosterNearby;if(!screen)return;
    screen.updateWorldMatrix(true,false);
    const bounds=new THREE.Box3().setFromObject(screen),center=bounds.getCenter(new THREE.Vector3());
    const size=bounds.getSize(new THREE.Vector3());
    const screenNormal=new THREE.Vector3(0,0,1).transformDirection(screen.matrixWorld).normalize();
    const currentCameraDirection=this.camera.position.clone().sub(center);
    if(screenNormal.dot(currentCameraDirection)<0)screenNormal.negate();
    const focusFov=30;
    const distance=Math.max(250,(size.y*.5)/(Math.tan(THREE.MathUtils.degToRad(focusFov*.5))*.82));
    const target=center.clone();
    const camera=center.clone().addScaledVector(screenNormal,distance);
    this.artsCenterPosterActive=screen;this.artsCenterPosterFocusView={target,camera};
    this.artsCenterPosterWebReady=false;
    this.artsCenterPosterFocusTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),elapsed:0};
    this.setProjectRoomCharactersVisible(false);
    this.renderer.domElement.style.cursor='pointer';
    gameEvents.emit('game-input-lock',true);
    gameEvents.emit('arts-center-poster-focus-mode-changed',{active:true,index:screen.userData.artsCenterPerformanceIndex as number,ready:false});
  }

  private artsCenterPosterDataUrl(screen:THREE.Mesh){
    if(!(screen.material instanceof THREE.MeshBasicMaterial))return undefined;
    const source=screen.material.map?.image;
    return source instanceof HTMLCanvasElement?source.toDataURL('image/png'):undefined;
  }

  private exitArtsCenterPosterFocus=()=>{
    if(!this.artsCenterPosterActive)return;
    this.artsCenterPosterActive=undefined;this.artsCenterPosterFocusView=undefined;this.artsCenterPosterFocusTransition=undefined;
    this.artsCenterPosterWebReady=false;
    this.lastArtsCenterPosterScreenRect=undefined;
    this.setProjectRoomCharactersVisible(true);
    this.renderer.domElement.style.cursor='';
    gameEvents.emit('game-input-lock',false);
    gameEvents.emit('arts-center-poster-screen-rect',null);
    gameEvents.emit('arts-center-poster-focus-mode-changed',{active:false,index:0,ready:false});
  };

  private onArtsCenterPosterPointerDown=(event:PointerEvent)=>{
    if(!this.mapReady||this.renderer.domElement.style.display==='none'||this.artsCenterPosterActive||!this.artsCenterPosterScreens.length)return;
    const rect=this.renderer.domElement.getBoundingClientRect();
    const pointer=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    this.raycaster.setFromCamera(pointer,this.camera);
    const seatHit=this.raycaster.intersectObjects(this.artsCenterSeatMeshes,false)[0];
    if(seatHit){
      const seat=this.artsCenterSeatByMesh.get(seatHit.object as THREE.Mesh);if(!seat)return;
      event.preventDefault();event.stopPropagation();this.sitInArtsCenterSeat(seat);return;
    }
    const hit=this.raycaster.intersectObjects(this.artsCenterPosterScreens,false)[0];
    if(!hit)return;
    event.preventDefault();event.stopPropagation();
    this.artsCenterPosterNearby=hit.object as THREE.Mesh;
    this.enterArtsCenterPosterFocus();
  };

  private onGreenhousePointerDown=(event:PointerEvent)=>{
    if(!this.mapReady||this.renderer.domElement.style.display==='none')return;
    const rect=this.renderer.domElement.getBoundingClientRect(),pointer=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    this.raycaster.setFromCamera(pointer,this.camera);
    const candidates=[...this.greenhouseTargets.values()].flatMap(target=>target.objects);
    const hit=this.raycaster.intersectObjects(candidates,true)[0];if(!hit)return;
    let object:THREE.Object3D|null=hit.object,id:string|undefined;
    while(object&&!id){id=this.greenhouseObjectIds.get(object)??object.userData.greenhousePlantId;object=object.parent}
    const target=id?this.greenhouseTargets.get(id):undefined;
    if(import.meta.env.DEV)console.info('[수목원 클릭]',{mesh:hit.object.name,plantId:id??null,distance:target?Math.round(this.greenhouseTargetDistance(target,this.localX,this.worldToSceneZ(this.localZ))):null});
    if(!target)return;
    const distance=this.greenhouseTargetDistance(target,this.localX,this.worldToSceneZ(this.localZ));
    if(distance>=GREENHOUSE_EXIT_DISTANCE)return;
    gameEvents.emit(target.kind==='plant'?'greenhouse-observe-plant':'greenhouse-observe-tree',target.id);
  };

  setVisible(visible:boolean){
    this.renderer.domElement.style.display=visible?'block':'none';
    if(visible)this.render();
    if(!visible&&this.guideNearby){this.guideNearby=false;gameEvents.emit('guide-proximity-changed',false)}
    if(!visible&&this.mapSignNearby){this.mapSignNearby=false;gameEvents.emit('map-sign-proximity-changed',false)}
    if(!visible&&this.portalNearby){this.portalNearby=false;this.activePortal=undefined;this.resetPortalCharge();gameEvents.emit('world-portal-proximity-changed',null)}
    if(!visible&&this.interactionNearby){this.interactionNearby=false;this.resetInteractionCharge();gameEvents.emit('world-interaction-proximity-changed',null)}
    if(!visible&&this.nearbyFoodTruckId){this.nearbyFoodTruckId=undefined;gameEvents.emit('food-truck-proximity-changed',null)}
    if(!visible&&this.foodTruckKioskId)this.exitFoodTruckKiosk();
    if(!visible&&this.campusFeaturePortalNearby){this.campusFeaturePortalNearby=undefined;gameEvents.emit('campus-feature-portal-proximity-changed',null)}
    if(!visible&&this.projectRoomInteractionNearby){this.projectRoomInteractionNearby=undefined;this.projectRoomInteractionOutlines.forEach(outline=>{outline.visible=false});gameEvents.emit('project-room-interaction-proximity-changed',null)}
    if(!visible&&this.governmentWebUiNearby){this.governmentWebUiNearby=undefined;this.governmentWebUiOutlines.forEach(outline=>{outline.visible=false});gameEvents.emit('government-webui-proximity-changed',null)}
    if(!visible&&this.governmentWebUiActive)this.exitGovernmentWebUi();
    if(!visible&&this.observatoryTelescopeNearby){this.observatoryTelescopeNearby=false;if(this.observatoryTelescopeOutline)this.observatoryTelescopeOutline.visible=false;gameEvents.emit('observatory-telescope-proximity-changed',false)}
    if(!visible&&this.observatoryTelescopeActive)this.exitObservatoryTelescope();
    if(!visible&&this.lakeExperienceNearby){this.lakeExperienceNearby=undefined;gameEvents.emit('lake-experience-proximity-changed',null)}
    if(!visible&&this.wildlifeClueNearby){this.wildlifeClueNearby=undefined;gameEvents.emit('bear-clue-proximity-changed',null)}
    if(!visible&&this.options.greenhouse){this.greenhouseTargets.forEach(target=>{target.marker.visible=false});this.greenhouseNearby=undefined;gameEvents.emit('greenhouse-nearby-changed',null)}
    if(!visible&&this.localNpcNearbyId){this.localNpcNearbyId=undefined;gameEvents.emit('local-npc-proximity-changed',null);gameEvents.emit('local-npc-screen-position',null)}
  }
  setWorldClock(serverNow:number){if(Number.isFinite(serverNow))this.worldClockOffset=serverNow-Date.now()}
  getWorldCameraProfile(){return {...(this.cameraProfileOverride??this.authoredCameraProfile)}}
  applyWorldCameraProfile(profile:WorldCameraProfile){
    if(profile.mapId!==this.options.mapId)return false;
    this.cameraProfileOverride={...profile};this.options.characterHeight=profile.characterHeight;
    this.localCharacter.setHeight(profile.characterHeight);this.remotes.forEach(character=>character.setHeight(profile.characterHeight));
    const groundPosition=this.followTarget.set(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
    this.followCharacter(groundPosition,0,true);this.render();return true;
  }
  resetWorldCameraProfile(){
    this.cameraProfileOverride=undefined;this.options.characterHeight=this.authoredCameraProfile.characterHeight;
    this.localCharacter.setHeight(this.authoredCameraProfile.characterHeight);this.remotes.forEach(character=>character.setHeight(this.authoredCameraProfile.characterHeight));
    const groundPosition=this.followTarget.set(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
    this.followCharacter(groundPosition,0,true);this.render();
  }
  setHiddenCharacterIds(ids:string[]){
    this.hiddenCharacterIds=new Set(ids);
    this.localNpcs.forEach(npc=>{npc.character.root.visible=!this.hiddenCharacterIds.has(npc.config.id)&&!this.bearPhotoMode&&!isProjectRoomKioskInteraction(this.projectRoomFocus)&&!this.studentHallBoardActive});
    this.remotes.forEach((character,id)=>{character.root.visible=!this.hiddenCharacterIds.has(id)&&!this.bearPhotoMode&&!isProjectRoomKioskInteraction(this.projectRoomFocus)&&!this.studentHallBoardActive});
    if(this.localNpcNearbyId&&this.hiddenCharacterIds.has(this.localNpcNearbyId)){this.localNpcNearbyId=undefined;gameEvents.emit('local-npc-proximity-changed',null);gameEvents.emit('local-npc-screen-position',null)}
    if(this.focusedLocalNpcId&&this.hiddenCharacterIds.has(this.focusedLocalNpcId))this.focusedLocalNpcId=undefined;
  }
  setInteractionPosition(_position:WorldInteractionPosition){/* Authored position is fixed. */}
  setLakeExperiencePosition(_position:LakeExperiencePosition,_fallbackGround?:number){/* Authored position is fixed. */}
  setBearTreePortalPositions(_positions:BearTreePortalPositions){/* Authored positions are fixed. */}
  private onBearPhotoEnter=()=>{
    if(!this.mapReady||!this.bearPhotoNearby||!this.bearPhotoDestination||this.bearPhotoMode)return;
    const distance=Math.hypot(this.localX-this.bearPhotoPortalPosition.x,this.localZ-this.bearPhotoPortalPosition.z);
    const directionX=distance>0?(this.localX-this.bearPhotoPortalPosition.x)/distance:0;
    const directionZ=distance>0?(this.localZ-this.bearPhotoPortalPosition.z)/distance:1;
    const returnDistance=PORTAL_EXIT_DISTANCE+16;
    const returnX=this.bearPhotoPortalPosition.x+directionX*returnDistance;
    const returnZ=this.bearPhotoPortalPosition.z+directionZ*returnDistance;
    const returnGround=this.sampleExperienceGround(returnX,returnZ)??{height:this.localGround,normal:this.localNormal};
    this.bearPhotoReturn={x:returnX,z:returnZ,groundHeight:returnGround.height};
    this.pendingTeleport={...this.bearPhotoDestination};
    this.bearPhotoNearby=false;
    this.bearPhotoMode=true;
    gameEvents.emit('bear-photo-proximity-changed',false);
    this.setBearPhotoPresentation(true);
    gameEvents.emit('bear-photo-mode-changed',true);
  }
  private onBearPhotoCapture=()=>{
    if(!this.bearPhotoMode)return;
    this.render();
    gameEvents.emit('bear-photo-captured');
    this.renderer.domElement.toBlob(blob=>{
      if(!blob)return;
      const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`곰-가족-포토존-${Date.now()}.png`;link.click();
      window.setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    },'image/png');
  }
  private setBearPhotoPresentation(active:boolean){
    if(this.mapModel)this.mapModel.visible=!active;
    if(this.bearPhotoStage)this.bearPhotoStage.visible=true;
    this.localCharacter.setNameplateVisible(!active);
    this.localCharacter.setPhotoPose(active);
    if(this.guideNpc)this.guideNpc.root.visible=!active;
    if(this.residentRoot)this.residentRoot.visible=!active;
    this.residentDecorRoots.forEach(root=>{root.visible=!active});
    this.remotes.forEach(character=>{character.root.visible=!active});
    if(this.portalRoot)this.portalRoot.visible=!active;
    this.fixedPortalRoots.forEach(root=>root.visible=!active);
    if(this.interactionRoot)this.interactionRoot.visible=!active;
    if(this.bearPhotoPortalRoot)this.bearPhotoPortalRoot.visible=!active;
    this.scene.background=new THREE.Color(active?'#f2dfbd':'#b9d7c2');
  }
  private onBearPhotoExit=()=>{
    if(!this.bearPhotoMode)return;
    if(this.bearPhotoReturn)this.pendingTeleport={...this.bearPhotoReturn};
    this.bearPhotoMode=false;this.setBearPhotoPresentation(false);gameEvents.emit('bear-photo-mode-changed',false);
  }
  setCampusFeaturePortalPosition(_position:CampusFeaturePortalPosition){/* Authored campus portal positions are fixed. */}
  getLocalPosition(){return {x:this.localX,z:this.localZ}}
  getCampusFeaturePortalPosition(portal:CampusFeaturePortalId){
    const config=this.options.campusFeaturePortals?.find(item=>item.id===portal);
    return config?{portal,x:config.x,z:config.z}:undefined;
  }
  getPortalDestinations(){
    return [
      this.options.portal?.destination,
      ...(this.options.fixedPortals??[]).map(config=>config.destination),
      this.options.interaction?.destination,
      ...(this.options.campusFeaturePortals??[]).map(config=>CAMPUS_FEATURE_PORTAL_DESTINATIONS[config.id]),
    ].filter((destination):destination is MapId=>Boolean(destination));
  }
  setPortalPosition(position:PortalPosition,sharedUpdate=true){
    if(this.options.mapId&&position.mapId!==this.options.mapId)return false;
    if(position.mapId==='campus'||position.mapId==='garden'||position.mapId==='club-street-festival'&&position.destination==='campus'||position.mapId==='recruitment-center'&&position.destination==='campus'||position.mapId==='project-room'&&position.destination==='campus'||position.mapId==='arts-center'||position.mapId==='festival-experience')return true;
    const primary=this.options.portal?.destination===position.destination?this.options.portal:undefined;
    const fixedIndex=this.options.fixedPortals?.findIndex(config=>config.destination===position.destination)??-1;
    const fixed=fixedIndex>=0?this.options.fixedPortals?.[fixedIndex]:undefined;
    const interaction=this.options.interaction?.destination===position.destination?this.options.interaction:undefined;
    const campusEntry=Object.entries(CAMPUS_FEATURE_PORTAL_DESTINATIONS).find(([,destination])=>destination===position.destination);
    const campusId=campusEntry?.[0] as CampusFeaturePortalId|undefined;
    if(campusId&&this.options.campusFeaturePortals?.some(config=>config.id===campusId)){
      this.setCampusFeaturePortalPosition({portal:campusId,x:position.x,z:position.z});return true;
    }
    const config=primary??fixed??interaction;
    if(!config)return false;
    // Locally editable return portals intentionally keep a per-browser
    // position. Periodic shared-layout polling must not move them back to the
    // server default after the player presses "현재 위치로 포탈 이동".
    if(sharedUpdate&&'sharedPosition' in config&&config.sharedPosition===false)return true;
    const currentPosition=primary?this.portalPosition:config;
    if(currentPosition&&Math.hypot(currentPosition.x-position.x,currentPosition.z-position.z)<.5)return true;
    Object.assign(config,{x:position.x,z:position.z});
    if(primary)this.portalPosition={x:position.x,z:position.z};
    if(interaction)this.interactionPosition={x:position.x,z:position.z};
    const root=primary?this.portalRoot:fixed?this.fixedPortalRoots[fixedIndex]:this.interactionRoot;
    if(root){
      const ground=this.sampleExperienceGround(position.x,position.z,true)
        ??this.sampleVisibleSurfaceGround(position.x,position.z)
        ??this.sampleGround(position.x,position.z,this.localGround,true);
      const groundHeight=ground?.height??this.localGround;
      root.position.set(position.x,groundHeight+.8,this.worldToSceneZ(position.z));
      root.userData.groundHeight=groundHeight;
    }
    this.portalEntryArmed=false;this.interactionEntryArmed=false;this.activePortal=undefined;this.resetPortalCharge();this.resetInteractionCharge();
    return true;
  }
  placePortalAtPlayer(destination:MapId){
    const mapId=this.options.mapId;
    if(!mapId||mapId==='garden'||!this.getPortalDestinations().includes(destination))return undefined;
    const position:PortalPosition={mapId,destination,x:Math.round(this.localX),z:Math.round(this.localZ)};
    return this.setPortalPosition(position,false)?position:undefined;
  }
  private resetPortalCharge(){
    this.portalTravelGate.reset();
    gameEvents.emit('portal-charge-progress',0);
  }
  private resetInteractionCharge(){
    this.interactionTravelGate.reset();
    gameEvents.emit('interaction-charge-progress',0);
  }

  private createWorldPortalLabel(label:string,showInteractionKey:boolean){
    const canvas=document.createElement('canvas');canvas.width=720;canvas.height=180;
    const context=canvas.getContext('2d')!;
    context.shadowColor='rgba(20,51,44,.28)';context.shadowBlur=22;
    context.fillStyle='rgba(20,51,44,.94)';context.beginPath();context.roundRect(18,18,684,144,34);context.fill();
    context.shadowBlur=0;context.strokeStyle='#ffffff';context.lineWidth=5;context.stroke();
    context.textAlign='center';context.fillStyle='#ffffff';context.font='900 46px "Noto Sans KR",sans-serif';
    context.fillText(label,360,showInteractionKey?77:105);
    if(showInteractionKey){
      context.fillStyle='#bfe9db';context.font='800 27px "Noto Sans KR",sans-serif';context.fillText('E  포탈 들어가기',360,126);
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
    const compact=this.options.mapName==='베어트리파크'||this.options.mapName==='모집센터'&&label.includes('공동 캠퍼스')||['세종호수공원','공동캠퍼스','베어트리파크','세종예술의전당','공연 부스','먹거리 부스','축제 부스','축제부스'].includes(label);
    const requestedTitleScale=['세종호수공원','베어트리파크'].includes(this.options.mapName)?1.5:1;
    sprite.scale.set((compact?125:250)*requestedTitleScale,(compact?31:62)*requestedTitleScale,1);sprite.renderOrder=120;sprite.frustumCulled=false;
    return sprite;
  }
  private createPortal(config:PortalConfig,groundHeight:number){
    config=withUnifiedWorldPortalVisual(config);
    const root=new THREE.Group();
    const visualScale=portalVisualScaleForMap(this.options.mapName);
    root.name=`world-portal-${config.destination}`;
    root.scale.setScalar(visualScale);
    root.userData.visualScale=visualScale;
    root.position.set(config.x,groundHeight+(config.appearance==='white-circle'?.8:0),this.worldToSceneZ(config.z));
    if(config.appearance==='white-circle'){
      root.rotation.x=-Math.PI/2;
      const color=config.theme==='blue'?0x72b9ff:config.theme==='orange'?0xff8a24:0xffffff;
      const material=(opacity:number)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthTest:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
      const center=new THREE.Mesh(new THREE.CircleGeometry(50,64),material(.08));
      const ring=new THREE.Mesh(new THREE.RingGeometry(45,54,64),material(.98));
      const middleRing=new THREE.Mesh(new THREE.RingGeometry(34,38,64),material(.78));
      const innerRing=new THREE.Mesh(new THREE.RingGeometry(18,22,64),material(.9));
      const pulseRing=new THREE.Mesh(new THREE.RingGeometry(55,59,64),material(.48));
      center.position.z=.2;ring.position.z=.4;middleRing.position.z=.6;innerRing.position.z=.8;pulseRing.position.z=.1;
      for(const object of [center,ring,middleRing,innerRing,pulseRing])object.renderOrder=30;
      root.add(center,ring,middleRing,innerRing,pulseRing);
      root.userData.center=center;root.userData.ring=ring;root.userData.middleRing=middleRing;root.userData.innerRing=innerRing;root.userData.pulseRing=pulseRing;
      root.userData.phase=0;root.userData.appearance='white-circle';root.userData.groundHeight=groundHeight;
      const light=new THREE.PointLight(color,2.2,155);light.position.set(0,0,38);root.add(light);
      root.userData.light=light;
      const label=this.createWorldPortalLabel(config.label,!config.chargeSeconds);
      label.position.set(0,0,112);root.add(label);root.userData.label=label;
      if(this.options.mapName==='베어트리파크'&&config.destination==='garden'){
        root.userData.natureJourney='garden';
        this.applyNatureJourneyHighlight(root,'garden');
      }
      this.scene.add(root);
      return root;
    }
    if(config.appearance==='energy-rift'){
      root.userData.appearance='energy-rift';
      root.userData.groundHeight=groundHeight;

      const additiveMaterial=(color:number,opacity:number)=>new THREE.MeshBasicMaterial({
        color,
        transparent:true,
        opacity,
        depthWrite:false,
        side:THREE.DoubleSide,
        blending:THREE.AdditiveBlending,
        toneMapped:false,
      });
      const portalMaterial=new THREE.ShaderMaterial({
        transparent:true,
        depthWrite:false,
        side:THREE.DoubleSide,
        blending:THREE.AdditiveBlending,
        toneMapped:false,
        uniforms:{uTime:{value:0}},
        vertexShader:`
          varying vec2 vUv;
          void main(){
            vUv=uv;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }
        `,
        fragmentShader:`
          uniform float uTime;
          varying vec2 vUv;
          void main(){
            vec2 p=(vUv-.5)*2.;
            float radius=length(p);
            float angle=atan(p.y,p.x);
            float edge=1.-smoothstep(.76,1.,radius);
            float core=1.-smoothstep(.02,.72,radius);
            float spiral=.5+.5*sin(angle*7.-radius*18.+uTime*2.8);
            float ripple=.5+.5*sin(radius*42.-uTime*4.2);
            vec3 deep=vec3(.035,.10,.34);
            vec3 cyan=vec3(.08,.88,1.);
            vec3 violet=vec3(.58,.18,1.);
            vec3 color=mix(deep,mix(violet,cyan,spiral),.46+core*.54);
            color+=cyan*ripple*.18*edge;
            float alpha=edge*(.72+spiral*.2)+core*.16;
            gl_FragColor=vec4(color,alpha);
          }
        `,
      });

      const surface=new THREE.Mesh(new THREE.CircleGeometry(36,96),portalMaterial);
      surface.position.y=58;
      surface.scale.y=1.42;
      surface.position.z=-1.5;
      surface.renderOrder=36;
      root.add(surface);

      const frame=new THREE.Group();
      frame.position.y=58;
      const outerRing=new THREE.Mesh(new THREE.TorusGeometry(39,3.7,16,96),additiveMaterial(0x69efff,.92));
      outerRing.scale.y=1.42;
      const middleRing=new THREE.Mesh(new THREE.TorusGeometry(35.8,1.2,10,96),additiveMaterial(0xa970ff,.84));
      middleRing.scale.y=1.42;
      middleRing.position.z=1.4;
      const innerRing=new THREE.Mesh(new THREE.TorusGeometry(33,0.65,8,96),additiveMaterial(0xffffff,.75));
      innerRing.scale.y=1.42;
      innerRing.position.z=2.3;
      frame.add(outerRing,middleRing,innerRing);
      root.add(frame);

      const shards=new THREE.Group();
      const shardGeometry=new THREE.OctahedronGeometry(1.65,0);
      for(let index=0;index<18;index++){
        const angle=index/18*Math.PI*2;
        const radius=47+(index%3)*3.2;
        const shard=new THREE.Mesh(shardGeometry,additiveMaterial(index%2?0x67ecff:0xb06cff,.82));
        shard.position.set(Math.cos(angle)*radius,58+Math.sin(angle)*radius*1.42,(index%4-1.5)*2.2);
        shard.scale.setScalar(.75+(index%5)*.18);
        shard.rotation.set(angle*.7,angle,angle*1.4);
        shards.add(shard);
      }
      root.add(shards);

      const motes=new THREE.Group();
      const moteGeometry=new THREE.SphereGeometry(1.05,8,6);
      for(let index=0;index<24;index++){
        const angle=index/24*Math.PI*2;
        const mote=new THREE.Mesh(moteGeometry,additiveMaterial(index%3===0?0xffffff:0x66eaff,.72));
        const radius=23+(index%6)*5;
        mote.position.set(Math.cos(angle)*radius,58+Math.sin(angle)*radius*1.38,(index%5-2)*1.8);
        mote.scale.setScalar(.45+(index%4)*.18);
        mote.userData.angle=angle;
        mote.userData.radius=radius;
        mote.userData.speed=.18+(index%5)*.025;
        motes.add(mote);
      }
      root.add(motes);

      const pedestal=new THREE.Group();
      const base=new THREE.Mesh(
        new THREE.CylinderGeometry(49,56,7,64),
        new THREE.MeshStandardMaterial({color:0x151b38,emissive:0x33217b,emissiveIntensity:1.15,metalness:.68,roughness:.26}),
      );
      base.position.y=3.5;
      const baseRing=new THREE.Mesh(new THREE.TorusGeometry(44,2.1,10,64),additiveMaterial(0x68eaff,.88));
      baseRing.rotation.x=Math.PI/2;
      baseRing.position.y=7.2;
      const floorGlow=new THREE.Mesh(new THREE.CircleGeometry(62,64),additiveMaterial(0x6546ff,.18));
      floorGlow.rotation.x=-Math.PI/2;
      floorGlow.position.y=.35;
      pedestal.add(base,baseRing,floorGlow);
      root.add(pedestal);

      const light=new THREE.PointLight(0x6f9dff,5.4,260);
      light.position.set(0,58,22);
      root.add(light);
      const groundLight=new THREE.PointLight(0x8d4fff,2.8,170);
      groundLight.position.set(0,12,8);
      root.add(groundLight);

      const label=this.createWorldPortalLabel(config.label,!config.chargeSeconds);
      label.position.set(0,132,0);
      root.add(label);
      root.userData.label=label;
      root.userData.surface=surface;
      root.userData.portalMaterial=portalMaterial;
      root.userData.frame=frame;
      root.userData.outerRing=outerRing;
      root.userData.middleRing=middleRing;
      root.userData.innerRing=innerRing;
      root.userData.shards=shards;
      root.userData.motes=motes;
      root.userData.baseRing=baseRing;
      root.userData.floorGlow=floorGlow;
      root.userData.light=light;
      this.scene.add(root);
      return root;
    }
    const blue=config.theme==='blue',orange=config.theme==='orange',ringColor=blue?0x72b9ff:orange?0xffa13d:0x71e5c2,emissiveColor=blue?0x2688ff:orange?0xff6a00:0x2ad8aa,glowColor=blue?0x79c4ff:orange?0xffbd66:0x74f5d0;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(38,6,12,48),new THREE.MeshStandardMaterial({color:ringColor,emissive:emissiveColor,emissiveIntensity:2.4,metalness:.25,roughness:.28}));
    ring.position.y=49;ring.castShadow=true;
    const glow=new THREE.Mesh(new THREE.CircleGeometry(31,48),new THREE.MeshBasicMaterial({color:glowColor,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));
    glow.position.y=49;glow.position.z=-1;
    const base=new THREE.Mesh(new THREE.CylinderGeometry(43,51,8,40),new THREE.MeshStandardMaterial({color:blue?0x203f66:orange?0x6b3518:0x244f48,emissive:blue?0x235f9e:orange?0xb34b11:0x1e7562,emissiveIntensity:.8,roughness:.42}));
    base.position.y=4;root.add(base,ring,glow);root.userData.glow=glow;root.userData.groundHeight=groundHeight;this.scene.add(root);
    const light=new THREE.PointLight(blue?0x7fc5ff:orange?0xffa347:0x76f5d1,3.2,210);light.position.set(0,52,18);root.add(light);
    if(config.hideMarker){base.visible=false;ring.visible=false;glow.visible=false;light.visible=false}
    const label=this.createWorldPortalLabel(config.label,!config.chargeSeconds);
    label.position.set(0,62,85);
    root.add(label);root.userData.label=label;
    return root;
  }
  private createCampusFeaturePortal(config:CampusFeaturePortalConfig,groundHeight:number,index:number){
    const root=this.createPortal(withUnifiedWorldPortalVisual({...config,fixedPosition:true,sharedPosition:false}),groundHeight);
    root.name=`campus-feature-portal-${config.id}`;
    root.userData.phase=index*Math.PI*.5;
    root.userData.featurePortalId=config.id;
    return root;
  }
  private studentHallBoardMesh(object:THREE.Object3D){
    if(object instanceof THREE.Mesh)return object;
    let mesh:THREE.Mesh|undefined;object.traverse(child=>{if(!mesh&&child instanceof THREE.Mesh)mesh=child});return mesh;
  }
  private setupStudentHallFeatures(model:THREE.Object3D){
    const tree=model.getObjectByName('OriginalCenterTree')
      ??model.getObjectByName('tripo_node_0dde67af-841b-4742-82a1-1dec368d5454');
    const occupancyBoard=model.getObjectByName('OccupancyBoard'),clubBoard=model.getObjectByName('ClubBoard');
    if(tree){
      const bounds=new THREE.Box3().setFromObject(tree),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
      // The tree is enclosed by the circular sofa, so its geometric centre is
      // not reachable by the character. Put the interaction target on the
      // open front edge and allow enough room to trigger before the sofa.
      const treeApproachSceneZ=bounds.max.z+150;
      this.studentHallFeatureTargets.push({id:'people',x:center.x,z:this.sceneToWorldZ(treeApproachSceneZ),radius:STUDENT_HALL_AI_TREE_OPEN_DISTANCE,label:'AI 추천 트리',description:'당신과 잘 맞는 사람을 AI가 추천해요'});
      // Sampling the visible surface at the tree centre hits the canopy and
      // places the whole effect above the tree. Anchor it to the tree base so
      // the rings, particles and light occupy the trunk/canopy volume.
      const effect=new THREE.Group();effect.name='student-hall-ai-tree-effect';effect.position.set(center.x,bounds.min.y,center.z);
      const radius=Math.max(62,size.x*.24),rings:THREE.Mesh[]=[];
      [
        {height:size.y*.38,radius:radius*.72,tilt:.18,color:0x72f7d2},
        {height:size.y*.52,radius:radius,tilt:-.28,color:0x53dff2},
        {height:size.y*.66,radius:radius*.78,tilt:.34,color:0xa0ffe6},
      ].forEach((config,index)=>{
        const material=new THREE.MeshBasicMaterial({color:config.color,transparent:true,opacity:.34,depthWrite:false,blending:THREE.AdditiveBlending});
        const ring=new THREE.Mesh(new THREE.TorusGeometry(config.radius,Math.max(1.4,size.x*.009),10,80),material);
        ring.position.y=config.height;ring.rotation.set(Math.PI/2+config.tilt,index*.9,config.tilt*.45);ring.renderOrder=34;effect.add(ring);rings.push(ring);
      });
      const groundRingMaterial=new THREE.MeshBasicMaterial({color:0x66eec6,transparent:true,opacity:.48,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
      const groundRing=new THREE.Mesh(new THREE.RingGeometry(radius*.76,radius*.9,72),groundRingMaterial);groundRing.rotation.x=-Math.PI/2;groundRing.position.y=2;groundRing.renderOrder=33;effect.add(groundRing);
      const particleCount=44,positions=new Float32Array(particleCount*3);
      for(let index=0;index<particleCount;index++){
        const progress=index/particleCount,angle=progress*Math.PI*7.5,indexRadius=radius*(.42+.38*((index*17)%11)/10);
        positions[index*3]=Math.cos(angle)*indexRadius;positions[index*3+1]=size.y*(.30+progress*.42);positions[index*3+2]=Math.sin(angle)*indexRadius;
      }
      const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0xb7ffea,size:Math.max(4,size.x*.022),transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));particles.renderOrder=36;effect.add(particles);
      const light=new THREE.PointLight(0x69efd0,1.5,Math.max(320,size.x*1.8));light.position.y=size.y*.52;effect.add(light);
      effect.userData.rings=rings;effect.userData.groundRing=groundRing;effect.userData.particles=particles;effect.userData.light=light;effect.userData.elapsed=0;
      this.scene.add(effect);this.studentHallAiTreeEffect=effect;
    }
    if(occupancyBoard){
      const bounds=new THREE.Box3().setFromObject(occupancyBoard),center=bounds.getCenter(new THREE.Vector3());
      this.studentHallFeatureTargets.push({id:'clubs',x:center.x,z:this.sceneToWorldZ(bounds.max.z+220),radius:280,label:'공동캠퍼스 현황',description:'인기 관심사와 현재 활동을 확인해요'});
      const mesh=this.studentHallBoardMesh(occupancyBoard);if(mesh)this.studentHallBoardScreens.set('occupancy',mesh);
    }
    if(clubBoard){
      const bounds=new THREE.Box3().setFromObject(clubBoard),center=bounds.getCenter(new THREE.Vector3());
      this.studentHallFeatureTargets.push({id:'recruit',x:center.x,z:this.sceneToWorldZ(bounds.max.z+220),radius:280,label:'오늘의 활동',description:'진행 중인 모임과 새 소식을 확인해요'});
      const mesh=this.studentHallBoardMesh(clubBoard);if(mesh)this.studentHallBoardScreens.set('activity',mesh);
    }
  }
  private updateStudentHallAiTreeEffect(delta:number){
    const effect=this.studentHallAiTreeEffect;if(!effect)return;
    const elapsed=(effect.userData.elapsed as number)+Math.min(delta,.05);effect.userData.elapsed=elapsed;
    const nearby=this.campusFeaturePortalNearby==='people',strength=nearby?1:.58;
    const rings=effect.userData.rings as THREE.Mesh[];
    rings.forEach((ring,index)=>{
      ring.rotation.y+=delta*(index%2?-.48:.42);
      ring.rotation.z+=delta*(index%2?.13:-.11);
      const pulse=1+Math.sin(elapsed*1.8+index*1.7)*.045;ring.scale.setScalar(pulse);
      (ring.material as THREE.MeshBasicMaterial).opacity=(.22+index*.045)*strength;
    });
    const particles=effect.userData.particles as THREE.Points;particles.rotation.y+=delta*(nearby ? .62 : .3);
    (particles.material as THREE.PointsMaterial).opacity=(.52+Math.sin(elapsed*2.2)*.14)*strength;
    const groundRing=effect.userData.groundRing as THREE.Mesh,groundPulse=1+Math.sin(elapsed*2)*.07;groundRing.scale.setScalar(groundPulse);
    (groundRing.material as THREE.MeshBasicMaterial).opacity=(nearby ? .62 : .3)+Math.sin(elapsed*2)*.08;
    const light=effect.userData.light as THREE.PointLight;light.intensity=(nearby?2.5:1.05)+Math.sin(elapsed*2.4)*.25;
  }
  private enterStudentHallBoardFocus(id:StudentHallBoardId){
    const mesh=this.studentHallBoardScreens.get(id);if(!mesh||!(this.camera instanceof THREE.PerspectiveCamera))return;
    mesh.updateWorldMatrix(true,false);
    const bounds=new THREE.Box3().setFromObject(mesh),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const normal=new THREE.Vector3(0,0,1).transformDirection(mesh.matrixWorld).normalize();
    if(normal.dot(this.camera.position.clone().sub(center))<0)normal.negate();
    const fov=31,verticalFov=THREE.MathUtils.degToRad(fov),horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*this.width/Math.max(1,this.height));
    const distance=Math.max(size.y/(2*Math.tan(verticalFov/2)),size.x/(2*Math.tan(horizontalFov/2)))*1.16;
    this.studentHallBoardActive=id;
    this.studentHallBoardFocusView={target:center,camera:center.clone().addScaledVector(normal,Math.max(190,distance)),fov};
    this.studentHallBoardFocusTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera.fov,elapsed:0};
    this.lastStudentHallBoardRects.clear();
    this.setProjectRoomCharactersVisible(false);
    gameEvents.emit('student-hall-board-focus-mode-changed',id);gameEvents.emit('game-input-lock',true);
  }
  private exitStudentHallBoardFocus=()=>{
    if(!this.studentHallBoardActive)return;
    this.studentHallBoardActive=undefined;this.studentHallBoardFocusView=undefined;this.studentHallBoardFocusTransition=undefined;this.lastStudentHallBoardRects.clear();
    this.setProjectRoomCharactersVisible(true);
    gameEvents.emit('student-hall-board-focus-mode-changed',null);gameEvents.emit('game-input-lock',false);
  };
  private enterProjectLobbyBoardFocus=()=>{
    const mesh=this.projectLobbyBoardScreen;
    if(!mesh||!(this.camera instanceof THREE.PerspectiveCamera)||this.projectLobbyBoardFocused)return;
    mesh.geometry.computeBoundingBox();
    const localBounds=mesh.geometry.boundingBox;if(!localBounds)return;
    mesh.updateWorldMatrix(true,false);
    const bounds=new THREE.Box3().setFromObject(mesh),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const localSize=localBounds.getSize(new THREE.Vector3());
    const normal=(localSize.x<=localSize.y&&localSize.x<=localSize.z?new THREE.Vector3(1,0,0):localSize.y<=localSize.z?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1)).transformDirection(mesh.matrixWorld).normalize();
    if(normal.dot(this.camera.position.clone().sub(center))<0)normal.negate();
    const fov=34,verticalFov=THREE.MathUtils.degToRad(fov),horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*this.width/Math.max(1,this.height));
    const boardWidth=Math.max(size.x,size.z),distance=Math.max(size.y/(2*Math.tan(verticalFov/2)),boardWidth/(2*Math.tan(horizontalFov/2)))*1.08;
    this.projectLobbyBoardFocused=true;
    this.projectLobbyBoardFocusView={target:center,camera:center.clone().addScaledVector(normal,Math.max(240,distance)),fov};
    this.projectLobbyBoardFocusTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera.fov,elapsed:0};
    this.setProjectRoomCharactersVisible(false);
    gameEvents.emit('project-lobby-board-focus-mode-changed',true);gameEvents.emit('game-input-lock',true);
  };
  private exitProjectLobbyBoardFocus=()=>{
    if(!this.projectLobbyBoardFocused)return;
    this.projectLobbyBoardFocused=false;this.projectLobbyBoardFocusView=undefined;this.projectLobbyBoardFocusTransition=undefined;
    this.setProjectRoomCharactersVisible(true);
    gameEvents.emit('project-lobby-board-focus-mode-changed',false);gameEvents.emit('game-input-lock',false);
  };
  private unlockProjectRoomDoor=()=>{
    if(this.projectRoomDoorUnlocked||!this.projectRoomDoorMeshes.length)return;
    const doorPosition=this.projectRoomInteractionPositions.get('project-door');
    this.projectRoomDoorEntrySide=doorPosition?Math.sign(this.localX-doorPosition.x)||-1:-1;
    this.projectRoomDoorUnlocked=true;
    this.projectRoomDoorMeshes.forEach(mesh=>{
      mesh.visible=false;
      this.mapMeshes=this.mapMeshes.filter(candidate=>candidate!==mesh);
      this.mapMeshBounds.delete(mesh);
    });
  };
  private onProjectRoomInstanceEnter=()=>{
    if(this.options.projectRoomInteractions)this.projectRoomCameraAzimuthDeg=-90;
  };
  private lockProjectRoomDoor(){
    if(!this.projectRoomDoorUnlocked)return;
    this.projectRoomDoorUnlocked=false;
    this.projectRoomDoorEntrySide=0;
    this.projectRoomDoorMeshes.forEach(mesh=>{
      mesh.visible=true;
      if(!this.mapMeshes.includes(mesh))this.mapMeshes.push(mesh);
      this.mapMeshBounds.set(mesh,new THREE.Box3().setFromObject(mesh));
    });
  }

  private resizeProjectRoomFurniture(model:THREE.Object3D){
    // Keep furniture at a usable character-relative height while reducing its
    // oversized footprint. Structural pieces, screens and kiosks stay intact.
    const tableScale=.82;
    model.traverse(object=>{
      if(object.name.startsWith('Collaboration_Table_')||object.name==='Collaboration_Rug'){
        object.scale.x*=tableScale;
        object.scale.z*=tableScale;
      }
      if(/^Lobby_Sofa_(?:Cushion_)?\d+$/.test(object.name)){
        object.scale.x*=.85;
        object.scale.z*=.85;
      }
    });
    for(let index=1;index<=6;index+=1){
      const stool=model.getObjectByName(`Collaboration_Stool_${index}`);
      if(!stool)continue;
      stool.scale.x*=.85;
      stool.scale.z*=.85;
      stool.position.x*=.86;
      stool.position.z=-.55+(stool.position.z+.55)*.86;
    }
  }
  private setupSmartCityWebUi(model:THREE.Object3D){
    model.updateMatrixWorld(true);
    const screen=model.getObjectByName('Central_Table_Screen');
    const platform=model.getObjectByName('Central_Table_Platform')??screen;
    if(!platform){console.warn('[미래 세종관] 중앙 테이블을 찾지 못했습니다.');return}
    if(screen instanceof THREE.Mesh)this.smartCityScreen=screen;
    ([['city','AI_Exhibit_Wall'],['future','Mobility_Wall'],['connected','Energy_Wall']] as const).forEach(([id,name])=>{
      const wall=model.getObjectByName(name);
      if(wall instanceof THREE.Mesh)this.smartCityWallScreens.set(id,wall);
    });
    const center=new THREE.Box3().setFromObject(platform).getCenter(new THREE.Vector3());
    this.smartCityTablePosition={x:center.x,z:this.sceneToWorldZ(center.z)+175,radius:285};
    this.smartCityHologram=new SmartCityHologram(model);
    this.smartCityHologram.setTechnology(this.smartCityTechnology,true);
    this.smartCityHologram.setActive(this.smartCityExperienceActive);
  }
  private onSmartCityTechnologyChanged=(technology:SmartCityTechnologyId)=>{
    this.smartCityTechnology=technology;
    this.smartCityHologram?.setTechnology(technology);
  };
  private onSmartCityExperienceActiveChanged=(active:boolean)=>{
    this.smartCityExperienceActive=active;
    this.smartCityHologram?.setActive(active);
    this.setProjectRoomCharactersVisible(!active);
    if(!active){
      this.smartCityFocusView=undefined;this.smartCityFocusTransition=undefined;this.lastSmartCityScreenRect=undefined;
      gameEvents.emit('smart-city-screen-rect',null);
      return;
    }
    const mesh=this.smartCityScreen;
    if(!mesh||!(this.camera instanceof THREE.PerspectiveCamera))return;
    mesh.updateWorldMatrix(true,false);
    const center=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    // Keep the showroom's authored viewing angle, but shift the framing toward
    // the hologram and leave enough distance to operate the table below it.
    const viewBack=this.camera.position.clone().sub(this.cameraTarget).normalize();
    const viewRight=new THREE.Vector3().crossVectors(this.camera.up,viewBack).normalize();
    const viewUp=new THREE.Vector3().crossVectors(viewBack,viewRight).normalize();
    const hologramCenter=this.smartCityHologram?.root.getWorldPosition(new THREE.Vector3());
    const hologramGap=hologramCenter?Math.max(0,hologramCenter.clone().sub(center).dot(viewUp)):0;
    // Aim higher so the rear service screen title and top frame remain visible
    // without losing the table controls or hologram from the same view.
    const target=center.clone().addScaledVector(viewUp,hologramGap*.56);
    const distance=THREE.MathUtils.clamp(this.camera.position.distanceTo(this.cameraTarget)*.61,900,1100);
    const fov=42;
    this.smartCityFocusView={target,camera:target.clone().addScaledVector(viewBack,distance),fov};
    this.smartCityFocusTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera.fov,elapsed:0};
    this.lastSmartCityScreenRect=undefined;
  };
  private onWorldPortalKeyDown=(event:KeyboardEvent)=>{
    const focused=document.activeElement as HTMLElement|null;
    if(this.projectLobbyBoardFocused&&(event.key==='Escape'||event.code==='KeyE')){event.preventDefault();this.exitProjectLobbyBoardFocus();return}
    if(this.recruitmentKioskActive&&event.key==='Escape'){event.preventDefault();this.exitRecruitmentKiosk();return}
    if(this.studentHallBoardActive&&event.key==='Escape'){event.preventDefault();this.exitStudentHallBoardFocus();return}
    if(this.artsCenterPosterActive&&event.key==='Escape'){
      event.preventDefault();this.exitArtsCenterPosterFocus();return;
    }
    if(this.observatoryTelescopeActive&&event.key==='Escape'){
      event.preventDefault();
      this.exitObservatoryTelescope();
      return;
    }
    if(this.governmentWebUiActive&&event.key==='Escape'){
      event.preventDefault();
      this.exitGovernmentWebUi();
      return;
    }
    if(isProjectRoomKioskInteraction(this.projectRoomFocus)&&event.key==='Escape'){
      event.preventDefault();
      this.exitProjectRoomKiosk();
      return;
    }
    if(this.foodTruckKioskId&&event.key==='Escape'){event.preventDefault();this.exitFoodTruckKiosk();return}
    if(event.repeat||this.inputLocked||this.renderer.domElement.style.display==='none'||this.overviewActive||this.bearPhotoMode||(focused&&['INPUT','TEXTAREA','SELECT'].includes(focused.tagName)))return;
    if((event.code==='KeyT'||event.key.toLowerCase()==='t')&&this.pendingHabitatResource){
      event.preventDefault();
      this.onHabitatResourcePositionPlace(this.pendingHabitatResource);
      return;
    }
    if(event.code!=='KeyE')return;
    if(this.personalFarmSleeping){
      event.preventDefault();event.stopImmediatePropagation();this.togglePersonalFarmBed();return;
    }
    if(this.greenhouseNearby?.kind==='plant'){
      event.preventDefault();event.stopImmediatePropagation();gameEvents.emit('greenhouse-observe-plant',this.greenhouseNearby.id);return;
    }
    if(this.greenhouseNearby?.kind==='memory-tree'){
      event.preventDefault();event.stopImmediatePropagation();gameEvents.emit('greenhouse-observe-tree');return;
    }
    if(this.options.personalFarm&&this.personalFarmDoorNearby){
      event.preventDefault();event.stopImmediatePropagation();this.togglePersonalFarmInterior();return;
    }
    if(this.personalFarmActiveSeat||this.personalFarmSeatNearby){
      event.preventDefault();event.stopImmediatePropagation();this.togglePersonalFarmSeat();return;
    }
    if(this.personalFarmBedNearby){
      event.preventDefault();event.stopImmediatePropagation();this.togglePersonalFarmBed();return;
    }
    if(this.smartCityTableNearby){
      event.preventDefault();event.stopImmediatePropagation();gameEvents.emit('smart-city-experience-open');return;
    }
    if(this.projectLobbyBoardNearby){
      event.preventDefault();event.stopImmediatePropagation();this.enterProjectLobbyBoardFocus();return;
    }
    if(this.recruitmentKioskNearby){
      event.preventDefault();event.stopImmediatePropagation();
      gameEvents.emit('recruitment-kiosk-open');
      return;
    }
    if(this.localNpcNearbyId==='recruitment-center-guide-chungnyeong'){
      event.preventDefault();event.stopImmediatePropagation();
      gameEvents.emit('recruitment-guide-open');
      return;
    }
    // Prefer the truck window when its interaction area overlaps a cafe chair.
    // Handling E here also avoids waiting for the React prompt state to settle.
    if(this.nearbyFoodTruckId){
      event.preventDefault();event.stopImmediatePropagation();
      this.enterFoodTruckKiosk(this.nearbyFoodTruckId);return;
    }
    if(this.foodActiveSeat||this.foodSeatNearby){
      event.preventDefault();event.stopImmediatePropagation();this.toggleFoodSeat();return;
    }
    if(this.artsCenterActiveSeat||this.artsCenterSeatNearby){
      event.preventDefault();this.toggleArtsCenterSeat();return;
    }
    if(this.projectRoomActiveSeat||this.projectRoomSeatNearby){
      event.preventDefault();event.stopImmediatePropagation();this.toggleProjectRoomSeat();return;
    }
    if(this.centralPlazaSofaActiveSeat||this.centralPlazaSofaSeatNearby){
      event.preventDefault();event.stopImmediatePropagation();this.toggleCentralPlazaSofaSeat();return;
    }
    if(this.governmentAiCenterNearby){
      event.preventDefault();event.stopImmediatePropagation();
      gameEvents.emit('government-ai-center-start');return;
    }
    if(this.observatoryTelescopeNearby){
      event.preventDefault();
      this.enterObservatoryTelescope();
      return;
    }
    if(this.projectRoomInteractionNearby){
      event.preventDefault();
      if(isProjectRoomKioskInteraction(this.projectRoomInteractionNearby)){
        this.enterProjectRoomKiosk(this.projectRoomInteractionNearby);
        return;
      }
      gameEvents.emit('project-room-interaction-open',this.projectRoomInteractionNearby);
      return;
    }
    if(this.governmentWebUiNearby){
      event.preventDefault();
      this.enterGovernmentWebUi(this.governmentWebUiNearby);
      return;
    }
    const keyPortal=this.activePortal&&!this.activePortal.chargeSeconds
      ?this.activePortal
      :[
        ...(this.options.portal&&this.portalPosition?[{...this.options.portal,...this.portalPosition}]:[]),
        ...(this.options.fixedPortals??[]),
      ].filter(config=>!config.chargeSeconds)
        .map(config=>({config,distance:Math.hypot(this.localX-config.x,this.localZ-config.z)}))
        .sort((a,b)=>a.distance-b.distance)
        .find(candidate=>candidate.distance<KEY_PORTAL_OPEN_DISTANCE)?.config;
    if(this.portalEntryArmed&&keyPortal){
      event.preventDefault();
      if(!this.canUsePortal(keyPortal)){gameEvents.emit('personal-farm-locked');return}
      gameEvents.emit('travel-to-map',keyPortal.destination);return;
    }
    if(this.interactionNearby&&this.options.interaction&&!this.options.interaction.chargeSeconds){
      event.preventDefault();gameEvents.emit('travel-to-map',this.options.interaction.destination);
      return;
    }
    if(this.campusFeaturePortalNearby){
      event.preventDefault();
      if(this.options.studentHallFeatures&&this.campusFeaturePortalNearby==='clubs'){this.enterStudentHallBoardFocus('occupancy');return}
      if(this.options.studentHallFeatures&&this.campusFeaturePortalNearby==='recruit'){this.enterStudentHallBoardFocus('activity');return}
      if(this.campusFeaturePortalNearby==='people'&&this.options.mapName!=='학생회관')gameEvents.emit('travel-to-map','student-hall');
      else if(this.campusFeaturePortalNearby==='government')gameEvents.emit('travel-to-map','project-room');
      else gameEvents.emit('campus-hub-open',this.campusFeaturePortalNearby);
    }
  };
  private onGameInputLock=(locked:boolean)=>{this.inputLocked=locked};
  private onMapTravelFailed=({mapId}:{mapId:MapId})=>{
    if(this.activePortal?.destination===mapId)this.resetPortalCharge();
    if(this.options.interaction?.destination===mapId)this.resetInteractionCharge();
  };
  private onFestivalStageFocusChanged=(active:boolean)=>{
    if(!active){
      this.festivalStageFocusView=undefined;
      this.festivalStageFocusTransition=undefined;
      this.setProjectRoomCharactersVisible(true);
      this.lastFestivalStageScreenRect=undefined;
      gameEvents.emit('festival-stage-screen-rect',null);
      return;
    }
    const stage=this.festivalStageBackdrop;
    if(!stage||!(this.camera instanceof THREE.PerspectiveCamera))return;
    this.setProjectRoomCharactersVisible(false);
    stage.updateWorldMatrix(true,false);
    const bounds=new THREE.Box3().setFromObject(stage),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const normal=new THREE.Vector3(0,0,1).transformDirection(stage.matrixWorld).normalize();
    if(normal.dot(this.camera.position.clone().sub(center))<0)normal.negate();
    const fov=32,verticalFov=THREE.MathUtils.degToRad(fov),horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*this.width/Math.max(1,this.height));
    const distance=Math.max(size.y/(2*Math.tan(verticalFov/2)),size.x/(2*Math.tan(horizontalFov/2)))*1.42;
    const target=center.clone();
    // Aim a little below the backdrop centre so the stage floor and front
    // speakers remain visible, matching a front-row view of the whole stage.
    target.y-=size.y*.12;
    const camera=target.clone().addScaledVector(normal,Math.max(320,distance));
    camera.y+=size.y*.04;
    this.festivalStageFocusView={target,camera,fov};
    this.festivalStageFocusTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera.fov,elapsed:0};
  };
  private onPrimaryPortalPlaceAtPlayer=()=>{
    const config=this.options.portal;
    if(!config?.positionEditable||!this.portalRoot)return;
    const ground=this.sampleExperienceGround(this.localX,this.localZ,true)
      ??this.sampleVisibleSurfaceGround(this.localX,this.localZ)
      ??this.sampleGround(this.localX,this.localZ,this.localGround,true);
    const groundHeight=ground?.height??this.localGround;
    this.portalPosition={x:this.localX,z:this.localZ};
    this.portalRoot.position.set(this.localX,groundHeight+.8,this.worldToSceneZ(this.localZ));
    this.portalRoot.userData.groundHeight=groundHeight;
    this.portalEntryArmed=false;this.portalNearby=false;this.resetPortalCharge();
    localStorage.setItem(`world-portal-position-${this.options.mapName}-${config.destination}`,JSON.stringify(this.portalPosition));
    gameEvents.emit('world-portal-proximity-changed',null);
  };
  private onLocalNpcEncounterFocus=(id:string|null)=>{this.focusedLocalNpcId=id??undefined};
  private onLocalNpcTalking=(id:string|null)=>{this.talkingLocalNpcId=id??undefined};
  private onProjectRoomFocusChanged=(focus?:ProjectRoomInteractionId)=>{
    const wasKiosk=isProjectRoomKioskInteraction(this.projectRoomFocus);
    // Opening the creation form emits the legacy interior-kiosk focus id.
    // Preserve the selected lobby kiosk so its camera and projected DOM rect
    // stay attached to the screen that the player actually activated.
    if(wasKiosk&&isProjectRoomKioskInteraction(focus))return;
    this.projectRoomFocus=focus;
    if(wasKiosk&&!isProjectRoomKioskInteraction(focus)){
      this.projectRoomKioskTransition=undefined;
      this.setProjectRoomCharactersVisible(true);
      this.renderer.domElement.style.cursor='';
      this.lastProjectRoomKioskScreenRect=undefined;
      gameEvents.emit('project-room-kiosk-screen-rect',null);
      gameEvents.emit('project-room-kiosk-mode-changed',false);
    }
  };
  private setProjectRoomCharactersVisible(visible:boolean){
    this.localCharacter.root.visible=visible;
    if(this.guideNpc)this.guideNpc.root.visible=visible;
    this.localNpcs.forEach(npc=>{npc.character.root.visible=visible&&!this.hiddenCharacterIds.has(npc.config.id)});
    this.remotes.forEach(character=>{character.root.visible=visible});
  }
  private enterProjectRoomKiosk=(requestedId?:ProjectRoomKioskInteractionId)=>{
    const id=isProjectRoomKioskInteraction(requestedId)
      ?requestedId
      :isProjectRoomKioskInteraction(this.projectRoomInteractionNearby)
        ?this.projectRoomInteractionNearby
        :'project-kiosk';
    const screen=this.projectRoomKioskScreens.get(id),view=this.projectRoomKioskViews.get(id);
    if(!screen||!view)return;
    this.projectRoomFocus=id;
    this.projectRoomKioskScreen=screen;
    this.projectRoomKioskView=view;
    this.setProjectRoomCharactersVisible(false);
    this.renderer.domElement.style.cursor='pointer';
    this.lastProjectRoomKioskScreenRect=undefined;
    gameEvents.emit('project-room-kiosk-screen-rect',null);
    this.projectRoomKioskTransition={
      target:this.cameraTarget.clone(),
      camera:this.camera.position.clone(),
      fov:this.camera instanceof THREE.PerspectiveCamera?this.camera.fov:35,
      elapsed:0,
    };
    gameEvents.emit('project-room-kiosk-mode-changed',true);
  };
  private exitProjectRoomKiosk=()=>{
    if(!isProjectRoomKioskInteraction(this.projectRoomFocus))return;
    this.projectRoomFocus=undefined;
    this.projectRoomKioskTransition=undefined;
    this.setProjectRoomCharactersVisible(true);
    this.renderer.domElement.style.cursor='';
    this.lastProjectRoomKioskScreenRect=undefined;
    gameEvents.emit('project-room-kiosk-screen-rect',null);
    gameEvents.emit('project-room-kiosk-mode-changed',false);
  };
  private projectedMeshScreenRect(mesh:THREE.Mesh){
    mesh.geometry.computeBoundingBox();
    const bounds=mesh.geometry.boundingBox;
    if(!bounds)return undefined;
    mesh.updateWorldMatrix(true,false);
    const canvasBounds=this.renderer.domElement.getBoundingClientRect();
    const corners=[
      [bounds.min.x,bounds.min.y,bounds.min.z],
      [bounds.min.x,bounds.max.y,bounds.min.z],
      [bounds.max.x,bounds.min.y,bounds.min.z],
      [bounds.max.x,bounds.max.y,bounds.min.z],
      [bounds.min.x,bounds.min.y,bounds.max.z],
      [bounds.min.x,bounds.max.y,bounds.max.z],
      [bounds.max.x,bounds.min.y,bounds.max.z],
      [bounds.max.x,bounds.max.y,bounds.max.z],
    ].map(([x,y,z])=>new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(this.camera));
    const left=canvasBounds.left+(Math.min(...corners.map(point=>point.x))+1)*.5*canvasBounds.width;
    const right=canvasBounds.left+(Math.max(...corners.map(point=>point.x))+1)*.5*canvasBounds.width;
    const top=canvasBounds.top+(1-Math.max(...corners.map(point=>point.y)))*.5*canvasBounds.height;
    const bottom=canvasBounds.top+(1-Math.min(...corners.map(point=>point.y)))*.5*canvasBounds.height;
    return {left,top,width:right-left,height:bottom-top};
  }
  private syncArtsCenterPosterScreenRect(){
    if(!this.artsCenterPosterActive)return;
    const rect=this.projectedMeshScreenRect(this.artsCenterPosterActive);
    if(!rect)return;
    const previous=this.lastArtsCenterPosterScreenRect;
    if(previous&&Math.abs(previous.left-rect.left)<.5&&Math.abs(previous.top-rect.top)<.5&&Math.abs(previous.width-rect.width)<.5&&Math.abs(previous.height-rect.height)<.5)return;
    this.lastArtsCenterPosterScreenRect=rect;
    gameEvents.emit('arts-center-poster-screen-rect',rect);
  }
  private syncArtsCenterStageScreenRect(){
    if(!this.artsCenterActiveSeat||!this.artsCenterStageBackdrop)return;
    const rect=this.projectedMeshScreenRect(this.artsCenterStageBackdrop);
    if(!rect||rect.width<2||rect.height<2)return;
    const previous=this.lastArtsCenterStageScreenRect;
    if(previous&&Math.abs(previous.left-rect.left)<.5&&Math.abs(previous.top-rect.top)<.5&&Math.abs(previous.width-rect.width)<.5&&Math.abs(previous.height-rect.height)<.5)return;
    this.lastArtsCenterStageScreenRect=rect;
    gameEvents.emit('arts-center-stage-screen-rect',rect);
  }
  private syncFestivalStageScreenRect(){
    // Projecting the stage bounds reads layout and used to notify React on
    // every movement frame, rerendering the entire experience overlay even
    // while the stage video was closed. Only the focused video view needs it.
    if(!this.festivalStageFocusView||!this.festivalStageBackdrop)return;
    const rect=this.projectedMeshScreenRect(this.festivalStageBackdrop);
    if(!rect||rect.width<2||rect.height<2)return;
    const previous=this.lastFestivalStageScreenRect;
    if(previous&&Math.abs(previous.left-rect.left)<.5&&Math.abs(previous.top-rect.top)<.5&&Math.abs(previous.width-rect.width)<.5&&Math.abs(previous.height-rect.height)<.5)return;
    this.lastFestivalStageScreenRect=rect;
    gameEvents.emit('festival-stage-screen-rect',rect);
  }
  private projectedMeshScreenQuad(mesh:THREE.Mesh,preserveLandscapeAxis=false){
    mesh.geometry.computeBoundingBox();
    const bounds=mesh.geometry.boundingBox;
    if(!bounds)return undefined;
    mesh.updateWorldMatrix(true,false);
    const canvasBounds=this.renderer.domElement.getBoundingClientRect();
    const toScreen=(point:THREE.Vector3)=>{
      point.applyMatrix4(mesh.matrixWorld).project(this.camera);
      return {x:canvasBounds.left+(point.x+1)*.5*canvasBounds.width,y:canvasBounds.top+(1-point.y)*.5*canvasBounds.height};
    };
    const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const thinAxis=size.x<=size.y&&size.x<=size.z?'x':size.y<=size.z?'y':'z';
    const corners=thinAxis==='x'
      ?[
        new THREE.Vector3(center.x,bounds.min.y,bounds.min.z),new THREE.Vector3(center.x,bounds.min.y,bounds.max.z),
        new THREE.Vector3(center.x,bounds.max.y,bounds.max.z),new THREE.Vector3(center.x,bounds.max.y,bounds.min.z),
      ]
      :thinAxis==='y'
        ?[
          new THREE.Vector3(bounds.min.x,center.y,bounds.min.z),new THREE.Vector3(bounds.max.x,center.y,bounds.min.z),
          new THREE.Vector3(bounds.max.x,center.y,bounds.max.z),new THREE.Vector3(bounds.min.x,center.y,bounds.max.z),
        ]
        :[
          new THREE.Vector3(bounds.min.x,bounds.min.y,center.z),new THREE.Vector3(bounds.max.x,bounds.min.y,center.z),
          new THREE.Vector3(bounds.max.x,bounds.max.y,center.z),new THREE.Vector3(bounds.min.x,bounds.max.y,center.z),
        ];
    const projectedCorners=corners.map(toScreen);
    if(preserveLandscapeAxis&&thinAxis==='x'){
      const [bottomA,bottomB,topB,topA]=projectedCorners;
      // The lobby board's long authored axis is local Z. Preserve that axis as
      // HTML width instead of re-sorting all corners by screen Y, which turns
      // the landscape dashboard into a portrait layout at oblique angles.
      return topA.x<=topB.x?[topA,topB,bottomB,bottomA] as const:[topB,topA,bottomA,bottomB] as const;
    }
    const points=projectedCorners.sort((a,b)=>a.y-b.y);
    const top=points.slice(0,2).sort((a,b)=>a.x-b.x),bottom=points.slice(2).sort((a,b)=>a.x-b.x);
    return [top[0],top[1],bottom[1],bottom[0]] as const;
  }
  private syncStudentHallBoardScreenRects(){
    if(!this.options.studentHallFeatures||!this.studentHallBoardScreens.size)return;
    const screens:Partial<Record<StudentHallBoardId,StudentHallBoardScreenRect>>={};
    let changed=false;
    this.studentHallBoardScreens.forEach((mesh,id)=>{
      const rect=this.projectedMeshScreenRect(mesh),quad=this.projectedMeshScreenQuad(mesh);
      if(!rect||!quad||rect.width<2||rect.height<2)return;
      const next={...rect,quad},previous=this.lastStudentHallBoardRects.get(id);
      screens[id]=next;
      if(!previous||Math.abs(previous.left-next.left)>.5||Math.abs(previous.top-next.top)>.5||Math.abs(previous.width-next.width)>.5||Math.abs(previous.height-next.height)>.5)changed=true;
      this.lastStudentHallBoardRects.set(id,next);
    });
    if(changed)gameEvents.emit('student-hall-board-screen-rects',screens);
  }
  private syncProjectLobbyBoardScreenRect(){
    if(!this.projectLobbyBoardScreen)return;
    const rect=this.projectedMeshScreenRect(this.projectLobbyBoardScreen),quad=this.projectedMeshScreenQuad(this.projectLobbyBoardScreen,true);
    if(!rect||!quad||rect.width<2||rect.height<2)return;
    const next={...rect,quad},previous=this.lastProjectLobbyBoardRect;
    if(previous&&Math.abs(previous.left-next.left)<.5&&Math.abs(previous.top-next.top)<.5&&Math.abs(previous.width-next.width)<.5&&Math.abs(previous.height-next.height)<.5)return;
    this.lastProjectLobbyBoardRect=next;
    gameEvents.emit('project-lobby-board-screen-rect',next);
  }
  private getProjectRoomKioskScreenRect(){
    if(!this.projectRoomKioskScreen)return undefined;
    return this.projectedMeshScreenRect(this.projectRoomKioskScreen);
  }
  private syncProjectRoomKioskScreenRect(){
    const rect=this.getProjectRoomKioskScreenRect();
    if(!rect)return;
    const previous=this.lastProjectRoomKioskScreenRect;
    if(previous&&Math.abs(previous.left-rect.left)<.75&&Math.abs(previous.top-rect.top)<.75&&Math.abs(previous.width-rect.width)<.75&&Math.abs(previous.height-rect.height)<.75)return;
    this.lastProjectRoomKioskScreenRect=rect;
    gameEvents.emit('project-room-kiosk-screen-rect',rect);
  }
  private onProjectRoomKioskPointerDown=(event:PointerEvent)=>{
    if(!isProjectRoomKioskInteraction(this.projectRoomFocus)||!this.projectRoomKioskScreen||this.projectRoomKioskTransition)return;
    // Once the projected React interface is open, every interaction must stay
    // inside that HTML surface. Letting the capture listener continue for the
    // browse or my-project pages would also click the canvas menu underneath.
    if(event.target instanceof Element&&event.target.closest('.project-room-panel'))return;
    const rect=this.getProjectRoomKioskScreenRect();
    if(!rect||event.clientX<rect.left||event.clientX>rect.left+rect.width||event.clientY<rect.top||event.clientY>rect.top+rect.height)return;
    event.preventDefault();
    event.stopPropagation();
    const x=(event.clientX-rect.left)/Math.max(1,rect.width)*512;
    const y=(event.clientY-rect.top)/Math.max(1,rect.height)*900;
    if(x>420&&y<115){this.exitProjectRoomKiosk();return}
    if(y>=250&&y<=400){gameEvents.emit('project-room-kiosk-selection','create');return}
    if(y>=395&&y<=545){gameEvents.emit('project-room-kiosk-selection','board');return}
    if(y>=535&&y<=690)gameEvents.emit('project-room-kiosk-selection','mine');
  };
  private createProjectRoomScreenTexture(kind:'board'|'recommendation'|'kiosk'){
    const dimensions=kind==='recommendation'?[1536,448]:kind==='board'?[1024,536]:[512,900];
    const canvas=document.createElement('canvas');
    [canvas.width,canvas.height]=dimensions;
    const context=canvas.getContext('2d')!;
    const width=canvas.width,height=canvas.height;
    const rounded=(x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string)=>{
      context.beginPath();context.roundRect(x,y,w,h,r);context.fillStyle=fill;context.fill();
      if(stroke){context.strokeStyle=stroke;context.lineWidth=Math.max(2,width/400);context.stroke()}
    };
    const text=(value:string,x:number,y:number,size:number,color:string,weight=700,align:CanvasTextAlign='left')=>{
      context.fillStyle=color;context.font=`${weight} ${size}px "Noto Sans KR","Apple SD Gothic Neo",sans-serif`;
      context.textAlign=align;context.textBaseline='middle';context.fillText(value,x,y);
    };
    const tag=(value:string,x:number,y:number,w:number)=>{
      rounded(x,y,w,30,15,'#e8f6f1');text(value,x+w/2,y+15,14,'#24715f',800,'center');
    };
    context.fillStyle='#f5faf8';context.fillRect(0,0,width,height);
    context.fillStyle='#16a17f';context.fillRect(0,0,width,kind==='kiosk'?14:12);

    if(kind==='recommendation'){
      context.fillStyle='#071f1c';context.fillRect(0,0,width,height);
      const statusGlow=context.createLinearGradient(0,0,width,0);
      statusGlow.addColorStop(0,'rgba(23,151,122,.22)');statusGlow.addColorStop(.52,'rgba(18,74,67,.10)');statusGlow.addColorStop(1,'rgba(97,74,181,.20)');
      context.fillStyle=statusGlow;context.fillRect(0,0,width,height);
      text('PROJECT STATUS',54,45,17,'#66e5c8',900);
      text('프로젝트 현황',54,83,34,'#ffffff',900);
      text('공동캠퍼스 프로젝트실 · LIVE',width-54,69,16,'#a9cbc3',700,'right');
      const stats=[
        ['오늘 생성','18','개','#58d9ba'],
        ['진행 중','42','개','#78b7ff'],
        ['모집 중','12','개','#c49cff'],
        ['오늘 완료','7','개','#ffd17c'],
        ['현재 프로젝트실','23','명','#ff8e9d'],
      ];
      const gap=18,margin=52,cardWidth=(width-margin*2-gap*4)/5;
      stats.forEach(([label,value,unit,color],index)=>{
        const x=margin+index*(cardWidth+gap);
        rounded(x,124,cardWidth,242,22,'rgba(12,48,43,.92)',index===4?'#ff8e9d':'#2d675b');
        rounded(x+20,145,44,8,4,color);
        text(label,x+20,191,index===4?18:20,'#b8d3cd',800);
        text(value,x+20,271,64,'#ffffff',900);
        text(unit,x+cardWidth-22,281,22,color,900,'right');
        text(index===4?'● LIVE':'↗ 실시간 집계',x+20,335,14,index===4?'#ff9cab':'#70b6a6',800);
      });
    }else if(kind==='board'){
      context.fillStyle='#f3faf7';context.fillRect(0,0,width,height);
      const scheduleGlow=context.createLinearGradient(0,0,width,height);
      scheduleGlow.addColorStop(0,'rgba(46,175,139,.13)');scheduleGlow.addColorStop(1,'rgba(111,91,196,.08)');
      context.fillStyle=scheduleGlow;context.fillRect(0,0,width,height);
      text('SEJONG SCHEDULE BOARD',38,38,15,'#198b70',900);
      text('세종 일정 보드',38,76,30,'#153f37',900);
      text('TODAY · LIVE',width-38,55,14,'#6a817a',800,'right');
      rounded(34,112,548,374,22,'#ffffff','#cce5dc');
      text('오늘의 세종',58,144,21,'#174a40',900);
      text('🎉  진행 중 행사',58,183,18,'#7b5ac7',900);
      const events=['야간 분수쇼','조치원 복숭아축제','국립수목원 특별전'];
      events.forEach((event,index)=>{
        rounded(56,210+index*72,500,56,14,index===0?'#eaf8f3':'#f6faf8');
        rounded(70,226+index*72,24,24,12,index===0?'#20a07f':'#b5d9cd');
        text(String(index+1),82,238+index*72,12,'#ffffff',900,'center');
        text(event,110,238+index*72,17,'#244d44',800);
        text(index===0?'진행 중':'오늘',532,238+index*72,13,index===0?'#16856c':'#7a918b',800,'right');
      });
      rounded(608,112,382,110,20,'#0e3b34','#2f7768');
      text('📅  이번 주 일정',632,146,17,'#72e2c7',900);
      text('행사 8 · 전시 4 · 체험 6',632,186,20,'#ffffff',900);
      rounded(608,238,382,110,20,'#ffffff','#d2e5de');
      text('🔥  인기 장소',632,272,17,'#d86d4d',900);
      text('세종호수공원 · 조치원시장',632,312,17,'#274f46',800);
      rounded(608,364,382,122,20,'#eaf5ff','#bfd8ed');
      text('🌤  오늘의 날씨',632,399,17,'#3977a7',900);
      text('24°C  맑음',632,442,25,'#174866',900);
      text('야외 활동 좋아요',966,442,14,'#56809b',800,'right');
    }else if(false&&kind==='recommendation'){
      text('AI PROJECT MATCH',58,52,18,'#20a080',900);
      text('나에게 맞는 프로젝트',58,94,35,'#173f37',900);
      text('체험 기록과 관심사를 바탕으로 추천했어요',width-58,94,18,'#68827a',600,'right');
      const cards=[
        ['94%','수목원 사진 기록','자연 · 사진','기록 큐레이터'],
        ['88%','야간축제 탐방','축제 · 문화','코스 플래너'],
        ['82%','전통시장 문화 기록','조사 · 인터뷰','현장 리서처'],
      ];
      cards.forEach((card,index)=>{
        const x=54+index*494;
        rounded(x,145,450,250,22,'#ffffff','#cfe5dc');
        rounded(x+24,169,72,72,18,index===0?'#dff4e8':index===1?'#eee8fa':'#f9eadf');
        text(index===0?'🌿':index===1?'✨':'📷',x+60,205,32,'#173f37',700,'center');
        text(card[0],x+422,183,27,'#16856c',900,'right');
        text(card[1],x+24,275,24,'#1d463d',900);
        tag(card[2],x+24,309,116);
        text(`추천 역할  ${card[3]}`,x+24,365,15,'#5c756e',700);
      });
    }else if(false){
      text('PROJECT BOARD',42,50,17,'#1b8d72',900);
      text('모집 중인 프로젝트',42,92,31,'#173f37',900);
      const cards=[
        ['수목원 사진 기록 프로젝트','사진 · 자연','3/5명'],
        ['세종 야간축제 탐방','축제 · 문화','2/6명'],
        ['전통시장 문화 기록','조사 · 인터뷰','4/6명'],
      ];
      cards.forEach((card,index)=>{
        const y=132+index*123;
        rounded(38,y,width-76,101,18,'#ffffff','#d4e6df');
        rounded(55,y+20,10,61,5,index===0?'#25a47f':index===1?'#8a6ad2':'#d38a53');
        text(card[0],84,y+32,22,'#1e473e',900);
        text(card[1],84,y+67,15,'#648078',700);
        text(card[2],width-60,y+50,18,'#188169',900,'right');
      });
      text('가까이에서 E를 눌러 프로젝트를 확인하세요',width/2,height-28,15,'#668078',700,'center');
    }else{
      const card=(y:number,icon:string,title:string,primary=false)=>{
        rounded(34,y,width-68,120,20,primary?'#15977c':'#143c35',primary?'#53e5c5':'#2a5b51');
        rounded(52,y+25,70,70,16,primary?'rgba(255,255,255,.14)':'#214d45');
        text(icon,87,y+60,34,'#ffffff',700,'center');
        text(title,144,y+66,22,'#ffffff',900);
        text('›',width-55,y+59,42,'#ffffff',400,'center');
      };
      context.fillStyle='#071f1c';context.fillRect(12,12,width-24,height-24);
      const glow=context.createRadialGradient(width*.68,height*.34,10,width*.68,height*.34,width*.75);
      glow.addColorStop(0,'rgba(14,117,91,.34)');glow.addColorStop(1,'rgba(5,34,29,0)');
      context.fillStyle=glow;context.fillRect(12,12,width-24,height-24);
      text('PROJECT KIOSK',36,62,15,'#68e8cd',900);
      rounded(width-74,34,42,42,11,'#f7fbf9');
      text('×',width-53,55,29,'#173f37',400,'center');
      text('공동캠퍼스 프로젝트실',36,105,15,'#c2ded7',800);
      text('체험 탐험가님, 무엇을 할까요?',36,154,29,'#ffffff',900);
      text('화면에서 원하는 기능을 선택하세요.',36,196,14,'#b0cec6',600);
      context.fillStyle='rgba(108,205,181,.22)';context.fillRect(34,231,width-68,1);
      card(267,'＋','새 프로젝트 시작하기',true);
      card(407,'⌕','프로젝트 둘러보기');
      card(547,'▱','내 프로젝트');
      text('화면을 터치하거나 항목을 선택하세요',36,height-54,12,'#9bc3ba',600);
      rounded(width-82,height-78,48,34,9,'#123b34','#3f6e63');
      text('ESC',width-58,height-61,12,'#d8eee8',800,'center');
    }
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=textureAnisotropy;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.magFilter=THREE.LinearFilter;
    this.projectRoomScreenTextures.push(texture);
    return texture;
  }
  private syncSmartCityScreenRect(){
    if(!this.smartCityScreen)return;
    const rect=this.projectedMeshScreenRect(this.smartCityScreen),quad=this.projectedMeshScreenQuad(this.smartCityScreen);
    if(!rect||!quad||rect.width<2||rect.height<2)return;
    const next={...rect,quad},previous=this.lastSmartCityScreenRect;
    if(previous&&Math.abs(previous.left-next.left)<.5&&Math.abs(previous.top-next.top)<.5&&Math.abs(previous.width-next.width)<.5&&Math.abs(previous.height-next.height)<.5)return;
    this.lastSmartCityScreenRect=next;gameEvents.emit('smart-city-screen-rect',next);
  }
  private syncSmartCityWallScreenRects(){
    if(!this.smartCityWallScreens.size)return;
    const screens:Partial<Record<'city'|'future'|'connected',ProjectLobbyBoardScreenRect>>={};
    let changed=false;
    this.smartCityWallScreens.forEach((mesh,id)=>{
      const rect=this.projectedMeshScreenRect(mesh),quad=this.projectedMeshScreenQuad(mesh);
      if(!rect||!quad||rect.width<2||rect.height<2)return;
      const next={...rect,quad},previous=this.lastSmartCityWallRects.get(id);
      screens[id]=next;
      if(!previous||Math.abs(previous.left-next.left)>=.5||Math.abs(previous.top-next.top)>=.5||Math.abs(previous.width-next.width)>=.5||Math.abs(previous.height-next.height)>=.5)changed=true;
      this.lastSmartCityWallRects.set(id,next);
    });
    if(changed)gameEvents.emit('smart-city-wall-screen-rects',screens);
  }
  private setupProjectRoomScreens(model:THREE.Object3D){
    // Make both lobby kiosks easier to see and use while preserving their
    // authored positions and proportions.
    ['Lobby_NewProject_Kiosk','Lobby_NewProject_Kiosk_2'].forEach(name=>{
      model.getObjectByName(name)?.scale.multiplyScalar(1.5);
    });
    const screens=[
      {anchor:'Idea_Board_Frame',surface:'Idea_Board_Frame',kind:'board' as const,size:[4.18,2.18] as const,position:[.121,0,0] as const,rotationY:Math.PI/2,hide:['Idea_Board_Card_','Idea_Board_Status_','Idea_Board_Title_Line']},
      {anchor:'Project_Screen_Frame',surface:'Project_Screen_Frame',kind:'recommendation' as const,size:[7.35,2.08] as const,position:[0,0,.121] as const,rotationY:0,hide:['Project_Screen_Card_','Project_Screen_Title_Line']},
      {anchor:'Lobby_Kiosk_Screen',surface:'Lobby_Kiosk_Screen',kind:'kiosk' as const,kioskId:'lobby-kiosk-1' as const,kioskRoot:'Lobby_NewProject_Kiosk',size:[.98,2.1] as const,position:[0,0,.04] as const,rotationY:0,hide:[]},
      {anchor:'Lobby_Kiosk_Screen_2',surface:'Lobby_Kiosk_Screen_2',kind:'kiosk' as const,kioskId:'lobby-kiosk-2' as const,kioskRoot:'Lobby_NewProject_Kiosk_2',size:[.98,2.1] as const,position:[0,0,.04] as const,rotationY:0,hide:[]},
    ];
    screens.forEach(config=>{
      const {anchor,surface,kind,size,position,rotationY,hide}=config;
      if(!model.getObjectByName(anchor))return;
      const target=model.getObjectByName(surface);
      if(!(target instanceof THREE.Mesh))return;
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshBasicMaterial({
        map:this.createProjectRoomScreenTexture(kind),
        color:0xffffff,
        side:THREE.DoubleSide,
        toneMapped:false,
        polygonOffset:true,
        polygonOffsetFactor:-4,
        polygonOffsetUnits:-4,
      }));
      panel.name=`project-room-live-screen-${'kioskId' in config?config.kioskId:kind}`;
      panel.position.set(position[0],position[1],position[2]);
      panel.rotation.y=rotationY;
      panel.renderOrder=5;
      target.add(panel);
      if(kind==='kiosk'&&'kioskId' in config){
        target.updateWorldMatrix(true,false);
        const kioskRoot=model.getObjectByName(config.kioskRoot)??target;
        const kioskCenter=new THREE.Box3().setFromObject(kioskRoot).getCenter(new THREE.Vector3());
        const screenNormal=new THREE.Vector3(0,0,1).transformDirection(target.matrixWorld).normalize();
        const isLobbyKiosk=config.kioskId==='lobby-kiosk-1'||config.kioskId==='lobby-kiosk-2';
        // The lobby kiosks are displayed at 1.5x scale, so frame them from a
        // little farther away to keep the complete screen bezel in view.
        const cameraDistance=isLobbyKiosk?1100:900;
        const view={
          target:kioskCenter.clone().add(new THREE.Vector3(0,isLobbyKiosk?0:15,0)),
          camera:kioskCenter.clone().addScaledVector(screenNormal,cameraDistance).add(new THREE.Vector3(0,isLobbyKiosk?45:60,0)),
        };
        this.projectRoomKioskScreens.set(config.kioskId,panel);
        this.projectRoomKioskViews.set(config.kioskId,view);
      }
      model.traverse(object=>{if(hide.some(prefix=>object.name.startsWith(prefix)))object.visible=false});
    });
    const lobbyBoard=model.getObjectByName('Lobby_AI_Board_Surface');
    if(lobbyBoard instanceof THREE.Mesh){
      this.projectLobbyBoardScreen=lobbyBoard;
      const boardBounds=new THREE.Box3().setFromObject(lobbyBoard);
      const boardCenter=boardBounds.getCenter(new THREE.Vector3()),boardSize=boardBounds.getSize(new THREE.Vector3());
      this.projectLobbyBoardPosition={
        x:boardCenter.x,
        z:this.sceneToWorldZ(boardCenter.z),
        radius:THREE.MathUtils.clamp(Math.max(boardSize.x,boardSize.z)*.9,320,520),
      };
      const authoredBoardParts=['Lobby_AI_Board_Title','Lobby_AI_Project_Card_','Lobby_AI_Project_Image_','Lobby_AI_Project_Title_','Lobby_AI_Project_Score_'];
      model.traverse(object=>{if(authoredBoardParts.some(prefix=>object.name.startsWith(prefix)))object.visible=false});
    }
  }
  private createRecruitmentKioskTexture(){
    const canvas=document.createElement('canvas');canvas.width=680;canvas.height=850;
    const context=canvas.getContext('2d')!,rounded=(x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string)=>{
      context.beginPath();context.roundRect(x,y,w,h,r);context.fillStyle=fill;context.fill();
      if(stroke){context.strokeStyle=stroke;context.lineWidth=2;context.stroke()}
    },text=(value:string,x:number,y:number,size:number,color:string,weight=700,align:CanvasTextAlign='left')=>{
      context.font=`${weight} ${size}px "Noto Sans KR",sans-serif`;context.fillStyle=color;context.textAlign=align;context.textBaseline='middle';context.fillText(value,x,y);
    };
    const gradient=context.createLinearGradient(0,0,680,850);gradient.addColorStop(0,'#fbfdfc');gradient.addColorStop(1,'#eef5f2');
    context.fillStyle=gradient;context.fillRect(0,0,680,850);
    context.strokeStyle='#1f735f';context.lineWidth=7;context.lineCap='round';
    context.beginPath();context.arc(91,101,18,0,Math.PI*2);context.moveTo(63,145);context.quadraticCurveTo(91,111,119,145);context.stroke();
    context.beginPath();context.arc(113,105,14,0,Math.PI*2);context.moveTo(99,126);context.quadraticCurveTo(119,116,132,143);context.stroke();
    text('모집센터 공용 키오스크',150,99,31,'#164f42',900);
    text('누가 눌러도 같은 화면',150,137,17,'#66746f',700);
    rounded(620,35,34,34,8,'#eef4f2','#cad8d3');text('×',637,52,22,'#6a827b',500,'center');
    const rows=[
      ['01','모집 둘러보기','오늘 · 전체 · 인기 모집','⌕'],
      ['02','오늘 일정','14:00 AI스터디 · 15:00 사진출사','▦'],
      ['03','이용 방법','모집 작성 → 신청 → 승인 → 활동','?'],
      ['04','공지사항','오늘 행사 · 점검 · 운영','◀'],
      ['05','FAQ','프로젝트 · 승인 · 동아리','♡'],
    ];
    rows.forEach(([number,title,copy,icon],index)=>{
      const y=190+index*108;rounded(55,y,570,86,17,'rgba(255,255,255,.9)','#d4dfdb');
      rounded(75,y+14,58,58,13,'#237c66');text(number,104,y+43,17,'#fff',900,'center');
      text(icon,165,y+43,29,'#247965',800,'center');text(title,202,y+30,21,'#172522',900);text(copy,202,y+59,14,'#697770',650);text('›',590,y+43,30,'#196c59',800,'center');
    });
    text('ⓘ  화면을 터치해 메뉴를 선택해주세요!',340,800,16,'#377a69',800,'center');
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
    this.recruitmentKioskTexture=texture;return texture;
  }
  private setupRecruitmentKioskWeb(model:THREE.Object3D){
    const target=model.getObjectByName('Kiosk_Screen');
    if(!(target instanceof THREE.Mesh))return;
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.34,1.68),new THREE.MeshBasicMaterial({
      map:this.createRecruitmentKioskTexture(),color:0xffffff,side:THREE.FrontSide,toneMapped:false,
      polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5,
    }));
    panel.name='Recruitment_Kiosk_Web_Surface';panel.position.z=.008;panel.renderOrder=8;target.add(panel);
    target.updateWorldMatrix(true,true);
    const bounds=new THREE.Box3().setFromObject(panel),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const normal=new THREE.Vector3(0,0,1).transformDirection(target.matrixWorld).normalize();
    const approach=center.clone().addScaledVector(normal,185);
    this.recruitmentKioskPosition={x:approach.x,z:this.sceneToWorldZ(approach.z),radius:250};
    const fov=32,verticalFov=THREE.MathUtils.degToRad(fov),horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*this.width/Math.max(1,this.height));
    // Keep the full physical kiosk and a band of the surrounding room visible.
    // A screen-only fit looked like a floating browser window rather than a
    // visitor standing naturally in front of the device.
    const distance=Math.max(size.y/(2*Math.tan(verticalFov/2)),size.x/(2*Math.tan(horizontalFov/2)))*1.62;
    this.recruitmentKioskScreen=panel;
    this.recruitmentKioskView={target:center,camera:center.clone().addScaledVector(normal,Math.max(260,distance)),fov};
  }
  private syncRecruitmentKioskRect(){
    if(!this.recruitmentKioskActive||!this.recruitmentKioskScreen)return;
    const rect=this.projectedMeshScreenRect(this.recruitmentKioskScreen);if(!rect||rect.width<2||rect.height<2)return;
    const previous=this.lastRecruitmentKioskRect;
    if(previous&&Math.abs(previous.left-rect.left)<.5&&Math.abs(previous.top-rect.top)<.5&&Math.abs(previous.width-rect.width)<.5&&Math.abs(previous.height-rect.height)<.5)return;
    this.lastRecruitmentKioskRect=rect;gameEvents.emit('recruitment-kiosk-screen-rect',rect);
  }
  private enterRecruitmentKiosk=()=>{
    if(!this.recruitmentKioskView||this.recruitmentKioskActive||!(this.camera instanceof THREE.PerspectiveCamera))return;
    this.recruitmentKioskActive=true;this.lastRecruitmentKioskRect=undefined;
    this.recruitmentKioskTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera.fov,elapsed:0};
    this.setProjectRoomCharactersVisible(false);gameEvents.emit('recruitment-kiosk-mode-changed',true);
  };
  private exitRecruitmentKiosk=()=>{
    if(!this.recruitmentKioskActive)return;
    this.recruitmentKioskActive=false;this.recruitmentKioskTransition=undefined;this.lastRecruitmentKioskRect=undefined;
    this.setProjectRoomCharactersVisible(true);gameEvents.emit('recruitment-kiosk-screen-rect',null);gameEvents.emit('recruitment-kiosk-mode-changed',false);
  };
  private createGovernmentWebUiTexture(id:GovernmentCentralPlazaWebUiId,label:string,eyebrow:string){
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
    const context=canvas.getContext('2d')!,rounded=(x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string)=>{
      context.beginPath();context.roundRect(x,y,w,h,r);context.fillStyle=fill;context.fill();
      if(stroke){context.strokeStyle=stroke;context.lineWidth=2;context.stroke()}
    },text=(value:string,x:number,y:number,size:number,color:string,weight=700,align:CanvasTextAlign='left')=>{
      context.font=`${weight} ${size}px "Noto Sans KR",sans-serif`;context.fillStyle=color;context.textAlign=align;context.textBaseline='middle';context.fillText(value,x,y);
    };
    const gradient=context.createLinearGradient(0,0,1280,720);gradient.addColorStop(0,'#071f2b');gradient.addColorStop(.55,'#0b3442');gradient.addColorStop(1,'#102a38');
    context.fillStyle=gradient;context.fillRect(0,0,1280,720);
    context.fillStyle='rgba(67,218,220,.12)';context.beginPath();context.arc(1050,100,360,0,Math.PI*2);context.fill();
    text(eyebrow,58,58,21,'#5ce8e3',900);text(label,58,112,44,'#ffffff',900);text('AI 세종 추천센터',1220,62,21,'#9bcbd0',800,'right');
    context.fillStyle='rgba(123,224,224,.22)';context.fillRect(58,150,1164,2);
    if(id==='experience-analysis'){
      rounded(70,210,1140,320,24,'rgba(255,255,255,.055)','#315f69');text('📁',126,280,48,'#6ce9e1',800,'center');
      text('세종 AI 라이프 프로젝트',190,270,32,'#ffffff',900);text('메타버스 활동과 방문 기록을 분석할 준비가 되었습니다.',190,320,20,'#a9d0d2',650);
      [['프로젝트','3개'],['참여자','2명'],['수집 신호','18개']].forEach(([name,value],index)=>{const x=190+index*300;text(name,x,414,17,'#83b9bd',700);text(value,x,456,27,'#dfffff',900)});
      rounded(410,590,460,58,15,'#167f79','#5ce4dc');text('프로젝트 데이터 준비 완료',640,619,20,'#ffffff',900,'center');
    }else if(id==='course-recommendation'){
      text('AI READY',640,250,42,'#78eee7',950,'center');text('프로필 분석을 시작하세요.',640,318,29,'#ffffff',850,'center');
      text('AI가 지금까지의 경험을 분석해 나만의 세종을 만들어드립니다.',640,365,18,'#9fc8cb',650,'center');
      [110,155,200].forEach((radius,index)=>{context.beginPath();context.ellipse(640,510,radius,radius*.25,0,0,Math.PI*2);context.strokeStyle=index===0?'#73eee8':'rgba(87,214,220,.46)';context.lineWidth=index===0?4:2;context.stroke()});
      rounded(505,585,270,58,15,'#208c75','#67e7bd');text('E  ·  AI 분석 시작',640,614,20,'#ffffff',900,'center');
    }else{
      rounded(70,210,1140,320,24,'rgba(255,255,255,.055)','#315f69');text('일정 저장 대기 중',640,292,35,'#ffffff',900,'center');
      text('AI 분석이 끝나면 개인 맞춤 세종 여행 일정이 이곳에 표시됩니다.',640,358,21,'#a8ced0',650,'center');
      text('QR  ·  PDF  ·  모바일 저장',640,438,20,'#64dfd7',850,'center');
      rounded(445,590,390,58,15,'#244e59','#356b75');text('추천 경로를 기다리는 중...',640,619,19,'#a9d0d2',800,'center');
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
    this.governmentWebUiTextures.push(texture);return texture;
  }
  private setupGovernmentWebUi(model:THREE.Object3D){
    // Use the authored save-course marker as the single source of truth for
    // the return portal instead of a hand-tuned plaza coordinate.
    if(this.options.mapName==='중앙광장'&&this.options.portal?.destination==='government'){
      const marker=model.getObjectByName('Marker_SaveCourse');
      if(marker){
        const markerPosition=new THREE.Vector3();
        marker.getWorldPosition(markerPosition);
        this.options.portal.x=markerPosition.x;
        this.options.portal.z=this.sceneToWorldZ(markerPosition.z);
        this.portalPosition={x:markerPosition.x,z:this.options.portal.z};
      }
    }
    // Turn the side displays farther toward the visitor. This keeps their
    // architectural inward angle while exposing the complete screen surface.
    const sideTilt=.36;
    const authoredLeft=model.getObjectByName('WebUI_Surface_Left');
    const authoredRight=model.getObjectByName('WebUI_Surface_Right');
    if(authoredLeft)authoredLeft.rotation.z+=sideTilt;
    if(authoredRight)authoredRight.rotation.z-=sideTilt;
    model.updateMatrixWorld(true);
    const aiPlatform=model.getObjectByName('AI_Platform_Base');
    if(aiPlatform){
      const bounds=new THREE.Box3().setFromObject(aiPlatform),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
      const platformTopObject=model.getObjectByName('AI_Platform_Stone')??aiPlatform;
      const platformTopBounds=new THREE.Box3().setFromObject(platformTopObject);
      this.governmentAiCenterPosition={
        x:center.x,
        z:this.sceneToWorldZ(center.z),
        radius:THREE.MathUtils.clamp(Math.min(size.x,size.z)*.42,180,290),
      };
      // The animated rings and inlay are separate meshes, so a generic ground
      // ray can pick the plaza floor beneath them. Keep the authored stone top
      // as one stable landing plane and inset it by the avatar footprint.
      this.governmentAiPlatformSurface={
        x:center.x,
        z:this.sceneToWorldZ(center.z),
        radius:Math.max(24,Math.min(size.x,size.z)*.42-COLLISION_RADIUS*.65),
        height:platformTopBounds.max.y+.15,
      };
      this.setupGovernmentAiHologram(center,bounds.max.y,size);
    }
    GOVERNMENT_CENTRAL_PLAZA_WEB_UI.forEach((config,index)=>{
      const target=model.getObjectByName(config.objectName);
      if(!(target instanceof THREE.Mesh))return;
      target.geometry.computeBoundingBox();
      const localSize=target.geometry.boundingBox?.getSize(new THREE.Vector3());
      if(!localSize)return;
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(localSize.x*.965,localSize.z*.925),new THREE.MeshBasicMaterial({
        map:this.createGovernmentWebUiTexture(config.id,config.label,config.eyebrow),
        // The authored front faces the glass entrance and central hologram.
        // Keep this single-sided so the web surface can never appear backwards.
        color:0xffffff,side:THREE.FrontSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5,
      }));
      panel.name=`government-live-screen-${config.id}`;
      panel.position.set(0,-localSize.y/2-.012,0);
      // PlaneGeometry is mounted onto the panel's X/Z face. The GLB root's
      // authored axis conversion leaves its in-plane UV basis rotated 180°,
      // so keep the front normal (-Y) and rotate only the displayed content.
      panel.rotation.set(Math.PI/2,0,Math.PI);
      panel.renderOrder=8;
      target.add(panel);
      target.updateWorldMatrix(true,true);
      const bounds=new THREE.Box3().setFromObject(panel),center=bounds.getCenter(new THREE.Vector3());
      const normal=new THREE.Vector3(0,-1,0).transformDirection(target.matrixWorld).normalize();
      const approach=center.clone().addScaledVector(normal,260);
      this.governmentWebUiScreens.set(config.id,panel);
      this.governmentWebUiPositions.set(config.id,{x:approach.x,z:this.sceneToWorldZ(approach.z),radius:index===1?470:420});
      // Use each panel's own normal and the same distance/FOV, so 01 and 03
      // enlarge as straight and as large as the center display.
      const cameraDirection=normal;
      this.governmentWebUiViews.set(config.id,{
        target:center,
        camera:center.clone().addScaledVector(cameraDirection,1120),
        fov:36,
      });
      const outline=new THREE.Box3Helper(new THREE.Box3().setFromObject(target),index===1?0x65e8ff:0x64dbc8);
      outline.visible=false;outline.renderOrder=90;const material=outline.material as THREE.LineBasicMaterial;material.transparent=true;material.opacity=.9;material.depthTest=false;
      this.scene.add(outline);this.governmentWebUiOutlines.set(config.id,outline);
    });
  }
  private getGovernmentWebUiRect(){
    const screen=this.governmentWebUiActive?this.governmentWebUiScreens.get(this.governmentWebUiActive):undefined;
    if(!screen)return undefined;
    const rect=this.projectedMeshScreenRect(screen),quad=this.projectedMeshScreenQuad(screen);
    return rect&&quad?{...rect,quad}:rect;
  }
  private syncGovernmentWebUiRect(){
    const rect=this.getGovernmentWebUiRect();if(!rect)return;
    const previous=this.lastGovernmentWebUiRect;
    if(previous&&Math.abs(previous.left-rect.left)<.75&&Math.abs(previous.top-rect.top)<.75&&Math.abs(previous.width-rect.width)<.75&&Math.abs(previous.height-rect.height)<.75)return;
    this.lastGovernmentWebUiRect=rect;gameEvents.emit('government-webui-screen-rect',rect);
  }
  private enterGovernmentWebUi=(id?:GovernmentCentralPlazaWebUiId)=>{
    const next=id??this.governmentWebUiNearby;if(!next||!this.governmentWebUiViews.has(next))return;
    this.governmentWebUiActive=next;this.governmentWebUiTransition={target:this.cameraTarget.clone(),camera:this.camera.position.clone(),fov:this.camera instanceof THREE.PerspectiveCamera?this.camera.fov:36,elapsed:0};
    this.governmentWebUiOutlines.forEach(outline=>{outline.visible=false});
    this.setProjectRoomCharactersVisible(false);this.renderer.domElement.style.cursor='pointer';
    gameEvents.emit('government-webui-mode-changed',next);
  };
  private exitGovernmentWebUi=()=>{
    if(!this.governmentWebUiActive)return;
    this.governmentWebUiActive=undefined;this.governmentWebUiTransition=undefined;this.lastGovernmentWebUiRect=undefined;
    this.setProjectRoomCharactersVisible(true);this.renderer.domElement.style.cursor='';
    this.governmentWebUiOutlines.forEach((outline,id)=>{outline.visible=id===this.governmentWebUiNearby});
    gameEvents.emit('government-webui-screen-rect',null);gameEvents.emit('government-webui-mode-changed',null);
  };
  private onGovernmentAiCenterModeChanged=(active:boolean)=>{
    this.governmentAiCenterActive=active;
    if(active){
      if(this.governmentAiCenterPosition){
        const {x,z}=this.governmentAiCenterPosition;
        const platform=this.governmentAiPlatformSurface;
        const ground=platform
          ?{height:platform.height,normal:new THREE.Vector3(0,1,0)}
          :this.sampleGround(x,z,this.localGround,true,1200);
        this.localX=x;this.localZ=z;
        if(ground){this.localGround=ground.height;this.localNormal.copy(ground.normal);this.governmentAiPlatformGrounded=!!platform}
        this.pendingTeleport={x,z,groundHeight:ground?.height};
      }
      this.governmentWebUiNearby=undefined;
      this.governmentWebUiOutlines.forEach(outline=>{outline.visible=false});
      gameEvents.emit('government-webui-proximity-changed',null);
    }
  };
  private onGovernmentAiCenterStageChanged=(stage:number)=>{
    const hologram=this.governmentAiHologram;if(!hologram)return;
    hologram.stage=stage;hologram.elapsed=0;
    hologram.beam.visible=stage>=1&&stage<=4;
    hologram.particles.visible=stage>=1&&stage<=4;
    hologram.core.visible=stage>=3&&stage<=5;
    hologram.city.visible=stage>=7;
    hologram.route.visible=stage>=8;
    if(stage===7)hologram.city.children.forEach(object=>{if(object.userData.aiBuilding)object.scale.y=.02});
  };
  private setupGovernmentAiHologram(center:THREE.Vector3,platformTop:number,size:THREE.Vector3){
    const root=new THREE.Group();root.name='government-ai-recommendation-hologram';root.position.set(center.x,platformTop+4,center.z);
    const scale=THREE.MathUtils.clamp(Math.min(size.x,size.z)/600,.72,1.25);
    const material=(color:number,opacity:number)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(85*scale,175*scale,420*scale,40,1,true),material(0x55e8ff,.075));beam.position.y=215*scale;beam.visible=false;root.add(beam);
    const particleGeometry=new THREE.BufferGeometry(),positions=new Float32Array(90*3);
    for(let index=0;index<90;index+=1){const angle=(index*2.399)% (Math.PI*2),radius=(45+(index%11)*12)*scale;positions[index*3]=Math.cos(angle)*radius;positions[index*3+1]=(index%30)*14*scale;positions[index*3+2]=Math.sin(angle)*radius}
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0xb8fbff,size:5*scale,transparent:true,opacity:.78,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));particles.visible=false;root.add(particles);
    const core=new THREE.Mesh(new THREE.SphereGeometry(58*scale,24,18),material(0x72efff,.25));core.position.y=180*scale;core.visible=false;root.add(core);
    const city=new THREE.Group();city.position.y=16*scale;city.visible=false;
    const grid=new THREE.GridHelper(520*scale,14,0x6be7f1,0x237f95);(grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.32;city.add(grid);
    for(let index=0;index<28;index+=1){const width=(18+(index%4)*6)*scale,height=(35+(index%7)*17)*scale,depth=(18+(index%3)*7)*scale,building=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material(index%5===0?0xa6fbff:0x45dff2,.28));const column=index%7,row=Math.floor(index/7);building.position.set((column-3)*65*scale,height/2,(row-1.5)*82*scale);building.userData.aiBuilding=true;building.scale.y=.02;city.add(building)}
    [[-210,-130],[215,-105],[-185,125],[195,135]].forEach(([x,z])=>{const landmark=new THREE.Mesh(new THREE.ConeGeometry(22*scale,95*scale,6),material(0x8ef5e2,.3));landmark.position.set(x*scale,48*scale,z*scale);landmark.userData.aiBuilding=true;landmark.scale.y=.02;city.add(landmark)});root.add(city);
    const route=new THREE.Group();route.position.y=city.position.y;route.visible=false;const points=[[-220,-130],[-90,35],[30,-50],[130,90],[225,130]].map(([x,z],index)=>new THREE.Vector3(x*scale,(105+index*9)*scale,z*scale)),curve=new THREE.CatmullRomCurve3(points),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,64,3.2*scale,8,false),material(0xffdf4f,.92));route.add(tube);points.forEach((point,index)=>{const marker=new THREE.Mesh(new THREE.SphereGeometry(9*scale,16,12),material(0xffed85,.95));marker.position.copy(point);marker.userData.routeMarker=index+1;route.add(marker)});root.add(route);
    this.scene.add(root);this.governmentAiHologram={root,beam,particles,core,city,route,stage:0,elapsed:0};
  }
  private updateGovernmentAiHologram(delta:number){
    const hologram=this.governmentAiHologram;if(!hologram)return;hologram.elapsed+=delta;
    if(hologram.beam.visible){hologram.beam.rotation.y+=delta*.55;const pulse=.88+Math.sin(hologram.elapsed*4)*.12;hologram.beam.scale.set(pulse,1,pulse)}
    if(hologram.particles.visible){const attribute=hologram.particles.geometry.getAttribute('position') as THREE.BufferAttribute;for(let index=0;index<attribute.count;index+=1){let y=attribute.getY(index)+delta*(85+(index%7)*9);if(y>430)y=0;attribute.setY(index,y)}attribute.needsUpdate=true;hologram.particles.rotation.y+=delta*.18}
    if(hologram.core.visible){const pulse=1+Math.sin(hologram.elapsed*5)*.1;hologram.core.scale.setScalar(pulse);hologram.core.rotation.y+=delta*.7}
    if(hologram.city.visible){hologram.city.children.forEach((object,index)=>{if(!object.userData.aiBuilding)return;const target=THREE.MathUtils.clamp((hologram.elapsed-index*.045)*2.4,0,1),eased=target*target*(3-2*target);object.scale.y=Math.max(.02,eased)});hologram.city.rotation.y=Math.sin(hologram.elapsed*.28)*.035}
    if(hologram.route.visible)hologram.route.children.forEach((object,index)=>{if(index>0){const pulse=1+Math.sin(hologram.elapsed*4-index)*.16;object.scale.setScalar(pulse)}});
  }
  private setupObservatoryTelescope(model:THREE.Object3D){
    const body=model.getObjectByName('Telescope_left_body');
    const lenses=[
      model.getObjectByName('Telescope_left_lens_+1'),
      model.getObjectByName('Telescope_left_lens_-1'),
    ].filter((object):object is THREE.Object3D=>!!object);
    if(!body||!lenses.length)return;
    body.updateWorldMatrix(true,true);
    lenses.forEach(lens=>lens.updateWorldMatrix(true,true));
    const bodyBounds=new THREE.Box3().setFromObject(body);
    const bodyCenter=bodyBounds.getCenter(new THREE.Vector3());
    const lensCenter=lenses.reduce(
      (sum,lens)=>sum.add(new THREE.Box3().setFromObject(lens).getCenter(new THREE.Vector3())),
      new THREE.Vector3(),
    ).multiplyScalar(1/lenses.length);
    const viewDirection=lensCenter.clone().sub(bodyCenter);
    viewDirection.y*=.12;
    viewDirection.normalize();
    const camera=bodyCenter.clone().addScaledVector(viewDirection,-72);
    camera.y+=12;
    const target=bodyCenter.clone().addScaledVector(viewDirection,1450);
    target.y+=8;
    const approach=bodyCenter.clone().addScaledVector(viewDirection,-135);
    this.observatoryTelescopePosition={x:approach.x,z:this.sceneToWorldZ(approach.z),radius:230};
    this.observatoryTelescopeView={camera,target};
    const outlineBounds=bodyBounds.clone();
    lenses.forEach(lens=>outlineBounds.expandByObject(lens));
    const outline=new THREE.Box3Helper(outlineBounds,0x67dcff);
    outline.name='observatory-telescope-outline';
    outline.visible=false;
    outline.renderOrder=90;
    const material=outline.material as THREE.LineBasicMaterial;
    material.transparent=true;
    material.opacity=.9;
    material.depthTest=false;
    this.scene.add(outline);
    this.observatoryTelescopeOutline=outline;
  }
  private enterObservatoryTelescope=()=>{
    if(!this.observatoryTelescopeNearby||!this.observatoryTelescopeView||this.observatoryTelescopeActive)return;
    this.observatoryTelescopeActive=true;
    this.observatoryTelescopeTransition={
      target:this.cameraTarget.clone(),
      camera:this.camera.position.clone(),
      fov:this.camera instanceof THREE.PerspectiveCamera?this.camera.fov:46,
      elapsed:0,
    };
    if(this.observatoryTelescopeOutline)this.observatoryTelescopeOutline.visible=false;
    this.setProjectRoomCharactersVisible(false);
    gameEvents.emit('observatory-telescope-mode-changed',true);
  };
  private exitObservatoryTelescope=()=>{
    if(!this.observatoryTelescopeActive)return;
    this.observatoryTelescopeActive=false;
    this.observatoryTelescopeTransition=undefined;
    this.setProjectRoomCharactersVisible(true);
    if(this.observatoryTelescopeOutline)this.observatoryTelescopeOutline.visible=this.observatoryTelescopeNearby;
    gameEvents.emit('observatory-telescope-mode-changed',false);
  };
  private setupProjectRoomHologram(model:THREE.Object3D){
    const table=model.getObjectByName('Collaboration_Table_Inset');
    if(!table)return;
    const room=table.parent??model;
    const root=new THREE.Group();
    root.name='collaboration-table-hologram';
    root.position.set(table.position.x,1.018,table.position.z);

    const hologramMaterial=(color:number,opacity:number,side:THREE.Side=THREE.DoubleSide)=>new THREE.MeshBasicMaterial({
      color,
      transparent:true,
      opacity,
      depthWrite:false,
      side,
      blending:THREE.AdditiveBlending,
      toneMapped:false,
    });
    const physicalMaterial=(color:number,opacity:number)=>new THREE.MeshStandardMaterial({
      color,
      emissive:color,
      emissiveIntensity:.28,
      transparent:true,
      opacity,
      roughness:.72,
      metalness:.05,
      depthWrite:false,
      side:THREE.DoubleSide,
    });

    const water=new THREE.Mesh(new THREE.CircleGeometry(2.63,96),hologramMaterial(0x087fb2,.3));
    water.rotation.x=-Math.PI/2;
    water.position.y=.025;
    root.add(water);

    const grid=new THREE.GridHelper(5.05,12,0x62ddff,0x188eb5);
    grid.position.y=.04;
    const gridMaterials=Array.isArray(grid.material)?grid.material:[grid.material];
    gridMaterials.forEach(material=>{material.transparent=true;material.opacity=.16;material.depthWrite=false});
    root.add(grid);

    const islandShape=new THREE.Shape();
    islandShape.moveTo(-2.05,-.48);
    islandShape.bezierCurveTo(-2.22,-1.18,-1.34,-1.83,-.55,-1.55);
    islandShape.bezierCurveTo(.05,-1.82,.82,-1.58,1.02,-1.12);
    islandShape.bezierCurveTo(1.48,-1.08,2.18,-.58,1.94,.02);
    islandShape.bezierCurveTo(2.35,.66,1.58,1.35,.88,1.31);
    islandShape.bezierCurveTo(.27,1.74,-.52,1.52,-.77,1.13);
    islandShape.bezierCurveTo(-1.43,1.34,-2.12,.75,-1.82,.2);
    islandShape.bezierCurveTo(-2.14,.02,-2.28,-.2,-2.05,-.48);
    const island=new THREE.Mesh(new THREE.ShapeGeometry(islandShape,18),physicalMaterial(0x45a96e,.92));
    island.rotation.x=-Math.PI/2;
    island.position.y=.075;
    root.add(island);

    const lakeShape=new THREE.Shape();
    lakeShape.moveTo(-.68,-.34);
    lakeShape.bezierCurveTo(-.82,-.78,-.18,-1.03,.15,-.72);
    lakeShape.bezierCurveTo(.6,-.84,.91,-.45,.72,-.12);
    lakeShape.bezierCurveTo(.48,.3,.04,.25,-.17,.49);
    lakeShape.bezierCurveTo(-.56,.42,-.82,.05,-.68,-.34);
    const lake=new THREE.Mesh(new THREE.ShapeGeometry(lakeShape,12),hologramMaterial(0x1bc8ed,.78));
    lake.rotation.x=-Math.PI/2;
    lake.position.y=.095;
    root.add(lake);

    const terrain=[
      {x:-1.35,z:.48,r:.38,color:0x8bd46b},
      {x:-.42,z:.92,r:.31,color:0x75c956},
      {x:.62,z:.77,r:.4,color:0x94d35f},
      {x:1.36,z:.16,r:.34,color:0x55b36f},
      {x:.87,z:-.78,r:.29,color:0x6bc45d},
      {x:-1.26,z:-.88,r:.3,color:0x80c861},
    ];
    terrain.forEach(({x,z,r,color},index)=>{
      const patch=new THREE.Mesh(new THREE.CircleGeometry(r,18),physicalMaterial(color,.9));
      patch.rotation.x=-Math.PI/2;
      patch.position.set(x,.11+index*.002,z);
      patch.scale.z=.72;
      root.add(patch);
    });

    const routePoints=[
      new THREE.Vector3(-1.55,.15,-.55),
      new THREE.Vector3(-.98,.17,.55),
      new THREE.Vector3(-.08,.16,.94),
      new THREE.Vector3(.7,.17,.45),
      new THREE.Vector3(1.35,.16,-.2),
      new THREE.Vector3(.75,.17,-.92),
    ];
    const route=new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(routePoints),72,.025,7,false),
      hologramMaterial(0xff8ca8,.95),
    );
    root.add(route);

    const labels=['호수공원','국립수목원','정부청사','이응다리'];
    const pinPoints=[routePoints[0],routePoints[2],routePoints[4],routePoints[5]];
    pinPoints.forEach((point,index)=>{
      const pin=new THREE.Group();
      pin.position.set(point.x,.15,point.z);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.36,8),hologramMaterial(index===0?0xff71a1:0x61e8ff,.95));
      stem.position.y=.18;
      const head=new THREE.Mesh(new THREE.SphereGeometry(.095,16,12),hologramMaterial(index===0?0xff5b91:0x42dfff,1));
      head.position.y=.4;
      const halo=new THREE.Mesh(new THREE.RingGeometry(.11,.15,24),hologramMaterial(0xc8f8ff,.7));
      halo.rotation.x=-Math.PI/2;
      halo.position.y=.31;
      pin.add(stem,head,halo);

      const canvas=document.createElement('canvas');
      canvas.width=256;canvas.height=72;
      const context=canvas.getContext('2d')!;
      context.fillStyle='rgba(9,78,104,.88)';
      context.beginPath();context.roundRect(5,5,246,62,18);context.fill();
      context.strokeStyle='rgba(101,229,255,.9)';context.lineWidth=3;context.stroke();
      context.fillStyle='#e8fbff';context.font='800 27px "Noto Sans KR","Apple SD Gothic Neo",sans-serif';
      context.textAlign='center';context.textBaseline='middle';context.fillText(labels[index],128,36);
      const texture=new THREE.CanvasTexture(canvas);
      texture.colorSpace=THREE.SRGBColorSpace;
      this.projectRoomScreenTextures.push(texture);
      const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));
      label.scale.set(.9,.255,1);
      label.position.y=.68;
      pin.add(label);
      root.add(pin);
    });

    const dome=new THREE.Mesh(
      new THREE.CylinderGeometry(2.69,2.69,.52,96,1,true),
      hologramMaterial(0x36cbff,.075,THREE.BackSide),
    );
    dome.position.y=.28;
    root.add(dome);
    const rings=new THREE.Group();
    for(const [radius,y,opacity] of [[2.68,.08,.72],[2.48,.3,.34],[2.25,.55,.2]] as const){
      const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.018,radius+.018,96),hologramMaterial(0x5ee7ff,opacity));
      ring.rotation.x=-Math.PI/2;
      ring.position.y=y;
      rings.add(ring);
    }
    root.add(rings);
    const scan=new THREE.Mesh(new THREE.RingGeometry(.25,2.58,96,1,0,Math.PI*.64),hologramMaterial(0x91efff,.26));
    scan.rotation.x=-Math.PI/2;
    scan.position.y=.2;
    root.add(scan);
    const light=new THREE.PointLight(0x2ecfff,1.7,5.8);
    light.position.y=1.2;
    root.add(light);

    root.userData.scan=scan;
    root.userData.rings=rings;
    root.userData.pins=pinPoints.length;
    room.add(root);
    this.projectRoomHologram=root;
  }
  private updateProjectRoomHologram(){
    const root=this.projectRoomHologram;
    if(!root)return;
    const elapsed=(Date.now()+this.worldClockOffset)/1000;
    const scan=root.userData.scan as THREE.Mesh|undefined;
    const rings=root.userData.rings as THREE.Group|undefined;
    if(scan)scan.rotation.z=elapsed*.38;
    if(rings){
      rings.rotation.y=-elapsed*.08;
      rings.children.forEach((ring,index)=>{
        const pulse=1+Math.sin(elapsed*1.7+index*.85)*.018;
        ring.scale.setScalar(pulse);
      });
    }
    root.children.forEach(child=>{
      if(!(child instanceof THREE.Group)||!child.children.some(item=>item instanceof THREE.Sprite))return;
      const head=child.children.find(item=>item instanceof THREE.Mesh&&item.geometry instanceof THREE.SphereGeometry);
      if(head)head.scale.setScalar(1+Math.sin(elapsed*2.5+child.position.x)*.12);
    });
  }
  private setupProjectRoomInteractionOutlines(model:THREE.Object3D){
    const doorPrefixes=['Lobby_ProjectDoor_Glass_','Lobby_ProjectDoor_Handle_'];
    this.projectRoomDoorMeshes=[];
    model.traverse(object=>{if(object instanceof THREE.Mesh&&doorPrefixes.some(prefix=>object.name.startsWith(prefix)))this.projectRoomDoorMeshes.push(object)});
    PROJECT_ROOM_INTERACTIONS.forEach(config=>{
      if(config.id==='project-kiosk')return;
      const matches:THREE.Object3D[]=[];
      model.traverse(object=>{
        if(config.objectNames.includes(object.name))matches.push(object);
      });
      if(!matches.length)return;
      const bounds=new THREE.Box3();
      matches.forEach(object=>bounds.expandByObject(object));
      if(bounds.isEmpty())return;
      const center=bounds.getCenter(new THREE.Vector3());
      const position={x:center.x,z:this.sceneToWorldZ(center.z),radius:config.radius};
      const roomIsRightOfLobby=this.options.mapName==='프로젝트실'&&!!this.options.companionModelUrl;
      if(config.id==='sejong-schedule-board'){
        if(roomIsRightOfLobby)position.z+=185;else position.x+=185;
        position.radius=Math.max(position.radius,285);
      }
      if(config.id==='project-status-board'){
        if(roomIsRightOfLobby)position.x-=230;else position.z+=230;
        position.radius=Math.max(position.radius,330);
      }
      if(config.id==='lobby-kiosk-1'||config.id==='lobby-kiosk-2'){
        position.z-=175;
        position.radius=Math.max(position.radius,320);
      }
      this.projectRoomInteractionPositions.set(config.id,position);
      const helper=new THREE.Box3Helper(bounds,config.id==='project-status-board'?0x55e5ff:0x74f0c9);
      helper.name=`project-room-outline-${config.id}`;
      helper.visible=false;
      helper.renderOrder=90;
      const material=helper.material as THREE.LineBasicMaterial;
      material.transparent=true;
      material.opacity=.82;
      material.depthTest=false;
      this.scene.add(helper);
      this.projectRoomInteractionOutlines.set(config.id,helper);
    });
  }
  private createLakeExperienceCircle(config:LakeExperienceConfig,groundHeight:number){
    const root=new THREE.Group();
    root.name=`lake-experience-${config.id}`;
    root.position.set(config.x,groundHeight+.8,this.worldToSceneZ(config.z));
    root.rotation.x=-Math.PI/2;
    const material=(color:number,opacity:number)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthTest:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const center=new THREE.Mesh(new THREE.CircleGeometry(50,64),material(config.color,.08));
    const ring=new THREE.Mesh(new THREE.RingGeometry(45,54,64),material(config.color,.98));
    const middleRing=new THREE.Mesh(new THREE.RingGeometry(34,38,64),material(0xffffff,.78));
    const innerRing=new THREE.Mesh(new THREE.RingGeometry(18,22,64),material(config.color,.9));
    const pulseRing=new THREE.Mesh(new THREE.RingGeometry(55,59,64),material(config.color,.48));
    center.position.z=.2;ring.position.z=.4;middleRing.position.z=.6;innerRing.position.z=.8;pulseRing.position.z=.1;
    for(const object of [center,ring,middleRing,innerRing,pulseRing])object.renderOrder=30;
    root.add(center,ring,middleRing,innerRing,pulseRing);
    root.userData.center=center;root.userData.ring=ring;root.userData.middleRing=middleRing;root.userData.innerRing=innerRing;root.userData.pulseRing=pulseRing;root.userData.groundHeight=groundHeight;root.userData.phase=config.id==='wind-hill'?Math.PI:0;root.userData.experienceId=config.id;
    const light=new THREE.PointLight(config.color,2.2,155);light.position.set(0,0,38);root.add(light);
    root.userData.light=light;
    const label=this.createWorldPortalLabel(config.label,false);
    label.position.set(0,0,112);root.add(label);root.userData.label=label;
    this.scene.add(root);
    this.applyLakeJourneyHighlight(root);
    return root;
  }
  private onLakeBoothCompletionChanged=(completion:Partial<Record<LakeExperienceId,boolean>>)=>{
    this.lakeBoothCompletion=completion;
    this.lakeExperienceRoots.forEach(root=>this.applyLakeJourneyHighlight(root));
  };
  private applyLakeJourneyHighlight(root:THREE.Group){
    const id=root.userData.experienceId as LakeExperienceId;
    const guided=id!=='wind-hill',completed=!!this.lakeBoothCompletion[id];
    const color=new THREE.Color(!guided?0xffffff:completed?0x49c879:0xff8a24);
    const parts=['center','ring','middleRing','innerRing','pulseRing'] as const;
    parts.forEach(key=>{
      const mesh=root.userData[key] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>|undefined;
      mesh?.material.color.copy(color);
    });
    const light=root.userData.light as THREE.PointLight|undefined;
    if(light){light.color.copy(color);light.intensity=guided?(completed?3.4:5.5):2.2;light.distance=guided?230:155}
    root.userData.journeyActive=guided&&!completed;
  }
  private onNatureChapterProgressChanged=(completion:{garden:boolean;photo:boolean})=>{
    this.natureChapterCompletion=completion;
    if(this.bearPhotoPortalRoot)this.applyNatureJourneyHighlight(this.bearPhotoPortalRoot,'photo');
    this.fixedPortalRoots.forEach(root=>{
      if(root.userData.natureJourney==='garden')this.applyNatureJourneyHighlight(root,'garden');
    });
  };
  private applyNatureJourneyHighlight(root:THREE.Group,kind:'garden'|'photo'){
    const completed=this.natureChapterCompletion[kind],color=new THREE.Color(completed?0x49c879:0xff8a24);
    const parts=['center','ring','middleRing','innerRing','pulseRing'] as const;
    parts.forEach(key=>{
      const mesh=root.userData[key] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>|undefined;
      mesh?.material.color.copy(color);
    });
    const light=root.userData.light as THREE.PointLight|undefined;
    if(light){light.color.copy(color);light.intensity=completed?3.4:5.5;light.distance=230}
    root.userData.journeyActive=!completed;
  }
  private createInteractionCircle(position:{x:number;z:number},groundHeight:number){
    const root=new THREE.Group();
    root.name='world-interaction-circle';
    root.position.set(position.x,groundHeight+.8,this.worldToSceneZ(position.z));
    root.rotation.x=-Math.PI/2;
    const material=(opacity:number)=>new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity,depthTest:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const center=new THREE.Mesh(new THREE.CircleGeometry(50,64),material(.08));
    const ring=new THREE.Mesh(new THREE.RingGeometry(45,54,64),material(.98));
    const middleRing=new THREE.Mesh(new THREE.RingGeometry(34,38,64),material(.78));
    const innerRing=new THREE.Mesh(new THREE.RingGeometry(18,22,64),material(.9));
    const pulseRing=new THREE.Mesh(new THREE.RingGeometry(55,59,64),material(.48));
    center.position.z=.2;ring.position.z=.4;middleRing.position.z=.6;innerRing.position.z=.8;pulseRing.position.z=.1;
    for(const object of [center,ring,middleRing,innerRing,pulseRing])object.renderOrder=30;
    root.add(center,ring,middleRing,innerRing,pulseRing);
    root.userData.center=center;root.userData.ring=ring;root.userData.middleRing=middleRing;root.userData.innerRing=innerRing;root.userData.pulseRing=pulseRing;root.userData.groundHeight=groundHeight;root.userData.phase=Math.PI*.5;
    const light=new THREE.PointLight(0xffffff,2.2,155);light.position.set(0,0,38);root.add(light);
    root.userData.light=light;
    if(this.options.interaction&&this.interactionPosition&&position.x===this.interactionPosition.x&&position.z===this.interactionPosition.z){
      const label=this.createWorldPortalLabel(this.options.interaction.label,!this.options.interaction.chargeSeconds);
      label.position.set(0,0,112);root.add(label);root.userData.label=label;
    }
    this.scene.add(root);
    return root;
  }
  private createWildlifeClueLabel(config:WildlifeClueConfig,groundHeight:number,color:THREE.Color){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=280;
    const context=canvas.getContext('2d')!;
    const bearLabel=config.id==='bearA'||config.id==='bearB';
    context.shadowColor='rgba(20,35,19,.28)';context.shadowBlur=24;context.fillStyle='rgba(255,255,248,.97)';
    context.beginPath();context.roundRect(18,18,604,238,78);context.fill();
    context.shadowBlur=0;context.strokeStyle=`#${color.getHexString()}`;context.lineWidth=10;context.stroke();
    context.textAlign='center';context.textBaseline='middle';
    if(!bearLabel){context.font='92px "Apple Color Emoji","Noto Color Emoji",sans-serif';context.fillText(config.icon,105,137)}
    if(!bearLabel){context.fillStyle='#73816d';context.font='900 30px "Noto Sans KR",sans-serif';context.fillText('서식 환경 설계 조사',390,97)}
    context.fillStyle='#263b29';context.font='900 48px "Noto Sans KR",sans-serif';context.fillText(config.label,bearLabel?320:390,bearLabel?137:161);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
    sprite.position.set(config.x,groundHeight+105,this.worldToSceneZ(config.z));sprite.scale.set(bearLabel?150:190,bearLabel?55:83,1);sprite.renderOrder=120;sprite.frustumCulled=false;
    this.scene.add(sprite);return sprite;
  }
  private onHabitatResourcePositionSet=(position:{resource:HabitatResourceId;x:number;z:number})=>{
    if(!this.options.wildlifeClues||!Number.isFinite(position.x)||!Number.isFinite(position.z))return;
    const definitions:Record<HabitatResourceId,{icon:string;label:string}>={
      cave:{icon:'🪨',label:'동굴 자원'},food:{icon:'🥕',label:'먹이 공급 지점'},water:{icon:'💧',label:'물가 이용 지점'},
    };
    let config=this.options.wildlifeClues.find(item=>item.id===position.resource);
    if(!config){
      config={id:position.resource,x:position.x,z:position.z,...definitions[position.resource]};
      this.options.wildlifeClues.push(config);
    }
    config.x=Math.max(0,Math.min(this.movementWorldWidth(),Math.round(position.x)));
    config.z=Math.max(0,Math.min(WORLD_HEIGHT,Math.round(position.z)));
    if(!this.mapReady)return;
    const ground=(this.sampleExperienceGround(config.x,config.z,true)??this.sampleVisibleSurfaceGround(config.x,config.z))?.height??this.localGround;
    let root=this.wildlifeClueRoots.get(config.id);
    if(!root){
      root=this.createInteractionCircle(config,ground);
      root.name=`bear-wildlife-clue-${config.id}`;root.userData.phase=(this.wildlifeClueRoots.size+1)*Math.PI*.66;root.userData.journeyActive=true;
      const colors:Record<HabitatResourceId,number>={cave:0x8c7a65,food:0x78a665,water:0x5d9daf},color=new THREE.Color(colors[position.resource]);
      for(const key of ['center','ring','middleRing','innerRing','pulseRing'] as const){
        const mesh=root.userData[key] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
        mesh.material.color.copy(color);
      }
      const light=root.userData.light as THREE.PointLight;light.color.copy(color);light.intensity=4.8;light.distance=210;
      root.userData.clueLabel=this.createWildlifeClueLabel(config,ground,color);
      this.wildlifeClueRoots.set(config.id,root);
    }
    if(root){
      root.position.set(config.x,ground+.8,this.worldToSceneZ(config.z));
      root.userData.groundHeight=ground;
      const label=root.userData.clueLabel as THREE.Sprite|undefined;
      label?.position.set(config.x,ground+105,this.worldToSceneZ(config.z));
    }
    if(this.wildlifeClueNearby===config.id){this.wildlifeClueNearby=undefined;gameEvents.emit('bear-clue-proximity-changed',null)}
    this.render();
  };
  private onHabitatResourcePositionPlace=(resource:HabitatResourceId)=>{
    if(!['cave','food','water'].includes(resource))return;
    this.pendingHabitatResource=undefined;
    const position={resource,x:Math.round(this.localX),z:Math.round(this.localZ)};
    this.onHabitatResourcePositionSet(position);
    gameEvents.emit('habitat-resource-position-saved',position);
  };
  private onHabitatResourcePlacementArm=(resource:HabitatResourceId|null)=>{
    this.pendingHabitatResource=resource&&['cave','food','water'].includes(resource)?resource:undefined;
  };
  private onCampusBuildingFastTravel=(id:CampusFeaturePortalId)=>{
    if(this.renderer.domElement.style.display==='none')return;
    const target=this.options.campusFeaturePortals?.find(config=>config.id===id);
    if(!target)return;
    const spawn=this.findSafeSpawn(target.x,target.z);
    if(!spawn)return;
    this.localX=spawn.x;
    this.localZ=spawn.z;
    this.localGround=spawn.ground.height;
    this.localNormal.copy(spawn.ground.normal);
    this.pendingTeleport={x:spawn.x,z:spawn.z,groundHeight:spawn.ground.height};
  };
  private createBearFeedPickupVisual(feedId:BearFeedId){
    const root=new THREE.Group();root.name=`bear-feed-pickup-${feedId}`;
    const standard=(color:number,roughness=.72)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.02});
    if(feedId==='apple'){
      const fruit=new THREE.Mesh(new THREE.SphereGeometry(18,24,18),standard(0xd84232,.58));fruit.scale.set(1,.92,1);fruit.position.y=18;
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.8,13,8),standard(0x5a3820));stem.position.set(0,35,0);stem.rotation.z=-.18;
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(6,12,8),standard(0x4f8b3a));leaf.scale.set(1.6,.35,.8);leaf.position.set(7,37,0);leaf.rotation.z=.45;
      root.add(fruit,stem,leaf);
    }else if(feedId==='carrot'){
      const body=new THREE.Mesh(new THREE.ConeGeometry(13,42,18),standard(0xef7d24,.7));body.position.y=21;body.rotation.z=Math.PI;
      for(let index=0;index<4;index++){
        const leaf=new THREE.Mesh(new THREE.ConeGeometry(3.4,24,8),standard(0x4e943f));leaf.position.set((index-1.5)*3.2,49,0);leaf.rotation.z=(index-1.5)*.17;root.add(leaf);
      }
      root.add(body);
    }else{
      const nut=new THREE.Mesh(new THREE.SphereGeometry(16,22,14),standard(0x9a5d2d));nut.scale.set(.9,1.16,.9);nut.position.y=18;
      const cap=new THREE.Mesh(new THREE.SphereGeometry(16,22,10,0,Math.PI*2,0,Math.PI*.42),standard(0x5d3a21,.95));cap.position.y=27;cap.rotation.x=Math.PI;
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.6,10,8),standard(0x59402a));stem.position.y=39;stem.rotation.z=.25;
      root.add(nut,cap,stem);
    }
    root.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true}});
    return root;
  }
  private createResidentStatusLabel(text:string){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=190;const context=canvas.getContext('2d')!;
    context.fillStyle='rgba(255,250,232,.97)';context.beginPath();context.roundRect(18,18,604,154,62);context.fill();
    context.strokeStyle='#d88a35';context.lineWidth=10;context.stroke();context.textAlign='center';context.textBaseline='middle';
    context.fillStyle='#50351f';context.font='900 52px "Noto Sans KR",sans-serif';context.fillText(text,320,96);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=textureAnisotropy;
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
    label.scale.set(190,57,1);label.renderOrder=130;label.frustumCulled=false;return label;
  }
  private async createResident(config:ResidentConfig){
    const asset=await this.loadResidentAsset(config);
    if(this.destroyed)return;
    const visual=asset.visual;visual.updateMatrixWorld(true);sharpenObjectTextures(visual);
    const bounds=new THREE.Box3().setFromObject(visual),size=bounds.getSize(new THREE.Vector3()),scale=config.height/Math.max(size.y,.001);
    visual.scale.setScalar(scale);visual.position.y=-bounds.min.y*scale;
    visual.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true}});
    const ground=this.sampleGround(config.x,config.z,0,true);if(!ground)return;
    const root=new THREE.Group();root.name='bear-cub-resident';root.position.set(config.x,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(config.z));root.rotation.y=config.yaw;root.add(visual);this.scene.add(root);this.residentRoot=root;
    if(this.options.mapName==='곰 체험소'){
      const label=this.createResidentStatusLabel('먹이를 주세요! 🙏');label.position.set(0,config.height+52,0);label.visible=false;root.add(label);this.residentStatusLabel=label;
    }
    this.residentX=config.x;this.residentZ=config.z;this.residentGround=ground.height;
    const movementAnimations=asset.animations.filter(clip=>!/praying/i.test(clip.name));
    const movementClip=config.stationary?movementAnimations.find(clip=>/rumba/i.test(clip.name))??movementAnimations.find(clip=>/idle dance|dance|idle/i.test(clip.name)):movementAnimations.find(clip=>/walk|locomotion|idle/i.test(clip.name))??movementAnimations.find(clip=>/rumba/i.test(clip.name));
    const begClip=asset.animations.find(clip=>/praying/i.test(clip.name));
    const rewardClips=[...new Map(asset.animations.filter(clip=>/breakdance|hip hop|jump/i.test(clip.name)).map(clip=>[(clip.name.split('|').pop()??clip.name).trim().toLowerCase(),clip])).values()];
    if(movementClip||begClip||rewardClips.length){
      this.residentMixer=new THREE.AnimationMixer(visual);
      if(movementClip){this.residentMovementAction=this.residentMixer.clipAction(movementClip);this.residentMovementAction.setLoop(THREE.LoopRepeat,Infinity);if(/rumba/i.test(movementClip.name))this.residentMovementAction.setEffectiveTimeScale(.42)}
      if(begClip){this.residentBegAction=this.residentMixer.clipAction(begClip);this.residentBegAction.setLoop(THREE.LoopRepeat,Infinity)}
      this.residentRewardActions=rewardClips.map(clip=>{const action=this.residentMixer!.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=false;return action});
      this.residentMixer.addEventListener('finished',event=>{
        if(!this.residentRewardActions.includes(event.action))return;
        event.action.stop();this.residentSpecialAction=undefined;this.residentBehavior='patrol';
        const pending=Boolean(this.personalFarmProgress&&(this.personalFarmProgress.bearMission.completedFeedSpotIds.length>this.personalFarmProgress.bearMission.fedFeedSpotIds.length||this.personalFarmProgress.bearMission.repeatFeedSpotId));
        const next=pending?this.residentBegAction:this.residentMovementAction;next?.reset().setEffectiveWeight(1).play();
        if(this.residentStatusLabel)this.residentStatusLabel.visible=pending;
      });
      this.setResidentBehavior('patrol');
    }
  }
  private async createResidentDecor(config:ResidentConfig,index:number){
    const asset=await this.loadResidentAsset(config);
    if(this.destroyed)return;
    const visual=asset.visual;visual.updateMatrixWorld(true);sharpenObjectTextures(visual);
    const bounds=new THREE.Box3().setFromObject(visual),size=bounds.getSize(new THREE.Vector3()),scale=config.height/Math.max(size.y,.001);
    visual.scale.setScalar(scale);visual.position.y=-bounds.min.y*scale;
    visual.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true}});
    const ground=this.sampleGround(config.x,config.z,0,true);if(!ground)return;
    const root=new THREE.Group();root.name=`bear-resident-decor-${index}`;root.position.set(config.x,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(config.z));root.rotation.y=config.yaw;root.add(visual);this.scene.add(root);this.residentDecorRoots.push(root);
    if(this.options.mapName==='곰 체험소'){
      const mixer=new THREE.AnimationMixer(visual),begClip=asset.animations.find(clip=>/praying/i.test(clip.name)),rumbaClip=asset.animations.filter(clip=>!/praying/i.test(clip.name)).find(clip=>/rumba/i.test(clip.name));
      const rewardClips=[...new Map(asset.animations.filter(clip=>/breakdance|hip hop|jump/i.test(clip.name)).map(clip=>[(clip.name.split('|').pop()??clip.name).trim().toLowerCase(),clip])).values()];
      const begAction=begClip?mixer.clipAction(begClip):undefined;if(begAction)begAction.setLoop(THREE.LoopRepeat,Infinity);
      const rewardActions=rewardClips.map(clip=>{const action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=false;return action});
      const movementAction=rumbaClip?mixer.clipAction(rumbaClip):undefined;if(movementAction){movementAction.setLoop(THREE.LoopRepeat,Infinity);movementAction.setEffectiveTimeScale(.42);movementAction.play()}
      const actor={root,mixer,movementAction,begAction,rewardActions,celebrating:false};
      mixer.addEventListener('finished',event=>{if(!actor.rewardActions.includes(event.action))return;event.action.stop();actor.celebrating=false;const pending=Boolean(this.personalFarmProgress&&(this.personalFarmProgress.bearMission.completedFeedSpotIds.length>this.personalFarmProgress.bearMission.fedFeedSpotIds.length||this.personalFarmProgress.bearMission.repeatFeedSpotId));(pending?actor.begAction:actor.movementAction)?.reset().setEffectiveWeight(1).play()});
      this.residentDecorMixers.push(mixer);this.residentDecorBearActors.push(actor);
    }else{
      const idleClip=asset.animations.find(clip=>/idle/i.test(clip.name));
      if(idleClip){const mixer=new THREE.AnimationMixer(visual);mixer.clipAction(idleClip).play();this.residentDecorMixers.push(mixer)}
    }
  }
  private async loadResidentAsset(config:ResidentConfig):Promise<{visual:THREE.Group;animations:THREE.AnimationClip[]}>{
    if(config.format==='fbx'){
      const visual=await new FBXLoader().loadAsync(config.modelUrl);
      return {visual,animations:visual.animations};
    }
    const gltf=await createGltfLoader().loadAsync(config.modelUrl);
    return {visual:gltf.scene,animations:gltf.animations};
  }
  private updateResident(delta:number){
    const root=this.residentRoot,config=this.options.resident;
    this.residentMixer?.update(delta);
    this.residentDecorMixers.forEach(mixer=>mixer.update(delta));
    if(!root||!config)return;
    if(this.residentBehavior==='celebrating')return;
    if(this.residentBehavior==='begging'){
      root.rotation.y=config.yaw+Math.atan2(this.localX-this.residentX,this.localZ-this.residentZ);
      this.residentDecorBearActors.forEach(actor=>{actor.root.rotation.y=Math.atan2(this.localX-actor.root.position.x,this.localZ-this.sceneToWorldZ(actor.root.position.z))});
      return;
    }
    if(config.stationary)return;
    const patrol=config.patrol;
    if(!root||!config||!patrol||patrol.length<2)return;
    const target=patrol[this.residentPatrolTarget%patrol.length],dx=target.x-this.residentX,dz=target.z-this.residentZ,distance=Math.hypot(dx,dz);
    if(distance<1){
      this.residentX=target.x;this.residentZ=target.z;this.residentPatrolTarget=(this.residentPatrolTarget+1)%patrol.length;return;
    }
    const step=Math.min(distance,(config.walkSpeed??RESIDENT_WALK_SPEED)*delta),nextX=this.residentX+dx/distance*step,nextZ=this.residentZ+dz/distance*step;
    const ground=this.sampleGround(nextX,nextZ,this.residentGround);
    if(!ground){this.residentPatrolTarget=(this.residentPatrolTarget+1)%patrol.length;return}
    this.residentX=nextX;this.residentZ=nextZ;this.residentGround=ground.height;
    root.position.set(nextX,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(nextZ));
    root.rotation.y=config.yaw+Math.atan2(dx,dz);
  }
  private setResidentBehavior(behavior:'patrol'|'begging'|'celebrating',action?:THREE.AnimationAction){
    this.residentBehavior=behavior;this.residentMixer?.stopAllAction();this.residentDecorBearActors.forEach(actor=>actor.mixer.stopAllAction());this.residentSpecialAction=behavior==='celebrating'?action:undefined;
    const next=action??(behavior==='begging'?this.residentBegAction:this.residentMovementAction);
    next?.reset().setEffectiveWeight(1).play();
    if(behavior==='begging')this.residentDecorBearActors.forEach(actor=>actor.begAction?.reset().setEffectiveWeight(1).play());
    if(behavior==='patrol')this.residentDecorBearActors.forEach(actor=>actor.movementAction?.reset().setEffectiveWeight(1).play());
    if(this.residentStatusLabel)this.residentStatusLabel.visible=behavior==='begging';
  }
  private syncResidentBearBehavior(progress=this.personalFarmProgress){
    if(this.options.mapName!=='곰 체험소')return;
    const pendingFeed=Boolean(progress&&progress.bearMission.completedFeedSpotIds.length>progress.bearMission.fedFeedSpotIds.length)||Boolean(progress?.bearMission.repeatFeedSpotId);
    if(!pendingFeed&&this.residentBehavior==='celebrating')return;
    this.setResidentBehavior(pendingFeed?'begging':'patrol');
  }
  private playResidentFeedReward(){
    if(this.options.mapName!=='곰 체험소'||!this.residentRewardActions.length)return;
    const action=this.residentRewardActions[Math.floor(Math.random()*this.residentRewardActions.length)];
    this.setResidentBehavior('celebrating',action);
    this.residentDecorBearActors.forEach(actor=>{if(!actor.rewardActions.length)return;const reward=actor.rewardActions[Math.floor(Math.random()*actor.rewardActions.length)];actor.celebrating=true;reward.reset().setEffectiveWeight(1).play()});
  }
  private updatePortals(){
    const elapsed=(Date.now()+this.worldClockOffset)/1000;
    this.feedSpotRoots.forEach((root,index)=>{const visual=root.userData.pickupVisual as THREE.Group|undefined;if(!visual)return;visual.rotation.y=elapsed*.72+Number(index.slice(-2))*.65;visual.position.y=25+Math.sin(elapsed*2.2+Number(index.slice(-2)))*4});
    for(const root of [this.portalRoot,...this.fixedPortalRoots,this.interactionRoot,...this.campusFeaturePortalRoots.values()]){
      if(!root)continue;
      if(root.userData.appearance==='energy-rift'){
        const material=root.userData.portalMaterial as THREE.ShaderMaterial|undefined;
        const frame=root.userData.frame as THREE.Group|undefined;
        const middleRing=root.userData.middleRing as THREE.Mesh|undefined;
        const innerRing=root.userData.innerRing as THREE.Mesh|undefined;
        const shards=root.userData.shards as THREE.Group|undefined;
        const motes=root.userData.motes as THREE.Group|undefined;
        const baseRing=root.userData.baseRing as THREE.Mesh|undefined;
        const floorGlow=root.userData.floorGlow as THREE.Mesh|undefined;
        const light=root.userData.light as THREE.PointLight|undefined;
        if(material)material.uniforms.uTime.value=elapsed;
        if(frame)frame.rotation.z=Math.sin(elapsed*.52)*.045;
        if(middleRing)middleRing.rotation.z=-elapsed*.16;
        if(innerRing)innerRing.rotation.z=elapsed*.22;
        if(shards){
          shards.rotation.z=elapsed*.085;
          shards.children.forEach((shard,index)=>{
            shard.rotation.x+=.006+(index%3)*.002;
            shard.rotation.y-=.008;
          });
        }
        if(motes)motes.children.forEach((mote,index)=>{
          const angle=(mote.userData.angle as number)+elapsed*(mote.userData.speed as number);
          const radius=mote.userData.radius as number;
          mote.position.x=Math.cos(angle)*radius;
          mote.position.y=58+Math.sin(angle)*radius*1.38;
          mote.position.z=Math.sin(elapsed*1.3+index)*4;
        });
        if(baseRing)baseRing.rotation.z=-elapsed*.34;
        if(floorGlow)floorGlow.scale.setScalar(1+Math.sin(elapsed*2.1)*.08);
        if(light)light.intensity=5.1+Math.sin(elapsed*3.2)*.75;
        root.position.y=root.userData.groundHeight as number;
        continue;
      }
      if(root.userData.appearance==='white-circle'){
        const phase=root.userData.phase as number,pulse=(elapsed*.55+phase/(Math.PI*2))%1;
        const visualScale=(root.userData.visualScale as number|undefined)??1;
        root.scale.setScalar(visualScale*(1+Math.sin(elapsed*2.15+phase)*.035));
        const center=root.userData.center as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
        const innerRing=root.userData.innerRing as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
        const pulseRing=root.userData.pulseRing as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
        center.material.opacity=.22+(Math.sin(elapsed*1.8+phase)+1)*.055;
        innerRing.rotation.z=elapsed*.35;
        pulseRing.scale.setScalar(1+pulse*.5);
        pulseRing.material.opacity=.5*(1-pulse);
        continue;
      }
      root.rotation.y=Math.sin(elapsed*.8)*.12;
      const glow=root.userData.glow as THREE.Object3D|undefined,pulse=1+Math.sin(elapsed*2.8)*.08;
      glow?.scale.setScalar(pulse);
      root.position.y=(root.userData.groundHeight as number)+Math.sin(elapsed*2.2)*2.2;
    }
  }
  private updateLakeExperienceCircles(){
    const elapsed=(Date.now()+this.worldClockOffset)/1000;
    const roots=[...this.lakeExperienceRoots.values(),...this.wildlifeClueRoots.values(),...(this.bearPhotoPortalRoot?[this.bearPhotoPortalRoot]:[])];
    roots.forEach(root=>{
      const phase=root.userData.phase as number,active=!!root.userData.journeyActive,wave=1+Math.sin(elapsed*(active?3.2:2.15)+phase)*(active ? .075 : .035);
      root.scale.setScalar(wave);
      const center=root.userData.center as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
      const innerRing=root.userData.innerRing as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
      const pulseRing=root.userData.pulseRing as THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
      const pulse=(elapsed*.55+phase/(Math.PI*2))%1;
      center.material.opacity=.22+(Math.sin(elapsed*1.8+phase)+1)*.055;
      innerRing.rotation.z=elapsed*.35;
      pulseRing.scale.setScalar(1+pulse*.5);
      pulseRing.material.opacity=(active ? .9 : .5)*(1-pulse);
    });
  }
  private updateGuideNpc(delta:number){
    if(!this.guideNpc)return;
    if(this.guideIntroActive){
      const progress=this.guideIntroStartedAt?Math.min(1,(performance.now()-this.guideIntroStartedAt)/LAKE_GUIDE_INTRO_DURATION_MS):0;
      const eased=1-(1-progress)*(1-progress);
      const frame={
        x:THREE.MathUtils.lerp(this.guideIntroStart.x,this.guideIntroEnd.x,eased),
        z:THREE.MathUtils.lerp(this.guideIntroStart.z,this.guideIntroEnd.z,eased),
        yaw:Math.atan2(this.guideIntroEnd.x-this.guideIntroStart.x,this.guideIntroEnd.z-this.guideIntroStart.z),
        motion:(progress<1?'walk':'idle') as Extract<MotionState,'idle'|'walk'>,
      };
      const ground=this.sampleGround(frame.x,frame.z,this.guideGround);
      if(ground){
        this.guideGround=ground.height;
        this.guidePosition={x:frame.x,z:frame.z,yaw:frame.yaw};
        this.guideNpcPosition.set(frame.x,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(frame.z));
      }
      this.guideNpc.update(this.guideNpcPosition,this.guideNpcUprightNormal,this.guidePosition.yaw,frame.motion,delta);
      if(progress===1&&!this.guideIntroArrived){
        this.guideIntroArrived=true;
        gameEvents.emit('guide-intro-arrived');
      }
      return;
    }
    const frame=guidePatrolFrame(Date.now()+this.worldClockOffset);
    const ground=this.sampleGround(frame.x,frame.z,this.guideGround);
    if(ground){
      this.guideGround=ground.height;
      this.guidePosition={x:frame.x,z:frame.z,yaw:frame.yaw};
      this.guideNpcPosition.set(frame.x,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(frame.z));
    }
    this.guideNpc.update(this.guideNpcPosition,this.guideNpcUprightNormal,this.guidePosition.yaw,frame.motion,delta);
  }

  private updateLocalNpcs(delta:number){
    this.localNpcs.forEach(npc=>{
      if(this.hiddenCharacterIds.has(npc.config.id)){npc.character.root.visible=false;return}
      if(npc.config.id===this.focusedLocalNpcId){
        const faceLocalYaw=Math.atan2(this.localX-npc.x,this.localZ-npc.z);
        if(npc.config.id===this.talkingLocalNpcId)npc.character.playEmote('talking',true);else npc.character.stopEmote();
        npc.character.update(npc.position,npc.normal,faceLocalYaw,'idle',delta);
        return;
      }
      npc.character.stopEmote();
      const patrol=npc.config.patrol;
      if(!patrol||patrol.length<2){
        npc.character.update(npc.position,npc.normal,npc.config.yaw,'idle',delta);
        return;
      }
      let target=patrol[npc.targetIndex%patrol.length];
      let dx=target.x-npc.x,dz=target.z-npc.z,distance=Math.hypot(dx,dz);
      if(distance<14){
        npc.targetIndex=(npc.targetIndex+1)%patrol.length;
        target=patrol[npc.targetIndex];
        dx=target.x-npc.x;dz=target.z-npc.z;distance=Math.hypot(dx,dz);
      }
      if(distance<.001){
        npc.character.update(npc.position,npc.normal,npc.config.yaw,'idle',delta);
        return;
      }
      const step=Math.min(distance,(npc.config.walkSpeed??48)*delta);
      const targetYaw=Math.atan2(dx,dz);
      let moved=false,movementYaw=targetYaw;
      // When the direct route is blocked, gently steer to either side instead
      // of walking through the collaboration table, stools, or kiosk.
      for(const angleOffset of [0,.38,-.38,.76,-.76,1.14,-1.14]){
        const yaw=targetYaw+angleOffset;
        const nextX=npc.x+Math.sin(yaw)*step;
        const nextZ=npc.z+Math.cos(yaw)*step;
        if(nextX<30||nextX>this.movementWorldWidth()-30||nextZ<30||nextZ>this.movementWorldHeight()-30)continue;
        if(Math.hypot(nextX-this.localX,nextZ-this.localZ)<48)continue;
        if(!this.options.simplifiedCollision&&!this.bodyPathClearFrom(npc.x,npc.z,npc.ground,nextX,nextZ))continue;
        const ground=this.sampleGround(nextX,nextZ,npc.ground);
        if(!ground||(!this.options.simplifiedCollision&&!this.spawnSpaceClear(nextX,nextZ,ground.height)))continue;
        npc.x=nextX;npc.z=nextZ;npc.ground=ground.height;npc.normal.copy(ground.normal);
        npc.position.set(nextX,ground.height+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(nextZ));
        movementYaw=yaw;moved=true;break;
      }
      if(moved)npc.blockedSeconds=0;
      else{
        npc.blockedSeconds+=delta;
        if(npc.blockedSeconds>1.2){
          npc.targetIndex=(npc.targetIndex+1)%patrol.length;
          npc.blockedSeconds=0;
        }
      }
      npc.character.update(npc.position,npc.normal,movementYaw,moved?'walk':'idle',delta);
    });
  }
  private onMapOverviewToggle=(active:boolean)=>{
    this.overviewActive=active;
    if(active)this.showMapOverview();
    else{
      this.camera.up.set(0,1,0);
      const position=new THREE.Vector3(this.localX,this.localGround+CHARACTER_GROUND_CLEARANCE,this.worldToSceneZ(this.localZ));
      this.followCharacter(position,0,true);
    }
    gameEvents.emit('map-overview-changed',active);
    this.render();
  }
  private showMapOverview(){
    if(this.mapBounds.isEmpty()||!(this.camera instanceof THREE.OrthographicCamera))return;
    const center=this.mapBounds.getCenter(new THREE.Vector3()),size=this.mapBounds.getSize(new THREE.Vector3()),aspect=this.width/Math.max(this.height,1);
    const projectedDepth=size.z*Math.sin(OVERVIEW_CAMERA_ELEVATION)+size.y*Math.cos(OVERVIEW_CAMERA_ELEVATION);
    const halfHeight=Math.max(projectedDepth/2+110,(size.x/2+110)/aspect),halfWidth=halfHeight*aspect;
    this.camera.left=-halfWidth;this.camera.right=halfWidth;this.camera.top=halfHeight;this.camera.bottom=-halfHeight;
    this.camera.up.set(0,1,0);
    this.camera.position.set(center.x,center.y+Math.sin(OVERVIEW_CAMERA_ELEVATION)*2200,center.z+Math.cos(OVERVIEW_CAMERA_ELEVATION)*2200);
    this.camera.lookAt(center);this.camera.updateProjectionMatrix();
  }
  private worldToSceneZ(worldZ:number){const height=this.movementWorldHeight();return height/2+(worldZ-height/2)/GROUND_PROJECTION}
  private sceneToWorldZ(sceneZ:number){const height=this.movementWorldHeight();return height/2+(sceneZ-height/2)*GROUND_PROJECTION}
  private movementWorldWidth(){return this.options.mapName==='프로젝트실'?PROJECT_ROOM_WORLD_WIDTH:WORLD_WIDTH}
  private movementWorldHeight(){return this.options.mapName==='프로젝트실'?PROJECT_ROOM_WORLD_HEIGHT:WORLD_HEIGHT}

  private classifyMaterial(material:THREE.Material){
    const map=(material as THREE.MeshStandardMaterial).map,image=map?.image as CanvasImageSource|undefined;if(!image)return;
    try{
      const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(image,0,0,8,8);
      const pixels=context.getImageData(0,0,8,8).data;let red=0,green=0,blue=0,count=0;
      for(let index=0;index<pixels.length;index+=4){if(pixels[index+3]<40)continue;red+=pixels[index];green+=pixels[index+1];blue+=pixels[index+2];count++}
      if(count&&blue/count>95&&blue>red*1.18&&blue>green*1.08)this.blockedMaterials.add(material);
    }catch{/* Texture sampling is an optional fallback when the GLB has no semantic water tags. */}
  }

  private materialForHit(hit:THREE.Intersection){const mesh=hit.object as THREE.Mesh,materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];return materials[hit.face?.materialIndex??0]??materials[0]}

  private setupFoodTruckWindows(model:THREE.Object3D){
    const configs=[
      {id:'local' as const,name:'Local_food_truck_service_window',label:'세종 푸드트럭',title:'세종 푸드트럭',items:['명품순두부','장원갑칼국수','산장가든']},
      {id:'street' as const,name:'Street_food_truck_service_window',label:'세종 특산물',title:'세종 특산물',items:['조치원 복숭아','복숭아 가공품','싱싱세종 농산물']},
      {id:'dessert' as const,name:'Dessert_truck_service_window',label:'세종 디저트트럭',title:'세종 디저트트럭',items:['카페 노호','유람','만나밀 베이커리']},
    ];
    const objectByNormalizedName=(name:string)=>{
      const normalized=normalizedModelObjectName(name);let found:THREE.Object3D|undefined;
      model.traverse(object=>{if(!found&&normalizedModelObjectName(object.name)===normalized)found=object});
      return found;
    };
    const plazaObject=objectByNormalizedName('Central_plaza');
    this.foodTruckPlazaCenter=plazaObject
      ?new THREE.Box3().setFromObject(plazaObject).getCenter(new THREE.Vector3())
      :new THREE.Vector3(FOOD_EXPERIENCE_SPAWN.x,0,this.worldToSceneZ(FOOD_EXPERIENCE_SPAWN.z));
    const plaza={x:this.foodTruckPlazaCenter.x,z:this.sceneToWorldZ(this.foodTruckPlazaCenter.z)},approachDistance=190;
    this.foodTruckWindows=configs.flatMap(config=>{
      const object=objectByNormalizedName(config.name);if(!object)return [];
      const surface=object instanceof THREE.Mesh?object:object.children.find(child=>child instanceof THREE.Mesh) as THREE.Mesh|undefined;
      // The GLB already provides the exact inner service-window rectangle.
      // Project this authored surface directly; no inferred plane or scaling.
      if(surface)this.foodTruckScreens.set(config.id,surface);
      const center=new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
      const windowZ=this.sceneToWorldZ(center.z),dx=plaza.x-center.x,dz=plaza.z-windowZ,length=Math.hypot(dx,dz)||1;
      return [{
        id:config.id,label:config.label,x:center.x,z:windowZ,
        approachX:center.x+dx/length*approachDistance,
        approachZ:windowZ+dz/length*approachDistance,
      }];
    });
    if(import.meta.env.DEV)console.info('[food truck windows]',this.foodTruckWindows);
  }

  private applyFoodTruckScreen(object:THREE.Object3D,title:string,items:string[],id:FoodTruckWindow['id']){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
    const context=canvas.getContext('2d')!,accent=id==='local'?'#68e0b4':id==='street'?'#ff9b65':'#ffc36f';
    context.fillStyle='#102d2a';context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle=accent;context.fillRect(0,0,18,canvas.height);
    context.fillStyle='#effff9';context.font='900 58px "Noto Sans KR",sans-serif';context.fillText(title,65,92);
    context.fillStyle='#8ecfba';context.font='800 23px "Noto Sans KR",sans-serif';context.fillText('SEJONG FOOD GUIDE · 가까이에서 E',68,135);
    items.forEach((item,index)=>{
      const y=184+index*93;context.fillStyle=index%2?'#173a35':'#19423b';context.beginPath();context.roundRect(55,y,914,70,16);context.fill();
      context.fillStyle=accent;context.font='900 28px "Noto Sans KR",sans-serif';context.fillText(String(index+1).padStart(2,'0'),78,y+45);
      context.fillStyle='#fff';context.font='800 30px "Noto Sans KR",sans-serif';context.fillText(item,145,y+45);
    });
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
    object.traverse(child=>{
      if(!(child instanceof THREE.Mesh))return;
      const source=Array.isArray(child.material)?child.material[0]:child.material,material=source.clone();
      if('map' in material)material.map=texture;
      if(material instanceof THREE.MeshStandardMaterial){material.color.set(0xffffff);material.emissive.set(0xffffff);material.emissiveIntensity=.65;material.emissiveMap=texture;material.roughness=.55}
      material.needsUpdate=true;child.material=material;
    });
  }

  private updateFoodTruckProximity(x:number,z:number){
    if(!this.foodTruckWindows.length)return;
    // Each prompt belongs to its authored service-window mesh. The approach
    // point keeps the interaction on the counter-facing side, while the window
    // distance prevents a prompt from appearing near another part of a truck.
    const closest=this.foodTruckWindows.map(window=>({
      ...window,
      windowDistance:Math.hypot(x-window.x,z-window.z),
      approachDistance:Math.hypot(x-window.approachX,z-window.approachZ),
    })).sort((a,b)=>a.windowDistance-b.windowDistance)[0];
    const same=closest?.id===this.nearbyFoodTruckId;
    const nearby=closest
      &&closest.windowDistance<(same?340:300)
      &&closest.approachDistance<(same?220:180)
      ?closest:undefined;
    if(nearby?.id===this.nearbyFoodTruckId)return;
    this.nearbyFoodTruckId=nearby?.id;
    if(nearby&&this.foodSeatNearby){
      this.foodSeatNearby=undefined;
      gameEvents.emit('food-seat-proximity-changed',null);
    }
    gameEvents.emit('food-truck-proximity-changed',nearby?{id:nearby.id,label:nearby.label}:null);
  }

  private enterFoodTruckKiosk=(id?:FoodTruckWindow['id'])=>{
    const next=id??this.nearbyFoodTruckId,screen=next?this.foodTruckScreens.get(next):undefined;if(!next||!screen)return;
    // A truck can overlap the lake-return portal's proximity radius. Once the
    // service window owns the interaction, clear that stale portal state so its
    // travel prompt and charge timer cannot remain visible behind the kiosk.
    if(this.portalNearby||this.activePortal){
      this.portalNearby=false;this.activePortal=undefined;this.resetPortalCharge();
      gameEvents.emit('world-portal-proximity-changed',null);
    }
    // The walking map deliberately stretches depth by 1 / GROUND_PROJECTION.
    // That is useful for its isometric ground coordinates, but it also made a
    // rotated truck and its 2.36:1 service window look about 1.8x too wide in
    // the focused view. Restore the GLB's uniform XYZ proportions while the
    // kiosk is open, keeping the selected window fixed in world space.
    if(this.mapModel&&!this.foodTruckKioskMapTransform){
      const anchor=new THREE.Box3().setFromObject(screen).getCenter(new THREE.Vector3());
      const {z:scaleZ}=this.mapModel.scale,{z:positionZ}=this.mapModel.position;
      const factor=this.mapModel.scale.x/scaleZ,plazaZ=this.foodTruckPlazaCenter?.z;
      this.foodTruckKioskMapTransform={scaleZ,positionZ,plazaZ};
      this.mapModel.scale.z=this.mapModel.scale.x;
      this.mapModel.position.z=anchor.z-(anchor.z-positionZ)*factor;
      if(this.foodTruckPlazaCenter)this.foodTruckPlazaCenter.z=anchor.z-(this.foodTruckPlazaCenter.z-positionZ)*factor;
      this.mapModel.updateMatrixWorld(true);
    }
    screen.geometry.computeBoundingBox();
    const center=new THREE.Box3().setFromObject(screen).getCenter(new THREE.Vector3()),localSize=screen.geometry.boundingBox?.getSize(new THREE.Vector3())??new THREE.Vector3(1,1,.01);
    const normalAxis=localSize.x<=localSize.y&&localSize.x<=localSize.z?new THREE.Vector3(1,0,0):localSize.y<=localSize.z?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
    const normal=normalAxis.applyQuaternion(screen.getWorldQuaternion(new THREE.Quaternion())).normalize();
    // Choose the service-window face from the player's actual interaction
    // side. The local-food truck is authored on the opposite map edge from the
    // other two, so a plaza-center heuristic could select its back face after
    // the temporary depth-scale correction.
    const viewerDirection=new THREE.Vector3(this.localX,center.y,this.worldToSceneZ(this.localZ)).sub(center);
    viewerDirection.y=0;
    if(normal.dot(viewerDirection)<0)normal.negate();
    const focusFov=32,halfVerticalFov=THREE.MathUtils.degToRad(focusFov*.5),aspect=this.width/Math.max(1,this.height);
    // Match the requested reference composition exactly: the authored service
    // window occupies about 62% of viewport width (and, by its 2.36:1 aspect,
    // roughly 35% of viewport height). Use the mesh's transformed local axes,
    // not the full truck bounds, so every truck gets the same framing.
    const matrix=screen.matrixWorld.elements;
    const worldScaleX=Math.hypot(matrix[0],matrix[1],matrix[2]),worldScaleY=Math.hypot(matrix[4],matrix[5],matrix[6]);
    const windowWidth=localSize.x*worldScaleX,windowHeight=localSize.y*worldScaleY;
    const targetWidthRatio=.62;
    const distance=Math.max(180,windowWidth/(2*Math.tan(halfVerticalFov)*aspect*targetWidthRatio));
    // In the reference the window center sits slightly above viewport center,
    // leaving more of the counter and wheel visible below it.
    const focusTarget=center.clone().add(new THREE.Vector3(0,-windowHeight*.085,0));
    const kioskCamera=focusTarget.clone().addScaledVector(normal,distance);
    this.foodTruckKioskId=next;this.foodTruckKioskView={target:focusTarget,camera:kioskCamera};
    // Begin every truck transition on the same front axis. This avoids the
    // sideways orbit that appeared after the food map was replaced.
    const transitionTarget=focusTarget.clone();
    const transitionCamera=focusTarget.clone().addScaledVector(normal,distance*1.45);
    this.foodTruckKioskTransition={target:transitionTarget,camera:transitionCamera,fov:this.camera instanceof THREE.PerspectiveCamera?this.camera.fov:46,elapsed:0};
    this.localCharacter.root.visible=false;this.remotes.forEach(character=>{character.root.visible=false});
    gameEvents.emit('food-truck-kiosk-mode-changed',next);gameEvents.emit('game-input-lock',true);
  };
  private exitFoodTruckKiosk=()=>{
    if(!this.foodTruckKioskId)return;
    this.foodTruckKioskId=undefined;this.foodTruckKioskView=undefined;this.foodTruckKioskTransition=undefined;
    if(this.mapModel&&this.foodTruckKioskMapTransform){
      const saved=this.foodTruckKioskMapTransform;
      this.mapModel.scale.z=saved.scaleZ;this.mapModel.position.z=saved.positionZ;
      if(this.foodTruckPlazaCenter&&saved.plazaZ!==undefined)this.foodTruckPlazaCenter.z=saved.plazaZ;
      this.mapModel.updateMatrixWorld(true);this.foodTruckKioskMapTransform=undefined;
    }
    this.localCharacter.root.visible=true;this.remotes.forEach(character=>{character.root.visible=true});
    gameEvents.emit('food-truck-kiosk-screen-rect',null);gameEvents.emit('food-truck-kiosk-mode-changed',null);gameEvents.emit('game-input-lock',false);
  };

  private isGroundSurface(hit:THREE.Intersection){
    return !/^Seat (?:cushion|frame|back)(?:\.\d+)?$/.test(hit.object.name);
  }

  private groundMeshesAt(worldX:number,worldZ:number){
    const sceneZ=this.worldToSceneZ(worldZ);
    return this.mapMeshes.filter(mesh=>{
      const bounds=this.mapMeshBounds.get(mesh);
      return !bounds||(worldX>=bounds.min.x&&worldX<=bounds.max.x&&sceneZ>=bounds.min.z&&sceneZ<=bounds.max.z);
    });
  }

  private walkableMeshesAt(worldX:number,worldZ:number){
    const candidates=this.groundMeshesAt(worldX,worldZ),prefixes=this.options.groundObjectPrefixes;
    return prefixes?.length?candidates.filter(mesh=>prefixes.some(prefix=>mesh.name.startsWith(prefix))):candidates;
  }

  private sampleExperienceGround(worldX:number,worldZ:number,preferHighest=false):GroundSample|undefined{
    if(!this.mapMeshes.length)return {height:this.localGround,normal:new THREE.Vector3(0,1,0)};
    this.raycaster.near=0;this.raycaster.far=Infinity;
    this.raycaster.set(new THREE.Vector3(worldX,1200,this.worldToSceneZ(worldZ)),new THREE.Vector3(0,-1,0));
    return this.raycaster.intersectObjects(this.walkableMeshesAt(worldX,worldZ),false).flatMap(hit=>{
      if(!hit.face||!this.isGroundSurface(hit))return [];
      const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
      return normal.y>=MIN_WALKABLE_NORMAL&&!this.blockedMaterials.has(this.materialForHit(hit))?[{height:hit.point.y,normal,objectName:hit.object.name}]:[];
    }).sort((a,b)=>preferHighest?b.height-a.height:a.height-b.height)[0];
  }

  private sampleGround(worldX:number,worldZ:number,currentHeight:number,initial=false,maxStepHeight=MAX_STEP_HEIGHT):GroundSample|undefined{
    if(!this.mapMeshes.length)return {height:currentHeight,normal:new THREE.Vector3(0,1,0)};
    // Probe the whole character footprint while moving, not only its center.
    // Otherwise the center can cross a ledge while the shoes/capsule still
    // overlap its vertical face, which visually sinks a foot into the step.
    const footprintRadius=COLLISION_RADIUS*.82;
    // The campus is broad and mostly flat. One center probe preserves terrain
    // height while avoiding five costly GLB raycasts on every movement frame.
    const offsets=this.options.fastGroundSampling
      ?[[0,0]]
      :[[0,0],[footprintRadius,0],[-footprintRadius,0],[0,footprintRadius],[0,-footprintRadius]];
    const samples:GroundSample[]=[];
    for(const [index,[offsetX,offsetZ]] of offsets.entries()){
      this.raycaster.near=0;this.raycaster.far=Infinity;
      this.raycaster.set(new THREE.Vector3(worldX+offsetX,1200,this.worldToSceneZ(worldZ+offsetZ)),new THREE.Vector3(0,-1,0));
      const candidates=this.raycaster.intersectObjects(this.walkableMeshesAt(worldX+offsetX,worldZ+offsetZ),false).flatMap(hit=>{
        if(!hit.face||!this.isGroundSurface(hit))return [];
        const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
        return normal.y>=MIN_WALKABLE_NORMAL&&!this.blockedMaterials.has(this.materialForHit(hit))?[{height:hit.point.y,normal,objectName:hit.object.name}]:[];
      });
      const viable=initial?candidates.sort((a,b)=>b.height-a.height):candidates.filter(sample=>{const heightDelta=sample.height-currentHeight;return heightDelta<=maxStepHeight&&heightDelta>=-MAX_DROP_HEIGHT}).sort((a,b)=>Math.abs(a.height-currentHeight)-Math.abs(b.height-currentHeight));
      if(!viable.length){
        const extension=this.options.flatGroundExtension;
        const extensionX=worldX+offsetX,extensionZ=worldZ+offsetZ;
        if(extension&&extensionX>=extension.minX&&extensionX<=extension.maxX&&extensionZ>=extension.minZ&&extensionZ<=extension.maxZ){samples.push({height:currentHeight,normal:new THREE.Vector3(0,1,0)});continue}
        if(index===0)return;continue;
      }
      samples.push(viable[0]);
    }
    const minimumSamples=this.options.fastGroundSampling?1:(initial?3:offsets.length);
    if(samples.length<minimumSamples)return;
    const heights=samples.map(sample=>sample.height),height=Math.max(...heights);
    if(!isGroundFootprintCoherent(heights,maxStepHeight,initial))return;
    const normal=samples.reduce((sum,sample)=>sum.add(sample.normal),new THREE.Vector3()).normalize();
    return {height,normal,objectName:samples.find(sample=>Math.abs(sample.height-height)<.01)?.objectName};
  }

  private sampleGovernmentAiPlatformGround(worldX:number,worldZ:number,jumpHeight:number):GroundSample|undefined{
    const surface=this.governmentAiPlatformSurface;
    if(!surface)return;
    const inside=Math.hypot(worldX-surface.x,worldZ-surface.z)<=surface.radius;
    if(!inside){this.governmentAiPlatformGrounded=false;return}
    if(!this.governmentAiPlatformGrounded){
      const rise=surface.height-this.localGround;
      // Require a real jump when approaching from the plaza floor. Once the
      // top has been acquired, keep using the exact same height until the full
      // character footprint leaves the platform, preventing feet from sinking.
      if(rise>3&&(jumpHeight<=8||this.localGround+jumpHeight<surface.height-4))return;
      this.governmentAiPlatformGrounded=true;
    }
    return {height:surface.height,normal:new THREE.Vector3(0,1,0)};
  }

  private sampleVisibleSurfaceGround(worldX:number,worldZ:number):GroundSample|undefined{
    if(!this.mapMeshes.length)return {height:this.localGround,normal:new THREE.Vector3(0,1,0)};
    this.raycaster.near=0;this.raycaster.far=Infinity;
    this.raycaster.set(new THREE.Vector3(worldX,1200,this.worldToSceneZ(worldZ)),new THREE.Vector3(0,-1,0));
    const hit=this.raycaster.intersectObjects(this.walkableMeshesAt(worldX,worldZ),false).filter(hit=>this.isGroundSurface(hit)).sort((a,b)=>b.point.y-a.point.y)[0];
    return hit?{height:hit.point.y+.15,normal:new THREE.Vector3(0,1,0)}:undefined;
  }

  private spawnSpaceClear(worldX:number,worldZ:number,groundHeight:number){
    this.raycaster.near=4;this.raycaster.far=(this.options.characterHeight??CHARACTER_HEIGHT)+70;
    this.raycaster.set(new THREE.Vector3(worldX,groundHeight+4,this.worldToSceneZ(worldZ)),new THREE.Vector3(0,1,0));
    return this.raycaster.intersectObjects(this.groundMeshesAt(worldX,worldZ),false).length===0;
  }

  private personalFarmEscapeDirections(x:number,z:number,groundY:number){
    const distance=76;
    return ([[distance,0],[-distance,0],[0,distance],[0,-distance]] as const).map(([dx,dz])=>{
      const targetX=x+dx,targetZ=z+dz;
      const ground=this.sampleGround(targetX,targetZ,groundY,false,MAX_STEP_HEIGHT);
      return !!ground&&this.spawnSpaceClear(targetX,targetZ,ground.height)&&this.bodyPathClearFrom(x,z,groundY,targetX,targetZ);
    });
  }

  private personalFarmOverlappingColliders(x:number,z:number,groundY:number){
    const sceneZ=this.worldToSceneZ(z),height=this.options.characterHeight??CHARACTER_HEIGHT;
    return this.mapMeshes.filter(mesh=>PERSONAL_FARM_COLLIDER_PREFIXES.some(prefix=>mesh.name.startsWith(prefix))).filter(mesh=>{
      const bounds=this.mapMeshBounds.get(mesh);if(!bounds)return false;
      return x+COLLISION_RADIUS>=bounds.min.x&&x-COLLISION_RADIUS<=bounds.max.x&&sceneZ+COLLISION_RADIUS>=bounds.min.z&&sceneZ-COLLISION_RADIUS<=bounds.max.z&&groundY+height>=bounds.min.y&&groundY<=bounds.max.y;
    }).map(mesh=>mesh.name);
  }

  private personalFarmMovementRayBlocks(x:number,z:number,groundY:number){
    const directions={east:[76,0],west:[-76,0],south:[0,76],north:[0,-76]} as const;
    return Object.fromEntries(Object.entries(directions).map(([name,[dx,dz]])=>{
      const start=new THREE.Vector3(x,groundY+this.characterGroundClearance+(this.options.characterHeight??CHARACTER_HEIGHT)*.46,this.worldToSceneZ(z));
      const end=new THREE.Vector3(x+dx,start.y,this.worldToSceneZ(z+dz)),direction=end.sub(start),distance=direction.length();
      this.bodyRaycaster.near=2;this.bodyRaycaster.far=distance+COLLISION_RADIUS;this.bodyRaycaster.set(start,direction.normalize());
      const hits=this.bodyRaycaster.intersectObjects(this.mapMeshes,false).filter(hit=>{
        if(!hit.face)return false;const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));return Math.abs(normal.y)<.55;
      }).map(hit=>hit.object.name);
      return [name,[...new Set(hits)]];
    }));
  }

  private canEscapeSpawn(x:number,z:number,groundY:number){
    return this.personalFarmEscapeDirections(x,z,groundY).filter(Boolean).length>=3;
  }

  private personalFarmSpawnAllowed(x:number,z:number,mode:PersonalFarmMode){
    if(mode==='indoor')return x>=770&&x<=1630&&z>=680&&z<=1180;
    const portal=this.options.portal;
    const clearOfPortal=!portal||Math.hypot(x-portal.x,z-portal.z)>=KEY_PORTAL_EXIT_DISTANCE+45;
    const clearOfDoor=Math.hypot(x-1200,z-1300)>=145;
    return x>=430&&x<=1880&&z>=1340&&z<=1780&&clearOfPortal&&clearOfDoor;
  }

  private findSafeSpawn(preferredX:number,preferredZ:number,farmMode?:PersonalFarmMode){
    const offsets:Array<[number,number]>=[[0,0]];
    for(const radius of [55,90,130,180,240,320]){
      for(let index=0;index<16;index++){
        const angle=index/16*Math.PI*2;
        offsets.push([Math.cos(angle)*radius,Math.sin(angle)*radius]);
      }
    }
    for(const [offsetX,offsetZ] of offsets){
      const x=Math.max(20,Math.min(this.movementWorldWidth()-20,preferredX+offsetX));
      const z=Math.max(20,Math.min(this.movementWorldHeight()-20,preferredZ+offsetZ));
      // Choose the walkable surface closest to the map's base level instead of
      // treating a tree canopy or roof as the spawn floor.
      // Authored ground lists intentionally exclude furniture and roofs. At
      // spawn time choose their highest surface (for example Central plaza)
      // instead of the lower map-island base closest to height zero.
      const ground=this.sampleGround(x,z,0,!!this.options.groundObjectPrefixes?.length,1200);
      // Railings, boat hulls and tree canopies can all be hit by the ground
      // ray. Only an upward-facing surface is safe for an upright avatar.
      const farmSafe=!this.options.personalFarm||!farmMode||(this.personalFarmSpawnAllowed(x,z,farmMode)&&this.canEscapeSpawn(x,z,ground?.height??0));
      if(ground&&ground.normal.y>=.72&&this.spawnSpaceClear(x,z,ground.height)&&farmSafe)return {x,z,ground};
    }
    return undefined;
  }

  private bodyPathClearFrom(startX:number,startZ:number,startGround:number,worldX:number,worldZ:number){
    const extension=this.options.flatGroundExtension;
    if(extension&&worldX>=extension.minX&&worldX<=extension.maxX&&worldZ>=extension.minZ&&worldZ<=extension.maxZ&&startZ>=extension.minZ-60&&worldZ>=startZ)return true;
    const startSceneZ=this.worldToSceneZ(startZ),endSceneZ=this.worldToSceneZ(worldZ);
    const penetration=(zone:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>
      x>=zone.minX&&x<=zone.maxX&&z>=zone.minZ&&z<=zone.maxZ
        ?Math.min(x-zone.minX,zone.maxX-x,z-zone.minZ,zone.maxZ-z)
        :-1;
    if(this.authoredCollisionZones.some(zone=>{
      const startPenetration=penetration(zone,startX,startSceneZ),endPenetration=penetration(zone,worldX,endSceneZ);
      // A player restored inside an old collision zone must still be able to
      // walk out. Only block entering or moving deeper into the furniture.
      return endPenetration>=0&&(startPenetration<0||endPenetration>=startPenetration-.001);
    }))return false;
    if(!this.mapMeshes.length)return true;
    const characterHeight=this.options.characterHeight??CHARACTER_HEIGHT;
    const groundClearance=this.characterGroundClearance;
    const start=new THREE.Vector3(startX,startGround+groundClearance,this.worldToSceneZ(startZ));
    const end=new THREE.Vector3(worldX,start.y,this.worldToSceneZ(worldZ)),direction=end.sub(start),distance=direction.length();
    if(distance<.001)return true;
    const pathBounds=new THREE.Box3().setFromPoints([start,start.clone().add(direction)]).expandByScalar(COLLISION_RADIUS);
    const nearbyMeshes=this.mapMeshes.filter(mesh=>this.mapMeshBounds.get(mesh)?.intersectsBox(pathBounds)??true);
    const normalizedDirection=direction.normalize();
    const side=new THREE.Vector3(-normalizedDirection.z,0,normalizedDirection.x).multiplyScalar(COLLISION_RADIUS*.8);
    // Cast a small capsule-like grid. The old single waist-height row missed
    // thresholds and low steps, allowing the legs to enter them before the
    // center-point ground ray noticed the height change.
    return [characterHeight*.14,characterHeight*.46,characterHeight*.78].every(height=>
      [-1,0,1].every(offset=>{
        this.bodyRaycaster.near=2;this.bodyRaycaster.far=distance+COLLISION_RADIUS;
        const rayOrigin=start.clone().addScaledVector(side,offset);rayOrigin.y+=height;
        this.bodyRaycaster.set(rayOrigin,normalizedDirection);
        const blockingHit=this.bodyRaycaster.intersectObjects(nearbyMeshes,false).find(hit=>{
          if(!hit.face)return false;
          const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
          return Math.abs(normal.y)<.55;
        });
        return !blockingHit;
      })
    );
  }

  private bodyPathClear(worldX:number,worldZ:number){
    if(this.guideNpc&&Math.hypot(worldX-this.guidePosition.x,worldZ-this.guidePosition.z)<42)return false;
    if(this.localNpcs.some(npc=>npc.config.collisionRadius&&Math.hypot(worldX-npc.x,worldZ-npc.z)<npc.config.collisionRadius))return false;
    const bearRadius=this.options.bearCollisionRadius;
    if(bearRadius){
      const bearRoots=[this.residentRoot,...this.residentDecorRoots].filter((root):root is THREE.Group=>!!root);
      if(bearRoots.some(root=>Math.hypot(worldX-root.position.x,worldZ-this.sceneToWorldZ(root.position.z))<bearRadius))return false;
    }
    return this.bodyPathClearFrom(this.localX,this.localZ,this.localGround,worldX,worldZ);
  }

  private canUsePortal(config:PortalConfig){
    if(config.destination!=='personal-farm')return true;
    const sourceMapId:MapId=this.options.mapName==='베어트리파크'?'bear-tree-park':this.options.mapName==='수목원'?'garden':'personal-farm';
    return canAccessPersonalFarmPortal({sourceMapId});
  }

  private createMapLayoutEnhancements(){
    const map=this.options.mapName;
    if(map!=='세종호수공원'&&map!=='수목원')return;
    const root=new THREE.Group();root.name=`${map}-layout-enhancements`;
    const pathMaterial=new THREE.MeshStandardMaterial({color:map==='세종호수공원'?0xc9b891:0xd0bd91,roughness:.92});
    const grassMaterial=new THREE.MeshStandardMaterial({color:map==='세종호수공원'?0x789b5e:0x7f9f62,roughness:1});
    const addRect=(x:number,z:number,width:number,depth:number,material:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,2,depth),material);mesh.position.set(x,1,this.worldToSceneZ(z));mesh.receiveShadow=true;root.add(mesh)};
    if(map==='세종호수공원'){
      addRect(1200,930,1500,86,pathMaterial);addRect(1200,930,86,1080,pathMaterial);addRect(1200,1470,1500,86,pathMaterial);addRect(1960,930,86,1080,pathMaterial);
      [[603,452],[1200,1462],[491,1556],[1450,1440],[1200,1610]].forEach(([x,z])=>addRect(x,z,210,170,pathMaterial));
      [[80,80],[2320,80],[80,1780],[2320,1780],[320,350],[2080,350],[320,1550],[2080,1550]].forEach(([x,z])=>addRect(x,z,90,90,grassMaterial));
    }else{
      addRect(1200,930,860,74,pathMaterial);addRect(780,1180,74,720,pathMaterial);addRect(1620,1180,74,720,pathMaterial);addRect(1200,1450,860,74,pathMaterial);
      [[1200,1180],[1840,1130],[1200,1260]].forEach(([x,z])=>addRect(x,z,190,150,pathMaterial));
      [[420,420],[1980,420],[420,1500],[1980,1500]].forEach(([x,z])=>addRect(x,z,90,90,grassMaterial));
    }
    this.scene.add(root);this.layoutDecorationRoots.push(root);
  }

  private onPersonalFarmProgressChanged=(progress:PersonalFarmProgressDto)=>{const justFed=(this.personalFarmProgress?.bearMission.fedFeedSpotIds.length??0)<progress.bearMission.fedFeedSpotIds.length;this.personalFarmProgress=progress;if(this.mapReady)this.applyPersonalFarmProgress(progress);if(justFed)this.playResidentFeedReward()};
  private applyPersonalFarmProgress(progress:PersonalFarmProgressDto){
    const feedClues={food:'apple',cave:'carrot',water:'acorn'} as const;
    for(const [clueId,feedId] of Object.entries(feedClues)){
      const root=this.wildlifeClueRoots.get(clueId);if(!root)continue;
      const collected=progress.bearMission.collectedFeedIds.includes(feedId);
      root.traverse(object=>{if(object instanceof THREE.Mesh&&object.material instanceof THREE.MeshBasicMaterial)object.material.opacity=collected?.16:Math.max(object.material.opacity,.3)});
    }
    this.feedSpotRoots.forEach((root,id)=>{const repeatReady=progress.bearMission.completed&&!progress.bearMission.repeatFeedSpotId&&(!progress.bearMission.repeatFeedAvailableAt||Date.parse(progress.bearMission.repeatFeedAvailableAt)<=Date.now());const done=progress.bearMission.completed?!repeatReady:progress.bearMission.completedFeedSpotIds.includes(id);root.visible=!done;if(done&&this.feedSpotNearby===id){this.feedSpotNearby=undefined;gameEvents.emit('bear-feed-spot-proximity-changed',null)}});
    this.syncResidentBearBehavior(progress);
    if(!this.options.personalFarm)return;
    const active=progress.farm.activeRewardIds;
    const bearStatueUnlocked=progress.farm.unlockedRewardIds.includes('bear-statue')||progress.bearMission.completed;
    void this.renderPersonalFarmBearStatue(bearStatueUnlocked);
    void this.renderPersonalFarmFlowers();
    this.personalFarmRewardsRoot?.removeFromParent();
    const root=new THREE.Group();root.name='personal-farm-server-rewards';
    if(progress.farm.unlockedRewardIds.includes('nature-complete-emblem')&&(!active.length||active.includes('nature-complete-emblem'))){
      const emblem=new THREE.Mesh(new THREE.TorusGeometry(24,5,12,32),new THREE.MeshStandardMaterial({color:0xf4c75c,emissive:0x6d4b08,emissiveIntensity:.35}));emblem.name='nature-complete-emblem';emblem.position.set(960,62,this.worldToSceneZ(1325));emblem.rotation.x=Math.PI/2;root.add(emblem);
    }
    this.personalFarmRewardsRoot=root;this.scene.add(root);
  }

  private async renderPersonalFarmBearStatue(unlocked:boolean){
    if(!unlocked){this.personalFarmBearStatueUnlocked=false;this.personalFarmBearStatueRoot?.removeFromParent();this.personalFarmBearStatueRoot=undefined;this.personalFarmBearStatueRenderToken++;return}
    if(this.personalFarmBearStatueRoot||this.personalFarmBearStatueUnlocked)return;
    this.personalFarmBearStatueUnlocked=true;const token=++this.personalFarmBearStatueRenderToken;
    if(this.destroyed){this.personalFarmBearStatueUnlocked=false;return}
    try{
      const statue=await createBearStatueObject({targetHeight:215,rotationY:-Math.PI*.1});
      if(token!==this.personalFarmBearStatueRenderToken||this.destroyed||!this.options.personalFarm)return;
      const anchor=this.personalFarmBearStatueAnchor,bounds=new THREE.Box3().setFromObject(statue),center=bounds.getCenter(new THREE.Vector3());
      const ground=this.sampleGround(anchor.x,anchor.z,0,true)??this.sampleExperienceGround(anchor.x,anchor.z,true)??{height:this.localGround};
      statue.position.set(anchor.x-center.x,ground.height-bounds.min.y+1,this.worldToSceneZ(anchor.z)-center.z);
      this.personalFarmBearStatueRoot=statue;this.scene.add(statue);
    }catch(error){this.personalFarmBearStatueUnlocked=false;if(import.meta.env.DEV)console.warn('[personal-farm bear statue failed]',error)}
  }

  private setupPersonalFarmGardenLayout(model:THREE.Object3D){
    model.updateMatrixWorld(true);
    const houseBounds=new THREE.Box3();
    model.traverse(object=>{
      if(!object.name.startsWith('ARCH_')&&!object.name.startsWith('EXTERIOR_'))return;
      const bounds=new THREE.Box3().setFromObject(object);if(!bounds.isEmpty())houseBounds.union(bounds);
    });
    const houseCenterScene=houseBounds.isEmpty()?this.mapBounds.getCenter(new THREE.Vector3()):houseBounds.getCenter(new THREE.Vector3());
    const houseCenter={x:houseCenterScene.x,z:this.sceneToWorldZ(houseCenterScene.z)};
    const door=model.getObjectByName('EXTERIOR_Entry_Door')??model.getObjectByName('EXTERIOR_Front_Door_Header');
    if(!door)return;
    const doorScene=new THREE.Box3().setFromObject(door).getCenter(new THREE.Vector3());
    const doorCenter={x:doorScene.x,z:this.sceneToWorldZ(doorScene.z)};
    const frontLength=Math.hypot(doorCenter.x-houseCenter.x,doorCenter.z-houseCenter.z)||1;
    const houseFrontDirection={x:(doorCenter.x-houseCenter.x)/frontLength,z:(doorCenter.z-houseCenter.z)/frontLength};
    const lateral={x:-houseFrontDirection.z,z:houseFrontDirection.x};
    const bedCenter={x:doorCenter.x+houseFrontDirection.x*190,z:doorCenter.z+houseFrontDirection.z*190};
    // Upstream layout: three flowers on the left, two on the right.
    const slotOffsets=[{side:105,front:20},{side:195,front:-25},{side:285,front:45},{side:-300,front:30},{side:-420,front:-20}];
    this.personalFarmFlowerSlots=PERSONAL_FARM_FLOWER_SLOTS.map((slot,index)=>{
      const offset=slotOffsets[index];
      return {...slot,x:bedCenter.x+lateral.x*offset.side+houseFrontDirection.x*offset.front,z:bedCenter.z+lateral.z*offset.side+houseFrontDirection.z*offset.front};
    });
    const slotThree=this.personalFarmFlowerSlots[2];
    this.personalFarmBearStatueAnchor={x:slotThree.x-180,z:slotThree.z-15};
    this.personalFarmFlowerSlotMarkers?.removeFromParent();
    const markers=new THREE.Group();markers.name='personal-farm-flower-slot-markers';
    this.personalFarmFlowerSlots.forEach((slot,index)=>{
      const ground=this.sampleGround(slot.x,slot.z,0,true);if(!ground)return;
      const marker=new THREE.Group();marker.name=`flower-slot-marker-${index+1}`;marker.position.set(slot.x,ground.height+3,this.worldToSceneZ(slot.z));
      const ring=new THREE.Mesh(new THREE.RingGeometry(25,36,32),new THREE.MeshBasicMaterial({color:0xffd95a,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;
      const light=new THREE.PointLight(0xffdc71,1.4,120);light.position.y=20;marker.userData.ring=ring;marker.userData.slot=index+1;marker.add(ring,light);markers.add(marker);
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const context=canvas.getContext('2d');
      if(context){context.fillStyle='#fff7c7';context.beginPath();context.arc(64,64,48,0,Math.PI*2);context.fill();context.strokeStyle='#e3ad31';context.lineWidth=7;context.stroke();context.fillStyle='#5d4315';context.font='bold 62px sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillText(String(index+1),64,68)}
      const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false}));label.name=`flower-slot-label-${index+1}`;label.position.y=47;label.scale.set(34,34,1);marker.add(label);
    });
    this.personalFarmFlowerSlotMarkers=markers;this.scene.add(markers);
    if(import.meta.env.DEV){const objectCenter=(prefix:string)=>{const matches:THREE.Object3D[]=[];model.traverse(object=>{if(object.name.startsWith(prefix))matches.push(object)});const bounds=new THREE.Box3();matches.forEach(object=>bounds.union(new THREE.Box3().setFromObject(object)));if(bounds.isEmpty())return null;const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());return {x:center.x,z:this.sceneToWorldZ(center.z),y:center.y,width:size.x,depth:size.z,height:size.y,names:matches.map(item=>item.name)}};console.info('[personal-farm layout diagnostics]',{houseCenter,doorCenter,bedCenter,spawn:PERSONAL_FARM_SPAWN,slots:this.personalFarmFlowerSlots,leftBush:objectCenter('ENV_Bush_05_')??objectCenter('ENV_Bush_'),fountain:objectCenter('ENV_Fountain_')})}
  }

  private async renderPersonalFarmFlowers(){
    if(!this.options.personalFarm)return;
    const selected=this.personalFarmProgress?.gardenMission.plantedFlowers??[],signature=selected.map(item=>`${item.slot}:${item.flowerId}`).sort().join('|');
    if(signature===this.personalFarmFlowerSignature&&Boolean(this.personalFarmFlowerRoot)===Boolean(selected.length))return;
    this.personalFarmFlowerSignature=signature;
    const token=++this.personalFarmFlowerRenderToken;
    const root=this.personalFarmFlowerRoot??new THREE.Group();root.name='personal-farm-planted-flowers';if(!this.personalFarmFlowerRoot){this.personalFarmFlowerRoot=root;this.scene.add(root)}
    const wanted=new Map<number,GardenFlowerId>(selected.map(item=>[item.slot,item.flowerId]));
    for(const [slot,object] of this.personalFarmFlowerObjects){if(wanted.get(slot)!==object.userData.flowerId){object.removeFromParent();this.personalFarmFlowerObjects.delete(slot)}}
    for(const planted of selected){
      const flowerId=planted.flowerId,slot=this.personalFarmFlowerSlots[planted.slot-1];
      if(!slot||this.personalFarmFlowerObjects.get(planted.slot)?.userData.flowerId===flowerId)continue;
      try{
        const object=await createFlowerObjectById(flowerId);
        if(token!==this.personalFarmFlowerRenderToken||this.destroyed)return;
        object.position.set(0,0,0);object.rotation.set(0,slot.rotationY,0);object.scale.setScalar(1);
        const initial=new THREE.Box3().setFromObject(object),size=initial.getSize(new THREE.Vector3());if(size.y<=.01)continue;
        object.scale.multiplyScalar(slot.targetHeight/size.y);
        const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3()),ground=this.sampleGround(slot.x,slot.z,0,true);if(!ground)continue;
        object.position.set(slot.x-center.x,ground.height-bounds.min.y+1,this.worldToSceneZ(slot.z)-center.z);
        object.name=`${slot.slotId}-${flowerId}`;object.userData.flowerId=flowerId;root.add(object);this.personalFarmFlowerObjects.set(planted.slot,object);
      }catch(error){if(import.meta.env.DEV)console.warn('[personal-farm flower asset failed]',{flowerId,error:error instanceof Error?error.message:'unknown'})}
    }
    if(token!==this.personalFarmFlowerRenderToken||this.destroyed)return;
  }

  private togglePersonalFarmInterior=()=>{
    if(this.personalFarmSleeping){
      this.personalFarmSleeping=false;this.personalFarmBedNearby=false;this.localCharacter.setLying(false);
      gameEvents.emit('personal-farm-bed-proximity-changed',null);
    }
    if(this.personalFarmActiveSeat){
      this.personalFarmActiveSeat=undefined;this.personalFarmSeatNearby=undefined;this.localCharacter.setSeated(false);
      gameEvents.emit('personal-farm-seat-proximity-changed',null);
    }
    this.personalFarmInterior=!this.personalFarmInterior;
    this.personalFarmShell.forEach(object=>{object.visible=!this.personalFarmInterior});
    const mode:PersonalFarmMode=this.personalFarmInterior?'indoor':'outdoor';
    const target=this.personalFarmInterior?{x:1200,z:1160}:{x:1050,z:1370};
    const fallback=this.personalFarmInterior?{x:1050,z:1100}:PERSONAL_FARM_SPAWN;
    const safe=this.findSafeSpawn(target.x,target.z,mode)??this.findSafeSpawn(fallback.x,fallback.z,mode);
    if(safe){this.localX=safe.x;this.localZ=safe.z;this.localGround=safe.ground.height;this.localNormal.copy(safe.ground.normal);this.pendingTeleport={x:safe.x,z:safe.z,groundHeight:safe.ground.height}}
    this.personalFarmDoorNearby=false;
    gameEvents.emit('personal-farm-door-proximity-changed',null);
    gameEvents.emit('personal-farm-interior-changed',this.personalFarmInterior);
  };

  updateLocalCharacter(proposedX:number,proposedZ:number,yaw:number,motion:MotionState,delta:number,jumpHeight=0,emote:CharacterEmote|null=null){
    if(!this.mapReady)return {x:this.localX,z:this.localZ,groundHeight:this.localGround};
    if(this.pendingTeleport){proposedX=this.pendingTeleport.x;proposedZ=this.pendingTeleport.z;if(this.pendingTeleport.groundHeight!==undefined)this.localGround=this.pendingTeleport.groundHeight;this.pendingTeleport=undefined}
    if(this.observatoryTelescopeActive){proposedX=this.localX;proposedZ=this.localZ;motion='idle';jumpHeight=0;emote=null}
    if(this.bearPhotoMode&&this.bearPhotoDestination){
      proposedX=this.bearPhotoDestination.x;proposedZ=this.bearPhotoDestination.z;this.localGround=this.bearPhotoDestination.groundHeight;yaw=BEAR_PHOTO_CAMERA_YAW;motion='idle';jumpHeight=0;
    }
    this.updateResident(delta);
    if(this.options.personalFarm){
      const door=this.personalFarmInterior?{x:1200,z:1160}:{x:1200,z:1300};
      const nearby=Math.hypot(this.localX-door.x,this.localZ-door.z)<(this.personalFarmDoorNearby?135:115);
      if(nearby!==this.personalFarmDoorNearby){
        this.personalFarmDoorNearby=nearby;
        gameEvents.emit('personal-farm-door-proximity-changed',nearby?{inside:this.personalFarmInterior}:null);
      }
      const flowerBedCenter=this.personalFarmFlowerSlots.reduce((center,slot)=>({x:center.x+slot.x/this.personalFarmFlowerSlots.length,z:center.z+slot.z/this.personalFarmFlowerSlots.length}),{x:0,z:0});
      const plantNearby=!this.personalFarmInterior&&!nearby&&Math.hypot(this.localX-flowerBedCenter.x,this.localZ-flowerBedCenter.z)<(this.personalFarmPlantAnchorNearby?190:165);
      if(plantNearby!==this.personalFarmPlantAnchorNearby){this.personalFarmPlantAnchorNearby=plantNearby;gameEvents.emit('personal-farm-plant-anchor-proximity-changed',plantNearby)}
      const planted=this.personalFarmProgress?.gardenMission.plantedFlowers??[];
      const closestSlot=!this.personalFarmInterior&&!nearby?this.personalFarmFlowerSlots.map((slot,index)=>({slot:(index+1) as 1|2|3|4|5,distance:Math.hypot(this.localX-slot.x,this.localZ-slot.z)})).sort((a,b)=>a.distance-b.distance)[0]:undefined;
      const slotNearby=closestSlot&&closestSlot.distance<105?closestSlot.slot:undefined;
      if(slotNearby!==this.personalFarmFlowerSlotNearby){this.personalFarmFlowerSlotNearby=slotNearby;gameEvents.emit('personal-farm-flower-slot-proximity-changed',slotNearby?{slot:slotNearby,flowerId:planted.find(item=>item.slot===slotNearby)?.flowerId}:null)}
      const closestFlower=!this.personalFarmInterior&&!nearby?planted.map(item=>({flowerId:item.flowerId,distance:Math.hypot(this.localX-this.personalFarmFlowerSlots[item.slot-1].x,this.localZ-this.personalFarmFlowerSlots[item.slot-1].z)})).sort((a,b)=>a.distance-b.distance)[0]:undefined;
      const flowerNearby=closestFlower&&closestFlower.distance<95?closestFlower.flowerId:undefined;
      if(flowerNearby!==this.personalFarmFlowerNearby){this.personalFarmFlowerNearby=flowerNearby;gameEvents.emit('personal-farm-flower-proximity-changed',flowerNearby??null)}
    }
    this.updateGuideNpc(delta);
    this.updateLocalNpcs(delta);
    this.updatePortals();
    this.updateFoodTruckProximity(this.localX,this.localZ);
    this.updateLakeExperienceCircles();
    this.updateProjectRoomHologram();
    this.updateStudentHallAiTreeEffect(delta);
    this.smartCityHologram?.update(delta);
    this.updateGovernmentAiHologram(delta);
    if(this.overviewActive){this.showMapOverview();this.renderAccumulator+=delta;if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}return {x:this.localX,z:this.localZ,groundHeight:this.localGround}}
    // While a government display is open the WebGL canvas is hidden behind
    // the DOM interface. Keep only the short camera/rect transition alive and
    // skip collision raycasts, proximity sorting and continuous 3D rendering.
    if(this.recruitmentKioskActive){
      // During the short push-in, render only the 3D kiosk preview. Once the
      // camera settles, the DOM UI is static and WebGL can sleep while the
      // visitor taps or edits the screen, avoiding a second render loop.
      if(this.recruitmentKioskTransition){
        const groundPosition=this.followTarget.set(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
        this.followCharacter(groundPosition,delta);this.renderAccumulator+=delta;
        if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
      }
      return {x:this.localX,z:this.localZ,groundHeight:this.localGround};
    }
    if(this.governmentWebUiActive){
      const groundPosition=this.followTarget.set(this.localX,this.localGround+this.characterGroundClearance,this.worldToSceneZ(this.localZ));
      this.followCharacter(groundPosition,delta);
      if(this.governmentWebUiTransition){
        this.renderAccumulator+=delta;
        if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
      }
      return {x:this.localX,z:this.localZ,groundHeight:this.localGround};
    }
    if(this.personalFarmSleeping&&this.personalFarmBed){
      const bed=this.personalFarmBed;
      this.localX=bed.x;this.localZ=bed.z;
      const position=this.localRenderPosition.set(bed.x,bed.seatHeight,this.worldToSceneZ(bed.z));
      const cameraTarget=this.followTarget.set(bed.cameraX,bed.seatHeight,this.worldToSceneZ(bed.cameraZ));
      this.localCharacter.update(position,this.localNormal,bed.yaw,'idle',delta);
      this.followCharacter(cameraTarget,delta);this.adjustQuality(delta);this.renderAccumulator+=delta;
      if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
      return {x:bed.x,z:bed.z,groundHeight:this.localGround};
    }
    const activeSeat=this.artsCenterActiveSeat??this.foodActiveSeat??this.projectRoomActiveSeat??this.centralPlazaSofaActiveSeat??this.personalFarmActiveSeat;
    if(activeSeat){
      const seat=activeSeat,characterHeight=this.options.characterHeight??CHARACTER_HEIGHT;
      this.localX=seat.x;this.localZ=seat.z;
      // Cafe and project-room cushions sit higher than the auditorium seats.
      // Apply map-specific lifts so the avatar's hips rest on the cushion top.
      const foodSeatLift=this.foodActiveSeat?22:0;
      const projectRoomSeatLift=this.projectRoomActiveSeat?24:0;
      const centralPlazaSeatLift=this.centralPlazaSofaActiveSeat?22:0;
      const personalFarmSeatLift=this.personalFarmActiveSeat?20:0;
      const position=this.localRenderPosition.set(seat.x,seat.seatHeight-characterHeight*.53+foodSeatLift+projectRoomSeatLift+centralPlazaSeatLift+personalFarmSeatLift,this.worldToSceneZ(seat.z));
      const cameraGround=this.followTarget.set(seat.x,seat.seatHeight,this.worldToSceneZ(seat.z));
      this.localCharacter.update(position,this.localNormal,seat.yaw,'idle',delta);
      this.followCharacter(cameraGround,delta);if(this.artsCenterActiveSeat)this.syncArtsCenterStageScreenRect();this.adjustQuality(delta);this.renderAccumulator+=delta;
      if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
      return {x:seat.x,z:seat.z,groundHeight:this.localGround};
    }
    const positionChanged=Math.hypot(proposedX-this.localX,proposedZ-this.localZ)>.001;
    // Jumping may clear a low obstacle, but must not make roofs count as
    // reachable ground. A larger downward allowance lets a character already
    // stranded on a roof step back onto the real terrain.
    const canCrossBody=jumpHeight>JUMP_COLLISION_CLEARANCE&&this.options.mapName!=='모집센터';
    const reachableHeight=reachableStepHeight(jumpHeight,this.options.maxJumpStepHeight);
    const pathClear=(x:number,z:number)=>canCrossBody||this.options.simplifiedCollision||this.bodyPathClear(x,z);
    const walkable=(ground:GroundSample|undefined)=>ground&&ground.normal.y>=.55?ground:undefined;
    const groundAt=(x:number,z:number)=>this.sampleGovernmentAiPlatformGround(x,z,jumpHeight)??walkable(this.sampleGround(x,z,this.localGround,false,reachableHeight));
    let nextX=proposedX,nextZ=proposedZ,sample=positionChanged?(pathClear(nextX,nextZ)?groundAt(nextX,nextZ):undefined):this.sampleGovernmentAiPlatformGround(nextX,nextZ,jumpHeight)??{height:this.localGround,normal:this.localNormal};
    if(!sample){nextZ=this.localZ;sample=pathClear(nextX,nextZ)?groundAt(nextX,nextZ):undefined}
    if(!sample){nextX=this.localX;nextZ=proposedZ;sample=pathClear(nextX,nextZ)?groundAt(nextX,nextZ):undefined}
    if(!sample){nextX=this.localX;nextZ=this.localZ;sample={height:this.localGround,normal:this.localNormal}}
    this.localX=nextX;this.localZ=nextZ;this.localGround=sample.height;this.localNormal.copy(sample.normal);
    if(this.artsCenterPosterScreens.length)this.updateArtsCenterSeatProximity(nextX,nextZ)
    if(this.options.foodTruckExperience)this.updateFoodSeatProximity(nextX,nextZ)
    if(this.options.projectRoomInteractions)this.updateProjectRoomSeatProximity(nextX,nextZ)
    if(this.options.centralPlazaSofaSeats)this.updateCentralPlazaSofaSeatProximity(nextX,nextZ)
    if(this.options.personalFarm){this.updatePersonalFarmSeatProximity(nextX,nextZ);this.updatePersonalFarmBedProximity(nextX,nextZ)}
    const closestLocalNpc=this.localNpcs.filter(npc=>!this.hiddenCharacterIds.has(npc.config.id)).map(npc=>({npc,distance:Math.hypot(nextX-npc.x,nextZ-npc.z)})).sort((a,b)=>a.distance-b.distance)[0];
    const sameLocalNpc=closestLocalNpc?.npc.config.id===this.localNpcNearbyId;
    const npcOpenDistance=closestLocalNpc?.npc.config.interactionRadius??180;
    const nearbyLocalNpc=closestLocalNpc&&closestLocalNpc.distance<npcOpenDistance+(sameLocalNpc?40:0)?closestLocalNpc.npc:undefined;
    if(nearbyLocalNpc?.config.id!==this.localNpcNearbyId){
      this.localNpcNearbyId=nearbyLocalNpc?.config.id;
      gameEvents.emit('local-npc-proximity-changed',nearbyLocalNpc?{...nearbyLocalNpc.config,x:nearbyLocalNpc.x,z:nearbyLocalNpc.z}:null);
      if(!nearbyLocalNpc)gameEvents.emit('local-npc-screen-position',null);
    }
    if(nearbyLocalNpc&&performance.now()-this.lastLocalNpcScreenPublish>80){
      this.lastLocalNpcScreenPublish=performance.now();
      const projected=nearbyLocalNpc.position.clone().project(this.camera);
      const localProjected=new THREE.Vector3(
        nextX,
        sample.height+this.characterGroundClearance,
        this.worldToSceneZ(nextZ),
      ).project(this.camera);
      const rect=this.renderer.domElement.getBoundingClientRect();
      gameEvents.emit('local-npc-screen-position',{
        id:nearbyLocalNpc.config.id,
        x:rect.left+(projected.x+1)*rect.width/2,
        y:rect.top+(1-projected.y)*rect.height/2,
        localX:rect.left+(localProjected.x+1)*rect.width/2,
        localY:rect.top+(1-localProjected.y)*rect.height/2,
      });
    }
    const focusedLocalNpc=this.focusedLocalNpcId&&!this.hiddenCharacterIds.has(this.focusedLocalNpcId)?this.localNpcs.find(npc=>npc.config.id===this.focusedLocalNpcId):undefined;
    if(focusedLocalNpc)yaw=Math.atan2(focusedLocalNpc.x-nextX,focusedLocalNpc.z-nextZ);
    if(this.options.bearPhotoZone&&this.bearPhotoDestination){
      const photoPortalDistance=Math.hypot(nextX-this.bearPhotoPortalPosition.x,nextZ-this.bearPhotoPortalPosition.z);
      const nearby=!this.bearPhotoMode&&photoPortalDistance<(this.bearPhotoNearby?PORTAL_EXIT_DISTANCE:PORTAL_OPEN_DISTANCE);
      if(nearby!==this.bearPhotoNearby){this.bearPhotoNearby=nearby;gameEvents.emit('bear-photo-proximity-changed',nearby)}
    }
    if(this.options.bearFeedingAnchor){
      const radius=this.options.bearFeedingAnchor.radius??120;
      const bearX=this.residentRoot?this.residentX:this.options.bearFeedingAnchor.x,bearZ=this.residentRoot?this.residentZ:this.options.bearFeedingAnchor.z;
      const nearby=Math.hypot(nextX-bearX,nextZ-bearZ)<radius;
      if(nearby!==this.bearFeedingNearby){this.bearFeedingNearby=nearby;gameEvents.emit('bear-feeding-proximity-changed',nearby)}
    }
    if(this.options.wildlifeClues?.length){
      const closest=this.options.wildlifeClues.map(config=>({config,distance:Math.hypot(nextX-config.x,nextZ-config.z)})).sort((a,b)=>a.distance-b.distance)[0];
      const nearby=closest&&closest.distance<(closest.config.id===this.wildlifeClueNearby?INTERACTION_EXIT_DISTANCE:INTERACTION_OPEN_DISTANCE)?closest.config.id:undefined;
      if(nearby!==this.wildlifeClueNearby){this.wildlifeClueNearby=nearby;gameEvents.emit('bear-clue-proximity-changed',nearby??null)}
    }
    if(this.options.feedSpotAnchors?.length){
      const mission=this.personalFarmProgress?.bearMission;
      const repeatReady=Boolean(mission?.completed&&!mission.repeatFeedSpotId&&(!mission.repeatFeedAvailableAt||Date.parse(mission.repeatFeedAvailableAt)<=Date.now()));
      this.feedSpotRoots.forEach((root,id)=>{root.visible=mission?.completed?repeatReady:!mission?.completedFeedSpotIds.includes(id)});
      const closest=this.options.feedSpotAnchors.filter(config=>mission?.completed?repeatReady:!mission?.completedFeedSpotIds.includes(config.id)).map(config=>({config,distance:Math.hypot(nextX-config.x,nextZ-config.z)})).sort((a,b)=>a.distance-b.distance)[0];
      const nearby=closest&&closest.distance<(this.feedSpotNearby===closest.config.id?135:110)?closest.config.id:undefined;
      if(nearby!==this.feedSpotNearby){this.feedSpotNearby=nearby;gameEvents.emit('bear-feed-spot-proximity-changed',nearby??null)}
    }
    this.personalFarmFlowerSlotMarkers?.children.forEach((marker,index)=>{const ring=marker.userData.ring as THREE.Mesh|undefined;if(!ring)return;const pulse=1+Math.sin(performance.now()*.004+index)*.14;ring.scale.setScalar(pulse);const material=ring.material as THREE.MeshBasicMaterial;material.opacity=.5+Math.sin(performance.now()*.004+index)*.18});
    if(this.options.greenhouse){
      this.greenhouseClock+=delta;this.updateGreenhouseProximity(nextX,nextZ);
      const particles=this.memoryTreeEffect?.userData.particles as THREE.Points|undefined;if(particles)particles.rotation.y+=delta*(this.greenhouseTreeStage===3?.55:this.greenhouseTreeStage===2?.36:.22);
      const rings=this.memoryTreeEffect?.userData.rings as THREE.Group|undefined;
      if(rings){
        rings.rotation.y+=delta*(this.greenhouseTreeStage===3?.65:.3);
        rings.children.forEach((ring,index)=>{const pulse=1+Math.sin(this.greenhouseClock*(2.4+index*.35)+index)*(.025+this.greenhouseTreeStage*.008);ring.scale.setScalar(pulse)});
      }
    }
    if(this.options.wildlifeClues){
      gameEvents.off('habitat-resource-position-set',this.onHabitatResourcePositionSet);
      gameEvents.off('habitat-resource-position-place',this.onHabitatResourcePositionPlace);
      gameEvents.off('habitat-resource-placement-arm',this.onHabitatResourcePlacementArm);
    }
    if(this.options.guide){
      const guideDistance=Math.hypot(nextX-this.guidePosition.x,nextZ-this.guidePosition.z);
      const guideNearby=guideDistance<(this.guideNearby?GUIDE_TALK_EXIT_DISTANCE:GUIDE_TALK_DISTANCE);
      if(guideNearby!==this.guideNearby){this.guideNearby=guideNearby;gameEvents.emit('guide-proximity-changed',guideNearby)}
    }
    if(this.options.mapSign){
      const mapSignDistance=Math.hypot(nextX-this.mapSignPosition.x,nextZ-this.mapSignPosition.z);
      const mapSignNearby=mapSignDistance<(this.mapSignNearby?MAP_SIGN_EXIT_DISTANCE:MAP_SIGN_OPEN_DISTANCE);
      if(mapSignNearby!==this.mapSignNearby){
        this.mapSignNearby=mapSignNearby;
        gameEvents.emit('map-sign-proximity-changed',mapSignNearby);
      }
    }
    const portalCandidates=[
      ...(this.options.portal&&this.portalPosition?[{...this.options.portal,...this.portalPosition}]:[]),
      ...(this.options.fixedPortals??[]),
      ...(this.options.campusFeaturePortals??[]),
    ].map(config=>({config,distance:Math.hypot(nextX-config.x,nextZ-config.z)})).sort((a,b)=>a.distance-b.distance);
    if(!this.portalEntryArmed&&portalCandidates.every(candidate=>candidate.distance>=(candidate.config.chargeSeconds?PORTAL_EXIT_DISTANCE:KEY_PORTAL_EXIT_DISTANCE)))this.portalEntryArmed=true;
    const chargingPortalCandidate=this.portalTravelGate.isCharging&&this.activePortal
      ?portalCandidates.find(candidate=>candidate.config.destination===this.activePortal?.destination)
      :undefined;
    const chargingPortalRadius=chargingPortalCandidate?.config.activationRadius??PORTAL_EXIT_DISTANCE;
    const chargingPortal=chargingPortalCandidate&&isPortalChargePositionHeld(chargingPortalCandidate.distance,chargingPortalRadius)
      ?chargingPortalCandidate
      :undefined;
    const closestPortal=chargingPortal??portalCandidates[0],samePortal=closestPortal?.config.destination===this.activePortal?.destination;
    const activationDistance=chargingPortal
      ?chargingPortalRadius
      :closestPortal?.config.activationRadius??(closestPortal&&!closestPortal.config.chargeSeconds
        ?(samePortal?KEY_PORTAL_EXIT_DISTANCE:KEY_PORTAL_OPEN_DISTANCE)
        :(samePortal?PORTAL_EXIT_DISTANCE:PORTAL_OPEN_DISTANCE));
    const activePortal=this.portalEntryArmed&&closestPortal&&closestPortal.distance<activationDistance?closestPortal.config:undefined;
    if(activePortal?.destination!==this.activePortal?.destination){
      this.activePortal=activePortal;
      this.portalNearby=!!activePortal;
      this.resetPortalCharge();
      gameEvents.emit('world-portal-proximity-changed',activePortal?{destination:activePortal.destination,label:activePortal.label,theme:activePortal.theme,chargeSeconds:activePortal.chargeSeconds}:null);
    }
    if(activePortal?.chargeSeconds){
      const charge=this.portalTravelGate.update(performance.now(),activePortal.chargeSeconds,accept=>{
        gameEvents.emit('travel-to-map',activePortal.destination,accept);
      });
      gameEvents.emit('portal-charge-progress',charge.progress);
    }
    if(this.options.interaction&&this.interactionPosition){
      const interactionDistance=Math.hypot(nextX-this.interactionPosition.x,nextZ-this.interactionPosition.z);
      if(!this.interactionEntryArmed&&interactionDistance>=INTERACTION_EXIT_DISTANCE)this.interactionEntryArmed=true;
      const interactionNearby=this.interactionEntryArmed&&interactionDistance<(this.interactionNearby?INTERACTION_EXIT_DISTANCE:INTERACTION_OPEN_DISTANCE);
      if(interactionNearby!==this.interactionNearby){
        this.interactionNearby=interactionNearby;
        this.resetInteractionCharge();
        gameEvents.emit('world-interaction-proximity-changed',interactionNearby?this.options.interaction:null);
      }
      const chargeDuration=this.options.interaction.chargeSeconds;
      if(interactionNearby&&chargeDuration){
        const charge=this.interactionTravelGate.update(performance.now(),chargeDuration,accept=>{
          gameEvents.emit('travel-to-map',this.options.interaction!.destination,accept);
        });
        gameEvents.emit('interaction-charge-progress',charge.progress);
      }
    }
    if(this.options.studentHallFeatures&&this.studentHallFeatureTargets.length){
      const closest=this.studentHallFeatureTargets.map(target=>({...target,distance:Math.hypot(nextX-target.x,nextZ-target.z)})).sort((a,b)=>a.distance-b.distance)[0];
      const same=closest?.id===this.campusFeaturePortalNearby;
      const nearby=closest&&closest.distance<closest.radius+(same?45:0)?closest:undefined;
      if(nearby?.id!==this.campusFeaturePortalNearby){
        this.campusFeaturePortalNearby=nearby?.id;
        gameEvents.emit('campus-feature-portal-proximity-changed',nearby?{id:nearby.id,label:nearby.label,description:nearby.description}:null);
      }
    }
    if(this.options.projectRoomInteractions){
      if(this.projectRoomDoorUnlocked){
        const doorPosition=this.projectRoomInteractionPositions.get('project-door');
        if(doorPosition){
          const currentSide=Math.sign(nextX-doorPosition.x);
          if(currentSide!==0&&currentSide!==this.projectRoomDoorEntrySide&&Math.abs(nextX-doorPosition.x)>35){
            // Face the project room square-on after crossing the door.
            this.projectRoomCameraAzimuthDeg=-90;
            gameEvents.emit('project-room-entered');
            this.lockProjectRoomDoor();
          }
        }
      }
      if(this.projectLobbyBoardPosition){
        const distance=Math.hypot(nextX-this.projectLobbyBoardPosition.x,nextZ-this.projectLobbyBoardPosition.z);
        const nearby=distance<this.projectLobbyBoardPosition.radius+(this.projectLobbyBoardNearby?55:0);
        if(nearby!==this.projectLobbyBoardNearby){
          this.projectLobbyBoardNearby=nearby;
          gameEvents.emit('project-lobby-board-proximity-changed',nearby);
        }
      }
      const closest=PROJECT_ROOM_INTERACTIONS
        .map(config=>{
          const position=this.projectRoomInteractionPositions.get(config.id)??config;
          return {config,position,distance:Math.hypot(nextX-position.x,nextZ-position.z)};
        })
        .sort((a,b)=>a.distance-b.distance)[0];
      const same=closest?.config.id===this.projectRoomInteractionNearby;
      const nearby=closest&&closest.distance<closest.position.radius+(same?40:0)?closest.config:undefined;
      if(nearby?.id!==this.projectRoomInteractionNearby){
        this.projectRoomInteractionNearby=nearby?.id;
        this.projectRoomInteractionOutlines.forEach((outline,id)=>{outline.visible=id===nearby?.id});
        gameEvents.emit('project-room-interaction-proximity-changed',nearby??null);
      }
    }
    if(this.options.observatoryTelescopeInteraction&&this.observatoryTelescopePosition&&!this.observatoryTelescopeActive){
      const distance=Math.hypot(nextX-this.observatoryTelescopePosition.x,nextZ-this.observatoryTelescopePosition.z);
      const nearby=distance<this.observatoryTelescopePosition.radius+(this.observatoryTelescopeNearby?45:0);
      if(nearby!==this.observatoryTelescopeNearby){
        this.observatoryTelescopeNearby=nearby;
        if(this.observatoryTelescopeOutline)this.observatoryTelescopeOutline.visible=nearby;
        gameEvents.emit('observatory-telescope-proximity-changed',nearby);
      }
    }
    if(this.options.governmentCentralPlazaWebUi&&this.governmentAiCenterPosition&&!this.governmentWebUiActive){
      const distance=Math.hypot(nextX-this.governmentAiCenterPosition.x,nextZ-this.governmentAiCenterPosition.z);
      const nearby=distance<this.governmentAiCenterPosition.radius+(this.governmentAiCenterNearby?55:0);
      if(nearby!==this.governmentAiCenterNearby){
        this.governmentAiCenterNearby=nearby;
        gameEvents.emit('government-ai-center-proximity-changed',nearby);
      }
      if((nearby||this.governmentAiCenterActive)&&this.governmentWebUiNearby){
        this.governmentWebUiNearby=undefined;
        this.governmentWebUiOutlines.forEach(outline=>{outline.visible=false});
        gameEvents.emit('government-webui-proximity-changed',null);
      }
    }
    if(this.options.governmentCentralPlazaWebUi&&!this.governmentWebUiActive&&!this.governmentAiCenterNearby&&!this.governmentAiCenterActive){
      const closest=GOVERNMENT_CENTRAL_PLAZA_WEB_UI.map(config=>{
        const position=this.governmentWebUiPositions.get(config.id);
        return position?{config,position,distance:Math.hypot(nextX-position.x,nextZ-position.z)}:undefined;
      }).filter((candidate):candidate is NonNullable<typeof candidate>=>!!candidate).sort((a,b)=>a.distance-b.distance)[0];
      const same=closest?.config.id===this.governmentWebUiNearby;
      const nearby=closest&&closest.distance<closest.position.radius+(same?45:0)?closest.config:undefined;
      if(nearby?.id!==this.governmentWebUiNearby){
        this.governmentWebUiNearby=nearby?.id;
        this.governmentWebUiOutlines.forEach((outline,id)=>{outline.visible=id===nearby?.id});
        gameEvents.emit('government-webui-proximity-changed',nearby??null);
      }
    }
    if(this.options.smartCityWebUi&&this.smartCityTablePosition){
      const distance=Math.hypot(nextX-this.smartCityTablePosition.x,nextZ-this.smartCityTablePosition.z);
      const nearby=distance<this.smartCityTablePosition.radius+(this.smartCityTableNearby?55:0);
      if(nearby!==this.smartCityTableNearby){
        this.smartCityTableNearby=nearby;
        gameEvents.emit('smart-city-table-proximity-changed',nearby);
      }
    }
    if(this.options.recruitmentKioskWeb&&this.recruitmentKioskPosition){
      const distance=Math.hypot(nextX-this.recruitmentKioskPosition.x,nextZ-this.recruitmentKioskPosition.z);
      const nearby=distance<this.recruitmentKioskPosition.radius+(this.recruitmentKioskNearby?45:0);
      if(nearby!==this.recruitmentKioskNearby){
        this.recruitmentKioskNearby=nearby;
        gameEvents.emit('recruitment-kiosk-proximity-changed',nearby);
      }
    }
    if(this.options.lakeExperiences?.length){
      const closest=this.options.lakeExperiences.map(config=>{const position=this.lakeExperiencePositions.get(config.id)??config;return {config,distance:Math.hypot(nextX-position.x,nextZ-position.z)}}).sort((a,b)=>a.distance-b.distance)[0];
      const same=closest?.config.id===this.lakeExperienceNearby;
      const openDistance=closest?.config.radius??LAKE_EXPERIENCE_OPEN_DISTANCE;
      const nearby=closest&&closest.distance<(same?openDistance+40:openDistance)?closest.config:undefined;
      if(nearby?.id!==this.lakeExperienceNearby){
        this.lakeExperienceNearby=nearby?.id;
        gameEvents.emit('lake-experience-proximity-changed',nearby?{id:nearby.id,label:nearby.label,description:nearby.description}:null);
      }
    }
    const stableGrounding=this.options.stableCharacterGrounding===true;
    const previousVisualGround=this.visualGroundHeight??sample.height;
    const visualGround=stableGrounding&&Math.abs(sample.height-previousVisualGround)<45
      ?THREE.MathUtils.lerp(previousVisualGround,sample.height,1-Math.exp(-18*Math.max(0,delta)))
      :sample.height;
    this.visualGroundHeight=visualGround;
    const visualNormal=stableGrounding?this.guideNpcUprightNormal:sample.normal;
    const groundPosition=this.followTarget.set(nextX,visualGround+this.characterGroundClearance,this.worldToSceneZ(nextZ));
    const position=this.localRenderPosition.copy(groundPosition);position.y=characterVisualY(visualGround,this.characterGroundClearance,this.characterFootLift,jumpHeight);
    if(emote)this.localCharacter.playEmote(emote,emote==='talking');else this.localCharacter.stopEmote();
    this.localCharacter.update(position,visualNormal,yaw,motion,delta);
    this.followCharacter(groundPosition,delta);this.syncFestivalStageScreenRect();this.adjustQuality(delta);this.renderAccumulator+=delta;if(this.renderAccumulator>=this.renderInterval){this.renderAccumulator%=this.renderInterval;this.render()}
    return {x:nextX,z:nextZ,groundHeight:sample.height};
  }

  updateRemoteCharacter(id:string,name:string,model:CharacterModel,parts:CharacterParts,worldX:number,worldZ:number,yaw:number,motion:MotionState,delta:number,jumpHeight=0,emote:CharacterEmote|null=null){
    if(this.hiddenCharacterIds.has(id)){this.removeRemoteCharacter(id);return}
    let character=this.remotes.get(id);if(!character){character=new WorldCharacter(this.scene,name,model,parts,this.options.characterHeight??CHARACTER_HEIGHT,false,false,false,this.options.nameplateScale??1);character.root.visible=!this.bearPhotoMode&&!isProjectRoomKioskInteraction(this.projectRoomFocus)&&!this.studentHallBoardActive;this.remotes.set(id,character)}
    const previousGround=this.remoteGrounds.get(id),needsGroundSample=!previousGround||Math.hypot(worldX-previousGround.x,worldZ-previousGround.z)>=4;
    const sampled=needsGroundSample?this.sampleGround(worldX,worldZ,previousGround?.height??0,!previousGround):undefined;
    const ground=sampled?{...sampled,x:worldX,z:worldZ}:previousGround??{height:0,normal:new THREE.Vector3(0,1,0),x:worldX,z:worldZ};
    if(needsGroundSample)this.remoteGrounds.set(id,ground);
    if(emote)character.playEmote(emote,emote==='talking');else character.stopEmote();
    character.update(this.remoteRenderPosition.set(worldX,characterVisualY(ground.height,this.characterGroundClearance,this.characterFootLift,jumpHeight),this.worldToSceneZ(worldZ)),ground.normal,yaw,motion,delta);
  }

  removeRemoteCharacter(id:string){this.remotes.get(id)?.destroy();this.remotes.delete(id);this.remoteGrounds.delete(id)}

  movementFromScreen(x:number,z:number){
    // Keep the project-room lobby and collaboration area on the same WASD
    // world grid, even though the internal camera is turned to the right.
    if(this.options.mapName==='프로젝트실')return {x,z};
    const azimuth=THREE.MathUtils.degToRad(this.projectRoomCameraAzimuthDeg??this.options.cameraAzimuthDeg??0);
    const cosine=Math.cos(azimuth),sine=Math.sin(azimuth);
    return {x:x*cosine+z*sine,z:-x*sine+z*cosine};
  }

  private followCharacter(position:THREE.Vector3,delta:number,immediate=false){
    if(this.overviewActive){this.showMapOverview();return}
    const target=this.followTarget.copy(position);
    const followBounds=this.options.personalFarm&&this.personalFarmInterior
      ?{minX:790,maxX:1610,minZ:700,maxZ:1170}
      :this.options.cameraFollowBounds;
    if(followBounds){
      if(followBounds.minX!==undefined)target.x=Math.max(target.x,followBounds.minX);
      if(followBounds.maxX!==undefined)target.x=Math.min(target.x,followBounds.maxX);
      if(followBounds.minZ!==undefined)target.z=Math.max(target.z,this.worldToSceneZ(followBounds.minZ));
      if(followBounds.maxZ!==undefined)target.z=Math.min(target.z,this.worldToSceneZ(followBounds.maxZ));
    }
    if(this.options.cameraDownScreenLimitZ!==undefined){
      target.z=clampCameraBehindLimit(target.z,this.worldToSceneZ(this.options.cameraDownScreenLimitZ));
    }
    target.y+=this.cameraProfileOverride?.cameraTargetHeight??(this.options.personalFarm&&this.personalFarmInterior?75:(this.options.cameraTargetHeight??0));
    const screenOffset=this.options.personalFarm&&this.personalFarmInterior?0:(this.options.cameraScreenOffsetY??0);
    target.z-=screenOffset/GROUND_PROJECTION;
    if(immediate)this.cameraTarget.copy(target);else this.cameraTarget.lerp(target,1-Math.exp(-5*delta));
    const elevation=THREE.MathUtils.degToRad(this.cameraProfileOverride?.cameraElevationDeg??(this.options.personalFarm&&this.personalFarmInterior?36:(this.options.cameraElevationDeg??33)));
    if(this.camera instanceof THREE.PerspectiveCamera){
      if(this.smartCityExperienceActive&&this.smartCityFocusView){
        const view=this.smartCityFocusView,transition=this.smartCityFocusTransition;
        if(transition){
          transition.elapsed=Math.min(.72,transition.elapsed+delta);
          const progress=transition.elapsed/.72,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,eased);
          if(progress>=1)this.smartCityFocusTransition=undefined;
        }else{this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov}
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        return;
      }
      if(this.recruitmentKioskActive&&this.recruitmentKioskView){
        const view=this.recruitmentKioskView,transition=this.recruitmentKioskTransition;
        if(transition){
          transition.elapsed=Math.min(.72,transition.elapsed+delta);
          const progress=transition.elapsed/.72,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,eased);
          if(progress>=1)this.recruitmentKioskTransition=undefined;
        }else{this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov}
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        // Publish the HTML surface only once the zoom has finished. This avoids
        // React layout work on every animation frame and lets the authored 3D
        // screen sell the approach motion first.
        if(!this.recruitmentKioskTransition)this.syncRecruitmentKioskRect();
        return;
      }
      if(this.festivalStageFocusView){
        const view=this.festivalStageFocusView,transition=this.festivalStageFocusTransition;
        if(transition){
          transition.elapsed=Math.min(.7,transition.elapsed+delta);
          const progress=transition.elapsed/.7,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,eased);
          if(progress>=1)this.festivalStageFocusTransition=undefined;
        }else{
          this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov;
        }
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        return;
      }
      if(this.artsCenterPosterActive&&this.artsCenterPosterFocusView){
        const view=this.artsCenterPosterFocusView,transition=this.artsCenterPosterFocusTransition;
        if(transition){
          transition.elapsed=Math.min(.65,transition.elapsed+delta);
          const progress=transition.elapsed/.65,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(this.options.cameraFov??46,30,eased);
          if(progress>=1)this.artsCenterPosterFocusTransition=undefined;
        }else{
          this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=30;
        }
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();this.syncArtsCenterPosterScreenRect();
        if(!this.artsCenterPosterFocusTransition&&!this.artsCenterPosterWebReady){
          this.artsCenterPosterWebReady=true;
          gameEvents.emit('arts-center-poster-focus-mode-changed',{active:true,index:this.artsCenterPosterActive.userData.artsCenterPerformanceIndex as number,ready:true,posterDataUrl:this.artsCenterPosterDataUrl(this.artsCenterPosterActive)});
        }
        return;
      }
      if(this.studentHallBoardActive&&this.studentHallBoardFocusView){
        const view=this.studentHallBoardFocusView,transition=this.studentHallBoardFocusTransition;
        if(transition){
          transition.elapsed=Math.min(.62,transition.elapsed+delta);
          const progress=transition.elapsed/.62,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);this.camera.position.lerpVectors(transition.camera,view.camera,eased);this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,eased);
          if(progress>=1)this.studentHallBoardFocusTransition=undefined;
        }else{this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov}
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        return;
      }
      if(this.projectLobbyBoardFocused&&this.projectLobbyBoardFocusView){
        const view=this.projectLobbyBoardFocusView,transition=this.projectLobbyBoardFocusTransition;
        if(transition){
          transition.elapsed=Math.min(.62,transition.elapsed+delta);
          const progress=transition.elapsed/.62,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);this.camera.position.lerpVectors(transition.camera,view.camera,eased);this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,eased);
          if(progress>=1)this.projectLobbyBoardFocusTransition=undefined;
        }else{this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov}
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        return;
      }
      if(this.observatoryTelescopeActive){
        const view=this.observatoryTelescopeView,transition=this.observatoryTelescopeTransition;
        if(!view)return;
        if(transition){
          transition.elapsed=Math.min(.72,transition.elapsed+delta);
          const progress=transition.elapsed/.72,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(transition.fov,24,eased);
          if(progress>=1)this.observatoryTelescopeTransition=undefined;
        }else{
          this.cameraTarget.copy(view.target);
          this.camera.position.copy(view.camera);
          this.camera.fov=24;
        }
        this.camera.aspect=this.width/Math.max(1,this.height);
        this.camera.lookAt(this.cameraTarget);
        this.camera.updateProjectionMatrix();
        return;
      }
      if(this.governmentWebUiActive){
        const view=this.governmentWebUiViews.get(this.governmentWebUiActive),transition=this.governmentWebUiTransition;
        if(!view)return;
        if(transition){
          transition.elapsed=Math.min(.72,transition.elapsed+delta);
          const progress=transition.elapsed/.72,eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,view.target,eased);
          this.camera.position.lerpVectors(transition.camera,view.camera,eased);
          this.camera.fov=THREE.MathUtils.lerp(transition.fov,view.fov,progress);
          if(progress>=1)this.governmentWebUiTransition=undefined;
        }else{
          this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=view.fov;
        }
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();this.syncGovernmentWebUiRect();return;
      }
      if(isProjectRoomKioskInteraction(this.projectRoomFocus)){
        const view=this.projectRoomKioskView;
        const target=view?.target??this.followTarget.set(1900,205,this.worldToSceneZ(535));
        const transition=this.projectRoomKioskTransition;
        if(transition){
          transition.elapsed=Math.min(.75,transition.elapsed+delta);
          const progress=transition.elapsed/.75;
          const eased=progress*progress*(3-2*progress);
          this.cameraTarget.lerpVectors(transition.target,target,eased);
          if(progress>=1)this.projectRoomKioskTransition=undefined;
        }else this.cameraTarget.copy(target);
        this.camera.aspect=this.width/Math.max(1,this.height);
        this.camera.fov=transition?THREE.MathUtils.lerp(transition.fov,37,transition.elapsed/.75):37;
        const cameraPosition=view?.camera??this.boundsCenter.set(1900,250,this.worldToSceneZ(535)+430);
        if(transition){
          const progress=transition.elapsed/.75;
          const eased=progress*progress*(3-2*progress);
          this.camera.position.lerpVectors(transition.camera,cameraPosition,eased);
        }else this.camera.position.copy(cameraPosition);
        this.camera.lookAt(this.cameraTarget);
        this.camera.updateProjectionMatrix();
        // The canvas texture remains visible while the camera approaches the
        // kiosk. Mount the interactive DOM only after the view has settled so
        // it does not visibly stretch from a distant screen into place.
        if(!this.projectRoomKioskTransition)this.syncProjectRoomKioskScreenRect();
        return;
      }
      if(this.foodTruckKioskId&&this.foodTruckKioskView){
        const view=this.foodTruckKioskView,transition=this.foodTruckKioskTransition;
        if(transition){transition.elapsed=Math.min(.65,transition.elapsed+delta);const p=transition.elapsed/.65,e=p*p*(3-2*p);this.cameraTarget.lerpVectors(transition.target,view.target,e);this.camera.position.lerpVectors(transition.camera,view.camera,e);this.camera.fov=THREE.MathUtils.lerp(transition.fov,32,p);if(p>=1)this.foodTruckKioskTransition=undefined}else{this.cameraTarget.copy(view.target);this.camera.position.copy(view.camera);this.camera.fov=32}
        this.camera.aspect=this.width/Math.max(1,this.height);this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
        const screen=this.foodTruckScreens.get(this.foodTruckKioskId);
        const rect=screen?this.projectedMeshScreenRect(screen):undefined,quad=screen?this.projectedMeshScreenQuad(screen):undefined;
        if(rect)gameEvents.emit('food-truck-kiosk-screen-rect',quad?{...rect,quad}:rect);
        return;
      }
      if(this.options.fixedCameraTarget&&!this.mapBounds.isEmpty())this.mapBounds.getCenter(this.cameraTarget);
      const distance=this.cameraProfileOverride?.cameraDistance??(this.options.personalFarm
        ?personalFarmCameraDistance(this.personalFarmInterior)
        :(this.options.cameraDistance??CAMERA_DISTANCE));
      const azimuth=THREE.MathUtils.degToRad(this.cameraProfileOverride?.cameraAzimuthDeg??this.projectRoomCameraAzimuthDeg??this.options.cameraAzimuthDeg??0);
      const horizontalDistance=this.options.cameraHorizontalDistance??Math.cos(elevation)*distance;
      this.camera.aspect=this.width/Math.max(1,this.height);
      this.camera.fov=this.cameraProfileOverride?.cameraFov??(this.options.personalFarm&&this.personalFarmInterior?50:(this.options.cameraFov??42));
      this.camera.position.set(
        this.cameraTarget.x+Math.sin(azimuth)*horizontalDistance,
        this.cameraTarget.y+Math.sin(elevation)*distance,
        this.cameraTarget.z+Math.cos(azimuth)*horizontalDistance,
      );
      this.camera.lookAt(this.cameraTarget);
      this.camera.updateProjectionMatrix();
      if(this.options.personalFarm)this.updatePersonalFarmCameraOcclusion(position);
      return;
    }
    const groundProjection=Math.max(.1,Math.sin(elevation));
    let zoom=this.options.personalFarm&&this.personalFarmInterior?1.05:(this.options.cameraZoom??CAMERA_ZOOM);
    if(this.cameraProfileOverride)zoom=orthographicZoomForCameraDistance(zoom,this.authoredCameraProfile.cameraDistance,this.cameraProfileOverride.cameraDistance);
    if(this.bearPhotoMode)zoom=1.48;
    if(!this.mapBounds.isEmpty()){
      const center=this.mapBounds.getCenter(this.boundsCenter),size=this.mapBounds.getSize(new THREE.Vector3());
      // Default maps cover the viewport automatically. Maps with an explicit
      // zoom keep that authored framing; their ground extension fills any
      // terrain outside the original GLB boundary without forcing a zoom-in.
      const coverZoom=Math.max(this.width/Math.max(1,size.x),this.height/Math.max(1,size.z*groundProjection));
      if(this.options.cameraZoom===undefined)zoom=Math.max(zoom,coverZoom*1.015);
      const halfWidth=this.width/(2*zoom),groundHalfDepth=this.height/(2*zoom*groundProjection),minX=this.mapBounds.min.x+halfWidth,maxX=this.mapBounds.max.x-halfWidth,minZ=this.mapBounds.min.z+groundHalfDepth,maxZ=this.mapBounds.max.z-groundHalfDepth;
      this.cameraTarget.x=minX<=maxX?THREE.MathUtils.clamp(this.cameraTarget.x,minX,maxX):center.x;
      this.cameraTarget.z=minZ<=maxZ?THREE.MathUtils.clamp(this.cameraTarget.z,minZ,maxZ):center.z;
    }
    this.camera.left=-this.width/(2*zoom);this.camera.right=this.width/(2*zoom);this.camera.top=this.height/(2*zoom);this.camera.bottom=-this.height/(2*zoom);
    const azimuth=THREE.MathUtils.degToRad(this.cameraProfileOverride?.cameraAzimuthDeg??this.projectRoomCameraAzimuthDeg??this.options.cameraAzimuthDeg??0);
    const distance=this.cameraProfileOverride?.cameraDistance??this.options.cameraDistance??CAMERA_DISTANCE;
    const horizontalDistance=Math.cos(elevation)*distance;
    this.camera.position.set(
      this.cameraTarget.x+Math.sin(azimuth)*horizontalDistance,
      this.cameraTarget.y+Math.sin(elevation)*distance,
      this.cameraTarget.z+Math.cos(azimuth)*horizontalDistance,
    );
    this.camera.lookAt(this.cameraTarget);this.camera.updateProjectionMatrix();
  }

  private updatePersonalFarmCameraOcclusion(characterPosition:THREE.Vector3){
    this.personalFarmOccluderOpacity.forEach((opacity,material)=>{material.opacity=opacity;material.transparent=opacity<1;material.depthWrite=opacity>=1});
    if(this.personalFarmInterior||!this.personalFarmOccluders.length)return;
    const direction=characterPosition.clone().sub(this.camera.position),distance=direction.length();
    if(distance<1)return;
    this.raycaster.near=1;this.raycaster.far=distance-12;this.raycaster.set(this.camera.position,direction.normalize());
    const blocking=new Set(this.raycaster.intersectObjects(this.personalFarmOccluders,false).map(hit=>hit.object));
    blocking.forEach(object=>{
      if(!(object instanceof THREE.Mesh))return;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      materials.forEach(material=>{material.transparent=true;material.opacity=.28;material.depthWrite=false});
    });
  }

  private adjustQuality(delta:number){
    if(this.options.adaptivePixelRatio===false)return;
    if(delta<=0||delta>.1)return;
    this.qualityElapsed+=delta;this.qualityFrameTime+=delta;this.qualityFrames++;
    if(this.qualityElapsed<2)return;
    const average=this.qualityFrameTime/Math.max(1,this.qualityFrames);
    let next=this.pixelRatio;
    if(average>1/36)next=Math.max(this.options.minPixelRatio??MIN_PIXEL_RATIO,this.pixelRatio-.15);
    else if(average<1/52)next=Math.min(this.options.performanceMode?(this.options.performancePixelRatio??1):(this.options.maxPixelRatio??MAX_PIXEL_RATIO),this.pixelRatio+.1);
    if(Math.abs(next-this.pixelRatio)>.01){this.pixelRatio=next;this.renderer.setPixelRatio(this.pixelRatio);this.resize(true)}
    this.qualityElapsed=0;this.qualityFrameTime=0;this.qualityFrames=0;
  }

  private resize(force=false){
    const width=Math.max(1,this.parent.clientWidth),height=Math.max(1,this.parent.clientHeight);
    if(!force&&width===this.width&&height===this.height)return;
    this.width=width;this.height=height;
    this.renderer.setSize(width,height,false);
    // Keep the projection and the CSS-sized canvas in lockstep. Without this,
    // a viewport/layout resize can briefly draw the previous aspect ratio into
    // the new canvas dimensions, which is most noticeable as horizontal stretch.
    if(this.camera instanceof THREE.PerspectiveCamera){
      this.camera.aspect=width/height;
      this.camera.updateProjectionMatrix();
    }
  }
  private render(){
    this.resize();if(this.destroyed)return;this.renderer.render(this.scene,this.camera);
    if(import.meta.env.DEV){this.diagnosticFrames++;const elapsed=performance.now()-this.diagnosticStartedAt;if(elapsed>=1000){let objects=0;this.scene.traverse(()=>objects++);(window as typeof window&{__SJ_RENDER_STATS__?:unknown}).__SJ_RENDER_STATS__={map:this.options.mapName,fps:Math.round(this.diagnosticFrames*1000/elapsed),calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,objects,statueAnchor:this.options.personalFarm?this.personalFarmBearStatueAnchor:undefined,statuePresent:Boolean(this.personalFarmBearStatueRoot?.parent),statuePosition:this.personalFarmBearStatueRoot?.position.toArray(),statueRotationY:this.personalFarmBearStatueRoot?.rotation.y,flowerSlots:this.options.personalFarm?this.personalFarmFlowerSlots:undefined,spawn:this.options.spawn};this.diagnosticFrames=0;this.diagnosticStartedAt=performance.now()}}
    this.syncStudentHallBoardScreenRects();
    this.syncProjectLobbyBoardScreenRect();
    this.syncSmartCityScreenRect();
    this.syncSmartCityWallScreenRects();
    if(this.clubBoothCardAnchors.length){
      const rect=this.renderer.domElement.getBoundingClientRect();
      gameEvents.emit('club-booth-card-screen-positions',this.clubBoothCardAnchors.map(object=>{
        const mesh=object as THREE.Mesh,geometry=mesh.geometry;
        if(geometry&&!geometry.boundingBox)geometry.computeBoundingBox();
        const bounds=geometry?.boundingBox,worldBounds=new THREE.Box3().setFromObject(object);
        const localCenter=bounds?.getCenter(new THREE.Vector3());
        const center=bounds&&localCenter?localCenter.clone().applyMatrix4(object.matrixWorld):worldBounds.getCenter(new THREE.Vector3());
        const halfWidth=bounds?Math.max(.01,(bounds.max.x-bounds.min.x)*.42):1,halfDepth=bounds?Math.max(.01,(bounds.max.z-bounds.min.z)*.32):.6;
        const edgeA=bounds&&localCenter?new THREE.Vector3(localCenter.x-halfWidth,bounds.max.y+.02,localCenter.z).applyMatrix4(object.matrixWorld):center.clone().add(new THREE.Vector3(-1,0,0));
        const edgeB=bounds&&localCenter?new THREE.Vector3(localCenter.x+halfWidth,bounds.max.y+.02,localCenter.z).applyMatrix4(object.matrixWorld):center.clone().add(new THREE.Vector3(1,0,0));
        const depthA=bounds&&localCenter?new THREE.Vector3(localCenter.x,bounds.max.y+.02,localCenter.z-halfDepth).applyMatrix4(object.matrixWorld):center.clone().add(new THREE.Vector3(0,0,-.6));
        const depthB=bounds&&localCenter?new THREE.Vector3(localCenter.x,bounds.max.y+.02,localCenter.z+halfDepth).applyMatrix4(object.matrixWorld):center.clone().add(new THREE.Vector3(0,0,.6));
        const projected=center.clone().project(this.camera),projectScreen=(point:THREE.Vector3)=>{const value=point.project(this.camera);return new THREE.Vector2((value.x+1)*rect.width/2,(1-value.y)*rect.height/2)};
        const screenA=projectScreen(edgeA),screenB=projectScreen(edgeB),screenDepthA=projectScreen(depthA),screenDepthB=projectScreen(depthB);
        const projectedWidth=screenA.distanceTo(screenB),projectedDepth=screenDepthA.distanceTo(screenDepthB),widthIsLong=projectedWidth>=projectedDepth;
        const longA=widthIsLong?screenA:screenDepthA,longB=widthIsLong?screenB:screenDepthB;
        return {x:rect.left+(projected.x+1)*rect.width/2,y:rect.top+(1-projected.y)*rect.height/2,width:Math.max(projectedWidth,projectedDepth),height:Math.min(projectedWidth,projectedDepth),rotation:THREE.MathUtils.radToDeg(Math.atan2(longB.y-longA.y,longB.x-longA.x)),visible:projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<=1.15&&Math.abs(projected.y)<=1.15};
      }));
    }
  }

  destroy(){
    if(this.destroyed)return;
    this.residentMixer?.stopAllAction();
    this.residentDecorMixers.forEach(mixer=>mixer.stopAllAction());
    this.residentDecorMixers=[];this.residentDecorBearActors=[];this.residentMixer=undefined;
    this.personalFarmFlowerRenderToken++;
    this.personalFarmFlowerRoot?.removeFromParent();this.personalFarmFlowerRoot=undefined;
    this.personalFarmFlowerSlotMarkers?.removeFromParent();this.personalFarmFlowerSlotMarkers=undefined;
    this.personalFarmBearStatueRenderToken++;
    this.personalFarmBearStatueRoot?.removeFromParent();this.personalFarmBearStatueRoot=undefined;
    if(this.artsCenterPosterActive){gameEvents.emit('game-input-lock',false);gameEvents.emit('arts-center-poster-screen-rect',null);gameEvents.emit('arts-center-poster-focus-mode-changed',{active:false,index:0,ready:false})}
    if(this.recruitmentKioskActive){gameEvents.emit('recruitment-kiosk-screen-rect',null);gameEvents.emit('recruitment-kiosk-mode-changed',false)}
    if(this.artsCenterStageBackdrop)gameEvents.emit('arts-center-stage-screen-rect',null);
    this.destroyed=true;
    if(this.guideNearby)gameEvents.emit('guide-proximity-changed',false);
    if(this.portalNearby)gameEvents.emit('world-portal-proximity-changed',null);
    if(this.interactionNearby)gameEvents.emit('world-interaction-proximity-changed',null);
    if(this.projectRoomInteractionNearby)gameEvents.emit('project-room-interaction-proximity-changed',null);
    if(this.recruitmentKioskNearby)gameEvents.emit('recruitment-kiosk-proximity-changed',false);
    if(this.observatoryTelescopeNearby)gameEvents.emit('observatory-telescope-proximity-changed',false);
    if(this.observatoryTelescopeActive)gameEvents.emit('observatory-telescope-mode-changed',false);
    if(this.lakeExperienceNearby)gameEvents.emit('lake-experience-proximity-changed',null);
    if(this.bearPhotoNearby)gameEvents.emit('bear-photo-proximity-changed',false);
    if(this.wildlifeClueNearby)gameEvents.emit('bear-clue-proximity-changed',null);
    if(this.bearFeedingNearby)gameEvents.emit('bear-feeding-proximity-changed',false);
    if(this.localNpcNearbyId){gameEvents.emit('local-npc-proximity-changed',null);gameEvents.emit('local-npc-screen-position',null)}
    if(this.overviewActive)gameEvents.emit('map-overview-changed',false);
    if(this.options.overview)gameEvents.off('map-overview-toggle',this.onMapOverviewToggle);
    if(this.options.previewNavigation)gameEvents.off('map-preview-camera-reset',this.onPreviewCameraReset);
    if(this.options.mapName==='베어트리파크')gameEvents.off('nature-chapter-progress-changed',this.onNatureChapterProgressChanged);
    if(this.options.bearPhotoZone)gameEvents.off('bear-photo-enter',this.onBearPhotoEnter);
    if(this.options.bearPhotoZone){gameEvents.off('bear-photo-capture',this.onBearPhotoCapture);gameEvents.off('bear-photo-exit',this.onBearPhotoExit)}
    if(this.options.lakeExperiences){
      gameEvents.off('lake-booth-completion-changed',this.onLakeBoothCompletionChanged);
    }
    if(this.options.greenhouse){
      gameEvents.emit('greenhouse-nearby-changed',null);
      gameEvents.off('greenhouse-progress-changed',this.onGreenhouseProgressChanged);
      this.parent.removeEventListener('pointerdown',this.onGreenhousePointerDown);
    }
    if(this.options.personalFarm||this.options.greenhouse||this.options.feedSpotAnchors)gameEvents.off('personal-farm-progress-changed',this.onPersonalFarmProgressChanged);
    if(this.options.personalFarm){
      gameEvents.off('personal-farm-door-toggle',this.togglePersonalFarmInterior);
      gameEvents.off('personal-farm-seat-toggle',this.togglePersonalFarmSeat);
      gameEvents.off('personal-farm-bed-toggle',this.togglePersonalFarmBed);
      gameEvents.emit('personal-farm-door-proximity-changed',null);
      gameEvents.emit('personal-farm-seat-proximity-changed',null);
      gameEvents.emit('personal-farm-bed-proximity-changed',null);
      gameEvents.emit('personal-farm-plant-anchor-proximity-changed',false);
      gameEvents.emit('personal-farm-flower-proximity-changed',null);
      gameEvents.emit('personal-farm-flower-slot-proximity-changed',null);
    }
    if(this.artsCenterPosterScreens.length)this.parent.removeEventListener('pointerdown',this.onArtsCenterPosterPointerDown);
    if(this.options.campusFeaturePortals){
      gameEvents.off('campus-building-fast-travel',this.onCampusBuildingFastTravel);
    }
    if(this.options.studentHallFeatures)gameEvents.off('student-hall-board-focus-close',this.exitStudentHallBoardFocus);
    if(this.options.campusFeaturePortals||this.options.studentHallFeatures)gameEvents.emit('campus-feature-portal-proximity-changed',null);
    if(this.options.studentHallFeatures)gameEvents.emit('student-hall-board-screen-rects',null);
    if(this.projectLobbyBoardScreen)gameEvents.emit('project-lobby-board-screen-rect',null);
    if(this.smartCityScreen)gameEvents.emit('smart-city-screen-rect',null);
    if(this.smartCityWallScreens.size)gameEvents.emit('smart-city-wall-screen-rects',null);
    if(this.projectLobbyBoardNearby)gameEvents.emit('project-lobby-board-proximity-changed',false);
    if(this.projectLobbyBoardFocused){gameEvents.emit('project-lobby-board-focus-mode-changed',false);gameEvents.emit('game-input-lock',false)}
    if(this.studentHallBoardActive){gameEvents.emit('student-hall-board-focus-mode-changed',null);gameEvents.emit('game-input-lock',false)}
    gameEvents.off('game-input-lock',this.onGameInputLock);
    gameEvents.off('map-travel-failed',this.onMapTravelFailed);
    if(this.options.mapName==='축제부스')gameEvents.off('festival-stage-focus-changed',this.onFestivalStageFocusChanged);
    if(this.options.portal?.positionEditable)gameEvents.off('primary-portal-place-at-player',this.onPrimaryPortalPlaceAtPlayer);
    gameEvents.off('local-npc-encounter-focus',this.onLocalNpcEncounterFocus);
    gameEvents.off('local-npc-talking',this.onLocalNpcTalking);
    if(this.options.projectRoomInteractions)gameEvents.off('project-room-focus-changed',this.onProjectRoomFocusChanged);
    if(this.options.projectRoomInteractions)gameEvents.off('project-room-kiosk-activate',this.enterProjectRoomKiosk);
    if(this.options.projectRoomInteractions)gameEvents.off('project-lobby-board-focus-open',this.enterProjectLobbyBoardFocus);
    if(this.options.projectRoomInteractions)gameEvents.off('project-room-seat-toggle',this.toggleProjectRoomSeat);
    if(this.options.centralPlazaSofaSeats)gameEvents.off('central-plaza-sofa-seat-toggle',this.toggleCentralPlazaSofaSeat);
    if(this.options.projectRoomInteractions)gameEvents.off('project-room-door-unlock',this.unlockProjectRoomDoor);
    if(this.options.projectRoomInteractions)gameEvents.off('project-room-instance-enter',this.onProjectRoomInstanceEnter);
    if(this.options.projectRoomInteractions)window.removeEventListener('pointerdown',this.onProjectRoomKioskPointerDown,true);
    if(this.options.foodTruckExperience)gameEvents.off('food-truck-kiosk-activate',this.enterFoodTruckKiosk);
    if(this.options.foodTruckExperience)gameEvents.off('food-truck-kiosk-close',this.exitFoodTruckKiosk);
    if(this.options.foodTruckExperience)gameEvents.off('food-seat-toggle',this.toggleFoodSeat);
    if(this.options.governmentCentralPlazaWebUi)gameEvents.off('government-webui-open',this.enterGovernmentWebUi);
    if(this.options.governmentCentralPlazaWebUi)gameEvents.off('government-webui-close',this.exitGovernmentWebUi);
    if(this.options.governmentCentralPlazaWebUi)gameEvents.off('government-ai-center-mode-changed',this.onGovernmentAiCenterModeChanged);
    if(this.options.governmentCentralPlazaWebUi)gameEvents.off('government-ai-center-stage-changed',this.onGovernmentAiCenterStageChanged);
    if(this.options.recruitmentKioskWeb)gameEvents.off('recruitment-kiosk-open',this.enterRecruitmentKiosk);
    if(this.options.recruitmentKioskWeb)gameEvents.off('recruitment-kiosk-close',this.exitRecruitmentKiosk);
    if(this.options.observatoryTelescopeInteraction)gameEvents.off('observatory-telescope-enter',this.enterObservatoryTelescope);
    if(this.options.observatoryTelescopeInteraction)gameEvents.off('observatory-telescope-exit',this.exitObservatoryTelescope);
    if(this.options.artsCenterPosterWeb)gameEvents.off('arts-center-seat-toggle',this.toggleArtsCenterSeat);
    if(this.options.artsCenterPosterWeb)gameEvents.off('arts-center-poster-focus-close',this.exitArtsCenterPosterFocus);
    if(this.options.smartCityWebUi){
      gameEvents.off('smart-city-technology-changed',this.onSmartCityTechnologyChanged);
      gameEvents.off('smart-city-experience-active-changed',this.onSmartCityExperienceActiveChanged);
    }
    if(this.artsCenterSeatNearby||this.artsCenterActiveSeat)gameEvents.emit('arts-center-seat-proximity-changed',null);
    if(this.foodSeatNearby||this.foodActiveSeat)gameEvents.emit('food-seat-proximity-changed',null);
    window.removeEventListener('keydown',this.onWorldPortalKeyDown);
    this.previewControls?.dispose();this.previewControls=undefined;
    this.projectRoomInteractionOutlines.forEach(outline=>{outline.geometry.dispose();(outline.material as THREE.Material).dispose()});
    this.projectRoomInteractionOutlines.clear();
    this.projectRoomInteractionPositions.clear();
    this.projectRoomKioskScreens.clear();this.projectRoomKioskViews.clear();
    if(this.projectRoomSeatNearby||this.projectRoomActiveSeat)gameEvents.emit('project-room-seat-proximity-changed',null);
    this.projectRoomSeats=[];this.projectRoomSeatNearby=undefined;this.projectRoomActiveSeat=undefined;
    if(this.centralPlazaSofaSeatNearby||this.centralPlazaSofaActiveSeat)gameEvents.emit('central-plaza-sofa-seat-proximity-changed',null);
    this.centralPlazaSofaSeats=[];this.centralPlazaSofaSeatNearby=undefined;this.centralPlazaSofaActiveSeat=undefined;
    this.projectRoomScreenTextures.forEach(texture=>texture.dispose());
    this.projectRoomScreenTextures=[];
    this.studentHallFeatureTargets=[];this.studentHallAiTreeEffect=undefined;this.studentHallBoardScreens.clear();this.lastStudentHallBoardRects.clear();
    this.projectLobbyBoardScreen=undefined;this.lastProjectLobbyBoardRect=undefined;this.projectLobbyBoardPosition=undefined;this.projectLobbyBoardNearby=false;this.projectLobbyBoardFocused=false;this.projectLobbyBoardFocusView=undefined;this.projectLobbyBoardFocusTransition=undefined;
    if(this.smartCityTableNearby)gameEvents.emit('smart-city-table-proximity-changed',false);
    this.smartCityHologram?.dispose();this.smartCityHologram=undefined;
    this.smartCityScreen=undefined;this.lastSmartCityScreenRect=undefined;this.smartCityWallScreens.clear();this.lastSmartCityWallRects.clear();this.smartCityTableNearby=false;this.smartCityTablePosition=undefined;this.smartCityFocusView=undefined;this.smartCityFocusTransition=undefined;
    this.governmentWebUiOutlines.forEach(outline=>{outline.geometry.dispose();(outline.material as THREE.Material).dispose()});
    this.governmentWebUiOutlines.clear();this.governmentWebUiPositions.clear();this.governmentWebUiViews.clear();this.governmentWebUiScreens.clear();
    if(this.governmentAiCenterNearby||this.governmentAiCenterActive)gameEvents.emit('government-ai-center-proximity-changed',false);
    this.governmentAiCenterPosition=undefined;this.governmentAiCenterNearby=false;this.governmentAiCenterActive=false;
    this.governmentAiPlatformSurface=undefined;this.governmentAiPlatformGrounded=false;
    this.governmentAiHologram=undefined;
    this.governmentWebUiTextures.forEach(texture=>texture.dispose());this.governmentWebUiTextures=[];
    this.recruitmentKioskTexture?.dispose();this.recruitmentKioskTexture=undefined;this.recruitmentKioskPosition=undefined;this.recruitmentKioskScreen=undefined;this.recruitmentKioskView=undefined;this.recruitmentKioskTransition=undefined;
    this.artsCenterPosterTextures.forEach(texture=>texture.dispose());this.artsCenterPosterTextures=[];this.artsCenterPosterScreens=[];this.artsCenterSeats=[];this.foodSeats=[];this.artsCenterStageBackdrop=undefined;
    if(this.festivalStageBackdrop)gameEvents.emit('festival-stage-screen-rect',null);this.festivalStageBackdrop=undefined;this.lastFestivalStageScreenRect=undefined;this.festivalStageFocusView=undefined;this.festivalStageFocusTransition=undefined;
    if(this.observatoryTelescopeOutline){this.observatoryTelescopeOutline.geometry.dispose();(this.observatoryTelescopeOutline.material as THREE.Material).dispose();this.observatoryTelescopeOutline=undefined}
    this.localCharacter?.destroy();this.guideNpc?.destroy();this.localNpcs.forEach(npc=>npc.character.destroy());this.localNpcs=[];this.remotes.forEach(character=>character.destroy());this.remotes.clear();this.remoteGrounds.clear();
    this.scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Points){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose())}if(object instanceof THREE.Sprite){object.material.map?.dispose();object.material.dispose()}});
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }
}
