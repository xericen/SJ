import { useEffect,useLayoutEffect,useMemo,useRef,useState } from 'react';import { Armchair,Check,LogOut,MapPin,MessageCircle,PhoneOff,Send,Siren,UserPlus,UserRound,Users,X } from 'lucide-react';import { GameCanvas } from '../game/GameCanvas';import { gameEvents } from '../game/events';import { socket } from '../game/systems/socketClient';import { CharacterPreview } from '../components/CharacterPreview';import { DirectRecommendationControls,DirectRecommendationMessage,GovernmentSessionPanel,MeetingPlaceBanner,MeetingPlaceSystemMessage } from '../components/DirectRecommendation';import {SocialProfileModal,socialProfileFromPlayer,type SocialProfilePerson} from '../components/SocialProfileModal';import {loadFriendIds,loadSocialBlocks,saveFriendIds,saveSocialBlock,saveSocialReport,type SocialBlockMode,type SocialReportReason} from '../services/socialSafety';import type { UserProfile } from '../types';import type { CampusFeaturePortalId,CharacterEmote,ChatMessage,DirectMessage,DirectRequest,DirectRoom,DirectRoomMeetingPlace,FriendRequest,GroupRoom,MapId,PlayerState } from '../../shared/socket-events';import './GamePage.css';
import { WORLD_PORTAL_LABELS,worldPortalsForMap } from '../../shared/world-portals';
import type { PortalSaveResult } from '../../shared/socket-events';
import { LakeParkTutorial,LAKE_WELCOME_SEEN_KEY } from '../components/LakeParkTutorial';
import { BearTreeParkTutorial } from '../components/BearTreeParkTutorial';
import { BearPlayZoneTutorial } from '../components/BearPlayZoneTutorial';
import { CampusCommunicationHub,type CampusHubTab } from '../components/CampusCommunicationHub';
import { AiSejongProfile } from '../components/AiSejongProfile';
import { ProjectRoomInteractions } from '../components/ProjectRoomInteractions';
import { GovernmentCentralPlazaWebUI } from '../components/GovernmentCentralPlazaWebUI';
import { GovernmentAiRecommendationCenter } from '../components/GovernmentAiRecommendationCenter';
import { ObservatoryTelescopeInteraction } from '../components/ObservatoryTelescopeInteraction';
import { FoodTruckExperience } from '../components/FoodTruckExperience';
import { ArtsCenterPosterKiosk } from '../components/ArtsCenterPosterKiosk';
import { ArtsCenterStageVideo } from '../components/ArtsCenterStageVideo';
import { ArtsCenterTutorial,ExperienceTutorial } from '../components/ArtsCenterTutorial';
import { ClubStreetExperience } from '../components/ClubStreetExperience';
import { StudentHallBoards } from '../components/StudentHallBoards';
import { ProjectLobbyBoard } from '../components/ProjectLobbyBoard';
import { RecruitmentCenterDesk,RECRUITMENT_GUIDE_ID } from '../components/RecruitmentCenterDesk';
import { RecruitmentCenterKiosk } from '../components/RecruitmentCenterKiosk';
import { CampusMapIntro } from '../components/CampusMapIntro';
import { SmartCityExperience } from '../components/SmartCityExperience';
import {WorldCameraEditor} from '../components/WorldCameraEditor';
import type { GameReturnState } from '../game/gameReturnState';
import { CAMPUS_FRIEND_NPCS } from '../data/campusNpc';
import { PROJECT_ROOM_NPC } from '../data/projectRoomNpc';
import { STUDENT_HALL_NPCS } from '../data/studentHallNpc';
import { FESTIVAL_NPCS } from '../data/festivalNpc';
import { CAMPUS_BUILDINGS,loadVisitedCampusBuildings,recordCampusBuildingVisit } from '../services/campusVisits';
import {recordCampusProfileSignal} from '../services/campusProfileSignals';
import {loadSharedWorldPortalState} from '../services/worldPortalPositions';
import {buildAiSejongProfile} from '../services/aiSejongProfile';
import {buildProfileProgress} from '../services/profileProgress';
import {isPersonalFarmReturnMap,loadPersonalFarmReturnMap,savePersonalFarmReturnMap} from '../game/personalFarmReturnMap';
type NearbyNpc={id:string;nickname:string;status:string;appearance:UserProfile['character'];model:UserProfile['model'];x:number;z:number};
type NpcChatMessage={id:string;sender:'me'|'npc';message:string};
type CharacterEncounter={kind:'npc';target:NearbyNpc}|{kind:'player';target:PlayerState};
type NpcScreenPosition={id:string;x:number;y:number;localX:number;localY:number};
const ENCOUNTER_EMOTES:[string,string,CharacterEmote][]=[['👋','인사하기','hi'],['👏','박수','clapping'],['💬','말하기','talking']];
const FOCUSED_EXPERIENCE_MAPS=new Set<MapId>(['arts-center','festival-experience','food-experience','club-street-festival','bear-tree-park','bear-play-zone','garden','government-central-plaza','government-policy-hall','government-observatory','sejong-smart-city']);
const normalizePlaceName=(name:string)=>name;
const npcEncounterMenuStyle=(position:NpcScreenPosition)=>{
 const panelWidth=198,edge=20,characterGap=118,leftUiEdge=285,maxLeft=Math.max(edge,window.innerWidth-panelWidth-edge);
 const characterMinX=Math.min(position.x,position.localX),characterMaxX=Math.max(position.x,position.localX);
 const rightCandidate=characterMaxX+characterGap,leftCandidate=characterMinX-panelWidth-characterGap;
 const left=rightCandidate<=maxLeft?rightCandidate:leftCandidate>=leftUiEdge?leftCandidate:characterMinX<window.innerWidth/2?maxLeft:leftUiEdge;
 const centerY=(position.y+position.localY)/2;
 return {left:`${Math.round(left)}px`,top:`${Math.round(Math.max(145,Math.min(window.innerHeight-145,centerY)))}px`};
};
export function GamePage({profile,returnState,onExit,onEditProfile,onOpenCommunity}:{profile:UserProfile;returnState?:GameReturnState;onExit:()=>void;onEditProfile:(state:GameReturnState)=>void;onOpenCommunity:(state:GameReturnState)=>void}){
 const pageRef=useRef<HTMLElement>(null);
 const [selected,setSelected]=useState<PlayerState|null>(null),[players,setPlayers]=useState<PlayerState[]>([]),[messages,setMessages]=useState<ChatMessage[]>([]),[request,setRequest]=useState<DirectRequest|null>(null),[friendRequest,setFriendRequest]=useState<FriendRequest|null>(null),[notice,setNotice]=useState(''),[groups,setGroups]=useState<GroupRoom[]>([]),[location,setLocation]=useState('세종호수공원');
 const initialMapId=returnState?.mapId??'town';
 const [currentMapId,setCurrentMapId]=useState<MapId>(initialMapId);
 const currentMapIdRef=useRef<MapId>(initialMapId);
 const [personalFarmReturnMap,setPersonalFarmReturnMap]=useState<Exclude<MapId,'personal-farm'>>(()=>isPersonalFarmReturnMap(initialMapId)?initialMapId:loadPersonalFarmReturnMap());
 const [directRooms,setDirectRooms]=useState<DirectRoom[]>([]),[activeDirect,setActiveDirect]=useState<string|null>(null),[directMessages,setDirectMessages]=useState<Record<string,DirectMessage[]>>({}),[directText,setDirectText]=useState(''),[unread,setUnread]=useState<Record<string,number>>({});
 const [lakeTutorialOpen,setLakeTutorialOpen]=useState(()=>(!returnState||returnState.mapId==='town')&&localStorage.getItem(LAKE_WELCOME_SEEN_KEY)!=='true');
 const [guideNearby,setGuideNearby]=useState(false),[guideConversation,setGuideConversation]=useState(false);
 const [bearTutorialOpen,setBearTutorialOpen]=useState(false),[bearTutorialStep,setBearTutorialStep]=useState(0),[bearTutorialShown,setBearTutorialShown]=useState(false),[bearPlayTutorialOpen,setBearPlayTutorialOpen]=useState(false);
 const [onlineCollapsed,setOnlineCollapsed]=useState(false),[mapOverview,setMapOverview]=useState(false),[mapSignNearby,setMapSignNearby]=useState(false);
 const [bearPhotoMode,setBearPhotoMode]=useState(false);
 const [bearPhotoNearby,setBearPhotoNearby]=useState(false);
 const [artsCenterSeated,setArtsCenterSeated]=useState(false);
 const [centralPlazaSofaSeat,setCentralPlazaSofaSeat]=useState<{id:string;seated?:boolean}|null>(null);
 const [personalFarmDoor,setPersonalFarmDoor]=useState<{inside:boolean}|null>(null);
 const [personalFarmSeat,setPersonalFarmSeat]=useState<{id:string;kind:'chair'|'sofa';label:string;seated?:boolean}|null>(null);
 const [personalFarmBed,setPersonalFarmBed]=useState<{sleeping:boolean}|null>(null);
 const [artsCenterTutorialOpen,setArtsCenterTutorialOpen]=useState(false);
 const [experienceTutorialOpen,setExperienceTutorialOpen]=useState<'festival'|'food'|null>(null);
 const [nearbyPortal,setNearbyPortal]=useState<{destination:MapId;label:string;theme?:'mint'|'blue'|'orange';chargeSeconds?:number}|null>(null),[portalProgress,setPortalProgress]=useState(0);
 const [nearbyInteraction,setNearbyInteraction]=useState<{destination:MapId;label:string;buttonLabel:string;chargeSeconds?:number}|null>(null),[interactionProgress,setInteractionProgress]=useState(0);
 const [campusHubOpen,setCampusHubOpen]=useState(false),[campusHubTab,setCampusHubTab]=useState<CampusHubTab>('people');
 const [nearbyCampusFeature,setNearbyCampusFeature]=useState<{id:CampusFeaturePortalId;label:string;description:string}|null>(null);
 const [visitedCampusBuildings,setVisitedCampusBuildings]=useState<CampusFeaturePortalId[]>(()=>loadVisitedCampusBuildings(profile.nickname)),[campusFastTravelOpen,setCampusFastTravelOpen]=useState(false);
 const [aiProfileOpen,setAiProfileOpen]=useState(false);
 const [,setGovernmentSessionId]=useState<string>();
 const [projectRoomPanelOpen,setProjectRoomPanelOpen]=useState(false);
 const [governmentAiCenterOpen,setGovernmentAiCenterOpen]=useState(false);
 const [recruitmentDeskOpen,setRecruitmentDeskOpen]=useState(false);
 const [recruitmentKioskOpen,setRecruitmentKioskOpen]=useState(false);
 const [nearbyPlayer,setNearbyPlayer]=useState<PlayerState|null>(null),[nearbyNpc,setNearbyNpc]=useState<NearbyNpc|null>(null),[pendingDirectPlayerId,setPendingDirectPlayerId]=useState<string|null>(null);
 const [activeNpc,setActiveNpc]=useState<NearbyNpc|null>(null),[npcMessages,setNpcMessages]=useState<NpcChatMessage[]>([]),[npcText,setNpcText]=useState('');
 const [guideMessages,setGuideMessages]=useState<NpcChatMessage[]>([]),[guideText,setGuideText]=useState('');
 const [encounter,setEncounter]=useState<CharacterEncounter|null>(null),[nearbyNpcScreen,setNearbyNpcScreen]=useState<NpcScreenPosition|null>(null);
 const [pendingDirectTarget,setPendingDirectTarget]=useState<PlayerState|null>(null);
 const [selectedNpc,setSelectedNpc]=useState<NearbyNpc|null>(null);
 const [friends,setFriends]=useState<string[]>(()=>loadFriendIds());
 const [pendingFriendIds,setPendingFriendIds]=useState<string[]>([]);
 const [socialBlocks,setSocialBlocks]=useState<Record<string,SocialBlockMode>>(()=>loadSocialBlocks());
 const socialBlocksRef=useRef(socialBlocks);
 const [reportTargetId,setReportTargetId]=useState<string|null>(null);
 const [friendsOpen,setFriendsOpen]=useState(false);
 const [friendDockLayout,setFriendDockLayout]=useState({left:20,top:200,width:245});
 const [smartCityExperienceOpen,setSmartCityExperienceOpen]=useState(false);
 const [canEditPortals,setCanEditPortals]=useState(false);
 const [cameraEditorOpen,setCameraEditorOpen]=useState(false);
 const editablePortals=useMemo(()=>worldPortalsForMap(currentMapId).filter(()=>!['bear-tree-park','personal-farm','garden','campus','recruitment-center','project-room'].includes(currentMapId)),[currentMapId]);
 useEffect(()=>{
  const saved=(result:PortalSaveResult)=>setNotice(result.message);
  gameEvents.on('portal-position-save-result',saved);
  // WIZ owns the authenticated shared-portal store. The realtime Node session
  // is separate and must not overwrite this permission with a stale false.
  void loadSharedWorldPortalState().then(state=>setCanEditPortals(state.canEdit)).catch(()=>undefined);
  return()=>{gameEvents.off('portal-position-save-result',saved)};
 },[]);
 useLayoutEffect(()=>{
  const page=pageRef.current;
  if(!page||!smartCityExperienceOpen)return;
  const changed=new Map<HTMLElement,{hidden:HTMLElement['hidden'];ariaHidden:string|null}>();
  const hide=(element:HTMLElement)=>{
   if(changed.has(element))return;
   changed.set(element,{hidden:element.hidden,ariaHidden:element.getAttribute('aria-hidden')});
   element.hidden=true;
   element.setAttribute('aria-hidden','true');
  };
  const apply=()=>{
   const layout=Array.from(page.children).find(child=>child.classList.contains('game-layout')) as HTMLElement|undefined;
   if(layout){
    Array.from(layout.children).forEach(child=>{
     const element=child as HTMLElement;
     if(!element.classList.contains('game-canvas')&&!element.classList.contains('game-loading'))hide(element);
    });
   }
   Array.from(page.children).forEach(child=>{
    const element=child as HTMLElement;
    if(element!==layout&&!element.classList.contains('smart-city-control-layer')&&!element.classList.contains('smart-city-wall-layer'))hide(element);
   });
  };
  apply();
  const observer=new MutationObserver(apply);
  observer.observe(page,{childList:true,subtree:true});
  return()=>{
   observer.disconnect();
   changed.forEach((previous,element)=>{
    element.hidden=previous.hidden;
    if(previous.ariaHidden===null)element.removeAttribute('aria-hidden');
    else element.setAttribute('aria-hidden',previous.ariaHidden);
   });
  };
 },[smartCityExperienceOpen]);
 useEffect(()=>{
  const online=document.querySelector<HTMLElement>('.game-page .online');
  if(!online)return;
  const sync=()=>{const rect=online.getBoundingClientRect();setFriendDockLayout({left:rect.left,top:rect.bottom+8,width:rect.width})};
  sync();
  const observer=new ResizeObserver(sync);observer.observe(online);window.addEventListener('resize',sync);
  return()=>{observer.disconnect();window.removeEventListener('resize',sync)};
 },[friendsOpen,players.length,onlineCollapsed,location]);
 useEffect(()=>{
  socialBlocksRef.current=socialBlocks;
  const hiddenIds=Object.entries(socialBlocks).filter(([,mode])=>mode==='hidden').map(([id])=>id);
  gameEvents.emit('social-chat-blocks-changed',Object.keys(socialBlocks));
  gameEvents.emit('social-hidden-characters-changed',hiddenIds);
  if(encounter&&hiddenIds.includes(encounter.target.id))endEncounter();
  if(selected&&hiddenIds.includes(selected.id))setSelected(null);
  if(selectedNpc&&hiddenIds.includes(selectedNpc.id))setSelectedNpc(null);
  if(activeNpc&&socialBlocks[activeNpc.id])setActiveNpc(null);
  if(request&&socialBlocks[request.from.id])setRequest(null);
  if(activeDirect){const room=directRooms.find(item=>item.id===activeDirect),other=room?.participants.find(item=>item.id!==socket.id);if(other&&socialBlocks[other.id])setActiveDirect(null)}
 },[socialBlocks]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(''),2000);return()=>window.clearTimeout(timer)},[notice]);
 useEffect(()=>{const changed=(open:boolean)=>setCameraEditorOpen(open);gameEvents.on('world-camera-editor-open-changed',changed);return()=>{gameEvents.off('world-camera-editor-open-changed',changed)}},[]);
 useEffect(()=>{const focused=FOCUSED_EXPERIENCE_MAPS.has(currentMapId);pageRef.current?.classList.toggle('is-focused-experience',focused);if(focused)setFriendsOpen(false)},[currentMapId]);
 useEffect(()=>{pageRef.current?.classList.toggle('is-npc-chat',Boolean(activeNpc||encounter||guideConversation))},[activeNpc,encounter,guideConversation]);
 useEffect(()=>{const locked=lakeTutorialOpen||guideConversation||bearTutorialOpen||artsCenterTutorialOpen||!!experienceTutorialOpen||bearPhotoMode||campusHubOpen||aiProfileOpen||projectRoomPanelOpen||governmentAiCenterOpen||recruitmentDeskOpen||recruitmentKioskOpen||cameraEditorOpen||!!encounter||!!activeNpc,syncInputLock=()=>gameEvents.emit('game-input-lock',locked);syncInputLock();gameEvents.on('map-travel-complete',syncInputLock);return()=>{gameEvents.off('map-travel-complete',syncInputLock);if(locked)gameEvents.emit('game-input-lock',false)}},[lakeTutorialOpen,guideConversation,bearTutorialOpen,artsCenterTutorialOpen,experienceTutorialOpen,bearPhotoMode,campusHubOpen,aiProfileOpen,projectRoomPanelOpen,governmentAiCenterOpen,recruitmentDeskOpen,recruitmentKioskOpen,cameraEditorOpen,encounter,activeNpc]);
 useEffect(()=>{const overviewChanged=(active:boolean)=>setMapOverview(active);gameEvents.on('map-overview-changed',overviewChanged);return()=>{gameEvents.off('map-overview-changed',overviewChanged)}},[]);
 useEffect(()=>{const proximityChanged=(nearby:boolean)=>setMapSignNearby(nearby);gameEvents.on('map-sign-proximity-changed',proximityChanged);return()=>{gameEvents.off('map-sign-proximity-changed',proximityChanged)}},[]);
 useEffect(()=>{
  const started=(destination:MapId)=>{const origin=currentMapIdRef.current;if(destination==='personal-farm'&&isPersonalFarmReturnMap(origin))setPersonalFarmReturnMap(savePersonalFarmReturnMap(origin))};
  const changed=(mapId:MapId)=>{currentMapIdRef.current=mapId;setCurrentMapId(mapId);if(FOCUSED_EXPERIENCE_MAPS.has(mapId))setFriendsOpen(false)};
  gameEvents.on('map-travel-started',started);gameEvents.on('map-travel-complete',changed);
  return()=>{gameEvents.off('map-travel-started',started);gameEvents.off('map-travel-complete',changed)};
 },[]);
 useEffect(()=>{const blocked=()=>setNotice('프로필을 50% 이상 채운 뒤 정부청사를 방문할 수 있어요.');gameEvents.on('government-access-blocked',blocked);return()=>{gameEvents.off('government-access-blocked',blocked)}},[]);
 useEffect(()=>{const portalChanged=(portal:{destination:MapId;label:string;theme?:'mint'|'blue'|'orange';chargeSeconds?:number}|null)=>{setNearbyPortal(portal);setPortalProgress(0)},chargeChanged=(progress:number)=>setPortalProgress(progress);gameEvents.on('world-portal-proximity-changed',portalChanged);gameEvents.on('portal-charge-progress',chargeChanged);return()=>{gameEvents.off('world-portal-proximity-changed',portalChanged);gameEvents.off('portal-charge-progress',chargeChanged)}},[]);
 useEffect(()=>{const interactionChanged=(interaction:{destination:MapId;label:string;buttonLabel:string;chargeSeconds?:number}|null)=>{setNearbyInteraction(interaction);setInteractionProgress(0)},chargeChanged=(progress:number)=>setInteractionProgress(progress);gameEvents.on('world-interaction-proximity-changed',interactionChanged);gameEvents.on('interaction-charge-progress',chargeChanged);return()=>{gameEvents.off('world-interaction-proximity-changed',interactionChanged);gameEvents.off('interaction-charge-progress',chargeChanged)}},[]);
 useEffect(()=>{const changed=(active:boolean)=>setBearPhotoMode(active);gameEvents.on('bear-photo-mode-changed',changed);return()=>{gameEvents.off('bear-photo-mode-changed',changed)}},[]);
 useEffect(()=>{const changed=(active:boolean)=>setSmartCityExperienceOpen(active);gameEvents.on('smart-city-experience-active-changed',changed);return()=>{gameEvents.off('smart-city-experience-active-changed',changed)}},[]);
 useEffect(()=>{const changed=(nearby:boolean)=>setBearPhotoNearby(nearby);gameEvents.on('bear-photo-proximity-changed',changed);return()=>{gameEvents.off('bear-photo-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(seat:{id:string;seated?:boolean}|null)=>setArtsCenterSeated(Boolean(seat?.seated));gameEvents.on('arts-center-seat-proximity-changed',changed);return()=>{gameEvents.off('arts-center-seat-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(seat:{id:string;seated?:boolean}|null)=>setCentralPlazaSofaSeat(seat);gameEvents.on('central-plaza-sofa-seat-proximity-changed',changed);return()=>{gameEvents.off('central-plaza-sofa-seat-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(door:{inside:boolean}|null)=>setPersonalFarmDoor(door);gameEvents.on('personal-farm-door-proximity-changed',changed);return()=>{gameEvents.off('personal-farm-door-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(seat:{id:string;kind:'chair'|'sofa';label:string;seated?:boolean}|null)=>setPersonalFarmSeat(seat);gameEvents.on('personal-farm-seat-proximity-changed',changed);return()=>{gameEvents.off('personal-farm-seat-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(bed:{sleeping:boolean}|null)=>setPersonalFarmBed(bed);gameEvents.on('personal-farm-bed-proximity-changed',changed);return()=>{gameEvents.off('personal-farm-bed-proximity-changed',changed)}},[]);
 useEffect(()=>{const open=(tab:CampusHubTab)=>{setVisitedCampusBuildings(recordCampusBuildingVisit(profile.nickname,tab));setCampusHubTab(tab);setCampusHubOpen(true);setCampusFastTravelOpen(false)};gameEvents.on('campus-hub-open',open);return()=>{gameEvents.off('campus-hub-open',open)}},[profile.nickname]);
 useEffect(()=>{const changed=(feature:{id:CampusFeaturePortalId;label:string;description:string}|null)=>setNearbyCampusFeature(feature);gameEvents.on('campus-feature-portal-proximity-changed',changed);return()=>{gameEvents.off('campus-feature-portal-proximity-changed',changed)}},[]);
 useEffect(()=>{
  const campusMapCopy:Partial<Record<MapId,{zone:string;subject:string;title:string;note:string;keywords:string[]}>>={
   campus:{zone:'공동캠퍼스',subject:'campus-visit',title:'공동캠퍼스 활동 시작',note:'공동캠퍼스에서 학생회관, 모집센터, 프로젝트실, 동아리 거리제 활동을 둘러봤어요.',keywords:['공동캠퍼스','연결','관계']},
   'student-hall':{zone:'학생회관',subject:'student-hall-visit',title:'학생회관 방문',note:'학생회관에서 현재 활동 중인 이웃과 추천 게시판을 확인했어요.',keywords:['학생회관','이웃 추천','관계']},
   'recruitment-center':{zone:'모집센터',subject:'recruitment-center-visit',title:'모집센터 방문',note:'모집센터에서 동행 모집과 참가 신청 활동을 확인했어요.',keywords:['모집센터','참가 신청','동행']},
   'project-room':{zone:'프로젝트실',subject:'project-room-visit',title:'프로젝트실 방문',note:'프로젝트실에서 함께 만들 프로젝트와 코스 기획 활동을 확인했어요.',keywords:['프로젝트실','협업','코스 기획']},
   'club-street-festival':{zone:'동아리 거리제',subject:'club-street-visit',title:'동아리 거리제 방문',note:'동아리 거리제에서 관심 동아리와 커뮤니티 활동을 둘러봤어요.',keywords:['동아리 거리제','커뮤니티','활동']},
  };
  const copy=campusMapCopy[currentMapId];
  if(!copy)return;
  recordCampusProfileSignal(profile.nickname,{mapId:currentMapId,zone:copy.zone,action:'map-visit',subject:copy.subject,title:copy.title,note:copy.note,keywords:copy.keywords,axes:{relation:5,explore:2},point:4});
 },[currentMapId,profile.nickname]);
 useEffect(()=>{void fetch(`/wiz/api/page.home/map_activity?mapId=${encodeURIComponent(currentMapId)}&userKey=${encodeURIComponent(profile.nickname||'guest')}`,{credentials:'include'}).catch(()=>undefined)},[currentMapId,profile.nickname]);
 useEffect(()=>{const changed=(player:PlayerState|null)=>setNearbyPlayer(player);gameEvents.on('nearby-player-changed',changed);return()=>{gameEvents.off('nearby-player-changed',changed)}},[]);
 useEffect(()=>{const changed=(npc:NearbyNpc|null)=>setNearbyNpc(npc);gameEvents.on('local-npc-proximity-changed',changed);return()=>{gameEvents.off('local-npc-proximity-changed',changed)}},[]);
 useEffect(()=>{const changed=(position:NpcScreenPosition|null)=>setNearbyNpcScreen(position);gameEvents.on('local-npc-screen-position',changed);return()=>{gameEvents.off('local-npc-screen-position',changed)}},[]);
 useEffect(()=>{const changed=({withId,active}:{withId:string;active:boolean})=>{if(!active){setEncounter(current=>current?.kind==='player'&&current.target.id===withId?null:current);return}const player=players.find(item=>item.id===withId)??(nearbyPlayer?.id===withId?nearbyPlayer:undefined);if(player)setEncounter({kind:'player',target:player})};socket.on('encounterFocusChanged',changed);return()=>{socket.off('encounterFocusChanged',changed)}},[players,nearbyPlayer]);
 useEffect(()=>{gameEvents.emit('player-encounter-focus',encounter?.kind==='player'?encounter.target.id:null);gameEvents.emit('local-npc-encounter-focus',encounter?.kind==='npc'?encounter.target.id:null);return()=>{gameEvents.emit('player-encounter-focus',null);gameEvents.emit('local-npc-encounter-focus',null)}},[encounter]);
 useEffect(()=>{if(location!=='세종호수공원'){setGuideNearby(false);setLakeTutorialOpen(false);setGuideConversation(false)}if(!['공동캠퍼스','학생회관'].includes(location))setCampusHubOpen(false);if(location!=='공동캠퍼스')setCampusFastTravelOpen(false)},[location]);
 useEffect(()=>{localStorage.removeItem('project-room-campus-portal-position-v1')},[]);
 useEffect(()=>{const normalized=normalizePlaceName(location);if(normalized!==location)setLocation(normalized)},[location]);
 useEffect(()=>{setArtsCenterTutorialOpen(location==='세종예술의전당');setExperienceTutorialOpen(location==='축제부스'?'festival':location==='먹거리 부스'?'food':null)},[location]);
 useEffect(()=>{
  if(location==='베어트리파크'&&!bearTutorialShown&&localStorage.getItem('bear-tree-park-tutorial-hidden-v1')!=='true'){
   setBearTutorialStep(0);setBearTutorialOpen(true);setBearTutorialShown(true);
  }else if(location!=='베어트리파크')setBearTutorialOpen(false);
  if(location==='곰 체험소'&&localStorage.getItem('bear-play-zone-tutorial-hidden-v1')!=='true')setBearPlayTutorialOpen(true);else if(location!=='곰 체험소')setBearPlayTutorialOpen(false);
 },[location,bearTutorialShown]);
 useEffect(()=>{if(bearPlayTutorialOpen)gameEvents.emit('game-input-lock',true);return()=>{if(bearPlayTutorialOpen)gameEvents.emit('game-input-lock',false)}},[bearPlayTutorialOpen]);
 useEffect(()=>{const selectedHandler=(p:PlayerState)=>{if(socialBlocksRef.current[p.id]!=='hidden')setSelected(p)},locationHandler=(name:string)=>setLocation(normalizePlaceName(name)),guideProximity=(nearby:boolean)=>setGuideNearby(nearby),isOther=(p:PlayerState)=>p.id!==socket.id&&p.nickname!==profile.nickname,replace=(users:PlayerState[])=>setPlayers(users.filter(isOther)),joined=(p:PlayerState)=>setPlayers(old=>isOther(p)?[...old.filter(x=>x.id!==p.id),p]:old.filter(x=>x.id!==p.id)),moved=(p:PlayerState)=>setPlayers(old=>isOther(p)?old.map(x=>x.id===p.id?p:x):old.filter(x=>x.id!==p.id)),left=(id:string)=>{setPlayers(old=>old.filter(x=>x.id!==id));setPendingDirectPlayerId(current=>current===id?null:current);setPendingDirectTarget(current=>current?.id===id?null:current)},chat=(m:ChatMessage)=>setMessages(old=>[...old.slice(-79),m]),directRequested=(r:DirectRequest)=>{if(!socialBlocksRef.current[r.from.id])setRequest(r)},rejected=()=>{setPendingDirectPlayerId(null);setPendingDirectTarget(null);setNotice('1:1 채팅 요청이 거절되었어요.')},started=(room:DirectRoom)=>{setPendingDirectPlayerId(null);setPendingDirectTarget(null);setDirectRooms(old=>[...old.filter(r=>r.id!==room.id),room]);setActiveDirect(room.id);setNotice('1:1 채팅을 시작했어요.')},directMessage=(m:DirectMessage)=>{setDirectMessages(old=>({...old,[m.directRoomId]:[...(old[m.directRoomId]??[]),m]}));setActiveDirect(current=>{if(current!==m.directRoomId)setUnread(old=>({...old,[m.directRoomId]:(old[m.directRoomId]??0)+1}));return current})},recommendationCompleted=(data:{directRoomId:string;message:DirectMessage})=>directMessage(data.message),meetingUpdated=(data:{roomId:string;meetingPlace:DirectRoomMeetingPlace|null})=>setDirectRooms(old=>old.map(room=>room.id===data.roomId?{...room,meetingPlace:data.meetingPlace??undefined}:room)),group=(g:GroupRoom)=>setGroups(old=>[...old.filter(x=>x.id!==g.id),g]),error=(m:string)=>{setPendingDirectPlayerId(null);setPendingDirectTarget(null);setNotice(m)};
 gameEvents.on('network-user-selected',selectedHandler);gameEvents.on('location-changed',locationHandler);gameEvents.on('guide-proximity-changed',guideProximity);gameEvents.on('chat-received',chat);socket.on('currentMapUsers',replace);socket.on('onlineUsersUpdated',replace);socket.on('userJoined',joined);socket.on('userMoved',moved);socket.on('userLeft',left);socket.on('directChatRequested',directRequested);socket.on('directChatRejected',rejected);socket.on('directChatStarted',started);socket.on('directMessageReceived',directMessage);socket.on('directRecommendationCompleted',recommendationCompleted);socket.on('directMeetingPlaceUpdated',meetingUpdated);socket.on('groupCreated',group);socket.on('groupUpdated',group);socket.on('errorMessage',error);
 return()=>{gameEvents.off('network-user-selected',selectedHandler);gameEvents.off('location-changed',locationHandler);gameEvents.off('guide-proximity-changed',guideProximity);gameEvents.off('chat-received',chat);socket.off('currentMapUsers',replace);socket.off('onlineUsersUpdated',replace);socket.off('userJoined',joined);socket.off('userMoved',moved);socket.off('userLeft',left);socket.off('directChatRequested',directRequested);socket.off('directChatRejected',rejected);socket.off('directChatStarted',started);socket.off('directMessageReceived',directMessage);socket.off('directRecommendationCompleted',recommendationCompleted);socket.off('directMeetingPlaceUpdated',meetingUpdated);socket.off('groupCreated',group);socket.off('groupUpdated',group);socket.off('errorMessage',error)}},[]);
 useEffect(()=>{
  const state=({friendIds}:{friendIds:string[]})=>setFriends(saveFriendIds(friendIds));
  const received=(incoming:FriendRequest)=>setFriendRequest(incoming);
  const resolved=({status}:{status:'accepted'|'rejected'})=>{setPendingFriendIds([]);setNotice(status==='accepted'?'친구 요청이 수락되었어요.':'친구 요청이 거절되었어요.')};
  const available=(room:DirectRoom)=>setDirectRooms(current=>[...current.filter(item=>item.id!==room.id),room]);
  const resumeRequired=({toId}:{toId:string})=>{socket.emit('directChatRequest',toId);setNotice('기존 채팅방이 없어 새 1:1 대화를 요청했어요.')};
  const focusEnded=({directRoomId}:{directRoomId:string})=>{setActiveDirect(current=>current===directRoomId?null:current);gameEvents.emit('character-emote-play',null)};
  const closed=({directRoomId}:{directRoomId:string})=>{setDirectRooms(current=>current.filter(room=>room.id!==directRoomId));setActiveDirect(current=>current===directRoomId?null:current);setUnread(current=>{const next={...current};delete next[directRoomId];return next});gameEvents.emit('character-emote-play',null)};
  const contact=(message:DirectMessage)=>{if(message.senderId===socket.id)return;setActiveDirect(current=>{if(current!==message.directRoomId)setNotice(`${message.nickname}님이 연락을 보냈습니다.`);return current})};
  const left=(id:string)=>{setFriends(current=>saveFriendIds(current.filter(friendId=>friendId!==id)));setPendingFriendIds(current=>current.filter(friendId=>friendId!==id))};
  socket.on('friendState',state);socket.on('friendRequestReceived',received);socket.on('friendRequestResolved',resolved);socket.on('directChatAvailable',available);socket.on('directChatResumeRequired',resumeRequired);socket.on('directChatFocusEnded',focusEnded);socket.on('directChatClosed',closed);socket.on('directMessageReceived',contact);socket.on('userLeft',left);
  return()=>{socket.off('friendState',state);socket.off('friendRequestReceived',received);socket.off('friendRequestResolved',resolved);socket.off('directChatAvailable',available);socket.off('directChatResumeRequired',resumeRequired);socket.off('directChatFocusEnded',focusEnded);socket.off('directChatClosed',closed);socket.off('directMessageReceived',contact);socket.off('userLeft',left)};
 },[]);
 useEffect(()=>{const history=(items:ChatMessage[])=>setMessages(items.slice(-80));socket.on('nearbyChatHistory',history);return()=>{socket.off('nearbyChatHistory',history)}},[]);
 const directRoom=directRooms.find(r=>r.id===activeDirect),partner=directRoom?.participants.find(p=>p.id!==socket.id),roomMessages=useMemo(()=>activeDirect?directMessages[activeDirect]??[]:[],[activeDirect,directMessages]);
 useEffect(()=>{if(!activeDirect)return;setUnread(current=>{if(!current[activeDirect])return current;const next={...current};delete next[activeDirect];return next})},[activeDirect]);
 useEffect(()=>{const canAnimate=profile.model==='cloths'||profile.model==='women',talking=canAnimate&&Boolean(activeNpc||directRoom);gameEvents.emit('character-emote-play',talking?'talking':null);gameEvents.emit('local-npc-talking',activeNpc?.id??null);return()=>{gameEvents.emit('character-emote-play',null);gameEvents.emit('local-npc-talking',null)}},[profile.model,activeNpc,directRoom]);
 useEffect(()=>{if(!encounter&&!activeNpc&&!directRoom)gameEvents.emit('character-emote-play',null)},[encounter,activeNpc,directRoom]);
 const tutorialOpen=lakeTutorialOpen||guideConversation||bearTutorialOpen||bearPlayTutorialOpen;
 const allLocalNpcs=currentMapId==='festival-experience'?FESTIVAL_NPCS:location==='공동캠퍼스'?CAMPUS_FRIEND_NPCS:location==='학생회관'?STUDENT_HALL_NPCS:location==='프로젝트실'?[PROJECT_ROOM_NPC]:[];
 const localNpcs=allLocalNpcs.filter(npc=>socialBlocks[npc.id]!=='hidden');
 const visiblePlayers=players.filter(player=>socialBlocks[player.id]!=='hidden');
 const visibleMessages=messages.filter(message=>!socialBlocks[message.senderId]);
 const portalEditor=!['town','personal-farm','garden','campus','arts-center','festival-experience','food-experience','club-street-festival','government-central-plaza','sejong-smart-city'].includes(currentMapId)&&canEditPortals&&editablePortals.length>0?<nav className="shared-portal-editors" aria-label="공용 포탈 위치 편집">{editablePortals.map(({destination})=><button type="button" className="shared-portal-position-editor" key={destination} onClick={()=>gameEvents.emit('world-portal-place-at-player',destination)}><span>🌀</span><div><small>공용 위치로 저장</small><b>{WORLD_PORTAL_LABELS[destination]??destination}</b></div><MapPin size={16}/></button>)}</nav>:null;
 const chatAllowed=profile.chatEnabled??true;
 const beginEncounter=(candidate:CharacterEncounter)=>{if(socialBlocks[candidate.target.id]==='hidden')return;setEncounter(candidate);if(candidate.kind==='player')socket.emit('encounterFocus',{toId:candidate.target.id,active:true})},endEncounter=()=>{if(!encounter)return;if(encounter.kind==='player')socket.emit('encounterFocus',{toId:encounter.target.id,active:false});setEncounter(null);setActiveNpc(null);setPendingDirectTarget(null)},requestDirectChat=(player:PlayerState)=>{if(socialBlocks[player.id])return setNotice(`${player.nickname}님의 대화가 차단되어 있어요.`);if(pendingDirectPlayerId)return;setPendingDirectPlayerId(player.id);setPendingDirectTarget(player);socket.emit('directChatRequest',player.id);setNotice(`${player.nickname}님에게 1:1 대화를 신청했어요.`);setSelected(null)},startNpcChat=(npc:NearbyNpc)=>{if(socialBlocks[npc.id])return setNotice(`${npc.nickname}님의 대화가 차단되어 있어요.`);setEncounter(null);setActiveNpc(npc);setNpcText('');setNpcMessages([{id:`${npc.id}-hello`,sender:'npc',message:`안녕하세요! 저는 ${npc.nickname}예요. ${npc.status}. 무엇이 궁금하세요?`}])},startGuideChat=()=>{setGuideConversation(true);setGuideText('');setGuideMessages([{id:'chungnyeong-hello',sender:'npc',message:'안녕! 나는 세종 여행을 함께할 충녕이야. 이곳은 세종호수공원이야. 자유롭게 둘러보다가 궁금한 게 있으면 언제든 물어봐!'}])},closeGuideChat=()=>setGuideConversation(false),npcReply=(npc:NearbyNpc,message:string)=>/프로젝트|아이디어/.test(message)?'좋아요! 관심 있는 주제부터 짧게 이야기해 보면 함께할 방법을 찾기 쉬워요.':/안녕|반가/.test(message)?'반가워요 👋 가까이 와서 말을 걸어줘서 고마워요!':/어디|장소|길/.test(message)?`${location}에서 둘러볼 만한 공간을 함께 찾아볼까요?`:'좋은 이야기네요. 조금 더 들려주세요!',guideReply=(message:string)=>/이동|조작|걷|뛰/.test(message)?'방향키로 이동하고 Shift를 누르면 달릴 수 있어. Space로 점프할 수도 있어!':/어디|장소|길|뭐/.test(message)?'축제와 공연, 먹거리 중 마음에 끌리는 곳부터 가 봐. 가까운 체험존과 포탈이 다음 여정을 알려줄 거야.':/안녕|반가/.test(message)?'반가워! 세종에서 네 취향에 맞는 장소를 함께 찾아보자.':'좋은 질문이야! 우선 공원을 자유롭게 둘러보고, 빛나는 체험존이나 포탈을 발견하면 가까이 가 봐.',sendNpc=()=>{const message=npcText.trim();if(!message||!activeNpc)return;setNpcMessages(old=>[...old,{id:crypto.randomUUID(),sender:'me',message},{id:crypto.randomUUID(),sender:'npc',message:npcReply(activeNpc,message)}]);setNpcText('')},sendGuide=()=>{const message=guideText.trim();if(!message)return;setGuideMessages(old=>[...old,{id:crypto.randomUUID(),sender:'me',message},{id:crypto.randomUUID(),sender:'npc',message:guideReply(message)}]);setGuideText('')},playEncounterEmote=(emote:CharacterEmote)=>gameEvents.emit('character-emote-play',emote),sendDirect=()=>{if(!chatAllowed)return setNotice('1:1 대화는 수목원과 공동캠퍼스에서 이용할 수 있어요.');if(partner&&socialBlocks[partner.id])return setNotice(`${partner.nickname}님의 대화가 차단되어 있어요.`);const message=directText.trim();if(!message||!activeDirect)return;socket.emit('directMessage',{directRoomId:activeDirect,message});setDirectText('')},close=()=>{socket.disconnect();onExit()},openProfileEditor=()=>gameEvents.emit('game-return-state-requested',(state:GameReturnState)=>onEditProfile(state));
 const toggleNpcFriend=(person:{id:string;nickname:string})=>setFriends(current=>{const removing=current.includes(person.id),next=saveFriendIds(removing?current.filter(id=>id!==person.id):[...current,person.id]);setNotice(`${person.nickname} NPC를 ${removing?'친구에서 삭제':'내 친구에 추가'}했어요.`);return next});
 const requestFriend=(person:{id:string;nickname:string})=>{if(friends.includes(person.id)){const roomIds=directRooms.filter(room=>room.participants.some(participant=>participant.id===person.id)).map(room=>room.id);roomIds.forEach(roomId=>socket.emit('directChatClosed',roomId));setDirectRooms(current=>current.filter(room=>!roomIds.includes(room.id)));setActiveDirect(current=>current&&roomIds.includes(current)?null:current);socket.emit('friendRemove',person.id);setNotice(`${person.nickname}님과의 친구 관계를 삭제했어요.`);return}if(pendingFriendIds.includes(person.id)){setNotice('이미 친구 요청을 보냈어요.');return}setPendingFriendIds(current=>[...current,person.id]);socket.emit('friendRequest',person.id);setNotice(`${person.nickname}님에게 친구 요청을 보냈어요.`)};
 const openOrRequestDirectChat=(player:PlayerState)=>{const existing=friends.includes(player.id)?directRooms.find(room=>room.active&&room.participants.some(person=>person.id===player.id)):undefined;if(existing){setActiveDirect(existing.id);setUnread(current=>{const next={...current};delete next[existing.id];return next});setSelected(null);setNotice(`${player.nickname}님과의 기존 채팅방을 열었어요.`);return}requestDirectChat(player)};
 const openEncounterProfile=(candidate:CharacterEncounter,report=false)=>{candidate.kind==='player'?setSelected(candidate.target):setSelectedNpc(candidate.target);setReportTargetId(report?candidate.target.id:null)};
 const selectedSocialPerson:SocialProfilePerson|null=selected?socialProfileFromPlayer(selected):selectedNpc?{kind:'npc',id:selectedNpc.id,nickname:selectedNpc.nickname,appearance:selectedNpc.appearance,model:selectedNpc.model,status:selectedNpc.status,interests:['세종탐험','로컬안내'],usagePurposes:['대화','공간안내'],preferredPlaceCategories:[location],experienceRecords:[`${location}에서 방문자를 안내하고 있어요.`],chatEnabled:true}:null;
 const submitSocialReport=(person:SocialProfilePerson,reason:SocialReportReason,mode:SocialBlockMode,detail:string)=>{saveSocialReport({targetId:person.id,targetName:person.nickname,reason,blockMode:mode,detail});setSocialBlocks(current=>saveSocialBlock(current,person.id,mode));if(mode==='hidden')setFriends(current=>saveFriendIds(current.filter(id=>id!==person.id)));setReportTargetId(null);setSelected(null);setSelectedNpc(null);setNotice(`${person.nickname}님 신고가 접수되었어요.${mode==='hidden'?' 캐릭터를 숨겼어요.':mode==='chat'?' 대화를 차단했어요.':''}`)};
 useEffect(()=>{const interact=(event:KeyboardEvent)=>{const target=event.target as HTMLElement|null;if(event.repeat||target?.matches('input,textarea,select,[contenteditable=\"true\"]'))return;if(guideConversation&&event.code==='KeyE'){event.preventDefault();closeGuideChat();return}if(encounter&&event.code==='KeyE'){event.preventDefault();endEncounter();return}if(!encounter&&!guideConversation&&event.code==='KeyT'&&guideNearby){event.preventDefault();startGuideChat();return}if(!encounter&&event.code==='KeyT'&&(nearbyNpc||nearbyPlayer)){event.preventDefault();beginEncounter(nearbyNpc?{kind:'npc',target:nearbyNpc}:{kind:'player',target:nearbyPlayer!})}};window.addEventListener('keydown',interact);return()=>window.removeEventListener('keydown',interact)},[encounter,guideConversation,guideNearby,nearbyNpc,nearbyPlayer]);
 const encounterMenuStyle=encounter?.kind==='npc'&&nearbyNpcScreen?.id===encounter.target.id?npcEncounterMenuStyle(nearbyNpcScreen):undefined;
 return <main ref={pageRef} className={`game-page ${currentMapId==='personal-farm'?'is-personal-farm':''} ${mapOverview?'is-map-overview':''} ${bearPhotoMode?'is-bear-photo':''} ${smartCityExperienceOpen?'is-smart-city-experience':''}`}><div className="game-layout"><GameCanvas profile={profile} returnState={returnState} onNotice={setNotice}/>{mapSignNearby&&!mapOverview&&!tutorialOpen&&<button type="button" className={`map-view-button ${guideNearby?'with-guide':''}`} onClick={()=>gameEvents.emit('map-overview-toggle',true)}><span>🗺️</span><div><small>지도 표지판이 가까이 있어요</small><b>세종호수공원 지도 보기</b></div><MapPin size={18}/></button>}<div className="world-location-chip"><span><MapPin size={15}/></span><div><small>현재 위치</small><b>{normalizePlaceName(location)}</b></div></div>{currentMapId!=='personal-farm'&&<button type="button" className="world-exit" onClick={close}><LogOut size={15}/> 나가기</button>}<aside className={`online ${onlineCollapsed?'is-collapsed':''} ${['베어트리파크','곰 체험소','수목원'].includes(normalizePlaceName(location))?'is-nature-chapter':''}`}><div className="online-heading"><span><Users size={17}/></span><div><small>지금 함께하는 사람</small><h3>현재 활동 중</h3></div><b>{visiblePlayers.length+1+localNpcs.length}</b><button type="button" className="online-collapse" onClick={()=>setOnlineCollapsed(value=>!value)} aria-label={onlineCollapsed?'현재 활동 중인 사람 펼치기':'현재 활동 중인 사람 접기'}>{onlineCollapsed?'‹':'접기 ‹'}</button></div><div className="online-list"><button type="button" className="me my-profile-card" onClick={()=>setAiProfileOpen(true)} aria-label={`${profile.nickname}님의 내 프로필 열기`}><CharacterPreview parts={profile.character} small/><div><small className="my-profile-kicker">내 프로필</small><b>{profile.nickname}</b><small>체험할수록 성장해요</small></div><span className="my-profile-action">보기</span><i/></button>{localNpcs.map(npc=><button type="button" className="campus-npc-card" key={npc.id} onClick={()=>setSelectedNpc(npc)}><CharacterPreview parts={npc.appearance} small/><div><small className="campus-npc-kicker">{location} 친구 · NPC</small><b>{npc.nickname}</b><small>{npc.status}</small></div><i/></button>)}{visiblePlayers.map(p=><button key={p.id} onClick={()=>setSelected(p)}><CharacterPreview parts={p.appearance} small/><div><b>{p.nickname}</b><small>{p.isMoving?'다음 체험으로 이동 중':'함께할 신호를 기다리는 중'}</small></div><i/></button>)}</div></aside>{mapOverview&&<section className="map-overview-ui"><div><span>🗺️</span><div><small>세종호수공원 안내도</small><b>소통 체험 여정 지도</b><p>충녕이 → 바람의 언덕 → 시민광장 순서로 이어져요.</p></div></div><button type="button" onClick={()=>gameEvents.emit('map-overview-toggle',false)}><X size={16}/> 지도 닫기</button></section>}</div>
 <WorldCameraEditor mapId={currentMapId} canEdit={canEditPortals}/>
 {currentMapId==='personal-farm'?<nav className="personal-farm-top-actions" aria-label="마이홈 메뉴"><button type="button" onClick={()=>gameEvents.emit('travel-to-map',personalFarmReturnMap)} aria-label="마이홈에 오기 전 맵으로 이동"><MapPin size={15}/> 맵 이동</button><button type="button" onClick={close}><LogOut size={15}/> 나가기</button></nav>:<button type="button" className="world-my-home" aria-label="마이홈으로 이동" onClick={()=>gameEvents.emit('travel-to-map','personal-farm')}><span aria-hidden="true">🏡</span> 마이홈</button>}
 {currentMapId==='government-central-plaza'&&canEditPortals&&<button type="button" className="portal-position-editor arts-center-portal-editor" onClick={()=>{gameEvents.emit('primary-portal-place-at-player');setNotice('정부청사 귀환 포탈을 현재 위치로 옮겼어요.')}}><span>🌀</span><div><small>운영자 포탈 편집</small><b>정부청사 귀환 포탈 이동</b></div><MapPin size={16}/></button>}
 {portalEditor}
 {bearPhotoNearby&&!bearPhotoMode&&<button type="button" className="bear-photo-enter-button" onClick={()=>gameEvents.emit('bear-photo-enter')}><span>📸</span><div><small>곰 가족 포토존</small><b>포토존 사진찍기</b></div><MapPin size={18}/></button>}
 {guideNearby&&!guideConversation&&!encounter&&!tutorialOpen&&!campusHubOpen&&!aiProfileOpen&&!projectRoomPanelOpen&&<button type="button" className="encounter-start-prompt" onClick={startGuideChat}><span><i/> 세종호수공원 NPC</span><b>충녕이에게 말을 걸어 보세요</b><kbd>T</kbd><strong>대화하기</strong></button>}
 {nearbyNpc?.id===RECRUITMENT_GUIDE_ID&&!recruitmentDeskOpen&&!tutorialOpen&&<button type="button" className="encounter-start-prompt" onClick={()=>gameEvents.emit('recruitment-guide-open')}><span><i/> 모집센터 AI 리크루터</span><b>충녕이와 나에게 맞는 모집을 찾아보세요</b><kbd>E</kbd><strong>모집 찾기</strong></button>}
 {!guideNearby&&!encounter&&(nearbyNpc||nearbyPlayer)&&nearbyNpc?.id!==RECRUITMENT_GUIDE_ID&&!tutorialOpen&&!campusHubOpen&&!aiProfileOpen&&!projectRoomPanelOpen&&!nearbyCampusFeature&&!nearbyInteraction&&<button type="button" className="encounter-start-prompt" onClick={()=>beginEncounter(nearbyNpc?{kind:'npc',target:nearbyNpc}:{kind:'player',target:nearbyPlayer!})}><span><i/> {nearbyNpc?`${location} NPC`:'가까운 이웃'}</span><b>{(nearbyNpc??nearbyPlayer!)?.nickname}님을 인지했어요</b><kbd>T</kbd><strong>대화하기</strong></button>}
 {encounter&&!tutorialOpen&&!campusHubOpen&&!aiProfileOpen&&!projectRoomPanelOpen&&<><aside className="encounter-menu" style={encounterMenuStyle}><header><small><i/> {encounter.kind==='npc'?`${location} NPC`:'가까운 이웃'}</small><b>{encounter.target.nickname}</b><span>{encounter.kind==='npc'?encounter.target.status:'함께할 준비가 되었어요'}</span></header><button type="button" onClick={()=>openEncounterProfile(encounter)}><UserRound/> 프로필 보기</button><button type="button" className="primary-action" disabled={Boolean(socialBlocks[encounter.target.id])} onClick={()=>encounter.kind==='npc'?startNpcChat(encounter.target):openOrRequestDirectChat(encounter.target)}><MessageCircle/> {socialBlocks[encounter.target.id]?'대화 차단됨':'1:1 대화'}</button><button type="button" className={friends.includes(encounter.target.id)?'friend-remove-action':''} disabled={encounter.kind==='player'&&pendingFriendIds.includes(encounter.target.id)} onClick={()=>encounter.kind==='npc'?toggleNpcFriend(encounter.target):requestFriend(encounter.target)}><UserPlus/> {friends.includes(encounter.target.id)?'친구 삭제':encounter.kind==='player'&&pendingFriendIds.includes(encounter.target.id)?'요청 중':'친구 요청'}</button><button type="button" className="report-action" onClick={()=>openEncounterProfile(encounter,true)}><Siren/> 신고하기</button></aside><button type="button" className="encounter-end-prompt" onClick={endEncounter}><span className="nearby-player-link" aria-hidden="true"/><kbd>E</kbd><b>대화 종료</b></button>{(profile.model==='cloths'||profile.model==='women')&&<nav className="encounter-emotes" aria-label="사용 가능한 캐릭터 모션">{ENCOUNTER_EMOTES.map(([emoji,label,emote])=><button type="button" key={emote} onClick={()=>playEncounterEmote(emote)}><span>{emoji}</span><small>{label}</small></button>)}</nav>}</>}
 {bearPhotoMode&&<div className="bear-photo-controls"><strong>🐻 곰 가족 포토존</strong><button type="button" onClick={()=>gameEvents.emit('bear-photo-capture')}>📸 사진 저장</button><button type="button" onClick={()=>gameEvents.emit('bear-photo-exit')}>포토존 나가기</button></div>}
 {artsCenterSeated&&<button type="button" className="arts-center-stand-button" onClick={()=>gameEvents.emit('arts-center-seat-toggle')}><span>↗</span><div><small>세종예술의전당 관람석</small><b>내리기</b></div><kbd>E</kbd></button>}
 {centralPlazaSofaSeat&&<button type="button" className="central-plaza-sofa-prompt" onClick={()=>gameEvents.emit('central-plaza-sofa-seat-toggle')}><span><Armchair size={19}/></span><div><small>중앙광장 휴식 공간</small><b>{centralPlazaSofaSeat.seated?'소파에서 일어나기':'소파에 앉기'}</b></div><kbd>E</kbd></button>}
 {personalFarmDoor&&<button type="button" className="personal-farm-interaction-prompt" onClick={()=>gameEvents.emit('personal-farm-door-toggle')}><span>🚪</span><div><small>마이홈 출입문</small><b>{personalFarmDoor.inside?'E 버튼으로 집 나가기':'E 버튼으로 집 들어가기'}</b></div><kbd>E</kbd></button>}
 {personalFarmSeat&&<button type="button" className="personal-farm-interaction-prompt" onClick={()=>gameEvents.emit('personal-farm-seat-toggle')}><span><Armchair size={19}/></span><div><small>{personalFarmSeat.kind==='sofa'?'마이홈 소파':'마이홈 식탁 의자'} · {personalFarmSeat.label}</small><b>{personalFarmSeat.seated?'E 버튼으로 일어나기':'E 버튼으로 앉기'}</b></div><kbd>E</kbd></button>}
 {personalFarmBed&&<button type="button" className="personal-farm-interaction-prompt" onClick={()=>gameEvents.emit('personal-farm-bed-toggle')}><span>🛏️</span><div><small>마이홈 침대</small><b>{personalFarmBed.sleeping?'E 버튼으로 일어나기':'E 버튼으로 잠자기'}</b></div><kbd>E</kbd></button>}
 {lakeTutorialOpen&&<LakeParkTutorial onClose={()=>setLakeTutorialOpen(false)}/>}
 {artsCenterTutorialOpen&&<ArtsCenterTutorial onClose={()=>setArtsCenterTutorialOpen(false)}/>}
 {experienceTutorialOpen&&<ExperienceTutorial kind={experienceTutorialOpen} onClose={()=>setExperienceTutorialOpen(null)}/>}
 {['공동캠퍼스','학생회관'].includes(location)&&nearbyCampusFeature&&!campusHubOpen&&<section className="campus-feature-enter" aria-live="polite"><span>{CAMPUS_BUILDINGS[nearbyCampusFeature.id].icon}</span><div><small>{nearbyCampusFeature.description}</small><b>{nearbyCampusFeature.label} 열기</b></div><kbd>E</kbd></section>}
 {location==='공동캠퍼스'&&!campusHubOpen&&visitedCampusBuildings.length>0&&<div className={`campus-fast-travel ${campusFastTravelOpen?'is-open':''}`}><button type="button" className="campus-fast-travel-toggle" onClick={()=>setCampusFastTravelOpen(value=>!value)}><MapPin size={15}/><span><small>방문한 건물</small><b>빠른 이동</b></span><i>{campusFastTravelOpen?'×':'›'}</i></button>{campusFastTravelOpen&&<section><header><small>FAST TRAVEL</small><b>방문한 건물로 이동</b><p>도착 후 건물 앞에서 E를 눌러 입장하세요.</p></header>{visitedCampusBuildings.map(id=><button type="button" key={id} onClick={()=>{gameEvents.emit('campus-building-fast-travel',id);setCampusFastTravelOpen(false);setNotice(`${CAMPUS_BUILDINGS[id].label} 앞으로 이동했어요.`)}}><span>{CAMPUS_BUILDINGS[id].icon}</span><div><b>{CAMPUS_BUILDINGS[id].label}</b><small>{CAMPUS_BUILDINGS[id].feature}</small></div><MapPin size={13}/></button>)}</section>}</div>}
 {nearbyPortal?.destination==='government'&&buildProfileProgress(profile).completion<50&&!mapOverview&&!tutorialOpen&&<section className="portal-charge-panel is-locked"><span>🔒</span><div><small>정부청사 방문 조건</small><b>프로필을 50% 이상 채운 뒤 방문해 주세요</b><em>내 프로필에서 관심사와 체험 기록을 완성하면 해금돼요</em></div></section>}
 {nearbyPortal?.chargeSeconds&&!(nearbyPortal.destination==='government'&&buildProfileProgress(profile).completion<50)&&!mapOverview&&!tutorialOpen&&<section className={`portal-charge-panel ${nearbyPortal.theme==='blue'?'is-blue':''} ${guideNearby||mapSignNearby?'with-nearby-actions':''}`}><span>✨</span><div><small>포탈 이동 준비</small><b>{normalizePlaceName(nearbyPortal.label)}(으)로 이동 중</b><div className="portal-charge-steps" style={{gridTemplateColumns:`repeat(${nearbyPortal.chargeSeconds}, minmax(0, 1fr))`}}>{Array.from({length:nearbyPortal.chargeSeconds},(_,index)=><div key={index}><span>{index+1}</span><i><b style={{width:`${Math.max(0,Math.min(1,portalProgress*nearbyPortal.chargeSeconds!-index))*100}%`}}/></i></div>)}</div><em>포탈 안에서 {nearbyPortal.chargeSeconds}초 동안 머물러 주세요</em></div></section>}
 {nearbyInteraction?.chargeSeconds&&!mapOverview&&!tutorialOpen&&<section className="portal-charge-panel"><span>✨</span><div><small>포탈 이동 준비</small><b>{normalizePlaceName(nearbyInteraction.label)}(으)로 이동 중</b><div className="portal-charge-steps" style={{gridTemplateColumns:`repeat(${nearbyInteraction.chargeSeconds}, minmax(0, 1fr))`}}>{Array.from({length:nearbyInteraction.chargeSeconds},(_,index)=><div key={index}><span>{index+1}</span><i><b style={{width:`${Math.max(0,Math.min(1,interactionProgress*nearbyInteraction.chargeSeconds!-index))*100}%`}}/></i></div>)}</div><em>포탈 안에서 {nearbyInteraction.chargeSeconds}초 동안 머물러 주세요</em></div></section>}
 {guideConversation&&<section className="direct-panel npc-direct-panel chungnyeong-direct-panel"><header><span className="chungnyeong-chat-avatar" aria-hidden="true">👑</span><div><b>충녕이</b><small>세종호수공원 NPC와 대화 중</small></div><button type="button" onClick={closeGuideChat} aria-label="충녕이와 대화 종료"><X size={17}/></button></header><div className="direct-messages">{guideMessages.map(message=><p className={message.sender==='me'?'mine':''} key={message.id}><small>{message.sender==='me'?profile.nickname:'충녕이'}</small><span>{message.message}</span></p>)}</div><footer><input value={guideText} onChange={event=>setGuideText(event.target.value)} onKeyDown={event=>{event.stopPropagation();if(event.key==='Enter'&&!event.nativeEvent.isComposing)sendGuide()}} placeholder="충녕이에게 메시지..."/><button type="button" onClick={sendGuide}><Send size={17}/></button></footer></section>}
 {bearTutorialOpen&&<BearTreeParkTutorial step={bearTutorialStep} onPrevious={()=>setBearTutorialStep(step=>step-1)} onNext={()=>{setBearTutorialOpen(false);setNotice('폭포, 동굴, 큰 나무를 자유롭게 둘러보며 나의 여행 방식을 발견해 보세요!')}}/>}
 {bearPlayTutorialOpen&&<BearPlayZoneTutorial onClose={()=>setBearPlayTutorialOpen(false)}/>}
 {(request||friendRequest||notice)&&<aside className="game-notification-stack" aria-label="알림" aria-live="polite">
   {notice&&<button className="notice" onClick={()=>setNotice('')}>{notice} ×</button>}
   {request&&<div className="request-toast"><b>{request.from.nickname}님의 1:1 채팅 요청</b><p>원치 않으면 부담 없이 거절해도 괜찮아요.</p><div><button onClick={()=>{socket.emit('directChatReject',request.requestId);setRequest(null)}}><PhoneOff size={16}/> 거절</button><button className="accept" onClick={()=>{socket.emit('directChatAccept',request.requestId);setRequest(null)}}><Check size={16}/> 수락</button></div></div>}
   {friendRequest&&<div className="request-toast friend-request-toast"><b>{friendRequest.from.nickname}님의 친구 요청</b><p>수락해야 서로의 내 친구 목록에 추가됩니다.</p><div><button onClick={()=>{socket.emit('friendReject',friendRequest.requestId);setFriendRequest(null)}}><PhoneOff size={16}/> 거절</button><button className="accept" onClick={()=>{socket.emit('friendAccept',friendRequest.requestId);setFriendRequest(null)}}><Check size={16}/> 수락</button></div></div>}
 </aside>}
 {pendingDirectTarget&&!directRoom&&<section className="direct-panel pending-direct-panel"><header><CharacterPreview parts={pendingDirectTarget.appearance} small/><div><b>{pendingDirectTarget.nickname}</b><small>1:1 대화 요청 중</small></div><button type="button" onClick={()=>setPendingDirectTarget(null)}><X size={17}/></button></header><div className="pending-direct-body"><i/><strong>상대방의 응답을 기다리고 있어요</strong><p>수락하면 이곳에서 바로 1:1 대화가 시작됩니다.</p></div><footer><input disabled placeholder="대화가 연결되면 메시지를 보낼 수 있어요"/><button type="button" disabled><Send size={17}/></button></footer></section>}
 {directRoom&&partner&&<section className="direct-panel"><header><CharacterPreview parts={partner.appearance} small/><div><b>{partner.nickname}</b><small>1:1 채팅</small></div><button type="button" className="direct-room-leave" onClick={()=>socket.emit('directChatClosed',directRoom.id)}>채팅방 나가기</button><button type="button" onClick={()=>{socket.emit('directChatFocusEnded',directRoom.id);setActiveDirect(null);gameEvents.emit('character-emote-play',null)}} aria-label="대화 그만하고 채팅창 닫기"><X size={17}/></button></header><MeetingPlaceBanner room={directRoom} showToast={setNotice}/><div className="direct-messages">{roomMessages.map(m=>m.type==='ai-recommendation'?<DirectRecommendationMessage message={m} room={directRoom} showToast={setNotice} key={m.id}/>:m.type==='system-meeting-place'?<MeetingPlaceSystemMessage message={m} showToast={setNotice} key={m.id}/>:<p className={m.senderId===socket.id?'mine':''} key={m.id}><small>{m.nickname}</small><span>{m.message}</span></p>)}</div><GovernmentSessionPanel room={directRoom} showToast={setNotice} onSessionReady={setGovernmentSessionId}/><DirectRecommendationControls room={directRoom} messageCount={roomMessages.filter(message=>message.type==='user'&&!message.deleted).length}/><footer><input value={directText} onChange={e=>setDirectText(e.target.value)} onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter'&&!e.nativeEvent.isComposing)sendDirect()}} placeholder="1:1 메시지..."/><button type="button" onClick={sendDirect}><Send size={17}/></button></footer></section>}
 {activeNpc&&<section className="direct-panel npc-direct-panel"><header><CharacterPreview parts={activeNpc.appearance} small/><div><b>{activeNpc.nickname}</b><small>{location} NPC와 대화 중</small></div><button type="button" onClick={()=>setActiveNpc(null)}><X size={17}/></button></header><div className="direct-messages">{npcMessages.map(message=><p className={message.sender==='me'?'mine':''} key={message.id}><small>{message.sender==='me'?profile.nickname:activeNpc.nickname}</small><span>{message.message}</span></p>)}</div><footer><input value={npcText} onChange={event=>setNpcText(event.target.value)} onKeyDown={event=>{event.stopPropagation();if(event.key==='Enter'&&!event.nativeEvent.isComposing)sendNpc()}} placeholder={`${activeNpc.nickname}에게 메시지...`}/><button type="button" onClick={sendNpc}><Send size={17}/></button></footer></section>}
 {<ProjectRoomInteractions profile={profile} active={location==='프로젝트실'} onOpenChange={setProjectRoomPanelOpen} onNotice={setNotice}/>}
 {<GovernmentAiRecommendationCenter profile={profile} active={location==='중앙광장'} onOpenChange={setGovernmentAiCenterOpen} onNotice={setNotice} onExit={onExit}/>}
 {<GovernmentCentralPlazaWebUI profile={profile} active={location==='중앙광장'} onOpenChange={setProjectRoomPanelOpen} onNotice={setNotice}/>}
 {<ObservatoryTelescopeInteraction active={location==='전망대'}/>}
 {<FoodTruckExperience/>}
  {<ArtsCenterPosterKiosk/>}
  {<ArtsCenterStageVideo/>}
 {<StudentHallBoards active={location==='학생회관'} profile={profile} players={visiblePlayers.filter(player=>player.mapId==='student-hall')} groups={groups} messages={visibleMessages}/>}
 {<ProjectLobbyBoard active={location==='프로젝트실'} profile={profile}/>}
 {<ClubStreetExperience active={location==='동아리 거리제'} profile={profile} onNotice={setNotice}/>}
 {<RecruitmentCenterDesk
   profile={profile}
   players={visiblePlayers}
   onOpenChange={setRecruitmentDeskOpen}
   onNotice={setNotice}
   onProfile={player=>setSelected(player)}
   onTravelProjectRoom={()=>gameEvents.emit('travel-to-map','project-room')}
   onEditInterests={openProfileEditor}
 />}
 {<RecruitmentCenterKiosk active={location==='모집센터'} onOpenChange={setRecruitmentKioskOpen} onNotice={setNotice}/>}
 {<CampusMapIntro mapId={currentMapId}/>}
 {<SmartCityExperience active={currentMapId==='sejong-smart-city'} profile={profile} onNotice={setNotice} onOpenChange={setSmartCityExperienceOpen}/>}
 {campusHubOpen&&<CampusCommunicationHub profile={profile} players={visiblePlayers} initialTab={campusHubTab} onClose={()=>setCampusHubOpen(false)} onProfile={player=>{setCampusHubOpen(false);setSelected(player)}} onDirectChat={player=>{openOrRequestDirectChat(player);setCampusHubOpen(false)}} onClubChat={club=>{const inviteeIds=visiblePlayers.filter(player=>club.members.some(member=>member.name===player.nickname)).map(player=>player.id);socket.emit('createGroup',{name:club.name,inviteeIds});setCampusHubOpen(false);setNotice(`${club.name} 단체 채팅을 열었어요.`)}} onGovernment={()=>{setCampusHubOpen(false);gameEvents.emit('travel-to-map','government')}}/>}
 {aiProfileOpen&&<AiSejongProfile profile={profile} onClose={()=>setAiProfileOpen(false)} onEdit={()=>{setAiProfileOpen(false);openProfileEditor()}}/>}
 {<aside className={`game-friend-dock ${friendsOpen?'is-open':''}`} style={friendDockLayout}><button type="button" className="game-friend-toggle" onClick={()=>setFriendsOpen(value=>!value)} aria-expanded={friendsOpen}><UserPlus size={14}/><b>내 친구</b><span>{friends.length}</span><em>{friendsOpen?'⌃':'⌄'}</em></button>{friendsOpen&&<div className="game-friend-list">{[...localNpcs,...visiblePlayers].filter(person=>friends.includes(person.id)).map(person=><button type="button" key={person.id} onClick={()=>{'status' in person?setSelectedNpc(person):setSelected(person)}}><CharacterPreview parts={person.appearance} small/><span><b>{person.nickname}</b><small>현재 접속 중</small></span><i/></button>)}{![...localNpcs,...visiblePlayers].some(person=>friends.includes(person.id))&&<p>현재 접속 중인 친구가 없어요.</p>}</div>}{directRooms.length>0&&<div className="game-connection-list"><b>함께 만든 연결</b>{directRooms.map(room=>{const other=room.participants.find(person=>person.id!==socket.id);return other?<button type="button" key={room.id} onClick={()=>setActiveDirect(room.id)}><MessageCircle size={13}/><span>{other.nickname}<small>1:1 채팅방</small></span>{unread[room.id]?<em>{unread[room.id]}</em>:null}</button>:null})}</div>}</aside>}
 {selectedSocialPerson&&<SocialProfileModal key={`${selectedSocialPerson.id}-${reportTargetId===selectedSocialPerson.id?'report':'profile'}`} person={selectedSocialPerson} location={location} isFriend={friends.includes(selectedSocialPerson.id)} friendRequestPending={selectedSocialPerson.kind==='player'&&pendingFriendIds.includes(selectedSocialPerson.id)} blockMode={socialBlocks[selectedSocialPerson.id]??'none'} openReportInitially={reportTargetId===selectedSocialPerson.id} onClose={()=>{setSelected(null);setSelectedNpc(null);setReportTargetId(null)}} onToggleFriend={()=>selected?requestFriend(selected):selectedNpc&&toggleNpcFriend(selectedNpc)} onDirectChat={()=>{if(selected){openOrRequestDirectChat(selected)}else if(selectedNpc){startNpcChat(selectedNpc);setSelectedNpc(null)}}} onReport={(reason,mode,detail)=>submitSocialReport(selectedSocialPerson,reason,mode,detail)}/>} 
</main>}
