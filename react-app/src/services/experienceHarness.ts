import type {MapId} from '../../shared/socket-events';
import {API_BASE_URL} from '../config/api';
import {gameEvents} from '../game/events';
import {readOptionalJson} from './optionalJson';
import {sejongDiningCodeDessertPlaces,sejongDiningCodeRestaurantPlaces} from '../data/sejongDiningCodePlaces';
import {sejongLocalFoods} from '../data/sejongLocalFoods';

type HarnessMap=MapId;
type Action={type:string;at?:number;[key:string]:unknown};
export type GeneratedExperienceProfile={source:string;generatorSource?:'openai'|'fallback';title?:string;tags:string[];traits?:Array<{key:string;label:string;score:number;confidence:number}>;summary:string;evidence?:string[];updatedAt:string};
export type ExperienceProfileFragment=GeneratedExperienceProfile&{scores?:Record<string,number>;sessionSummary?:Record<string,unknown>};
export type SavedExperienceInterest={id:string;domain:'performance'|'food'|'festival';title:string;subtitle:string;tags:string[];placeCategories:string[];savedAt:string};
export type ExperienceActivityRecord={id:string;mapId:HarnessMap;title:string;note:string;point:number;breakdown:Array<{label:string;point:number}>;recordedAt:string};
export type ExperienceAnalysisResult={summary:{scores:Record<string,number>;evidence:string[]};profile:GeneratedExperienceProfile;profileFragments?:ExperienceProfileFragment[];savedInterests?:SavedExperienceInterest[];activityRecords?:ExperienceActivityRecord[]};
export const EXPERIENCE_PROFILE_KEY='sejong-ai-experience-profile-v1';
export const EXPERIENCE_PROFILE_FRAGMENTS_KEY='sejong-ai-experience-profile-fragments-v1';
export const SAVED_EXPERIENCE_INTERESTS_KEY='sejong-saved-experience-interests-v1';
export const EXPERIENCE_ACTIVITY_HISTORY_KEY='sejong-experience-activity-history-v1';
export const FESTIVAL_INTEREST_HISTORY_KEY='sejong-festival-interest-history-v1';
type FestivalInterestEntry={id:string;title:string;categories:string[];opens:number;saved:boolean;sections:string[];updatedAt:string};
export type FestivalKeywordInsight={keyword:string;score:number;count:number;festivals:string[]};
const isHarnessMap=(mapId:MapId):mapId is HarnessMap=>Boolean(mapId);
const MAP_NAMES:Record<MapId,string>={
  'personal-farm':'마이홈',town:'세종호수공원','arts-center':'세종예술의전당','festival-experience':'축제 체험장','food-experience':'먹거리 체험장','club-street-festival':'동아리 거리제','bear-tree-park':'베어트리파크','bear-play-zone':'곰 체험소',garden:'국립세종수목원',campus:'공동캠퍼스','student-hall':'학생회관','recruitment-center':'모집센터','project-room':'프로젝트실',government:'정부세종청사','government-central-plaza':'정부청사 중앙광장','government-policy-hall':'정책 체험관','government-observatory':'정부청사 전망대','sejong-smart-city':'스마트시티 전시관','jochwon-station':'조치원역','traditional-market':'세종전통시장','jochwon-park':'조치원공원','college-street':'대학로',
};
const userKey=(nickname:string)=>nickname.trim().toLowerCase()||'guest';
let activeUserKey='guest';
let remoteExperienceApiAvailable:boolean|undefined;
let experienceSocialMode=Boolean(typeof window!=='undefined'&&localStorage.getItem('jochiwon-kakao-user-id')?.trim());
const guestExperienceMemory=new Map<string,string>();
const memoryStorage={
  getItem:(key:string)=>guestExperienceMemory.get(key)??null,
  setItem:(key:string,value:string)=>{guestExperienceMemory.set(key,value)},
  removeItem:(key:string)=>{guestExperienceMemory.delete(key)},
};
const profileStorage=()=>experienceSocialMode?localStorage:memoryStorage;

async function requestExperienceJson<T>(path:string,init?:RequestInit):Promise<T|null>{
  if(!experienceSocialMode)return null;
  if(remoteExperienceApiAvailable===false)return null;
  try{
    const response=await fetch(`${API_BASE_URL}${path}`,init);
    const body=await readOptionalJson<T>(response);
    if(body===null){
      if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))remoteExperienceApiAvailable=false;
      return null;
    }
    remoteExperienceApiAvailable=true;
    return response.ok?body:null;
  }catch{return null}
}

export function setActiveExperienceUser(nickname:string){activeUserKey=userKey(nickname)}
export function setExperienceProfileMode(authenticated:boolean){experienceSocialMode=authenticated;if(!authenticated)guestExperienceMemory.clear()}
export function resetGuestExperienceProfile(){if(!experienceSocialMode)guestExperienceMemory.clear()}
const profileKey=()=>`${EXPERIENCE_PROFILE_KEY}:${activeUserKey}`;
const fragmentsKey=(nickname=activeUserKey)=>`${EXPERIENCE_PROFILE_FRAGMENTS_KEY}:${userKey(nickname)}`;
const savedInterestsKey=(nickname=activeUserKey)=>`${SAVED_EXPERIENCE_INTERESTS_KEY}:${userKey(nickname)}`;
const historyKey=(nickname:string)=>`${EXPERIENCE_ACTIVITY_HISTORY_KEY}:${userKey(nickname)}`;
const festivalInterestKey=(nickname:string)=>`${FESTIVAL_INTEREST_HISTORY_KEY}:${userKey(nickname)}`;
const legacyFoodPlaces=[...sejongDiningCodeRestaurantPlaces,...sejongLocalFoods,...sejongDiningCodeDessertPlaces];

function loadFestivalInterestEntries(nickname:string){
  try{const value=JSON.parse(profileStorage().getItem(festivalInterestKey(nickname))??'[]') as unknown;return Array.isArray(value)?value.filter((item):item is FestivalInterestEntry=>Boolean(item&&typeof item==='object'&&'id' in item&&'categories' in item)):[]}catch{return []}
}
export function loadFestivalKeywordInsights(nickname:string):FestivalKeywordInsight[]{
  const scores=new Map<string,{count:number;festivals:Set<string>}>();
  const themes:Array<[string,RegExp]>=[
    ['야간·감성',/야간|밤|낙화|불꽃|조명|야경/],
    ['공연·음악',/공연|음악|콘서트|무대|버스킹|국악|연희/],
    ['전통·문화',/전통|한글|단오|공예|민속|문화유산/],
    ['가족·체험',/가족|어린이|아이|아동/],
    ['참여·체험',/체험|참여|놀이|만들기/],
    ['예술·전시',/예술|전시|미디어아트|작품/],
    ['자연·계절',/꽃|봄|자연|생태|복숭아/],
    ['먹거리·로컬',/먹거리|푸드|로컬|지역/],
    ['실속·접근성',/무료|저렴|접근/],
    ['함께·교류',/친구|연인|함께|시민|교류/],
  ];
  const add=(keyword:string,weight:number,title:string)=>{
    const current=scores.get(keyword)??{count:0,festivals:new Set<string>()};current.count+=weight;current.festivals.add(title);scores.set(keyword,current);
  };
  loadFestivalInterestEntries(nickname).forEach(entry=>{
    const weight=entry.saved?3:Math.min(2,Math.max(1,entry.opens));
    const matched=new Set<string>();
    entry.categories.forEach(category=>themes.forEach(([theme,pattern])=>{if(pattern.test(category))matched.add(theme)}));
    matched.forEach(theme=>add(theme,weight,entry.title));
    if(entry.sections.some(section=>['map','transport','timetable','recommended-time','nearby','route'].includes(section)))add('방문·계획',2,entry.title);
  });
  return [...scores].map(([keyword,value])=>({keyword,count:value.count,score:Math.min(100,20+value.count*9+Math.max(0,value.festivals.size-1)*12),festivals:[...value.festivals]}))
    .sort((a,b)=>(b.festivals.length*4+b.count)-(a.festivals.length*4+a.count)||b.score-a.score||a.keyword.localeCompare(b.keyword,'ko'))
    .slice(0,5);
}

function trackFestivalInterest(action:Action){
  if(!action.type.startsWith('festival-'))return;
  const booth=action.type==='festival-booth-complete'&&typeof action.booth==='string'?action.booth:undefined;
  const filter=action.type==='festival-filter'&&typeof action.filter==='string'&&action.filter!=='전체'?action.filter:undefined;
  const id=typeof action.festivalId==='string'?action.festivalId:booth?`booth-${booth}`:filter?`filter-${filter}`:undefined;
  if(!id)return;
  const boothLabels:Record<string,string>={performance:'축제 공연', 'traditional-culture':'전통문화 체험','art-exhibition':'문화예술 전시'};
  const title=typeof action.festivalTitle==='string'?action.festivalTitle:booth?boothLabels[booth]??booth:`${filter} 축제 탐색`;
  const entries=loadFestivalInterestEntries(activeUserKey),index=entries.findIndex(entry=>entry.id===id);
  const current=index>=0?entries[index]:{id,title,categories:[],opens:0,saved:false,sections:[],updatedAt:new Date().toISOString()};
  if(typeof action.festivalTitle==='string')current.title=action.festivalTitle;
  if(Array.isArray(action.categories))current.categories=[...new Set([...current.categories,...action.categories.filter((value):value is string=>typeof value==='string')])];
  if(booth&&Array.isArray(action.selectedCards))current.categories=[...new Set([...current.categories,boothLabels[booth]??booth,...action.selectedCards.filter((value):value is string=>typeof value==='string')])];
  if(filter)current.categories=[...new Set([...current.categories,filter])];
  if(action.type==='festival-open'||filter)current.opens+=1;
  if(action.type==='festival-save')current.saved=action.saved!==false;
  if(booth)current.saved=true;
  if(action.type==='festival-section'&&typeof action.section==='string')current.sections=[...new Set([...current.sections,action.section])];
  current.updatedAt=new Date().toISOString();if(index>=0)entries[index]=current;else entries.push(current);
  profileStorage().setItem(festivalInterestKey(activeUserKey),JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent('sejong-festival-interest-updated',{detail:{festivalId:current.id}}));
}
export function syncFestivalInterest(festival:{id:string;title:string;categories:string[]}){
  trackFestivalInterest({type:'festival-save',festivalId:festival.id,festivalTitle:festival.title,categories:festival.categories,saved:true});
}

function trackFoodRecentAction(action:Action){
  const truck=typeof action.truck==='string'?action.truck:'';
  const truckLabels:Record<string,string>={local:'세종 로컬 맛집',street:'세종 특산물 상점',dessert:'세종 카페·디저트'};
  let record:ExperienceActivityRecord|undefined;
  if(action.type==='food_truck_enter'&&truck){
    const label=truckLabels[truck]??'먹거리';
    record={id:`food-experience:truck:${truck}`,mapId:'food-experience',title:`${label} 트럭 열기`,note:`먹거리 부스에서 ${label} 안내 트럭을 열어봤어요.`,point:2,breakdown:[{label:'먹거리 트럭 열기',point:2}],recordedAt:typeof action.timestamp==='string'?action.timestamp:new Date().toISOString()};
  }
  if(['food_card_open','food_reopen','food_save'].includes(action.type)&&typeof action.itemId==='string'){
    const name=typeof action.itemName==='string'?action.itemName:'세종 먹거리';
    const menu=typeof action.menuName==='string'?action.menuName:'';
    const district=typeof action.district==='string'?action.district:'';
    const tags=Array.isArray(action.tags)?action.tags.map(String).slice(0,3):[];
    const saved=action.type==='food_save',reopened=action.type==='food_reopen';
    record={id:`food-experience:${saved?'saved':'view'}:${action.itemId}`,mapId:'food-experience',title:`${name} ${saved?'방문 후보 저장':reopened?'다시 보기':'상세 보기'}`,note:[`${truckLabels[truck]??'먹거리 부스'}에서 열었어요`,menu&&`메뉴: ${menu}`,district&&`지역: ${district}`,tags.length&&`키워드: ${tags.join(' · ')}`].filter(Boolean).join(' · '),point:saved?8:reopened?4:3,breakdown:saved?[{label:'먹거리 상세 탐색',point:3},{label:'방문 후보 저장',point:5}]:[{label:reopened?'먹거리 다시 보기':'먹거리 카드 열기',point:reopened?4:3}],recordedAt:typeof action.timestamp==='string'?action.timestamp:new Date().toISOString()};
  }
  if(!record)return;
  mergeExperienceActivities(activeUserKey,[record]);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record],optimistic:true}}));
}

export function recordExperienceAction(action:Action){
  trackFestivalInterest(action);
  trackFoodRecentAction(action);
  trackSavedExperienceInterest(action);
  if(action.type==='booth'&&typeof action.zone==='string'&&action.zone.startsWith('festival-filter:')){
    gameEvents.emit('experience-action',{type:'festival-filter',filter:action.zone.slice('festival-filter:'.length)});
    return;
  }
  gameEvents.emit('experience-action',action);
}
export function loadGeneratedExperienceProfile(){try{return JSON.parse(profileStorage().getItem(profileKey())??'null') as GeneratedExperienceProfile|null}catch{return null}}
export function loadExperienceProfileFragments(nickname=activeUserKey){try{const value=JSON.parse(profileStorage().getItem(fragmentsKey(nickname))??'[]') as unknown;return Array.isArray(value)?value.filter((item):item is ExperienceProfileFragment=>Boolean(item&&typeof item==='object'&&'source' in item&&'tags' in item)):[]}catch{return []}}
export function loadSavedExperienceInterests(nickname=activeUserKey){try{const value=JSON.parse(profileStorage().getItem(savedInterestsKey(nickname))??'[]') as unknown;return Array.isArray(value)?value.filter((item):item is SavedExperienceInterest=>Boolean(item&&typeof item==='object'&&'id' in item&&'domain' in item&&'title' in item)):[]}catch{return []}}
function replaceSavedExperienceInterests(nickname:string,items:SavedExperienceInterest[]){profileStorage().setItem(savedInterestsKey(nickname),JSON.stringify(items.slice(0,100)))}
function loadLegacySavedExperienceInterests(nickname:string):SavedExperienceInterest[]{
  const items:SavedExperienceInterest[]=[],now=new Date().toISOString();
  try{const ids=JSON.parse(profileStorage().getItem('sejong-arts-center-favorites-v1')??'[]') as unknown;if(Array.isArray(ids))ids.filter((id):id is number=>Number.isInteger(id)&&id>=0).forEach(index=>{const id=String(index),performance=performanceNames[id]??{title:'세종예술의전당 공연',type:'공연'};items.push({id,domain:'performance',title:performance.title,subtitle:performance.type,tags:[performance.type,'문화예술'],placeCategories:['문화시설'],savedAt:now})})}catch{/* Ignore malformed legacy favorites. */}
  try{const ids=JSON.parse(profileStorage().getItem('sejong-food-visit-candidates-v1')??'[]') as unknown;if(Array.isArray(ids)){const selected=new Set(ids.filter((id):id is string=>typeof id==='string'));legacyFoodPlaces.filter(place=>selected.has(place.id)).forEach(place=>items.push({id:place.id,domain:'food',title:place.name,subtitle:[place.menuName,place.district].filter(Boolean).join(' · '),tags:[...place.category,...place.tags].slice(0,8),placeCategories:[place.itemType==='cafe'?'카페':'음식점'],savedAt:now}))}}catch{/* Ignore malformed legacy food saves. */}
  loadFestivalInterestEntries(nickname).filter(entry=>entry.saved).forEach(entry=>items.push({id:entry.id,domain:'festival',title:entry.title,subtitle:'',tags:entry.categories.slice(0,8),placeCategories:['문화시설','관광명소'],savedAt:entry.updatedAt||now}));
  return [...new Map(items.map(item=>[`${item.domain}:${item.id}`,item])).values()];
}
function trackSavedExperienceInterest(action:Action){
  let domain:SavedExperienceInterest['domain']|undefined,id='',saved=true,title='',subtitle='',tags:string[]=[],placeCategories:string[]=[];
  if(action.type==='favorite'&&typeof action.performanceId==='string'){
    domain='performance';id=action.performanceId;saved=action.saved!==false;const performance=performanceNames[id]??{title:'세종예술의전당 공연',type:'공연'};title=performance.title;subtitle=performance.type;tags=[performance.type,'문화예술'];placeCategories=['문화시설'];
  }else if((action.type==='food_save'||action.type==='food_unsave')&&typeof action.itemId==='string'){
    domain='food';id=action.itemId;saved=action.type==='food_save';title=typeof action.itemName==='string'?action.itemName:'세종 먹거리';subtitle=[typeof action.menuName==='string'?action.menuName:'',typeof action.district==='string'?action.district:''].filter(Boolean).join(' · ');tags=[...(Array.isArray(action.categories)?action.categories.map(String):[]),...(Array.isArray(action.tags)?action.tags.map(String):[])].slice(0,8);placeCategories=[action.itemType==='cafe'?'카페':'음식점'];
  }else if((action.type==='festival-save'||action.type==='festival-route-save')&&typeof action.festivalId==='string'){
    domain='festival';id=action.festivalId;saved=action.saved!==false;title=typeof action.festivalTitle==='string'?action.festivalTitle:id;subtitle=typeof action.location==='string'?action.location:'';tags=Array.isArray(action.categories)?action.categories.map(String).slice(0,8):[];placeCategories=['문화시설','관광명소'];
  }
  if(!domain||!id)return;
  const items=loadSavedExperienceInterests(activeUserKey).filter(item=>!(item.domain===domain&&item.id===id));
  if(saved)items.unshift({id,domain,title,subtitle,tags,placeCategories,savedAt:new Date().toISOString()});
  replaceSavedExperienceInterests(activeUserKey,items);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{savedInterests:items,optimistic:true}}));
}
export function loadExperienceActivityHistory(nickname:string){
  try{
    const value=JSON.parse(profileStorage().getItem(historyKey(nickname))??'[]') as unknown;
    return Array.isArray(value)?value.filter((item):item is ExperienceActivityRecord=>Boolean(
      item&&typeof item==='object'&&'id' in item&&'mapId' in item&&'title' in item&&'note' in item&&'recordedAt' in item
    )):[];
  }catch{return []}
}
function cacheExperienceActivities(nickname:string,records:ExperienceActivityRecord[]){
  profileStorage().setItem(historyKey(nickname),JSON.stringify(records.slice(-100)));
}
function mergeExperienceActivities(nickname:string,records:ExperienceActivityRecord[]){
  const merged=new Map(loadExperienceActivityHistory(nickname).map(record=>[record.id,record]));
  records.forEach(record=>merged.set(record.id,record));
  cacheExperienceActivities(nickname,[...merged.values()].sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt)));
}
const GENERIC_ACTION_LABELS:Record<string,string>={
  'map-enter':'입장','map-exit':'탐험','club-open':'동아리 부스 살펴보기','club-detail':'동아리 상세 보기','club-join':'동아리 가입','club-save':'관심 동아리 저장','club-activity':'동아리 활동 참여','club-vote':'동아리 제안 투표','photo':'사진 기록','favorite':'관심 저장','save':'저장','complete':'체험 완료','apply':'참여 신청','join':'참여','select':'선택','open':'상세 보기','interaction':'공간 체험',
};
const meaningfulValue=(action:Action,keys:string[])=>keys.map(key=>action[key]).find(value=>typeof value==='string'&&value.trim());
function genericActionCopy(action:Action){
  const subject=String(meaningfulValue(action,['clubName','activityName','title','itemName','festivalTitle','placeName','projectName','label','name'])??'').trim();
  const tags=Array.isArray(action.tags)?action.tags.filter((value):value is string=>typeof value==='string').slice(0,4):[];
  const detail=String(meaningfulValue(action,['note','description','category','section','zone','booth','choice','role'])??'').trim();
  const known=GENERIC_ACTION_LABELS[action.type]??Object.entries(GENERIC_ACTION_LABELS).find(([key])=>action.type.includes(key))?.[1]??action.type.replaceAll(/[-_]/g,' ');
  return {title:subject?`${subject} ${known}`:known,note:[subject&&`${subject}에서`,detail,tags.length&&`관심 키워드: ${tags.join(' · ')}`].filter(Boolean).join(' · ')||`${known} 활동을 했어요.`};
}
function cacheGenericActivity(nickname:string,payload:{mapId:HarnessMap;sessionId:string;events:Action[]}){
  if(['arts-center','food-experience','festival-experience'].includes(payload.mapId))return;
  const actions=payload.events.filter(event=>event.type!=='map-enter');
  const representative=[...actions].reverse().find(event=>event.type!=='map-exit')??actions.at(-1);
  const duration=Math.max(1,Math.round((Number(actions.at(-1)?.at) || 0)/1000));
  const copy=representative?genericActionCopy(representative):{title:`${MAP_NAMES[payload.mapId]} 방문`,note:`${MAP_NAMES[payload.mapId]}에 입장해 공간을 탐색했어요.`};
  const specificCount=actions.filter(event=>!['map-exit'].includes(event.type)).length;
  const breakdown=[{label:`${MAP_NAMES[payload.mapId]} 탐색`,point:2},...(specificCount?[{label:`구체적인 활동 ${specificCount}개`,point:Math.min(12,specificCount*3)}]:[])];
  const record:ExperienceActivityRecord={id:`${payload.mapId}:${payload.sessionId}`,mapId:payload.mapId,title:copy.title,note:`${copy.note}${duration>=5?` · 약 ${duration}초 동안 활동`:''}`,point:breakdown.reduce((sum,item)=>sum+item.point,0),breakdown,recordedAt:new Date().toISOString()};
  mergeExperienceActivities(nickname,[record]);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record],optimistic:true}}));
}
const performanceNames:Record<string,{title:string;type:string}>={
  '0':{title:'뮤지컬 〈서편제〉',type:'뮤지컬 공연'},
  '1':{title:'연극 〈렁스〉',type:'연극 공연'},
  '2':{title:'19시 야민락콘서트 〈레브드집시〉',type:'라이브 공연'},
  '3':{title:'국립국악원 〈연희-판, 흥으로 잇는 세상〉',type:'전통 공연'},
  '4':{title:'국립심포니콘서트오케스트라 〈브람스, 교향곡 1번〉',type:'클래식 공연'},
};
function cacheLocalPerformanceActivity(nickname:string,payload:{mapId:HarnessMap;sessionId:string;events:Action[]}){
  if(payload.mapId!=='arts-center')return;
  const events=payload.events,performanceId=String(events.find(event=>typeof event.performanceId==='string')?.performanceId??'');
  const performance=performanceNames[performanceId]??{title:'세종예술의전당 공연',type:'공연'};
  const watched=Math.round(events.filter(event=>event.type==='watch').reduce((total,event)=>total+(typeof event.durationSeconds==='number'?event.durationSeconds:0),0));
  const breakdown:Array<{label:string;point:number}>=[];
  if(events.some(event=>event.type==='browse'))breakdown.push({label:'공연 탐색',point:2});
  if(watched>=1)breakdown.push({label:`영상 ${watched}초 감상`,point:watched>=15?5:2});
  if(events.some(event=>event.type==='finish'))breakdown.push({label:'끝까지 감상',point:5});
  if(events.some(event=>event.type==='favorite'&&event.saved!==false))breakdown.push({label:'관심 공연 저장',point:3});
  if(events.some(event=>event.type==='rewatch'))breakdown.push({label:'공연 다시 감상',point:3});
  if(events.some(event=>event.type==='sit'))breakdown.push({label:'객석에서 감상',point:2});
  if(!breakdown.length&&events.some(event=>event.type!=='enter'))breakdown.push({label:'공연장 체험',point:2});
  if(!breakdown.length)return;
  const finished=events.some(event=>event.type==='finish');
  const favorited=events.some(event=>event.type==='favorite'&&event.saved!==false);
  const record:ExperienceActivityRecord={id:`${payload.mapId}:${payload.sessionId}`,mapId:payload.mapId,title:performance.title,note:finished?`${performance.title} 영상을 ${watched}초 동안 시청하고 끝까지 감상했어요.`:favorited?`${performance.title}을(를) 관심 공연으로 저장했어요. 장르: ${performance.type}`:watched?`${performance.title} 영상을 ${watched}초 감상했어요.`:`${performance.title} 공연 정보를 살펴봤어요. 장르: ${performance.type}`,point:breakdown.reduce((sum,item)=>sum+item.point,0),breakdown,recordedAt:new Date().toISOString()};
  mergeExperienceActivities(nickname,[record]);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record]}}));
}
function cacheLocalFestivalActivity(nickname:string,payload:{mapId:HarnessMap;sessionId:string;events:Action[]}){
  if(payload.mapId!=='festival-experience')return;
  const completions=payload.events.filter(event=>event.type==='festival-booth-complete'&&typeof event.booth==='string');
  const booths=[...new Set(completions.map(event=>String(event.booth)))];
  const savedFestival=[...payload.events].reverse().find(event=>event.type==='festival-save'&&event.saved!==false&&typeof event.festivalTitle==='string');
  const viewedFestival=[...payload.events].reverse().find(event=>(event.type==='festival-close'||event.type==='festival-open')&&typeof event.festivalTitle==='string');
  if(!booths.length&&savedFestival){
    const title=String(savedFestival.festivalTitle),categories=Array.isArray(savedFestival.categories)?savedFestival.categories.map(String).slice(0,4):[];
    const record:ExperienceActivityRecord={id:`${payload.mapId}:${payload.sessionId}`,mapId:payload.mapId,title:`${title} 관심 저장`,note:`${title}에 관심을 표시했어요.${categories.length?` 관심 키워드: ${categories.join(' · ')}`:''}`,point:5,breakdown:[{label:'관심 축제 저장',point:5}],recordedAt:new Date().toISOString()};
    mergeExperienceActivities(nickname,[record]);window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record],optimistic:true}}));return;
  }
  if(!booths.length&&viewedFestival){
    const title=String(viewedFestival.festivalTitle),id=typeof viewedFestival.festivalId==='string'?viewedFestival.festivalId:payload.sessionId;
    const categories=Array.isArray(viewedFestival.categories)?viewedFestival.categories.map(String).slice(0,4):[];
    const location=typeof viewedFestival.location==='string'?viewedFestival.location:'';
    const duration=typeof viewedFestival.durationSeconds==='number'&&viewedFestival.durationSeconds>=1?`${Math.round(viewedFestival.durationSeconds)}초 동안 `:'';
    const record:ExperienceActivityRecord={id:`${payload.mapId}:view:${id}`,mapId:payload.mapId,title:`${title} 상세 관람`,note:`${duration}${title}의 일정과 장소를 살펴봤어요.${location?` 장소: ${location}.`:''}${categories.length?` 관심 키워드: ${categories.join(' · ')}`:''}`,point:3,breakdown:[{label:'축제 상세 보기',point:3}],recordedAt:new Date().toISOString()};
    mergeExperienceActivities(nickname,[record]);window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record],optimistic:true}}));return;
  }
  if(!booths.length)return;
  const labels:Record<string,string>={performance:'공연 무대','traditional-culture':'전통문화 체험','art-exhibition':'문화예술 전시'};
  const breakdown=booths.map(booth=>({label:`${labels[booth]??'축제'} 완료`,point:booth==='performance'?15:12}));
  const selected=completions.flatMap(event=>Array.isArray(event.selectedCards)?event.selectedCards.map(String):[]);
  const names=booths.map(booth=>labels[booth]??booth);
  const record:ExperienceActivityRecord={id:`${payload.mapId}:${payload.sessionId}`,mapId:payload.mapId,title:names.length===1?`${names[0]} 체험 완료`:'축제 부스 체험 완료',note:`${names.join(' · ')}${selected.length?`에서 ${selected.join(' · ')}을(를) 선택하고`:''} 축제 경험을 쌓았어요.`,point:breakdown.reduce((sum,item)=>sum+item.point,0),breakdown,recordedAt:new Date().toISOString()};
  mergeExperienceActivities(nickname,[record]);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:[record],optimistic:true}}));
}
function cacheLocalFoodActivity(nickname:string,payload:{mapId:HarnessMap;sessionId:string;events:Action[]}){
  if(payload.mapId!=='food-experience')return;
  const meaningful=payload.events.filter(event=>['food_save','food_card_open','food_reopen','food_truck_complete'].includes(event.type));
  if(!meaningful.length)return;
  const records:ExperienceActivityRecord[]=[];
  const savedItems=new Map<string,Action>();
  meaningful.filter(event=>event.type==='food_save'&&typeof event.itemId==='string').forEach(event=>savedItems.set(String(event.itemId),event));
  savedItems.forEach((event,itemId)=>{
    const name=typeof event.itemName==='string'?event.itemName:'세종 먹거리';
    const menu=typeof event.menuName==='string'?event.menuName:'';
    const district=typeof event.district==='string'?event.district:'';
    const tags=Array.isArray(event.tags)?event.tags.map(String).slice(0,3):[];
    records.push({id:`${payload.mapId}:saved:${itemId}`,mapId:payload.mapId,title:`${name} 방문 후보 저장`,note:[menu,district,tags.length?`관심 키워드: ${tags.join(' · ')}`:''].filter(Boolean).join(' · '),point:8,breakdown:[{label:'먹거리 상세 탐색',point:3},{label:'방문 후보 저장',point:5}],recordedAt:typeof event.timestamp==='string'?event.timestamp:new Date().toISOString()});
  });
  const viewedItems=new Map<string,Action>();
  meaningful.filter(event=>(event.type==='food_card_open'||event.type==='food_reopen')&&typeof event.itemId==='string').forEach(event=>viewedItems.set(String(event.itemId),event));
  viewedItems.forEach((event,itemId)=>{
    if(savedItems.has(itemId))return;
    const name=typeof event.itemName==='string'?event.itemName:'세종 먹거리';
    const menu=typeof event.menuName==='string'?event.menuName:'';
    const district=typeof event.district==='string'?event.district:'';
    const tags=Array.isArray(event.tags)?event.tags.map(String).slice(0,3):[];
    records.push({id:`${payload.mapId}:view:${itemId}`,mapId:payload.mapId,title:`${name} 상세 보기`,note:[menu,district,tags.length?`살펴본 키워드: ${tags.join(' · ')}`:''].filter(Boolean).join(' · '),point:event.type==='food_reopen'?4:3,breakdown:[{label:event.type==='food_reopen'?'먹거리 다시 보기':'먹거리 카드 보기',point:event.type==='food_reopen'?4:3}],recordedAt:typeof event.timestamp==='string'?event.timestamp:new Date().toISOString()});
  });
  const completed=[...meaningful].reverse().find(event=>event.type==='food_truck_complete');
  if(completed){
    const labels:Record<string,string>={local:'세종 로컬 맛집',street:'세종 특산물',dessert:'카페·디저트'};
    const truck=typeof completed.truck==='string'?completed.truck:'';
    records.push({id:`${payload.mapId}:booth:${truck}`,mapId:payload.mapId,title:`${labels[truck]??'먹거리'} 부스 완료`,note:'카드 3곳 이상과 상세 정보 2개 이상을 살펴보며 먹거리 취향을 기록했어요.',point:15,breakdown:[{label:'먹거리 카드 탐색',point:6},{label:'상세 정보 확인',point:4},{label:'부스 완료',point:5}],recordedAt:typeof completed.timestamp==='string'?completed.timestamp:new Date().toISOString()});
  }
  if(!records.length)return;
  mergeExperienceActivities(nickname,records);
  window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{activityRecords:records,optimistic:true}}));
}
export async function hydrateGeneratedExperienceProfile(nickname:string){activeUserKey=userKey(nickname);const body=await requestExperienceJson<{data?:{profile?:GeneratedExperienceProfile|null;profileFragments?:ExperienceProfileFragment[];savedInterests?:SavedExperienceInterest[];savedInterestsInitialized?:boolean;activityRecords?:ExperienceActivityRecord[]}}>('/account/me/experience/profile',{credentials:'include'});if(!body)return null;mergeExperienceActivities(nickname,body.data?.activityRecords??[]);if(body.data?.profile)profileStorage().setItem(profileKey(),JSON.stringify(body.data.profile));else profileStorage().removeItem(profileKey());profileStorage().setItem(fragmentsKey(nickname),JSON.stringify(body.data?.profileFragments??[]));let savedInterests=body.data?.savedInterests??[];if(!body.data?.savedInterestsInitialized){savedInterests=[...new Map([...savedInterests,...loadLegacySavedExperienceInterests(nickname)].map(item=>[`${item.domain}:${item.id}`,item])).values()];void requestExperienceJson('/account/me/experience/saved-interests',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({savedInterests})})}replaceSavedExperienceInterests(nickname,savedInterests);window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:{...body.data,savedInterests}}));return body.data?.profile??null}

export class ExperienceHarnessCollector{
  private map?:HarnessMap;private sessionId='';private startedAt=0;private events:Action[]=[];
  private activeSince=new Map<string,number>();private visits=new Map<string,number>();
  constructor(private readonly nickname:string){
    setActiveExperienceUser(nickname);
    gameEvents.on('experience-action',this.onAction);
    gameEvents.on('food-truck-kiosk-mode-changed',this.onFoodMode);
    gameEvents.on('arts-center-poster-focus-mode-changed',this.onPerformanceMode);
    gameEvents.on('arts-center-seat-proximity-changed',this.onSeat);
    gameEvents.on('experience-analysis-request',this.onAnalysisRequest);
  }
  enter(mapId:MapId){if(!isHarnessMap(mapId)){this.map=undefined;return}this.map=mapId;this.sessionId=crypto.randomUUID();this.startedAt=Date.now();this.events=[];this.activeSince.clear();this.push({type:'map-enter',title:MAP_NAMES[mapId]});if(mapId==='arts-center')this.push({type:'enter'});if(mapId==='festival-experience')this.push({type:'zone-first',zone:'entrance'})}
  exit(){
    if(!this.map)return;
    for(const [key,since] of this.activeSince){
      if(key.startsWith('food:'))this.push({type:'dwell',truck:key.slice(5),durationSeconds:(Date.now()-since)/1000});
      if(key.startsWith('performance:'))this.push({type:'browse',performanceId:key.slice(12),durationSeconds:(Date.now()-since)/1000});
      if(key==='seat')this.push({type:'sit',durationSeconds:(Date.now()-since)/1000});
    }
    this.activeSince.clear();this.push({type:'map-exit',title:MAP_NAMES[this.map],durationSeconds:(Date.now()-this.startedAt)/1000});
    const payload={mapId:this.map,sessionId:this.sessionId,events:this.events};
    this.map=undefined;this.events=[];void this.send(payload,true);
  }
  destroy(){this.exit();gameEvents.off('experience-action',this.onAction);gameEvents.off('food-truck-kiosk-mode-changed',this.onFoodMode);gameEvents.off('arts-center-poster-focus-mode-changed',this.onPerformanceMode);gameEvents.off('arts-center-seat-proximity-changed',this.onSeat);gameEvents.off('experience-analysis-request',this.onAnalysisRequest)}
  private push=(action:Action)=>{if(this.map)this.events.push({...action,at:Math.max(0,Date.now()-this.startedAt)})};
  private onAction=(action:Action)=>{this.push(action);if((this.map==='festival-experience'&&(action.type==='festival-open'||action.type==='festival-close'||action.type==='festival-booth-complete'||action.type==='festival-save'||action.type==='festival-route-save'))||(this.map==='arts-center'&&(['browse','watch','finish','favorite'].includes(action.type)))||(this.map==='food-experience'&&['food_card_open','food_reopen','food_save','food_unsave','food_truck_complete'].includes(action.type))||(this.map&&!['arts-center','food-experience','festival-experience'].includes(this.map)&&action.type!=='map-enter'))this.flushCurrentSession()};
  private send=async(payload:{mapId:HarnessMap;sessionId:string;events:Action[]},recordPlaceVisit=false)=>{
    cacheLocalPerformanceActivity(this.nickname,payload);
    cacheLocalFestivalActivity(this.nickname,payload);
    cacheLocalFoodActivity(this.nickname,payload);
    cacheGenericActivity(this.nickname,payload);
    if(recordPlaceVisit){const activeDurationSeconds=payload.events.filter(event=>event.type!=='map-exit').reduce((total,event)=>total+Math.max(0,Number(event.activeDurationSec??event.durationSeconds??((Number(event.actualViewMs??event.watchedMs)||0)/1000))||0),0);void requestExperienceJson('/account/me/unified-profile/place-visits',{method:'POST',credentials:'include',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:payload.sessionId,placeId:payload.mapId,activeDurationSeconds,idleDurationSeconds:0,visitedAt:new Date().toISOString()})})}
    const body=await requestExperienceJson<{data?:ExperienceAnalysisResult}>('/account/me/experience/map-exit',{method:'POST',credentials:'include',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!body?.data?.profile)return;
    profileStorage().setItem(profileKey(),JSON.stringify(body.data.profile));
    if(body.data.profileFragments)profileStorage().setItem(fragmentsKey(this.nickname),JSON.stringify(body.data.profileFragments));
    if(body.data.savedInterests)replaceSavedExperienceInterests(this.nickname,body.data.savedInterests);
    if(body.data.activityRecords)mergeExperienceActivities(this.nickname,body.data.activityRecords);
    gameEvents.emit('experience-profile-updated',body.data);window.dispatchEvent(new CustomEvent('sejong-experience-profile-updated',{detail:body.data}));
  };
  private flushCurrentSession=()=>{if(!this.map||!this.events.length)return;const payload={mapId:this.map,sessionId:this.sessionId,events:[...this.events]};this.sessionId=crypto.randomUUID();this.startedAt=Date.now();this.events=[];void this.send(payload)};
  private onAnalysisRequest=()=>{
    if(!this.map||!this.events.length)return;
    const now=Date.now();
    for(const [key,since] of this.activeSince){if(key==='seat')this.push({type:'sit',durationSeconds:(now-since)/1000});this.activeSince.set(key,now)}
    this.flushCurrentSession();
  };
  private onFoodMode=(truck:'local'|'street'|'dessert'|null)=>{
    if(this.map!=='food-experience')return;
    const previous=[...this.activeSince.entries()].find(([key])=>key.startsWith('food:'));
    if(previous){const [key,since]=previous,id=key.slice(5);this.push({type:'dwell',truck:id,durationSeconds:(Date.now()-since)/1000});this.activeSince.delete(key)}
    if(truck){const count=this.visits.get(truck)??0;this.visits.set(truck,count+1);this.push({type:count?'revisit':'visit',truck});this.push({type:'detail',truck});this.activeSince.set(`food:${truck}`,Date.now())}
  };
  private onPerformanceMode=(value:{active:boolean;index:number})=>{
    if(this.map!=='arts-center')return;const key=`performance:${value.index}`;
    if(value.active){const browseKey=`performance-browse:${value.index}`,previouslyBrowsed=[...this.visits.keys()].filter(item=>item.startsWith('performance-browse:')).length;if(!this.visits.has(browseKey)){this.visits.set(browseKey,1);if(previouslyBrowsed===1)this.push({type:'compare',performanceId:String(value.index)})}this.activeSince.set(key,Date.now());return}
    for(const [activeKey,since] of this.activeSince){if(!activeKey.startsWith('performance:'))continue;this.push({type:'browse',performanceId:activeKey.slice(12),durationSeconds:(Date.now()-since)/1000});this.activeSince.delete(activeKey)}
  };
  private onSeat=(value:{id:string;seated?:boolean}|null)=>{
    if(this.map!=='arts-center')return;const key='seat';
    if(value?.seated){this.activeSince.set(key,Date.now());return}
    const since=this.activeSince.get(key);if(since){this.push({type:'sit',durationSeconds:(Date.now()-since)/1000});this.activeSince.delete(key)}
  };
}
