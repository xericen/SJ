import type { PortalPosition,PortalSaveResult } from '../../shared/socket-events';

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

export async function loadSharedWorldPortalState(){
  const body=await callPortalApi();
  return {
    positions:(body.data?.positions??[]).filter(validPosition),
    canEdit:body.data?.canEdit===true,
  };
}

export async function saveSharedWorldPortalPosition(position:PortalPosition):Promise<PortalSaveResult>{
  const body=await callPortalApi(position);
  const saved=body.data?.position;
  if(!validPosition(saved))throw new Error('저장된 포탈 위치를 확인하지 못했어요.');
  return {ok:true,position:saved,message:body.data?.message??'공용 포탈 위치로 저장했어요.'};
}
