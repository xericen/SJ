import type { PortalPosition,PortalSaveResult } from '../../shared/socket-events';

const LOCAL_EXPERIENCE_MODE_KEY='jochiwon-local-experience-active';
const LOCAL_PORTAL_POSITIONS_KEY='jochiwon-local-world-portal-positions-v1';
const FIXED_LOCAL_PORTAL_POSITIONS_KEY='jochiwon-fixed-world-portal-positions-v1';
const isLocalExperience=()=>typeof window!=='undefined'&&window.sessionStorage.getItem(LOCAL_EXPERIENCE_MODE_KEY)==='1';

const WORLD_PORTAL_API='/wiz/api/page.home/portal_positions';

type WizPortalResponse={
  code?:number;
  data?:{
    positions?:PortalPosition[];
    position?:PortalPosition;
    canEdit?:boolean;
    message?:string;
  };
};

const validPosition=(value:unknown):value is PortalPosition=>{
  if(!value||typeof value!=='object')return false;
  const position=value as Partial<PortalPosition>;
  return typeof position.mapId==='string'&&typeof position.destination==='string'
    &&Number.isFinite(position.x)&&Number.isFinite(position.z);
};

function loadLocalPortalPositions(){
  if(!isLocalExperience())return [];
  try{
    const fixed=JSON.parse(window.localStorage.getItem(FIXED_LOCAL_PORTAL_POSITIONS_KEY)??'[]') as unknown;
    const session=JSON.parse(window.sessionStorage.getItem(LOCAL_PORTAL_POSITIONS_KEY)??'[]') as unknown;
    const fixedPositions=Array.isArray(fixed)?fixed.filter(validPosition):[];
    const sessionPositions=Array.isArray(session)?session.filter(validPosition):[];
    if(sessionPositions.length){
      const sessionKeys=new Set(sessionPositions.map(position=>`${position.mapId}:${position.destination}`));
      const promoted=[...fixedPositions.filter(position=>!sessionKeys.has(`${position.mapId}:${position.destination}`)),...sessionPositions];
      window.localStorage.setItem(FIXED_LOCAL_PORTAL_POSITIONS_KEY,JSON.stringify(promoted));
      window.sessionStorage.removeItem(LOCAL_PORTAL_POSITIONS_KEY);
      return promoted;
    }
    return fixedPositions;
  }catch{return []}
}

function saveLocalPortalPosition(position:PortalPosition){
  const key=(value:PortalPosition)=>`${value.mapId}:${value.destination}`;
  const current=loadLocalPortalPositions();
  const next=[...current.filter(value=>key(value)!==key(position)),position];
  window.localStorage.setItem(FIXED_LOCAL_PORTAL_POSITIONS_KEY,JSON.stringify(next));
}

async function callPortalApi(payload?:PortalPosition):Promise<WizPortalResponse>{
  const response=await fetch(WORLD_PORTAL_API,{
    method:'POST',credentials:'include',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:payload?new URLSearchParams({payload:JSON.stringify(payload)}):undefined,
  });
  const body=await response.json().catch(()=>null) as WizPortalResponse|null;
  if(!response.ok||!body||body.code!==200)throw new Error(body?.data?.message??'포탈 위치 서버에 연결하지 못했어요.');
  return body;
}

async function promoteLocalNaturalPortals(positions:PortalPosition[]){
  const natural=positions.filter(position=>position.mapId==='town'||position.mapId==='bear-tree-park');
  if(!natural.length)return;
  await fetch(WORLD_PORTAL_API,{
    method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:new URLSearchParams({payload:JSON.stringify({resource:'promoteNaturalPortalsV2',positions:natural})}),
  }).catch(()=>undefined);
}

export async function loadSharedWorldPortalState(){
  const local=loadLocalPortalPositions();
  if(isLocalExperience()&&local.length)await promoteLocalNaturalPortals(local);
  let body:WizPortalResponse;
  try{body=await callPortalApi()}catch(error){if(isLocalExperience())return {positions:local,canEdit:true};throw error}
  const positions=(body.data?.positions??[]).filter(validPosition);
  const localKeys=new Set(local.map(position=>`${position.mapId}:${position.destination}`));
  return {
    positions:[...positions.filter(position=>!localKeys.has(`${position.mapId}:${position.destination}`)),...local],
    canEdit:isLocalExperience()||body.data?.canEdit===true,
  };
}

export async function saveSharedWorldPortalPosition(position:PortalPosition):Promise<PortalSaveResult>{
  if(isLocalExperience()){
    saveLocalPortalPosition(position);
    return {ok:true,position,message:'체험용 포탈 위치로 저장했어요.'};
  }
  const body=await callPortalApi(position);
  const saved=body.data?.position;
  if(!validPosition(saved))throw new Error('저장된 포탈 위치를 확인하지 못했어요.');
  return {ok:true,position:saved,message:body.data?.message??'공용 포탈 위치로 저장했어요.'};
}
