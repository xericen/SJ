import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BusFront, Check, Database, HeartPulse, Leaf, Plane, Radio, Sparkles } from 'lucide-react';
import { gameEvents } from '../game/events';
import type { UserProfile } from '../types';
import type { SmartCityTechnologyId } from '../game/renderers/SmartCityHologram';
import './SmartCityExperience.css';

const services=[
  {id:'brt' as const,label:'자율주행 BRT',icon:BusFront,fact:'세종시는 BRT 중심 대중교통 체계를 갖추고 있으며, BRT 전용도로에서 자율주행버스 운행이 시작된 도시입니다.'},
  {id:'uam' as const,label:'UAM',icon:Plane,fact:'도심 항공교통 UAM은 국토교통부의 미래 교통 체계와 연계해 연구되고 있습니다.'},
  {id:'traffic' as const,label:'AI 교통관제',icon:Radio,fact:'도시 교통 데이터를 분석해 교차로 신호를 제어하고 혼잡을 줄이는 스마트 교통 서비스입니다.'},
  {id:'energy' as const,label:'스마트 에너지',icon:Leaf,fact:'세종 국가시범도시는 신재생에너지와 에너지 관리 시스템을 포함한 친환경 에너지 도시를 추진합니다.'},
  {id:'twin' as const,label:'디지털 트윈',icon:Database,fact:'세종은 AI·데이터허브, 디지털 트윈과 IoT 센서를 기반으로 도시 데이터를 활용하는 스마트시티를 추진합니다.'},
  {id:'health' as const,label:'스마트 헬스케어',icon:HeartPulse,fact:'병원과 응급 데이터를 연결해 신속하게 대응하는 AI 기반 응급의료 서비스가 국가시범도시 계획에 포함됩니다.'},
];
const phases=['빛 확산','건물 활성화','도로 연결','이동체 운행','데이터 생성','서비스 적용 완료'] as const;
const TRANSITION_MS=6200;
type ScreenPoint={x:number;y:number};
type ScreenRect={left:number;top:number;width:number;height:number;quad?:readonly [ScreenPoint,ScreenPoint,ScreenPoint,ScreenPoint]};
type WallPanelId='city'|'future'|'connected';
type WallScreenRects=Partial<Record<WallPanelId,ScreenRect>>;
const TABLE_WIDTH=1200,TABLE_HEIGHT=650;
const perspectiveMatrix=(quad:ScreenRect['quad'],sourceWidth:number,sourceHeight:number)=>{
  if(!quad)return undefined;
  const [topLeft,topRight,bottomRight,bottomLeft]=quad;
  const dx1=topRight.x-bottomRight.x,dx2=bottomLeft.x-bottomRight.x,dx3=topLeft.x-topRight.x+bottomRight.x-bottomLeft.x;
  const dy1=topRight.y-bottomRight.y,dy2=bottomLeft.y-bottomRight.y,dy3=topLeft.y-topRight.y+bottomRight.y-bottomLeft.y;
  const denominator=dx1*dy2-dx2*dy1;let perspectiveX=0,perspectiveY=0;
  if(Math.abs(denominator)>1e-6){perspectiveX=(dx3*dy2-dx2*dy3)/denominator;perspectiveY=(dx1*dy3-dx3*dy1)/denominator}
  const scaleX=topRight.x-topLeft.x+perspectiveX*topRight.x,skewX=bottomLeft.x-topLeft.x+perspectiveY*bottomLeft.x;
  const scaleY=topRight.y-topLeft.y+perspectiveX*topRight.y,skewY=bottomLeft.y-topLeft.y+perspectiveY*bottomLeft.y;
  return `matrix3d(${[scaleX/sourceWidth,scaleY/sourceWidth,0,perspectiveX/sourceWidth,skewX/sourceHeight,skewY/sourceHeight,0,perspectiveY/sourceHeight,0,0,1,0,topLeft.x,topLeft.y,0,1].map(value=>Math.abs(value)<1e-10?0:value).join(',')})`;
};
const projectedStyle=(rect:ScreenRect,width:number,height:number):CSSProperties=>{
  const matrix=perspectiveMatrix(rect.quad,width,height);
  return matrix?{left:0,top:0,width,height,transform:matrix,transformOrigin:'0 0'}:{left:rect.left,top:rect.top,width:rect.width,height:rect.height};
};
const tableStyle=(rect:ScreenRect)=>projectedStyle(rect,TABLE_WIDTH,TABLE_HEIGHT);

export function SmartCityExperience({active,profile,onNotice,onOpenChange,wallLayerStyle}:{active:boolean;profile:UserProfile;onNotice?:(message:string)=>void;onOpenChange?:(open:boolean)=>void;wallLayerStyle?:CSSProperties}){
  const [nearby,setNearby]=useState(false),[open,setOpen]=useState(false);
  const [selected,setSelected]=useState<SmartCityTechnologyId>('brt'),[visited,setVisited]=useState<SmartCityTechnologyId[]>([]),[showResult,setShowResult]=useState(false);
  const [transitionKey,setTransitionKey]=useState(0),[transitionStarted,setTransitionStarted]=useState(Date.now()),[progress,setProgress]=useState(0);
  const [screenRect,setScreenRect]=useState<ScreenRect|null>(null);
  const [wallRects,setWallRects]=useState<WallScreenRects>({});
  const saved=useRef(false);
  const current=services.find(service=>service.id===selected)!;
  const phaseIndex=Math.min(phases.length-1,Math.floor(progress*phases.length));

  useEffect(()=>{
    const proximity=(value:boolean)=>setNearby(value),launch=()=>setOpen(true),screen=(value:ScreenRect|null)=>setScreenRect(value),walls=(value:WallScreenRects|null)=>setWallRects(value??{});
    gameEvents.on('smart-city-table-proximity-changed',proximity);
    gameEvents.on('smart-city-experience-open',launch);
    gameEvents.on('smart-city-screen-rect',screen);
    gameEvents.on('smart-city-wall-screen-rects',walls);
    return()=>{gameEvents.off('smart-city-table-proximity-changed',proximity);gameEvents.off('smart-city-experience-open',launch);gameEvents.off('smart-city-screen-rect',screen);gameEvents.off('smart-city-wall-screen-rects',walls)};
  },[]);
  useEffect(()=>{if(!active){setOpen(false);setNearby(false)}},[active]);
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.repeat)return;
      if(event.code==='KeyE'&&!open&&active&&nearby){event.preventDefault();event.stopImmediatePropagation();setOpen(true)}
      else if(event.key==='Escape'&&open){event.preventDefault();event.stopImmediatePropagation();setOpen(false);setShowResult(false)}
    };
    window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
  },[active,nearby,open]);
  useEffect(()=>{
    gameEvents.emit('game-input-lock',open);
    gameEvents.emit('smart-city-experience-active-changed',open);
    onOpenChange?.(open);
    document.querySelector('.game-page')?.classList.toggle('is-smart-city-experience',open);
    if(open){setTransitionStarted(Date.now());setProgress(0)}
    return()=>{
      if(open){gameEvents.emit('game-input-lock',false);gameEvents.emit('smart-city-experience-active-changed',false)}
      onOpenChange?.(false);
      document.querySelector('.game-page')?.classList.remove('is-smart-city-experience');
    };
  },[open,onOpenChange]);
  useEffect(()=>{gameEvents.emit('smart-city-technology-changed',selected)},[selected,transitionKey]);
  useEffect(()=>{
    if(!open)return;
    let frame=0;
    const tick=()=>{const next=Math.min(1,(Date.now()-transitionStarted)/TRANSITION_MS);setProgress(next);if(next<1)frame=requestAnimationFrame(tick)};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[open,transitionStarted]);
  useEffect(()=>{
    if(visited.length!==services.length||saved.current)return;
    saved.current=true;
    const timer=window.setTimeout(()=>{
      const labels=visited.map(id=>services.find(service=>service.id===id)?.label).filter(Boolean);
      const result={completedAt:Date.now(),visited,services:labels,summary:'세종시는 앞으로 AI 행정과 스마트 교통을 중심으로 발전할 예정입니다.'};
      const user=profile.nickname.trim().toLowerCase()||'guest';
      localStorage.setItem(`sejong-smart-city-experience-v2:${user}`,JSON.stringify(result));
      window.dispatchEvent(new CustomEvent('sejong-profile-progress-updated',{detail:{mapId:'sejong-smart-city'}}));
      setShowResult(true);onNotice?.('오늘 체험한 세종 스마트 서비스를 프로필에 저장했어요.');
    },TRANSITION_MS);
    return()=>window.clearTimeout(timer);
  },[visited,profile.nickname,onNotice]);

  const choose=(id:SmartCityTechnologyId)=>{
    setSelected(id);setTransitionStarted(Date.now());setTransitionKey(value=>value+1);setProgress(0);
    setVisited(value=>value.includes(id)?value:[...value,id]);setShowResult(false);
  };

  if(!active)return null;
  return <>
    <div className="smart-city-wall-layer" style={wallLayerStyle}>
      {wallRects.city&&<article className="smart-city-wall-panel smart-city-wall-city" style={projectedStyle(wallRects.city,760,1000)}>
        <header><small>SEJONG SMART CITY</small><h2>세종 스마트시티란?</h2><p>도시 데이터를 연결해 시민의 일상을 더 안전하고 편리하게 만드는 미래도시입니다.</p></header>
        <dl>
          <div><dt>01</dt><dd><b>AI 데이터 허브</b><span>교통·환경·에너지 통합</span></dd></div>
          <div><dt>02</dt><dd><b>스마트 인프라</b><span>도시 상황을 실시간 감지</span></dd></div>
          <div><dt>03</dt><dd><b>시민 중심 서비스</b><span>생활 문제를 먼저 해결</span></dd></div>
          <div><dt>04</dt><dd><b>지속 가능한 도시</b><span>탄소와 에너지를 함께 관리</span></dd></div>
        </dl>
        <footer>행정수도에서 미래 생활도시로</footer>
      </article>}
      {wallRects.future&&<article className="smart-city-wall-panel smart-city-wall-side" style={projectedStyle(wallRects.future,390,1000)}>
        <header><small>FUTURE TECH</small><h2>세종의<br/>미래기술</h2></header>
        <dl>
          <div><dt><BusFront/></dt><dd><b>자율주행 BRT</b><span>전용도로·정류장 연결</span></dd></div>
          <div><dt><Plane/></dt><dd><b>UAM</b><span>버티포트와 하늘길</span></dd></div>
          <div><dt><Radio/></dt><dd><b>AI 교통관제</b><span>실시간 신호 최적화</span></dd></div>
        </dl>
        <footer>MOVE SMARTER</footer>
      </article>}
      {wallRects.connected&&<article className="smart-city-wall-panel smart-city-wall-side is-connected" style={projectedStyle(wallRects.connected,390,1000)}>
        <header><small>CONNECTED CITY</small><h2>데이터로<br/>연결된 세종</h2></header>
        <dl>
          <div><dt><Database/></dt><dd><b>디지털 트윈</b><span>도시 현황 실시간 분석</span></dd></div>
          <div><dt><Leaf/></dt><dd><b>스마트 에너지</b><span>태양광·ESS 연계</span></dd></div>
          <div><dt><HeartPulse/></dt><dd><b>스마트 헬스케어</b><span>병원·응급·AED 연결</span></dd></div>
        </dl>
        <footer>LIVE CITY DATA</footer>
      </article>}
    </div>
    {!open&&nearby&&<button type="button" className="smart-city-prompt is-nearby" onClick={()=>setOpen(true)}><kbd>E</kbd><span><b>미래 세종 체험하기</b><small>세종 스마트 서비스 6종</small></span></button>}
    {open&&<div className="smart-city-control-layer">
      {screenRect&&<section className="smart-city-table-ui" style={tableStyle(screenRect)} aria-label="중앙 테이블 스마트 서비스 선택" onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
        <header><span><Sparkles/><small>FUTURE SEJONG DIGITAL TWIN</small><b>스마트 서비스 선택</b></span><em>{visited.length} / 6</em></header>
        <nav aria-label="스마트 서비스 선택">{services.map(({id,label,icon:Icon})=><button type="button" className={selected===id?'active':''} key={id} onClick={()=>choose(id)}><span><Icon/></span><b>{label}</b>{visited.includes(id)&&<Check className="visited"/>}</button>)}</nav>
        <div className="smart-city-table-status"><span><b>{current.label}</b><small>{phases[phaseIndex]} · 정면 홀로그램과 벽면 설명을 확인하세요</small></span><em>{Math.round(progress*100)}%</em></div>
        <div className="smart-city-table-progress"><b style={{width:`${progress*100}%`}}/></div>
        <footer><span>👑 충녕이</span><p>{current.fact}</p><kbd>ESC</kbd></footer>
      </section>}
      {showResult&&<div className="city-result" role="dialog" aria-modal="true" aria-label="미래 세종 체험 결과"><span className="city-result-chungnyeong">👑</span><small>SMART SERVICE EXPERIENCE COMPLETE</small><h2>오늘 체험한 세종 스마트 서비스</h2><dl>{services.map(service=><div key={service.id}><dt>{service.label}</dt><dd>{visited.includes(service.id)?'✓ 체험 완료':'－'}</dd></div>)}</dl><p>“세종시는 앞으로 AI 행정과 스마트 교통을 중심으로 발전할 예정입니다.”</p><strong>체험 결과가 사용자 프로필에 저장되었습니다.</strong><button type="button" onClick={()=>setShowResult(false)}>홀로그램 도시 계속 보기</button></div>}
    </div>}
  </>;
}
