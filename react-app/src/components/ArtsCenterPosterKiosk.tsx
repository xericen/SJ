import {useEffect,useState} from 'react';
import {ArrowLeft,Check,Heart,Info,Play,X} from 'lucide-react';
import {ARTS_CENTER_FAVORITES_STORAGE_KEY,parseArtsCenterFavorites,toggleArtsCenterFavorite} from '../game/artsCenterFavorites';
import {ARTS_CENTER_PERFORMANCES} from '../game/artsCenterPerformances';
import {gameEvents} from '../game/events';
import {loadPerformanceSourcePreview} from '../services/foodSourcePreview';
import {recordExperienceAction} from '../services/experienceHarness';
import './ArtsCenterPosterKiosk.css';

type PosterFocus={active:boolean;index:number;ready:boolean;posterDataUrl?:string};
type PosterRect={left:number;top:number;width:number;height:number};
type DetailPreview={html?:string;loading:boolean;error?:string}|null;

export function ArtsCenterPosterKiosk(){
  const [focus,setFocus]=useState<PosterFocus>({active:false,index:0,ready:false});
  const [rect,setRect]=useState<PosterRect|null>(null);
  const [detailOpen,setDetailOpen]=useState(false);
  const [detailPreview,setDetailPreview]=useState<DetailPreview>(null);
  const [favorites,setFavorites]=useState<number[]>(()=>parseArtsCenterFavorites(localStorage.getItem(ARTS_CENTER_FAVORITES_STORAGE_KEY)));
  useEffect(()=>{
    const changed=(next:PosterFocus)=>{setFocus(next);setDetailOpen(false);setDetailPreview(null);if(!next.active)setRect(null)};
    const rectChanged=(next:PosterRect|null)=>setRect(next);
    gameEvents.on('arts-center-poster-focus-mode-changed',changed);
    gameEvents.on('arts-center-poster-screen-rect',rectChanged);
    return()=>{gameEvents.off('arts-center-poster-focus-mode-changed',changed);gameEvents.off('arts-center-poster-screen-rect',rectChanged)};
  },[]);
  const performance=ARTS_CENTER_PERFORMANCES[Math.max(0,Math.min(ARTS_CENTER_PERFORMANCES.length-1,focus.index))];
  useEffect(()=>{
    if(!detailOpen){setDetailPreview(null);return}
    let active=true;
    setDetailPreview({loading:true});
    void loadPerformanceSourcePreview(performance.detailUrl).then(preview=>{
      if(active)setDetailPreview({loading:false,html:preview.html});
    }).catch(error=>{
      if(active)setDetailPreview({loading:false,error:error instanceof Error?error.message:'공연 상세 정보를 불러오지 못했어요.'});
    });
    return()=>{active=false};
  },[detailOpen,performance.detailUrl]);
  if(!focus.active)return null;
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
  const stopPointer=(event:React.PointerEvent<HTMLElement>)=>event.stopPropagation();
  const toggleFavorite=(event:React.MouseEvent<HTMLButtonElement>)=>{
    event.preventDefault();event.stopPropagation();
    const wasSaved=favorites.includes(focus.index),next=toggleArtsCenterFavorite(favorites,focus.index);
    setFavorites(next);
    try{localStorage.setItem(ARTS_CENTER_FAVORITES_STORAGE_KEY,JSON.stringify(next))}catch{/* UI state remains available when storage is blocked. */}
    recordExperienceAction({type:'favorite',performanceId:String(focus.index),saved:!wasSaved});
  };
  const openDetail=(event:React.MouseEvent<HTMLButtonElement>)=>{event.preventDefault();event.stopPropagation();setDetailOpen(true)};
  const saved=favorites.includes(focus.index);
  return <div className="arts-center-poster-object-mode" role="dialog" aria-modal="true" aria-label={`${performance.title} 오브젝트 인터랙션`}>
    {focus.ready&&rect&&focus.posterDataUrl&&<article className="arts-center-html-poster" style={{left:rect.left,top:rect.top,width:rect.width,height:rect.height}}>
      {!detailOpen&&<>
        <img src={focus.posterDataUrl} alt={`${performance.title} 공연 포스터`} draggable={false}/>
        <button className="arts-center-poster-close" type="button" onPointerDown={stopPointer} onClick={closePoster} aria-label="포스터 닫기"><X/></button>
        <button className="arts-center-poster-watch" type="button" onPointerDown={stopPointer} onClick={selectVideo}><Play fill="currentColor"/>영상 선택</button>
        <button className="arts-center-poster-favorite" type="button" onPointerDown={stopPointer} onClick={toggleFavorite} aria-pressed={saved}>{saved?<><Check/>관심 저장됨</>:<><Heart/>관심 있어요</>}</button>
        <button className="arts-center-poster-detail" type="button" onPointerDown={stopPointer} onClick={openDetail}><Info/>자세히 보기</button>
      </>}
      {detailOpen&&<section className="arts-center-poster-web-detail">
        <header>
          <button type="button" onPointerDown={stopPointer} onClick={()=>setDetailOpen(false)}><ArrowLeft/>포스터</button>
          <strong>자세히 보기</strong>
          <button type="button" className="arts-center-web-detail-close" onPointerDown={stopPointer} onClick={closePoster} aria-label="상세 화면 닫기"><X/></button>
        </header>
        {detailPreview?.loading
          ?<div className="arts-center-web-detail-state"><span/><b>공식 공연 정보를 준비하고 있어요</b></div>
          :detailPreview?.error
            ?<div className="arts-center-web-detail-state is-error"><Info/><b>공연 정보를 불러오지 못했어요</b><p>{detailPreview.error}</p></div>
            :<iframe srcDoc={detailPreview?.html} sandbox="" title={`${performance.title} 공식 상세 페이지`} referrerPolicy="no-referrer"/>}
      </section>}
    </article>}
  </div>;
}
