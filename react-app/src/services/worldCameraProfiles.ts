import type {MapId} from '../../shared/socket-events';
import {isFixedWorldCameraMap} from '../game/fixedWorldCameraProfiles';
import {WORLD_GUIDE_MAP_IDS} from '../game/worldNavigationProfile';

export const WORLD_CAMERA_EDITOR_MAP_IDS=WORLD_GUIDE_MAP_IDS.filter(mapId=>!isFixedWorldCameraMap(mapId));
const editableMapIds=new Set<MapId>(WORLD_CAMERA_EDITOR_MAP_IDS);

export type WorldCameraProfile={
  mapId:MapId;
  characterHeight:number;
  cameraElevationDeg:number;
  cameraAzimuthDeg:number;
  cameraDistance:number;
  cameraTargetHeight:number;
  cameraFov:number;
};

export const WORLD_CAMERA_PROFILE_LIMITS={
  characterHeight:{min:60,max:300,step:2},
  cameraElevationDeg:{min:15,max:65,step:1},
  cameraAzimuthDeg:{min:-180,max:180,step:1},
  cameraDistance:{min:500,max:2400,step:10},
  cameraTargetHeight:{min:0,max:300,step:5},
  cameraFov:{min:30,max:70,step:1},
} as const;

const WORLD_CAMERA_API='/wiz/api/page.home/portal_positions';
const WORLD_CAMERA_DRAFTS_KEY='sejong-world-camera-profile-drafts-v1';
const LOCAL_EXPERIENCE_MODE_KEY='jochiwon-local-experience-active';
const LOCAL_CAMERA_PROFILES_KEY='jochiwon-local-world-camera-profiles-v1';
const FIXED_LOCAL_CAMERA_PROFILES_KEY='jochiwon-fixed-world-camera-profiles-v1';
const isLocalExperience=()=>typeof window!=='undefined'&&window.sessionStorage.getItem(LOCAL_EXPERIENCE_MODE_KEY)==='1';
type CameraApiResponse={code?:number;data?:{profiles?:unknown[];profile?:unknown;canEdit?:boolean;message?:string}};

export const isWorldCameraEditorMap=(mapId:MapId)=>editableMapIds.has(mapId);

export function isWorldCameraProfile(value:unknown):value is WorldCameraProfile{
  if(!value||typeof value!=='object')return false;
  const profile=value as Partial<WorldCameraProfile>;
  if(typeof profile.mapId!=='string'||!editableMapIds.has(profile.mapId as MapId))return false;
  return (Object.keys(WORLD_CAMERA_PROFILE_LIMITS) as Array<keyof typeof WORLD_CAMERA_PROFILE_LIMITS>).every(field=>{
    const number=profile[field],limit=WORLD_CAMERA_PROFILE_LIMITS[field];
    return typeof number==='number'&&Number.isFinite(number)&&number>=limit.min&&number<=limit.max;
  });
}

function readLocalCameraProfiles(){
  if(!isLocalExperience())return [] as WorldCameraProfile[];
  try{
    const fixed=JSON.parse(window.localStorage.getItem(FIXED_LOCAL_CAMERA_PROFILES_KEY)??'[]') as unknown;
    const session=JSON.parse(window.sessionStorage.getItem(LOCAL_CAMERA_PROFILES_KEY)??'[]') as unknown;
    const fixedProfiles=Array.isArray(fixed)?fixed.filter(isWorldCameraProfile):[];
    const sessionProfiles=Array.isArray(session)?session.filter(isWorldCameraProfile):[];
    if(sessionProfiles.length){
      const sessionMapIds=new Set(sessionProfiles.map(profile=>profile.mapId));
      const promoted=[...fixedProfiles.filter(profile=>!sessionMapIds.has(profile.mapId)),...sessionProfiles];
      window.localStorage.setItem(FIXED_LOCAL_CAMERA_PROFILES_KEY,JSON.stringify(promoted));
      window.sessionStorage.removeItem(LOCAL_CAMERA_PROFILES_KEY);
      return promoted;
    }
    return fixedProfiles;
  }catch{return []}
}

function writeLocalCameraProfile(profile:WorldCameraProfile){
  const current=readLocalCameraProfiles();
  window.localStorage.setItem(FIXED_LOCAL_CAMERA_PROFILES_KEY,JSON.stringify([...current.filter(value=>value.mapId!==profile.mapId),profile]));
}

function readWorldCameraProfileDrafts(){
  if(typeof window==='undefined')return {} as Partial<Record<MapId,WorldCameraProfile>>;
  try{
    const stored=JSON.parse(window.sessionStorage.getItem(WORLD_CAMERA_DRAFTS_KEY)??'{}') as Record<string,unknown>;
    return Object.fromEntries(Object.entries(stored).filter(([,profile])=>isWorldCameraProfile(profile))) as Partial<Record<MapId,WorldCameraProfile>>;
  }catch{return {} as Partial<Record<MapId,WorldCameraProfile>>}
}

export const loadWorldCameraProfileDraft=(mapId:MapId)=>readWorldCameraProfileDrafts()[mapId];

export function saveWorldCameraProfileDraft(profile:WorldCameraProfile){
  if(typeof window==='undefined')return;
  try{window.sessionStorage.setItem(WORLD_CAMERA_DRAFTS_KEY,JSON.stringify({...readWorldCameraProfileDrafts(),[profile.mapId]:profile}))}catch{/* Restricted frames may block storage; the game renderer still keeps the in-memory preview. */}
}

export function clearWorldCameraProfileDraft(mapId:MapId){
  if(typeof window==='undefined')return;
  try{
    const drafts=readWorldCameraProfileDrafts();delete drafts[mapId];
    window.sessionStorage.setItem(WORLD_CAMERA_DRAFTS_KEY,JSON.stringify(drafts));
  }catch{/* Ignore unavailable session storage. */}
}

async function callCameraApi(payload?:WorldCameraProfile|{mapId:MapId;reset:true}){
  const form=new URLSearchParams({payload:JSON.stringify({resource:'worldCameraProfiles',profile:payload??null})});
  const response=await fetch(WORLD_CAMERA_API,{
    method:'POST',credentials:'include',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:form,
  });
  const body=await response.json().catch(()=>null) as CameraApiResponse|null;
  if(!response.ok||!body||body.code!==200)throw new Error(body?.data?.message??'카메라 설정 서버에 연결하지 못했어요.');
  return body;
}

export async function loadSharedWorldCameraProfiles(){
  const local=readLocalCameraProfiles();
  let body:CameraApiResponse;
  try{body=await callCameraApi()}catch(error){if(isLocalExperience())return {profiles:local,canEdit:true};throw error}
  const profiles=(body.data?.profiles??[]).filter(isWorldCameraProfile);
  const localMapIds=new Set(local.map(profile=>profile.mapId));
  return {profiles:[...profiles.filter(profile=>!localMapIds.has(profile.mapId)),...local],canEdit:isLocalExperience()||body.data?.canEdit===true};
}

export async function saveSharedWorldCameraProfile(profile:WorldCameraProfile){
  if(isLocalExperience()){
    writeLocalCameraProfile(profile);
    return {profile,message:'체험용 카메라 설정으로 저장했어요.'};
  }
  const body=await callCameraApi(profile),saved=body.data?.profile;
  if(!isWorldCameraProfile(saved))throw new Error('저장된 카메라 설정을 확인하지 못했어요.');
  return {profile:saved,message:body.data?.message??'모든 사용자에게 적용되는 카메라 설정으로 저장했어요.'};
}

export async function resetSharedWorldCameraProfile(mapId:MapId){
  if(isLocalExperience()){
    const profiles=readLocalCameraProfiles().filter(profile=>profile.mapId!==mapId);
    window.localStorage.setItem(FIXED_LOCAL_CAMERA_PROFILES_KEY,JSON.stringify(profiles));
    return {message:'체험용 카메라 설정을 기본값으로 되돌렸어요.'};
  }
  const body=await callCameraApi({mapId,reset:true});
  return {message:body.data?.message??'기본 카메라 설정으로 되돌렸어요.'};
}
