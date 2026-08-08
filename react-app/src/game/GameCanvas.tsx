import { memo,useEffect,useRef,useState } from 'react';
import Phaser from 'phaser';
import { WorldScene } from './scenes/WorldScene';
import { gameEvents } from './events';
import { socket } from './systems/socketClient';
import type { UserProfile } from '../types';
import { LakeParkExperiences } from '../components/LakeParkExperiences';
import { GreenhouseExperience } from '../components/GreenhouseExperience';
import { BEAR_PLAY_ZONE_RENDERER_OPTIONS,BEAR_TREE_PARK_RENDERER_OPTIONS,CAMPUS_RENDERER_OPTIONS,CLUB_STREET_FESTIVAL_RENDERER_OPTIONS,FESTIVAL_EXPERIENCE_RENDERER_OPTIONS,FOOD_EXPERIENCE_RENDERER_OPTIONS,GARDEN_RENDERER_OPTIONS,GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS,GOVERNMENT_OBSERVATORY_RENDERER_OPTIONS,GOVERNMENT_RENDERER_OPTIONS,LAKE_PARK_RENDERER_OPTIONS,LAKE_PARK_SPAWN,PERSONAL_FARM_RENDERER_OPTIONS,preloadBearPlayZoneDownload,preloadBearTreeParkDownload,PROJECT_ROOM_RENDERER_OPTIONS,RECRUITMENT_CENTER_RENDERER_OPTIONS,SEJONG_ARTS_CENTER_RENDERER_OPTIONS,SEJONG_SMART_CITY_RENDERER_OPTIONS,STUDENT_HALL_RENDERER_OPTIONS,VillageMapRenderer,WORLD_RENDERER_LAYOUT_TOKEN } from './renderers/VillageMapRenderer';
import type { MapId,PortalPosition,PortalSaveResult,RespawnPosition } from '../../shared/socket-events';
import { buildExperienceRecommendationProfile,recordMapExperience } from '../services/experienceRecommendationProfile';
import type { GameReturnState } from './gameReturnState';
import { getSharedRespawnPosition } from '../services/respawnPosition';
import {ExperienceHarnessCollector,hydrateGeneratedExperienceProfile,resetGuestExperienceProfile,setActiveExperienceUser,setExperienceProfileMode} from '../services/experienceHarness';
import {loadSharedWorldPortalState,saveSharedWorldPortalPosition} from '../services/worldPortalPositions';
import {PersonalFarmProgressExperience} from '../components/PersonalFarmProgressExperience';
import {PERSONAL_FARM_PROGRESS_CHANGED,refreshPersonalFarmProgress,setPersonalFarmProgressMode,setPersonalFarmProgressUser} from '../services/personalFarmApi';
import {applyUnifiedWorldCamera,usesUnifiedWorldNavigation} from './worldNavigationProfile';
import {loadSharedWorldCameraProfiles,loadWorldCameraProfileDraft,type WorldCameraProfile} from '../services/worldCameraProfiles';
import {fixedWorldCameraProfileFor,isFixedWorldCameraMap} from './fixedWorldCameraProfiles';
import {resetGuestCampusProfileSignals,setCampusProfileSignalMode} from '../services/campusProfileSignals';
import {resetGuestProjectRoomProfile,setProjectRoomProfileMode} from '../services/projectRoomProjects';
import {guestUnifiedProfileSession} from '../services/guestUnifiedProfile';

const MAP_LOADING_COPY:Partial<Record<MapId,{place:string;title:string;description:string;tasks:string[]}>>={
  'bear-play-zone':{place:'곰 체험소',title:'곰 체험소로 이동 중...',description:'움직이는 곰과 길가의 먹이 찾기 체험을 준비하고 있어요.',tasks:['곰 체험소 입구 확인','체험소 공간 불러오기','캐릭터 배치','움직이는 곰과 먹이 배치','베어트리파크 귀환 포털 연결']},
  'personal-farm':{place:'마이홈',title:'마이홈으로 이동 중...',description:'아늑한 집과 작은 마당을 준비하고 있어요.',tasks:['마이홈 입구 확인','집과 마당 불러오기','캐릭터 배치','꽃밭과 보상 확인','포털 연결']},
  'recruitment-center':{place:'모집센터',title:'모집센터로 이동 중...',description:'함께할 사람과 활동을 찾는 모집 공간을 준비하고 있어요.',tasks:['모집센터 입구 확인','모집센터 GLB 불러오기','캐릭터 배치','안내 데스크 동선 연결','공동 캠퍼스 귀환 포털 연결']},
  town:{place:'세종호수공원',title:'세종호수공원으로 이동중...',description:'호수 산책로와 다양한 취향 체험을 준비하고 있어요.',tasks:['입장 위치 확인','호수공원 산책로 불러오기','캐릭터 배치','축제·공연 체험 연결','주변 사용자 연결']},
  'arts-center':{place:'세종예술의전당',title:'세종예술의전당으로 이동중...',description:'밝은 예술 로비와 공연장을 준비하고 있어요.',tasks:['예술의전당 포털 확인','공연장 GLB 불러오기','캐릭터 배치','공연장 동선 연결','호수공원 귀환 포털 연결']},
  'festival-experience':{place:'축제 부스',title:'축제 부스로 이동중...',description:'무대와 체험 부스가 있는 축제 공간을 준비하고 있어요.',tasks:['축제 포털 확인','축제 맵 GLB 불러오기','캐릭터 배치','축제 광장 연결','호수공원 귀환 포털 연결']},
  'club-street-festival':{place:'동아리 거리제',title:'동아리 거리제로 이동중...',description:'동아리 부스와 중앙 광장을 준비하고 있어요.',tasks:['동아리 거리제 포털 확인','거리제 GLB 불러오기','캐릭터 배치','부스 거리 연결','공동캠퍼스 귀환 포털 연결']},
  'food-experience':{place:'먹거리 부스',title:'먹거리 부스로 이동중...',description:'푸드트럭과 야외 테이블이 있는 광장을 준비하고 있어요.',tasks:['먹거리 포털 확인','먹거리 공간 불러오기','캐릭터 배치','푸드트럭 광장 연결','호수공원 귀환 포털 연결']},
  'bear-tree-park':{place:'베어트리파크',title:'베어트리파크로 이동중...',description:'숲길과 자연 관찰 공간을 준비하고 있어요.',tasks:['숲길 입구 확인','베어트리파크 숲 불러오기','탐험 캐릭터 배치','자연 관찰 기록 연결','주변 탐험가 연결']},
  garden:{place:'수목원',title:'수목원으로 이동중...',description:'정원과 온실의 식물 탐험을 준비하고 있어요.',tasks:['수목원 입구 확인','정원과 온실 불러오기','탐험 캐릭터 배치','식물도감 기록 연결','주변 탐험가 연결']},
  campus:{place:'공동캠퍼스',title:'공동캠퍼스로 이동중...',description:'관심사가 비슷한 이웃과 만날 캠퍼스를 준비하고 있어요.',tasks:['캠퍼스 입구 확인','공동캠퍼스 불러오기','캐릭터 배치','관심사·동아리 연결','다른 사용자 연결']},
  'student-hall':{place:'학생회관',title:'학생회관으로 이동중...',description:'캠퍼스 이웃과 만날 학생회관 로비를 준비하고 있어요.',tasks:['학생회관 입구 확인','학생회관 불러오기','캐릭터 배치','로비 동선 연결','다른 사용자 연결']},
  'project-room':{place:'프로젝트실',title:'프로젝트실로 이동중...',description:'함께 아이디어를 구체화할 프로젝트 공간을 준비하고 있어요.',tasks:['프로젝트실 입구 확인','프로젝트실 불러오기','캐릭터 배치','공동 작업 공간 연결','주변 사용자 연결']},
  government:{place:'정부청사',title:'정부청사로 이동중...',description:'함께 방문할 장소와 코스를 정할 공간을 준비하고 있어요.',tasks:['정부청사 입구 확인','정부청사 불러오기','캐릭터 배치','공동 계획 공간 연결','다른 사용자 연결']},
  'government-central-plaza':{place:'중앙광장',title:'중앙광장으로 이동중...',description:'AI 세종 추천센터와 행정 안내 공간을 준비하고 있어요.',tasks:['중앙광장 입구 확인','중앙광장 GLB 불러오기','캐릭터 배치','AI 추천센터 연결','정부청사 귀환 포탈 연결']},
  'government-policy-hall':{place:'정책 체험관',title:'정책 체험관으로 이동중...',description:'세종의 정책을 살펴보고 의견을 남길 공간을 준비하고 있어요.',tasks:['정책 체험관 입구 확인','행정 체험 공간 구성','캐릭터 배치','정책 안내 연결','정부청사 귀환 동선 연결']},
  'government-observatory':{place:'전망대',title:'전망대로 이동중...',description:'세종의 전경을 한눈에 볼 전망 공간을 준비하고 있어요.',tasks:['전망대 입구 확인','전망 공간 구성','캐릭터 배치','전경 안내 연결','정부청사 귀환 동선 연결']},
  'sejong-smart-city':{place:'세종 스마트시티 국가시범도시',title:'스마트시티로 이동중...',description:'AI와 데이터로 연결된 세종 5-1 생활권 미래 전시관을 준비하고 있어요.',tasks:['전시관 입구 확인','스마트시티 전시관 GLB 불러오기','캐릭터 배치','AI·모빌리티·에너지 전시 연결','정부청사 귀환 포탈 연결']},
  'jochwon-station':{place:'조치원역',title:'조치원역으로 이동중...',description:'세종 여행을 시작할 역 광장을 준비하고 있어요.',tasks:['도착 위치 확인','조치원역 광장 불러오기','캐릭터 배치','지역 이동 정보 연결','주변 사용자 연결']},
  'traditional-market':{place:'세종전통시장',title:'세종전통시장으로 이동중...',description:'먹거리와 골목 상점을 둘러볼 시장을 준비하고 있어요.',tasks:['시장 입구 확인','시장 골목 불러오기','캐릭터 배치','맛집·상점 정보 연결','주변 방문자 연결']},
  'jochwon-park':{place:'조치원공원',title:'조치원공원으로 이동중...',description:'천천히 산책하고 쉴 수 있는 공원을 준비하고 있어요.',tasks:['공원 입구 확인','산책로와 쉼터 불러오기','캐릭터 배치','공원 체험 연결','주변 산책자 연결']},
  'college-street':{place:'대학로',title:'대학로로 이동중...',description:'청년 문화와 개성 있는 가게가 모인 거리를 준비하고 있어요.',tasks:['거리 입구 확인','대학로 상점 불러오기','캐릭터 배치','문화·상점 정보 연결','주변 사용자 연결']},
};

const authoredRendererOptionsFor=(mapId:MapId)=>mapId==='personal-farm'?PERSONAL_FARM_RENDERER_OPTIONS:mapId==='arts-center'?SEJONG_ARTS_CENTER_RENDERER_OPTIONS:mapId==='festival-experience'?FESTIVAL_EXPERIENCE_RENDERER_OPTIONS:mapId==='food-experience'?FOOD_EXPERIENCE_RENDERER_OPTIONS:mapId==='club-street-festival'?CLUB_STREET_FESTIVAL_RENDERER_OPTIONS:mapId==='town'?LAKE_PARK_RENDERER_OPTIONS:mapId==='bear-tree-park'?BEAR_TREE_PARK_RENDERER_OPTIONS:mapId==='bear-play-zone'?BEAR_PLAY_ZONE_RENDERER_OPTIONS:mapId==='garden'?GARDEN_RENDERER_OPTIONS:mapId==='campus'?CAMPUS_RENDERER_OPTIONS:mapId==='student-hall'?STUDENT_HALL_RENDERER_OPTIONS:mapId==='recruitment-center'?RECRUITMENT_CENTER_RENDERER_OPTIONS:mapId==='project-room'?PROJECT_ROOM_RENDERER_OPTIONS:mapId==='government'?GOVERNMENT_RENDERER_OPTIONS:mapId==='government-central-plaza'?GOVERNMENT_CENTRAL_PLAZA_RENDERER_OPTIONS:mapId==='government-observatory'?GOVERNMENT_OBSERVATORY_RENDERER_OPTIONS:mapId==='sejong-smart-city'?SEJONG_SMART_CITY_RENDERER_OPTIONS:undefined;
const rendererOptionsFor=(mapId:MapId)=>{
  const options=authoredRendererOptionsFor(mapId);
  return options&&usesUnifiedWorldNavigation(mapId)?applyUnifiedWorldCamera(options,mapId):options;
};

export const GameCanvas=memo(function GameCanvas({profile,returnState,previewOnly=false,previewDragRotate=false,authenticated=Boolean(localStorage.getItem('jochiwon-kakao-user-id')?.trim())}:{profile:UserProfile;returnState?:GameReturnState;previewOnly?:boolean;previewDragRotate?:boolean;authenticated?:boolean}){
  if(!previewOnly){setExperienceProfileMode(authenticated);setActiveExperienceUser(profile.nickname);setPersonalFarmProgressUser(profile.nickname);setPersonalFarmProgressMode(authenticated);setCampusProfileSignalMode(authenticated);setProjectRoomProfileMode(authenticated,profile.nickname)}
  const [entrySpawn,setEntrySpawn]=useState<RespawnPosition|GameReturnState|undefined>(()=>returnState);
  const ref=useRef<HTMLDivElement>(null),[loading,setLoading]=useState(true),[loadingMapId,setLoadingMapId]=useState<MapId>(()=>returnState?.mapId??'town'),[loadError,setLoadError]=useState('');
  useEffect(()=>{
    if(previewOnly)return;
    const changed=(event:Event)=>gameEvents.emit(PERSONAL_FARM_PROGRESS_CHANGED,(event as CustomEvent).detail);
    window.addEventListener(PERSONAL_FARM_PROGRESS_CHANGED,changed);
    void refreshPersonalFarmProgress().catch(()=>undefined);
    return()=>{window.removeEventListener(PERSONAL_FARM_PROGRESS_CHANGED,changed);if(!authenticated){resetGuestExperienceProfile();resetGuestCampusProfileSignals();resetGuestProjectRoomProfile();guestUnifiedProfileSession.reset()}};
  },[authenticated,previewOnly,profile.nickname]);
  const loadingCopy=MAP_LOADING_COPY[loadingMapId]??{place:'세종예술의전당',title:'세종예술의전당으로 이동중...',description:'공연장 로비와 무대를 준비하고 있어요',tasks:['전당 입구 확인','예술의전당 GLB 불러오기','캐릭터 배치','공연 공간 연결','호수공원 귀환 포탈 연결']};
  useEffect(()=>{
    if(returnState){setEntrySpawn(returnState);return}
    let active=true,settled=false,fallbackTimer=0;
    const finish=(position:RespawnPosition)=>{if(!active||settled)return;settled=true;window.clearTimeout(fallbackTimer);setEntrySpawn(position)};
    const resolveRespawn=async()=>{
      try{finish(await getSharedRespawnPosition())}
      catch{
        if(socket.connected)socket.emit('getRespawnPosition',finish);
        else socket.connect();
      }
    };
    // Prefer the shared WIZ position used by both demo and Kakao entry flows.
    fallbackTimer=window.setTimeout(()=>finish(LAKE_PARK_SPAWN),5000);
    socket.on('connect',resolveRespawn);
    void resolveRespawn();
    return()=>{active=false;window.clearTimeout(fallbackTimer);socket.off('connect',resolveRespawn)};
  },[profile.nickname,returnState]);
  useEffect(()=>{
    if(!ref.current||!entrySpawn)return;
    let cancelled=false,mapTravelActive=false,gardenReleaseTimer=0;
    const experienceHarness=previewOnly?undefined:new ExperienceHarnessCollector(profile.nickname);
    if(!previewOnly)void hydrateGeneratedExperienceProfile(profile.nickname);
    const preloadIdleHandles:number[]=[],queuedBearMapPreloads=new Set<'bear-tree-park'|'bear-play-zone'>();
    const initialMapId=returnState?.mapId??('mapId' in entrySpawn?entrySpawn.mapId:'town'),initialOptions=rendererOptionsFor(initialMapId);
    experienceHarness?.enter(initialMapId);
    const previewOptions={hideCharacters:true,previewNavigation:true,previewDragRotate,guide:false,resident:undefined,residentDecor:[],localNpcs:[]};
    const initialRenderer=initialOptions?new VillageMapRenderer(ref.current,profile,{...initialOptions,mapId:initialMapId,...(previewOnly?previewOptions:{}),spawn:entrySpawn}):undefined;
    const initialCameraProfile=fixedWorldCameraProfileFor(initialMapId)??loadWorldCameraProfileDraft(initialMapId);
    if(initialRenderer&&initialCameraProfile)initialRenderer.applyWorldCameraProfile(initialCameraProfile);
    const worldRenderers:Partial<Record<MapId,VillageMapRenderer>>=initialRenderer?{[initialMapId]:initialRenderer}:{};
    let latestPortalPositions:PortalPosition[]=[],activeMapId=initialMapId,latestCameraProfiles=new Map<MapId,WorldCameraProfile>();
    let portalSyncGeneration=0,pendingPortalSaveCount=0;
    const preloadConnectedBearMap=(mapId:MapId)=>{
      const target=mapId==='bear-tree-park'?'bear-play-zone':'bear-tree-park';
      if(queuedBearMapPreloads.has(target))return;
      queuedBearMapPreloads.add(target);
      const preload=target==='bear-play-zone'?preloadBearPlayZoneDownload:preloadBearTreeParkDownload;
      preloadIdleHandles.push(window.requestIdleCallback(()=>{
        if(cancelled)return;
        void preload().catch(error=>{
          queuedBearMapPreloads.delete(target);
          console.warn(`[${target} preload] download failed`,error);
        });
      },{timeout:1800}));
    };
    const ensureWorldRenderer=(mapId:MapId)=>{
      const existing=worldRenderers[mapId];if(existing)return existing;
      const options=rendererOptionsFor(mapId);
      if(!options)return;
      const renderer=new VillageMapRenderer(ref.current!,profile,{...options,mapId,...(previewOnly?previewOptions:{})});renderer.setVisible(false);worldRenderers[mapId]=renderer;
      const cameraProfile=mapId==='garden'?loadWorldCameraProfileDraft(mapId):fixedWorldCameraProfileFor(mapId)??loadWorldCameraProfileDraft(mapId)??latestCameraProfiles.get(mapId);if(cameraProfile)renderer.applyWorldCameraProfile(cameraProfile);
      latestPortalPositions.filter(position=>position.mapId===mapId).forEach(position=>renderer.setPortalPosition(position));
      return renderer;
    };
    const showMapTravelLoading=(mapId:MapId)=>{
      experienceHarness?.exit();
      mapTravelActive=true;setLoadingMapId(mapId);setLoadError('');setLoading(true);
      window.clearTimeout(gardenReleaseTimer);
      if(mapId==='bear-tree-park'&&worldRenderers.garden){
        gardenReleaseTimer=window.setTimeout(()=>{
          const gardenRenderer=worldRenderers.garden;
          if(!gardenRenderer)return;
          gardenRenderer.setVisible(false);
          gardenRenderer.destroy();
          delete worldRenderers.garden;
        },160);
      }
    };
    const hideMapTravelLoading=(mapId?:MapId)=>{if(mapId){setLoadingMapId(mapId);preloadConnectedBearMap(mapId)}if(!mapTravelActive)return;mapTravelActive=false;setLoading(false)};
    const showMapTravelError=({message}:{message:string})=>{if(!mapTravelActive)return;mapTravelActive=false;setLoadError(message);setLoading(false)};
    gameEvents.on('map-travel-started',showMapTravelLoading);
    gameEvents.on('map-travel-complete',hideMapTravelLoading);
    gameEvents.on('map-travel-failed',showMapTravelError);
    void (initialRenderer?.ready??Promise.resolve()).then(()=>{
      if(cancelled)return;
      setLoading(false);
      preloadConnectedBearMap(initialMapId);
      gameEvents.emit('world-camera-profile-ready',initialMapId);
    }).catch(error=>{if(!cancelled)setLoadError(error instanceof Error?error.message:String(error))});
    const syncWorldClock=(serverNow:number)=>Object.values(worldRenderers).forEach(renderer=>renderer?.setWorldClock(serverNow));
    const syncPortalPositions=(positions:PortalPosition[])=>{
      latestPortalPositions=positions;
      positions.forEach(position=>worldRenderers[position.mapId]?.setPortalPosition(position));
    };
    const portalPositionKey=(position:Pick<PortalPosition,'mapId'|'destination'>)=>`${position.mapId}:${position.destination}`;
    const upsertPortalPosition=(positions:PortalPosition[],position:PortalPosition)=>{
      const key=portalPositionKey(position),exists=positions.some(item=>portalPositionKey(item)===key);
      return exists?positions.map(item=>portalPositionKey(item)===key?position:item):[...positions,position];
    };
    const refreshSharedPortals=()=>{
      if(pendingPortalSaveCount)return;
      const generation=portalSyncGeneration;
      void loadSharedWorldPortalState().then(({positions})=>{
        if(!cancelled&&!pendingPortalSaveCount&&generation===portalSyncGeneration&&positions.length)syncPortalPositions(positions);
      }).catch(()=>undefined);
    };
    const syncCameraProfiles=(profiles:WorldCameraProfile[])=>{
      latestCameraProfiles=new Map(profiles.map(profile=>[profile.mapId,profile]));
      Object.entries(worldRenderers).forEach(([mapId,renderer])=>{const typedMapId=mapId as MapId,cameraProfile=typedMapId==='garden'?loadWorldCameraProfileDraft(typedMapId):fixedWorldCameraProfileFor(typedMapId)??loadWorldCameraProfileDraft(typedMapId)??latestCameraProfiles.get(typedMapId);if(renderer&&cameraProfile)renderer.applyWorldCameraProfile(cameraProfile)});
    };
    const previewCameraProfile=(cameraProfile:WorldCameraProfile)=>{if(isFixedWorldCameraMap(cameraProfile.mapId))return;latestCameraProfiles.set(cameraProfile.mapId,cameraProfile);worldRenderers[cameraProfile.mapId]?.applyWorldCameraProfile(cameraProfile)};
    const resetCameraProfile=(mapId:MapId)=>{if(isFixedWorldCameraMap(mapId))return;latestCameraProfiles.delete(mapId);worldRenderers[mapId]?.resetWorldCameraProfile()};
    const requestCameraProfile=(mapId:MapId,reply:(profile?:WorldCameraProfile)=>void)=>reply(worldRenderers[mapId]?.getWorldCameraProfile());
    const placeWorldPortal=(destination:MapId)=>{
      if(activeMapId==='garden')return;
      const position=worldRenderers[activeMapId]?.placePortalAtPlayer(destination);
      if(!position)return;
      let saveFailed=false;
      pendingPortalSaveCount++;portalSyncGeneration++;
      void saveSharedWorldPortalPosition(position).then(result=>{
        if(cancelled)return;
        const saved=result.position??position;
        portalSyncGeneration++;
        syncPortalPositions(upsertPortalPosition(latestPortalPositions,saved));
        gameEvents.emit('portal-position-save-result',result);
      }).catch(error=>{
        if(cancelled)return;
        // Reconcile immediately with the WIZ source of truth when persistence
        // fails, instead of leaving an optimistic position that jumps back on
        // the next polling tick with no explanation.
        saveFailed=true;portalSyncGeneration++;
        gameEvents.emit('portal-position-save-result',{ok:false,message:error instanceof Error?error.message:'포탈 위치를 저장하지 못했어요.'});
      }).finally(()=>{pendingPortalSaveCount=Math.max(0,pendingPortalSaveCount-1);if(saveFailed)refreshSharedPortals()});
    };
    const recommendationProfile=()=>{
      const recommendation=buildExperienceRecommendationProfile(profile);
      return {
        ...recommendation,
        experienceRecords:profile.recordVisibility==='private'?[]:recommendation.experienceRecords,
        recordVisibility:profile.recordVisibility??'public',
        chatEnabled:profile.chatEnabled??true,
      };
    };
    const publishRecommendationProfile=()=>socket.emit('updateMatchProfile',recommendationProfile());
    const enrich=()=>socket.emit('joinMap',{mapId:initialMapId,nickname:profile.nickname,appearance:profile.character,model:profile.model,matchProfile:recommendationProfile(),x:entrySpawn.x,y:entrySpawn.z});
    const experienceChanged=()=>publishRecommendationProfile();
    const mapExperienceChanged=(mapId:MapId)=>{
      activeMapId=mapId;
      experienceHarness?.enter(mapId);
      if(!previewOnly){recordMapExperience(profile.nickname,mapId);publishRecommendationProfile()}
      // Keep only the active WebGL world. Retaining the lake renderer while
      // loading the bear park and research lab can exhaust the GPU context.
      Object.entries(worldRenderers).forEach(([storedMapId,renderer])=>{
        if(storedMapId===mapId||!renderer)return;
        renderer.setVisible(false);
        renderer.destroy();
        delete worldRenderers[storedMapId as MapId];
      });
      void worldRenderers[mapId]?.ready.then(()=>{if(!cancelled)gameEvents.emit('world-camera-profile-ready',mapId)});
    };
    let sharedPortalTimer=0;
    // WIZ is the canonical portal store. Socket.IO may run a different release
    // or database, so applying its portal snapshot can roll a successful WIZ
    // save back to an older position.
    if(!previewOnly){socket.on('worldClock',syncWorldClock);refreshSharedPortals();sharedPortalTimer=window.setInterval(refreshSharedPortals,2500)}
    gameEvents.on('world-portal-place-at-player',placeWorldPortal);
    gameEvents.on('world-camera-profile-preview',previewCameraProfile);
    gameEvents.on('world-camera-profile-reset',resetCameraProfile);
    gameEvents.on('world-camera-profile-request',requestCameraProfile);
    if(!previewOnly)void loadSharedWorldCameraProfiles().then(({profiles})=>{if(!cancelled)syncCameraProfiles(profiles)}).catch(()=>undefined);
    if(!previewOnly){
      socket.once('currentMapUsers',enrich);
      window.addEventListener('sejong-lake-interest-updated',experienceChanged);
      window.addEventListener('sejong-experience-profile-updated',experienceChanged);
      gameEvents.on('greenhouse-progress-changed',experienceChanged);
    }
    gameEvents.on('map-travel-complete',mapExperienceChanged);
    const game=new Phaser.Game({type:Phaser.CANVAS,parent:ref.current,width:1100,height:700,transparent:true,backgroundColor:'rgba(0,0,0,0)',render:{antialias:false,roundPixels:true},dom:{createContainer:true},physics:{default:'arcade'},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}});
    game.canvas.classList.add('phaser-world-canvas');
    if(game.domContainer)game.domContainer.style.zIndex='3';
    game.scene.add('world',WorldScene,true,{profile,mapId:initialMapId,worldRenderers,ensureWorldRenderer,initialSpawn:entrySpawn,previewOnly});
    return()=>{
      cancelled=true;
      window.clearTimeout(gardenReleaseTimer);
      window.clearInterval(sharedPortalTimer);
      preloadIdleHandles.forEach(handle=>window.cancelIdleCallback(handle));
      socket.off('worldClock',syncWorldClock);
      gameEvents.off('world-portal-place-at-player',placeWorldPortal);
      gameEvents.off('world-camera-profile-preview',previewCameraProfile);
      gameEvents.off('world-camera-profile-reset',resetCameraProfile);
      gameEvents.off('world-camera-profile-request',requestCameraProfile);
      socket.off('currentMapUsers',enrich);
      window.removeEventListener('sejong-lake-interest-updated',experienceChanged);
      window.removeEventListener('sejong-experience-profile-updated',experienceChanged);
      gameEvents.off('greenhouse-progress-changed',experienceChanged);
      gameEvents.off('map-travel-complete',mapExperienceChanged);
      gameEvents.off('map-travel-started',showMapTravelLoading);
      gameEvents.off('map-travel-complete',hideMapTravelLoading);
      gameEvents.off('map-travel-failed',showMapTravelError);
      gameEvents.removeAllListeners('show-bubble');
      experienceHarness?.destroy();
      game.destroy(true);
      Object.values(worldRenderers).forEach(renderer=>renderer?.destroy());
    };
  },[profile,entrySpawn,returnState,previewOnly,previewDragRotate,authenticated,WORLD_RENDERER_LAYOUT_TOKEN]);
  const loadingTasks=previewOnly?['입장 위치 확인',`${loadingCopy.place} GLB 불러오기`,'맵 둘러보기 카메라 준비']:loadingCopy.tasks;
  return <><div className="game-canvas" ref={ref}/>{loading&&<div className="game-loading" role="status" aria-live="polite"><div className="game-loading-brand"><span><img className="sejong-brand-logo" src="/assets/brand/sejong-hanbakwi.png" alt="" aria-hidden="true"/></span><div><b>세종한바퀴</b><small>{previewOnly?'비로그인 맵 둘러보기':'세종 소통형 체험 공간'}</small></div></div><div className="game-loading-center"><i/><span>{loadingCopy.place}</span><h1>{loadingCopy.title}</h1><p>{loadError||(previewOnly?'캐릭터 없이 월드 맵을 준비하고 있어요.':loadingCopy.description)}</p><div className="world-loading-tasks">{loadingTasks.map((task,index)=><span key={task}>{index===0?'✓':'●'} {task}</span>)}</div><div className="game-loading-progress"><em/></div></div></div>}{!previewOnly&&<><LakeParkExperiences/><GreenhouseExperience userKey={profile.nickname}/><PersonalFarmProgressExperience authenticated={authenticated} userKey={profile.nickname} mapId={loadingMapId}/></>}</>;
});
