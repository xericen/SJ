import {API_BASE_URL} from '../config/api';
import {
  BEAR_FEED_IDS,BEAR_FEED_SPOT_IDS,FARM_REWARD_IDS,GARDEN_FLOWER_IDS,
  type BearFeedId,type BearFeedSpotId,type FarmRewardId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../shared/personal-farm';

export const PERSONAL_FARM_PROGRESS_CHANGED='personal-farm-progress-changed';
const WIZ_PERSONAL_FARM_API='/wiz/api/page.home/personal_farm_progress';
const useWizRuntime=()=>window.location.hostname.endsWith('.wizide.com')||window.location.pathname.startsWith('/assets/jochwon-app/');
const errorMessages:Record<string,string>={
  UNAUTHENTICATED:'로그인이 필요합니다.',NETWORK_ERROR:'서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  FLOWER_ALREADY_COLLECTED:'이미 수집한 꽃입니다.',FLOWER_NOT_COLLECTED:'먼저 수목원에서 꽃을 수집해 주세요.',
  FEED_NOT_COLLECTED:'사용할 수 있는 먹이가 없습니다.',FEED_SPOT_ALREADY_COMPLETED:'이미 완료한 먹이 체험 지점입니다.',
  FEED_SPOTS_INCOMPLETE:'다섯 곳의 먹이 지점을 먼저 완료해 주세요.',BEAR_ALREADY_FED:'이미 곰 급여 체험을 완료했습니다.',
  FLOWER_ALREADY_PLANTED:'이미 심은 꽃입니다.',FARM_LOCKED:'수목원과 베어트리파크 미션을 완료하면 보상이 열립니다.',
};

export class PersonalFarmApiError extends Error {
  constructor(readonly code:string,message?:string,readonly status=0){super(errorMessages[code]??message??'마이홈 정보를 처리하지 못했습니다. 다시 시도해 주세요.')}
}

let cachedProgress:PersonalFarmProgressDto|undefined;
let refreshRequest:Promise<PersonalFarmProgressDto>|undefined;
let activeUserKey='';
const strings=(value:unknown,allowed:readonly string[])=>Array.isArray(value)&&value.every(item=>typeof item==='string'&&allowed.includes(item));
const nullableDate=(value:unknown)=>value===null||typeof value==='string';

export function isPersonalFarmProgressDto(value:unknown):value is PersonalFarmProgressDto{
  if(!value||typeof value!=='object')return false;
  const root=value as Record<string,unknown>,garden=root.gardenMission,bear=root.bearMission,farm=root.farm,visit=root.realVisit;
  if(!garden||typeof garden!=='object'||!bear||typeof bear!=='object'||!farm||typeof farm!=='object'||!visit||typeof visit!=='object')return false;
  const g=garden as Record<string,unknown>,b=bear as Record<string,unknown>,f=farm as Record<string,unknown>,v=visit as Record<string,unknown>;
  return strings(g.collectedFlowerIds,GARDEN_FLOWER_IDS)&&strings(g.plantedFlowerIds,GARDEN_FLOWER_IDS)&&typeof g.completed==='boolean'&&nullableDate(g.completedAt)
    &&strings(b.collectedFeedIds,BEAR_FEED_IDS)&&strings(b.completedFeedSpotIds,BEAR_FEED_SPOT_IDS)&&typeof b.bearFed==='boolean'&&nullableDate(b.bearFedAt)&&typeof b.completed==='boolean'&&nullableDate(b.completedAt)
    &&typeof f.unlocked==='boolean'&&strings(f.unlockedRewardIds,FARM_REWARD_IDS)&&strings(f.activeRewardIds,FARM_REWARD_IDS)&&['locked','cub','young','adult'].includes(String(f.bearGrowthStage))
    &&typeof v.garden==='object'&&typeof v.bearTree==='object'&&typeof root.layoutVersion==='number'&&typeof root.createdAt==='string'&&typeof root.updatedAt==='string';
}

function publish(progress:PersonalFarmProgressDto){cachedProgress=progress;window.dispatchEvent(new CustomEvent<PersonalFarmProgressDto>(PERSONAL_FARM_PROGRESS_CHANGED,{detail:progress}));return progress}
export const getCachedPersonalFarmProgress=()=>cachedProgress;
export const clearPersonalFarmProgressCache=()=>{cachedProgress=undefined;refreshRequest=undefined};
export function setPersonalFarmProgressUser(userKey:string){const next=userKey.trim().toLowerCase();if(next!==activeUserKey){activeUserKey=next;clearPersonalFarmProgressCache()}}
export const personalFarmErrorMessage=(error:unknown)=>error instanceof PersonalFarmApiError?error.message:'서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';

async function jsonResponse(response:Response){try{return await response.json() as Record<string,any>}catch{throw new PersonalFarmApiError('INVALID_RESPONSE',undefined,response.status)}}

async function requestExpress(path:string,init?:RequestInit){
  let response:Response;
  try{response=await fetch(`${API_BASE_URL}/account/me/personal-farm${path}`,{...init,credentials:'include',headers:{...(init?.body?{'Content-Type':'application/json'}:{}),...init?.headers}})}catch{throw new PersonalFarmApiError('NETWORK_ERROR')}
  const body=await jsonResponse(response);
  if(!response.ok){const code=typeof body.error?.code==='string'?body.error.code:'REQUEST_FAILED';throw new PersonalFarmApiError(code,typeof body.error?.message==='string'?body.error.message:undefined,response.status)}
  if(body.success!==true||!isPersonalFarmProgressDto(body.data))throw new PersonalFarmApiError('INVALID_RESPONSE');
  return publish(body.data);
}

async function requestWiz(action='',fields:Record<string,string>={}){
  const form=new URLSearchParams(action?{action,...fields}:fields);
  let response:Response;
  try{response=await fetch(WIZ_PERSONAL_FARM_API,{method:action?'POST':'GET',credentials:'include',headers:action?{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}:undefined,body:action?form.toString():undefined})}catch{throw new PersonalFarmApiError('NETWORK_ERROR')}
  const body=await jsonResponse(response),data=body.data as Record<string,unknown>|undefined;
  if(!response.ok||body.code!==200){const code=typeof data?.errorCode==='string'?data.errorCode:'REQUEST_FAILED';throw new PersonalFarmApiError(code,typeof data?.message==='string'?data.message:undefined,response.status)}
  if(!isPersonalFarmProgressDto(data?.progress))throw new PersonalFarmApiError('INVALID_RESPONSE');
  return publish(data.progress);
}

export const getMyPersonalFarmProgress=()=>useWizRuntime()?requestWiz():requestExpress('');
export function refreshPersonalFarmProgress(){return refreshRequest??(refreshRequest=getMyPersonalFarmProgress().finally(()=>{refreshRequest=undefined}))}
export const collectGardenFlower=(flowerId:GardenFlowerId)=>useWizRuntime()?requestWiz('collectFlower',{flowerId}):requestExpress(`/garden/collect/${encodeURIComponent(flowerId)}`,{method:'POST'});
export const plantGardenFlower=(flowerId:GardenFlowerId)=>useWizRuntime()?requestWiz('plantFlower',{flowerId}):requestExpress(`/garden/plant/${encodeURIComponent(flowerId)}`,{method:'POST'});
export const collectBearFeed=(feedId:BearFeedId)=>useWizRuntime()?requestWiz('collectFeed',{feedId}):requestExpress(`/bear/collect/${encodeURIComponent(feedId)}`,{method:'POST'});
export const completeBearFeedSpot=(spotId:BearFeedSpotId)=>useWizRuntime()?requestWiz('completeFeedSpot',{spotId}):requestExpress(`/bear/feed/${encodeURIComponent(spotId)}`,{method:'POST'});
export const feedBear=()=>useWizRuntime()?requestWiz('feedBear'):requestExpress('/bear/feed',{method:'POST'});
export const updateActiveFarmRewards=(rewardIds:FarmRewardId[])=>useWizRuntime()?requestWiz('activeRewards',{rewardIds:JSON.stringify(rewardIds)}):requestExpress('/rewards/active',{method:'PATCH',body:JSON.stringify({rewardIds})});
export const submitVisitMetadata=(mission:'garden'|'bearTree',metadata:Record<string,string>)=>useWizRuntime()?requestWiz('visitProof',{mission,metadata:JSON.stringify(metadata)}):requestExpress('/visit-proof',{method:'POST',body:JSON.stringify({mission,metadata})});
