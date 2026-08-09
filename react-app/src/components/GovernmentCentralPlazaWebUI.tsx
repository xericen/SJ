import { useEffect,useMemo,useState,type CSSProperties } from 'react';
import { Check,Download,MapPin,Plus,Route,Sparkles,X } from 'lucide-react';
import type { UserProfile } from '../types';
import { gameEvents } from '../game/events';
import { buildAiSejongProfile } from '../services/aiSejongProfile';
import type { GovernmentCentralPlazaWebUiId,GovernmentCentralPlazaWebUiSurface } from '../game/governmentCentralPlazaWebUi';
import './GovernmentCentralPlazaWebUI.css';
import './GovernmentApprovalFlow.css';
import './GovernmentCoursePlanner.css';
import './GovernmentThreeStage.css';
import { loadTravelProjectDraft,saveTravelProjectDraft } from '../services/travelProjectDraft';
import {loadExperienceActivityHistory,recordConfirmedCourseVisit} from '../services/experienceHarness';
import {loadProjectRoomProjects,refreshProjectRoomProjects,type Project} from '../services/projectRoomProjects';

type ScreenPoint={x:number;y:number};
type ScreenRect={left:number;top:number;width:number;height:number;quad?:readonly [ScreenPoint,ScreenPoint,ScreenPoint,ScreenPoint]};
const WEB_UI_WIDTH=1280,WEB_UI_HEIGHT=720;
const AI_HANDOFF_KEY='government-ai-profile-handoff-v1';
const FINAL_COURSE_KEY='government-finalized-project-course-v1';
type AiProfileHandoff={profile:UserProfile;experienceRecords:string[];projects:Project[];linkedAt:string};
type FinalizedProjectCourse={nickname:string;projectTitle:string;places:string[];confirmedAt:string};
type ProjectCourseHandoff={projectId:string;course:{items:Array<{placeName:string}>}};
type KakaoPlace={id:string;name:string;category:string;address:string;roadAddress?:string;latitude?:number;longitude?:number};
const loadAiHandoff=(nickname:string):AiProfileHandoff|null=>{try{const value=JSON.parse(localStorage.getItem(AI_HANDOFF_KEY)??'null') as AiProfileHandoff|null;return value?.profile?.nickname===nickname?value:null}catch{return null}};
const saveAiHandoff=(value:AiProfileHandoff)=>{localStorage.setItem(AI_HANDOFF_KEY,JSON.stringify(value));window.dispatchEvent(new CustomEvent('government-ai-profile-linked',{detail:value}))};
const loadFinalCourse=(nickname:string):FinalizedProjectCourse|null=>{try{const value=JSON.parse(localStorage.getItem(FINAL_COURSE_KEY)??'null') as FinalizedProjectCourse|null;return value?.nickname===nickname&&value.places.length?value:null}catch{return null}};
const perspectiveMatrix=(quad:ScreenRect['quad'])=>{
  if(!quad)return undefined;
  const [topLeft,topRight,bottomRight,bottomLeft]=quad;
  const dx1=topRight.x-bottomRight.x,dx2=bottomLeft.x-bottomRight.x,dx3=topLeft.x-topRight.x+bottomRight.x-bottomLeft.x;
  const dy1=topRight.y-bottomRight.y,dy2=bottomLeft.y-bottomRight.y,dy3=topLeft.y-topRight.y+bottomRight.y-bottomLeft.y;
  const denominator=dx1*dy2-dx2*dy1;
  let perspectiveX=0,perspectiveY=0;
  if(Math.abs(denominator)>1e-6){
    perspectiveX=(dx3*dy2-dx2*dy3)/denominator;
    perspectiveY=(dx1*dy3-dx3*dy1)/denominator;
  }
  const scaleX=topRight.x-topLeft.x+perspectiveX*topRight.x;
  const skewX=bottomLeft.x-topLeft.x+perspectiveY*bottomLeft.x;
  const scaleY=topRight.y-topLeft.y+perspectiveX*topRight.y;
  const skewY=bottomLeft.y-topLeft.y+perspectiveY*bottomLeft.y;
  const values=[
    scaleX/WEB_UI_WIDTH,scaleY/WEB_UI_WIDTH,0,perspectiveX/WEB_UI_WIDTH,
    skewX/WEB_UI_HEIGHT,skewY/WEB_UI_HEIGHT,0,perspectiveY/WEB_UI_HEIGHT,
    0,0,1,0,
    topLeft.x,topLeft.y,0,1,
  ];
  return `matrix3d(${values.map(value=>Math.abs(value)<1e-10?0:value).join(',')})`;
};
const routes=[
  {id:'admin',title:'도심 행정 투어',places:'정부청사 → 대통령기록관 → 국립세종박물관',time:'3시간',score:92},
  {id:'nature',title:'세종 자연 산책',places:'국립세종수목원 → 호수공원 → 전망대',time:'4시간',score:88},
  {id:'night',title:'야간 문화 코스',places:'박물관단지 → 중앙광장 → 도시전망대',time:'3.5시간',score:81},
];

export function GovernmentCentralPlazaWebUI({profile,active,onOpenChange,onNotice}:{profile:UserProfile;active:boolean;onOpenChange:(open:boolean)=>void;onNotice:(message:string)=>void}){
  const [nearby,setNearby]=useState<GovernmentCentralPlazaWebUiSurface|null>(null);
  const [screen,setScreen]=useState<GovernmentCentralPlazaWebUiId|null>(null);
  const [rect,setRect]=useState<ScreenRect|null>(null);
  const [mood,setMood]=useState('여유롭게');
  const [duration,setDuration]=useState('반나절');
  const [generated,setGenerated]=useState(false);
  const [saved,setSaved]=useState<string[]>([]);
  const [draft,setDraft]=useState(loadTravelProjectDraft);
  const [finalCourse,setFinalCourse]=useState<FinalizedProjectCourse|null>(()=>loadFinalCourse(profile.nickname));
  const [approved,setApproved]=useState(()=>Boolean(loadFinalCourse(profile.nickname)));
  const [linkedContext,setLinkedContext]=useState<AiProfileHandoff|null>(()=>loadAiHandoff(profile.nickname));
  const [projectLoaded,setProjectLoaded]=useState(false);
  const [optimized,setOptimized]=useState(false);
  const [optimizing,setOptimizing]=useState(false);
  const [optimizationSource,setOptimizationSource]=useState('홀로그램 원본 코스');
  const [coursePlaces,setCoursePlaces]=useState(['세종수목원','이응다리','조치원 카페거리','세종호수공원']);
  const [dragging,setDragging]=useState<string|null>(null);
  const [addingPlace,setAddingPlace]=useState(false);
  const [visited,setVisited]=useState<string[]>([]);
  const mineCompleted=(item:Project)=>item.status==='completed'&&(item.leaderId===profile.nickname||item.memberIds.includes(profile.nickname));
  const [completedProjects,setCompletedProjects]=useState<Project[]>(()=>loadProjectRoomProjects().filter(mineCompleted));
  const [mapPlace,setMapPlace]=useState<string|null>(null);
  const ai=useMemo(()=>buildAiSejongProfile(profile),[profile]);
  const activityRecords=useMemo(()=>loadExperienceActivityHistory(profile.nickname),[profile.nickname,draft.updatedAt]);
  const close=()=>gameEvents.emit('government-webui-close');

  useEffect(()=>{
    const proximity=(surface:GovernmentCentralPlazaWebUiSurface|null)=>setNearby(surface);
    const mode=(id:GovernmentCentralPlazaWebUiId|null)=>{setScreen(id);if(!id)setRect(null)};
    const screenRect=(value:ScreenRect|null)=>setRect(value);
    gameEvents.on('government-webui-proximity-changed',proximity);
    gameEvents.on('government-webui-mode-changed',mode);
    gameEvents.on('government-webui-screen-rect',screenRect);
    return()=>{
      gameEvents.off('government-webui-proximity-changed',proximity);
      gameEvents.off('government-webui-mode-changed',mode);
      gameEvents.off('government-webui-screen-rect',screenRect);
    };
  },[]);
  useEffect(()=>{if(!active){setNearby(null);setScreen(null);setRect(null);gameEvents.emit('government-webui-close')}},[active]);
  useEffect(()=>onOpenChange(!!screen),[onOpenChange,screen]);
  useEffect(()=>{
    if(!screen)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close()}};
    window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
  },[screen]);
  useEffect(()=>{const refresh=()=>setDraft(loadTravelProjectDraft());window.addEventListener('sejong-travel-draft-changed',refresh);return()=>window.removeEventListener('sejong-travel-draft-changed',refresh)},[]);
  useEffect(()=>{const refresh=()=>setCompletedProjects(loadProjectRoomProjects().filter(mineCompleted));window.addEventListener('project-room-projects-updated',refresh);void refreshProjectRoomProjects().then(refresh).catch(()=>undefined);return()=>window.removeEventListener('project-room-projects-updated',refresh)},[profile.nickname]);
  useEffect(()=>{setLinkedContext(loadAiHandoff(profile.nickname));setProjectLoaded(false);setOptimized(false);const saved=loadFinalCourse(profile.nickname);setFinalCourse(saved);setApproved(Boolean(saved))},[profile.nickname]);

  const toggleSave=(id:string)=>{
    setSaved(items=>items.includes(id)?items.filter(item=>item!==id):[...items,id]);
    onNotice(saved.includes(id)?'저장한 코스에서 해제했어요.':'추천 코스를 저장했어요.');
  };
  const analysis=[
    {label:'프로필 완성도',value:Math.max(20,ai.completion)},
    {label:'자연·힐링 선호',value:ai.interests.some(item=>/산책|자연/.test(item.label))?88:72},
    {label:'문화·행정 관심',value:profile.interests.length?76:61},
  ];
  const matrix=perspectiveMatrix(rect?.quad);
  const style=rect?(matrix
    ?{left:0,top:0,width:WEB_UI_WIDTH,height:WEB_UI_HEIGHT,transform:matrix,transformOrigin:'0 0'} as CSSProperties
    :{left:rect.left,top:rect.top,width:Math.max(1,rect.width),height:Math.max(1,rect.height)}):undefined;
  const optimizeCourse=async()=>{
    if(optimizing||!projectLoaded||!linkedContext)return;
    setOptimizing(true);setApproved(false);
    try{
      const linkedProfile=linkedContext.profile,linkedProject=linkedContext.projects[0];
      const places=coursePlaces.map((name,index)=>({id:`project-${index}`,name,category:index===0?'관광지':'체험',themes:linkedProfile.interests.slice(0,6),durationMinutes:60}));
      const response=await fetch('/api/government/course',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:{nickname:linkedProfile.nickname,residence:linkedProfile.residence??'',sejongVisitExperience:linkedProfile.sejongVisitExperience??'',mbti:linkedProfile.mbti,interests:linkedProfile.interests,usagePurposes:linkedProfile.usagePurposes,preferredPlaceCategories:linkedProfile.preferredPlaceCategories,recordVisibility:linkedProfile.recordVisibility??'public',chatEnabled:linkedProfile.chatEnabled??true,characterModel:linkedProfile.model},projects:linkedContext.projects.map(project=>({title:project.title,summary:project.summary,places:project.placeIds,activities:project.activityTypes,members:project.memberIds,preferredTraits:project.preferredTraits})),places,selectedPlaceIds:places.map(place=>place.id),themes:linkedProfile.interests.slice(0,6),interests:linkedProfile.interests.slice(0,20),experienceRecords:linkedContext.experienceRecords.slice(-20),chatActivities:linkedProject?.activityTypes.slice(0,10)??[],constraints:{date:'토요일',startTime:'13:00',endTime:'19:00',transport:'대중교통',meal:true,cafe:true,experience:true,activities:linkedProject?.activityTypes.slice(0,6)??[]}})});
      if(!response.ok)throw new Error(`AI course ${response.status}`);
      const payload=await response.json() as {course?:{source?:string;items?:Array<{placeName:string}>}};
      const optimizedPlaces=payload.course?.items?.map(item=>item.placeName).filter(Boolean)??[];
      if(optimizedPlaces.length)setCoursePlaces(optimizedPlaces);
      setOptimizationSource(payload.course?.source==='openai'?'OpenAI 실제 분석':'맞춤 분석 대체');
      setProjectLoaded(true);setGenerated(true);setOptimized(true);
      onNotice(payload.course?.source==='openai'?'OpenAI가 실제 프로필과 프로젝트 코스를 분석해 최적화했어요.':'OpenAI 연결이 지연되어 맞춤 규칙으로 코스를 최적화했어요.');
    }catch{
      setCoursePlaces(items=>[...items].sort((a,b)=>a.localeCompare(b,'ko')));setOptimizationSource('로컬 안전 최적화');setOptimized(true);
      onNotice('AI 연결이 지연되어 현재 홀로그램 코스를 안전하게 최적화했어요.');
    }finally{setOptimizing(false)}
  };
  const addCoursePlace=async()=>{
    if(addingPlace||!linkedContext)return;setAddingPlace(true);
    try{
      const query=linkedContext.profile.preferredPlaceCategories[0]??linkedContext.profile.interests[0]??'관광 명소';
      const search=await fetch('/api/places/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:`세종 ${query}`,longitude:127.289,latitude:36.5,radius:30000,size:15})});if(!search.ok)throw new Error();
      const candidates=((await search.json()) as {places?:KakaoPlace[]}).places?.filter(place=>place.address.includes('세종')&&!coursePlaces.includes(place.name)).slice(0,10)??[];if(!candidates.length)throw new Error();
      const p=linkedContext.profile,recommendation=await fetch('/api/ai/place-recommendations',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({requester:{userId:p.nickname,interests:[...p.interests,`MBTI ${p.mbti}`,`거주지역 ${p.residence||'미입력'}`,`세종 방문 ${p.sejongVisitExperience||'미입력'}`],currentNeeds:p.usagePurposes,campusInterests:p.preferredPlaceCategories,plantProfile:{discoveredPlants:[],completionRate:ai.completion},festivalProfile:{visitedFestivals:linkedContext.experienceRecords,likedBooths:[],likedActivities:linkedContext.projects.flatMap(project=>project.activityTypes)}},conversationSummary:{sharedInterests:p.interests,wantedActivities:p.usagePurposes,avoidActivities:[],preferredMood:[p.mbti||'맞춤 여행'],additionalConditions:[`현재 프로젝트 코스 ${coursePlaces.join(' → ')}`]},candidatePlaces:candidates.map(place=>({placeId:place.id,name:place.name,category:place.category,address:place.address,roadAddress:place.roadAddress,latitude:place.latitude,longitude:place.longitude,tags:[query,...p.interests].slice(0,10),isLocalBusiness:/카페|음식|식당|상점/.test(place.category),description:'카카오지도에서 확인한 세종 실제 장소',source:'kakao'}))})});if(!recommendation.ok)throw new Error();
      const result=await recommendation.json() as {data?:{route?:Array<{placeId:string}>}};const selected=candidates.find(place=>place.id===result.data?.route?.[0]?.placeId)??candidates[0];setCoursePlaces(items=>[...items,selected.name]);setOptimized(false);setApproved(false);onNotice(`전체 프로필과 카카오지도를 분석해 ${selected.name}을 추천했어요.`);
    }catch{onNotice('AI 장소 추천을 불러오지 못했어요. OpenAI와 카카오 연결을 확인해 주세요.')}finally{setAddingPlace(false)}
  };
  const importCompletedProject=()=>{
    const project=completedProjects[0];if(!project)return;let handoff:ProjectCourseHandoff|null=null;try{const value=JSON.parse(localStorage.getItem('government-project-course-handoff-v1')??'null') as ProjectCourseHandoff|null;if(value?.projectId===project.id)handoff=value}catch{/* invalid handoff */}
    const projectDraft=loadTravelProjectDraft(project.id),names=handoff?.course.items.map(item=>item.placeName)??(projectDraft.courseOrder??[]).flatMap(id=>{const idea=projectDraft.ideas.find(item=>item.id===id&&item.category==='place');return idea?[idea.name]:[]});setCoursePlaces(names.length?names:project.placeIds);setProjectLoaded(true);setOptimized(false);setApproved(false);setFinalCourse(null);localStorage.removeItem(FINAL_COURSE_KEY);onNotice(`${project.title}에서 팀과 확정한 일정표를 불러왔어요.`);
  };
  const dropCoursePlace=(target:string)=>{
    if(!dragging||dragging===target)return;
    setCoursePlaces(items=>{const next=items.filter(item=>item!==dragging);next.splice(items.indexOf(target),0,dragging);return next});
    setDragging(null);setOptimized(false);setApproved(false);
  };
  const approveCourse=()=>{
    const next={...draft,courseOrder:coursePlaces,courseConfirmed:true,status:'approved' as const};
    const finalized:FinalizedProjectCourse={nickname:profile.nickname,projectTitle:completedProjects[0]?.title??'프로젝트 코스',places:[...coursePlaces],confirmedAt:new Date().toISOString()};
    saveTravelProjectDraft(next);localStorage.setItem(FINAL_COURSE_KEY,JSON.stringify(finalized));setDraft(next);setFinalCourse(finalized);setApproved(true);
    onNotice('여행 일정을 확정하고 내 프로필의 추천 세종 코스에 저장했어요.');
  };
  const confirmVisit=(place:string)=>{
    if(visited.includes(place))return;
    recordConfirmedCourseVisit(profile.nickname,place);setVisited(items=>[...items,place]);
    onNotice(`${place} 방문 기록을 내 프로필에 반영했어요.`);
  };
  const linkProfileToAi=()=>{
    const context:AiProfileHandoff={profile:{...profile,interests:[...profile.interests],usagePurposes:[...profile.usagePurposes],preferredPlaceCategories:[...profile.preferredPlaceCategories],character:{...profile.character}},experienceRecords:activityRecords.map(record=>`${record.title}: ${record.note}`),projects:completedProjects.map(project=>({...project,placeIds:[...project.placeIds],activityTypes:[...project.activityTypes],memberIds:[...project.memberIds],preferredTraits:[...project.preferredTraits]})),linkedAt:new Date().toISOString()};
    saveAiHandoff(context);setLinkedContext(context);setProjectLoaded(false);setOptimized(false);setApproved(false);
    onNotice('현재 전체 프로필과 완료 프로젝트·체험 기록을 02 OpenAI 추천에 전달했어요.');
  };
  const screenTitle=screen==='experience-analysis'?'프로젝트 불러오기':screen==='course-browser'?'일정 및 방문':'AI 일정 확정';

  return <>
    {active&&screen&&<div className="government-webui-active-marker" aria-hidden="true"/>}
    {active&&nearby&&!screen&&<button type="button" className="government-webui-prompt" onClick={()=>gameEvents.emit('government-webui-open',nearby.id)}>
      <span><Sparkles size={18}/></span><div><small>AI 세종 추천센터</small><b>{nearby.label}</b></div><kbd>E</kbd><em>웹 화면 열기</em>
    </button>}
    {active&&screen&&rect&&<section className={`government-surface-webui is-${screen}`} style={style} role="dialog" aria-modal="true">
      <header><div><small>{screen==='experience-analysis'?'01 · PROJECT':screen==='course-browser'?'03 · VISIT':'02 · AI'}</small><h2>{screenTitle}</h2></div><button type="button" onClick={close} aria-label="웹 화면 닫기"><X/></button></header>

      {screen==='experience-analysis'&&<div className="government-project-import-screen">
        <header><small>MY SEJONG EXPERIENCE</small><h3>내가 경험한 세종을 AI 추천에 연결하세요.</h3><p>내 프로필, 역할, 관심사와 실제 체험 기록을 준비합니다.</p></header>
        <main><section><small>프로젝트실 완료 프로젝트</small><h3>{profile.nickname}님의 완성 프로젝트</h3>{completedProjects.map(project=><article key={project.id}><Check/><span><b>{project.title}</b><small>{project.summary} · {project.memberIds.length}명 협업 · {project.activityTypes.slice(0,2).join(' · ')}</small></span></article>)}{!completedProjects.length&&<p>아직 완성된 프로젝트가 없습니다. 프로젝트실에서 팀원과 테이블 프로젝트를 완료해 주세요.</p>}<small>체험 기록 {activityRecords.length}개도 AI 분석 근거로 함께 전달됩니다.</small></section><aside><b>AI에 전달할 데이터</b><span>완성 프로젝트 · 팀원 · 역할 · 목표</span><span>방문 장소 · 미션 · 부스 · 식물 · 사진</span><strong>완성 프로젝트 {completedProjects.length}개 · 활동 기록 {activityRecords.length}개</strong></aside></main>
        <button type="button" className={linkedContext?'loaded':''} disabled={!completedProjects.length} onClick={linkProfileToAi}><Download/>{linkedContext?'전체 프로필 연결 완료':'AI 추천에 사용하기'}</button>
      </div>}

      {screen==='course-recommendation'&&<div className="government-approval-flow">
        <aside className="project-import-panel"><small>PROJECT ROOM</small><h3>완료 프로젝트 가져오기</h3>{completedProjects.length?<article><i>📁</i><b>{completedProjects[0].title}</b><p>{completedProjects[0].summary}</p><dl><span><dt>장소</dt><dd>{completedProjects[0].placeIds.length}개</dd></span><span><dt>참여자</dt><dd>{completedProjects[0].memberIds.length}명</dd></span><span><dt>상태</dt><dd>완료</dd></span></dl></article>:<article><i>📁</i><b>내 완료 프로젝트 없음</b><p>내가 만들거나 참여해 프로젝트실에서 완성한 프로젝트만 표시됩니다.</p></article>}<button className={projectLoaded?'loaded':''} type="button" disabled={!completedProjects.length||!linkedContext} onClick={importCompletedProject}>{projectLoaded?<><Check/> 일정표 불러오기 완료</>:<><Download/> 완료 프로젝트 불러오기</>}</button></aside>
        <main className="hologram-course-panel"><header><Route/><div><small>AI COURSE MAP</small><b>홀로그램 코스</b></div><em>{projectLoaded?'프로젝트실 확정 일정표':'프로젝트를 먼저 불러와 주세요'}</em></header>{projectLoaded?<><div className="hologram-map"><div className="hologram-rings"/>{coursePlaces.map((place,index)=><span key={place} style={{'--node-index':index} as CSSProperties}><i>{index+1}</i>{place}</span>)}</div><div className="draggable-course-list">{coursePlaces.map((place,index)=><article key={place} draggable onDragStart={()=>setDragging(place)} onDragOver={event=>event.preventDefault()} onDrop={()=>dropCoursePlace(place)}><i>{index+1}</i><span><b>{place}</b><small>프로젝트 일정</small></span><em>⋮⋮</em></article>)}<button type="button" onClick={()=>void addCoursePlace()} disabled={addingPlace}><Plus/> {addingPlace?'AI 추천 중...':'장소 추가'}</button></div></>:<p className="course-hint">완료 프로젝트를 불러오면 팀이 정한 일정표가 표시됩니다.</p>}</main>
        <aside className="ai-result-panel"><small>AI RESULT</small><h3>{optimized?'AI 분석 결과':'분석 대기'}</h3>{projectLoaded&&optimized&&[['이동시간','3시간 45분'],['예상 비용','18,000원'],['현재 축제','1개 포함'],['추천도','96%']].map(([label,value])=><article key={label}><Check/><span><small>{label}</small><b>{value}</b></span></article>)}{projectLoaded?(optimized?<div className="time-saved"><Sparkles/><span><b>홀로그램 코스 분석 완료</b><small>{optimizationSource} · 전체 프로필을 반영했어요.</small></span></div>:<p>AI 추천을 누르면 홀로그램 코스를 분석합니다.</p>):<p>프로젝트를 불러오기 전에는 분석 결과가 표시되지 않습니다.</p>}</aside>
        <footer><button className="optimize" disabled={!projectLoaded||optimizing} onClick={()=>void optimizeCourse()}><Sparkles/> {optimizing?'OpenAI 분석 중...':'AI 최적화'}</button><button className="confirm" disabled={!projectLoaded||!optimized} onClick={approveCourse}><Check/> {approved?'일정 확정 완료':'일정 확정'}</button></footer>
      </div>}

      {screen==='course-browser'&&<div className="government-visit-screen">
        <header><small>MY SEJONG TRIP</small><h3>{approved?'확정한 세종 여행':'확정된 일정이 아직 없어요'}</h3><p>02에서 확정한 일정으로 방문하고 결과를 내 프로필에 다시 쌓아보세요.</p></header>
        <main>{(approved&&finalCourse?finalCourse.places:[]).map((place,index)=><article key={place}><time>{`${13+index}:00`}</time><i>{index+1}</i><span><b>{place}</b><small>{index===0?'추천 코스 시작':'다음 방문 장소'}</small></span><div><button onClick={()=>setMapPlace(place)}><MapPin/>지도에서 보기</button><button className={visited.includes(place)?'visited':''} onClick={()=>confirmVisit(place)}><Check/>{visited.includes(place)?'방문 완료':'방문 기록'}</button></div></article>)}{mapPlace&&<div className="inline-kakao-map"><header><b>{mapPlace} 카카오지도</b><button onClick={()=>setMapPlace(null)}><X/></button></header><iframe title={`${mapPlace} 카카오지도`} src={`https://map.kakao.com/link/search/${encodeURIComponent(`세종 ${mapPlace}`)}`} /></div>}</main>
        <footer>추천 → 방문 → 방문 인증 → 체험 기록 추가 → 프로필 업데이트</footer>
      </div>}

    </section>}
  </>;
}
