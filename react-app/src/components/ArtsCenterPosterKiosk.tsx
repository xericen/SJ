import {useEffect,useState} from 'react';
import {Heart,Play,X} from 'lucide-react';
import {ARTS_CENTER_PERFORMANCES} from '../game/artsCenterPerformances';
import {gameEvents} from '../game/events';
import {recordExperienceAction} from '../services/experienceHarness';
import './ArtsCenterPosterKiosk.css';

type PosterFocus={active:boolean;index:number;ready:boolean;posterDataUrl?:string};
type PosterRect={left:number;top:number;width:number;height:number};

export function ArtsCenterPosterKiosk(){
  const [focus,setFocus]=useState<PosterFocus>({active:false,index:0,ready:false});
  const [rect,setRect]=useState<PosterRect|null>(null);
  const [favorites,setFavorites]=useState<number[]>(()=>{try{return JSON.parse(localStorage.getItem('sejong-arts-center-favorites-v1')??'[]') as number[]}catch{return []}});
  useEffect(()=>{
    const changed=(next:PosterFocus)=>{setFocus(next);if(!next.active)setRect(null)};
    const rectChanged=(next:PosterRect|null)=>setRect(next);
    gameEvents.on('arts-center-poster-focus-mode-changed',changed);
    gameEvents.on('arts-center-poster-screen-rect',rectChanged);
    return()=>{gameEvents.off('arts-center-poster-focus-mode-changed',changed);gameEvents.off('arts-center-poster-screen-rect',rectChanged)};
  },[]);
  if(!focus.active)return null;
  const performance=ARTS_CENTER_PERFORMANCES[Math.max(0,Math.min(ARTS_CENTER_PERFORMANCES.length-1,focus.index))];
  const closePoster=(event:React.MouseEvent<HTMLButtonElement>)=>{
    event.preventDefault();
    event.stopPropagation();
    setFocus(current=>({...current,active:false,ready:false}));
    gameEvents.emit('arts-center-poster-focus-close');
  };
  const selectVideo=(event:React.MouseEvent<HTMLButtonElement>)=>{
    gameEvents.emit('arts-center-video-select',{index:focus.index});
    closePoster(event);
  };
  const toggleFavorite=()=>{
    const saved=favorites.includes(focus.index),next=saved?favorites.filter(index=>index!==focus.index):[...favorites,focus.index];
    setFavorites(next);localStorage.setItem('sejong-arts-center-favorites-v1',JSON.stringify(next));
    recordExperienceAction({type:'favorite',performanceId:String(focus.index),saved:!saved});
  };
  const saved=favorites.includes(focus.index);
  return <div className="arts-center-poster-object-mode" role="dialog" aria-modal="true" aria-label={`${performance.title} 오브젝트 인터랙션`}>
    {focus.ready&&rect&&focus.posterDataUrl&&<article className="arts-center-html-poster" style={{left:rect.left,top:rect.top,width:rect.width,height:rect.height}}>
      <img src={focus.posterDataUrl} alt={`${performance.title} 공연 포스터`} draggable={false}/>
      <button className="arts-center-poster-close" type="button" onClick={closePoster} aria-label="포스터 닫기"><X/></button>
      <button className="arts-center-poster-watch" type="button" onClick={selectVideo}><Play fill="currentColor"/>영상 선택</button>
      <button className="arts-center-poster-favorite" type="button" onClick={toggleFavorite} aria-pressed={saved} aria-label={saved?'관심 공연 저장됨':'관심 공연으로 저장'}><Heart/>관심 있어요</button>
    </article>}
  </div>;
}
