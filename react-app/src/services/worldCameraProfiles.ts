import type {MapId} from '../../shared/socket-events';
import {WORLD_GUIDE_MAP_IDS} from '../game/worldNavigationProfile';

export const WORLD_CAMERA_EDITOR_MAP_IDS=[...WORLD_GUIDE_MAP_IDS] as const;
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
  characterHeight:{min:60,max:220,step:2},
  cameraElevationDeg:{min:15,max:65,step:1},
  cameraAzimuthDeg:{min:-180,max:180,step:1},
  cameraDistance:{min:500,max:2400,step:10},
  cameraTargetHeight:{min:0,max:300,step:5},
  cameraFov:{min:30,max:70,step:1},
} as const;

const WORLD_CAMERA_API='/wiz/api/page.home/portal_positions';
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
  const body=await callCameraApi();
  return {profiles:(body.data?.profiles??[]).filter(isWorldCameraProfile),canEdit:body.data?.canEdit===true};
}

export async function saveSharedWorldCameraProfile(profile:WorldCameraProfile){
  const body=await callCameraApi(profile),saved=body.data?.profile;
  if(!isWorldCameraProfile(saved))throw new Error('저장된 카메라 설정을 확인하지 못했어요.');
  return {profile:saved,message:body.data?.message??'모든 사용자에게 적용되는 카메라 설정으로 저장했어요.'};
}

export async function resetSharedWorldCameraProfile(mapId:MapId){
  const body=await callCameraApi({mapId,reset:true});
  return {message:body.data?.message??'기본 카메라 설정으로 되돌렸어요.'};
}
