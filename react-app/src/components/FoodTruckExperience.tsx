import {useEffect,useMemo,useRef,useState} from 'react';
import {Armchair,Bookmark,Check,Clock,Coffee,Heart,Info,MapPin,MoreHorizontal,Search,Store,Utensils,X} from 'lucide-react';
import {sejongDiningCodeDessertPlaces,sejongDiningCodeRestaurantPlaces} from '../data/sejongDiningCodePlaces';
import {sejongLocalFoods} from '../data/sejongLocalFoods';
import {foodImageUrl,type FoodTruckId,type SejongFoodPlace} from '../data/sejongFoodTypes';
import {gameEvents} from '../game/events';
import {recordExperienceAction} from '../services/experienceHarness';
import {loadFoodSourcePreview} from '../services/foodSourcePreview';
import './FoodTruckExperience.css';
import './FoodTruckKiosk.css';
import './FoodTruckDetails.css';
import './FoodTruckLocalDetail.css';
import './FoodTruckResponsive.css';
import './FoodTruckRedesign.css';
import './FoodTruckEmbedded.css';

export type {FoodTruckId} from '../data/sejongFoodTypes';
type NearbyTruck={id:FoodTruckId;label:string}|null;
type Section='hours'|'price'|'origin'|'nearby';
type EmbeddedView={kind:'map'|'source';url:string;title:string;revision:number;html?:string;loading?:boolean;error?:string}|null;
type ScreenPoint={x:number;y:number};
type ScreenRect={left:number;top:number;width:number;height:number;quad?:readonly [ScreenPoint,ScreenPoint,ScreenPoint,ScreenPoint]};
type KioskStyle=React.CSSProperties&Record<string,string|number|undefined>;
const allItems=[...sejongDiningCodeRestaurantPlaces,...sejongLocalFoods,...sejongDiningCodeDessertPlaces].filter(item=>item.active);
const menus:Record<FoodTruckId,{eyebrow:string;title:string;description:string;button:string;color:string;emoji:string}>={
 local:{eyebrow:'DININGCODE SEJONG TOP 50',title:'세종 로컬 맛집',description:'세종의 오래된 맛과 든든한 한 끼를 만나는 로컬 맛집 안내입니다.',button:'맛집 둘러보기',color:'#d7a04a',emoji:'🍲'},
 street:{eyebrow:'SEJONG LOCAL SPECIALTIES',title:'세종 특산물 상점',description:'조치원 복숭아부터 세종의 재료로 만든 특별한 먹거리를 만나보세요.',button:'특산물 둘러보기',color:'#df8a4b',emoji:'🍑'},
 dessert:{eyebrow:'DININGCODE SEJONG TOP 50',title:'세종 카페 & 디저트',description:'세종의 분위기 좋은 카페와 베이커리, 달콤한 디저트를 만나보세요.',button:'카페 둘러보기',color:'#d7a04a',emoji:'☕'},
};
const SAVE_KEY='sejong-food-visit-candidates-v1',STAMP_KEY='sejong-food-stamps-v1';
const event=(type:string,item?:SejongFoodPlace,extra:Record<string,unknown>={})=>recordExperienceAction({type,truck:item?.truckId,itemId:item?.id,itemName:item?.name,menuName:item?.menuName,itemType:item?.itemType,categories:item?.category??[],tags:item?.tags??[],district:item?.district,timestamp:new Date().toISOString(),...extra});
const categoryIcon=(value:string)=>value.includes('카페')||value.includes('커피')?<Coffee/>:value.includes('베이커리')||value.includes('빵')?<Store/>:<Utensils/>;

export function FoodTruckExperience(){
 const [nearby,setNearby]=useState<NearbyTruck>(null),[active,setActive]=useState<FoodTruckId|null>(null),[selected,setSelected]=useState<SejongFoodPlace|null>(null);
 const [nearbySeat,setNearbySeat]=useState<{id:string;seated?:boolean}|null>(null);
 const [screenRect,setScreenRect]=useState<ScreenRect|null>(null),[search,setSearch]=useState(''),[filter,setFilter]=useState('전체');
 const [saved,setSaved]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)??'[]')}catch{return[]}});
 const [viewed,setViewed]=useState<Record<FoodTruckId,string[]>>({local:[],street:[],dessert:[]}),[sections,setSections]=useState<Record<FoodTruckId,string[]>>({local:[],street:[],dessert:[]});
 const [activeInfoSection,setActiveInfoSection]=useState<string|null>(null);
 const [embeddedView,setEmbeddedView]=useState<EmbeddedView>(null);
 const [stamps,setStamps]=useState<FoodTruckId[]>(()=>{try{return JSON.parse(localStorage.getItem(STAMP_KEY)??'[]')}catch{return[]}});
 const openedAt=useRef(0),itemOpenedAt=useRef(Date.now()),lastOpened=useRef(new Set<string>()),lastInteraction=useRef(Date.now()),sourceRequestId=useRef(0);
 useEffect(()=>{const changed=(truck:NearbyTruck)=>setNearby(truck);const seatChanged=(seat:{id:string;seated?:boolean}|null)=>setNearbySeat(seat);const mode=(id:FoodTruckId|null)=>{if(active&&!id)event('food_truck_exit',undefined,{truck:active,activeDurationSec:Math.round((Date.now()-openedAt.current)/1000)});setActive(id);setSelected(null);setSearch('');setFilter('전체');if(id){openedAt.current=Date.now();event('food_truck_enter',undefined,{truck:id})}};const rect=(value:typeof screenRect)=>setScreenRect(value);const key=(e:KeyboardEvent)=>{if(e.code==='KeyE'&&nearby&&!nearbySeat&&!active){e.preventDefault();gameEvents.emit('food-truck-kiosk-activate',nearby.id)}};gameEvents.on('food-truck-proximity-changed',changed);gameEvents.on('food-seat-proximity-changed',seatChanged);gameEvents.on('food-truck-kiosk-mode-changed',mode);gameEvents.on('food-truck-kiosk-screen-rect',rect);window.addEventListener('keydown',key);return()=>{gameEvents.off('food-truck-proximity-changed',changed);gameEvents.off('food-seat-proximity-changed',seatChanged);gameEvents.off('food-truck-kiosk-mode-changed',mode);gameEvents.off('food-truck-kiosk-screen-rect',rect);window.removeEventListener('keydown',key)}},[nearby,nearbySeat,active]);
 useEffect(()=>{if(!active)return;gameEvents.emit('game-input-lock',true);return()=>{gameEvents.emit('game-input-lock',false)}},[active]);
 const items=useMemo(()=>allItems.filter(item=>item.truckId===active&&(`${item.name} ${item.menuName} ${item.tags.join(' ')}`).toLowerCase().includes(search.toLowerCase())&&(filter==='전체'||item.category.includes(filter)||item.tags.includes(filter))),[active,search,filter]);
 const filters=useMemo(()=>['전체',...new Set(allItems.filter(i=>i.truckId===active).flatMap(i=>i.category))].slice(0,8),[active]);
 const menu=active?menus[active]:null;
 // The kiosk camera is aligned perpendicular to the authored service window,
 // so its projected rectangle is already the exact usable screen. Applying a
 // second perspective matrix here caused skewing after the GLB was replaced.
 const kioskScreenStyle:KioskStyle|null=screenRect?{
  '--truck-color':menu?.color,
  '--kiosk-left':`${screenRect.left+screenRect.width*.015}px`,
  '--kiosk-top':`${screenRect.top+screenRect.height*.02}px`,
  '--kiosk-width':`${screenRect.width*.97}px`,
  '--kiosk-height':`${screenRect.height*.96}px`,
 }:null;
 const markSection=(section:Section)=>{if(!selected)return;lastInteraction.current=Date.now();setSections(current=>({...current,[selected.truckId]:[...new Set([...current[selected.truckId],section])]}));event(section==='hours'?'food_hours_open':section==='price'?'food_price_open':section==='origin'?'food_origin_open':'food_nearby_place_open',selected)};
 const markInfoSection=(section:string)=>{if(!selected)return;lastInteraction.current=Date.now();setActiveInfoSection(section);setSections(current=>({...current,[selected.truckId]:[...new Set([...current[selected.truckId],section])]}));event('food_section_open',selected,{section})};
 const openItem=(item:SejongFoodPlace)=>{const reopened=lastOpened.current.has(item.id);lastOpened.current.add(item.id);itemOpenedAt.current=Date.now();lastInteraction.current=Date.now();setActiveInfoSection(item.infoSections?.[0]?.id??null);setSelected(item);setViewed(current=>({...current,[item.truckId]:[...new Set([...current[item.truckId],item.id])]}));event(reopened?'food_reopen':'food_card_open',item)};
 const closeEmbedded=()=>{sourceRequestId.current+=1;setEmbeddedView(null)};
 const closeItem=()=>{if(selected)event('food_card_close',selected,{activeDurationSec:Math.round((Date.now()-itemOpenedAt.current)/1000)});setSelected(null);setActiveInfoSection(null);closeEmbedded()};
 const openEmbedded=(kind:'map'|'source')=>{
  if(!selected)return;
  const url=kind==='map'?selected.mapUrl:selected.sourceUrl;
  if(!url)return;
  const revision=Date.now();
  if(kind==='map'){
   sourceRequestId.current+=1;
   markSection('nearby');event('food_map_open',selected);
   setEmbeddedView({kind,url,title:`${selected.name} 지도`,revision});
   return;
  }
  const requestId=sourceRequestId.current+1;
  sourceRequestId.current=requestId;
  setEmbeddedView({kind,url,title:`${selected.name} 정보 출처`,revision,loading:true});
  void loadFoodSourcePreview(url).then(preview=>{
   if(sourceRequestId.current!==requestId)return;
   setEmbeddedView(current=>current?.kind==='source'&&current.url===url?{...current,url:preview.sourceUrl,html:preview.html,loading:false}:current);
  }).catch(error=>{
   if(sourceRequestId.current!==requestId)return;
   setEmbeddedView(current=>current?.kind==='source'&&current.url===url?{...current,loading:false,error:error instanceof Error?error.message:'원본 페이지를 불러오지 못했어요.'}:current);
  });
 };
 const toggleSave=(item:SejongFoodPlace)=>{const removing=saved.includes(item.id),next=removing?saved.filter(id=>id!==item.id):[...saved,item.id];setSaved(next);localStorage.setItem(SAVE_KEY,JSON.stringify(next));event(removing?'food_unsave':'food_save',item);window.dispatchEvent(new CustomEvent('sejong-food-taste-updated',{detail:{itemId:item.id,saved:!removing}}))};
 useEffect(()=>{(['local','street','dessert'] as FoodTruckId[]).forEach(id=>{if(stamps.includes(id)||viewed[id].length<3||sections[id].length<2)return;const qualifies=viewed[id].some(itemId=>saved.includes(itemId))||sections[id].some(s=>['hours','origin','nearby'].includes(s));if(!qualifies)return;const next=[...stamps,id];setStamps(next);localStorage.setItem(STAMP_KEY,JSON.stringify(next));event('food_truck_complete',undefined,{truck:id});if(next.length===3)gameEvents.emit('experience-analysis-request')})},[viewed,sections,saved,stamps]);
 return <>
  {active&&<div className="food-truck-kiosk-active-marker" aria-hidden="true"/>}
  {nearbySeat&&!active?<button type="button" className="food-truck-prompt food-seat-prompt" onClick={()=>gameEvents.emit('food-seat-toggle')}><span><Armchair size={21}/></span><div><small>먹거리 부스 휴식 공간</small><b>{nearbySeat.seated?'의자에서 일어나기':'의자에 앉기'}</b><em>E 키를 눌러 이용하세요</em></div><kbd>E</kbd></button>:nearby&&!active&&<button type="button" className="food-truck-prompt" onClick={()=>gameEvents.emit('food-truck-kiosk-activate',nearby.id)}><span>{menus[nearby.id].emoji}</span><div><small>세종 먹거리 안내</small><b>{menus[nearby.id].title}</b><em>{menus[nearby.id].button}</em></div><kbd>E</kbd></button>}
   {menu&&kioskScreenStyle&&<div className="food-truck-overlay is-kiosk is-in-world" role="dialog" aria-modal="true" aria-label={menu.title}><section className="food-truck-menu" style={kioskScreenStyle}>
   <header><span>{menu.emoji}</span><div><small>{menu.eyebrow}</small><h2>{menu.title}</h2><p>{menu.description}</p></div><div className="food-header-actions"><button type="button" aria-label="저장한 장소 보기"><Bookmark/></button><button type="button" aria-label="관심 장소 보기"><Heart/></button><button type="button" aria-label="메뉴 더 보기"><MoreHorizontal/></button><button type="button" onClick={()=>gameEvents.emit('food-truck-kiosk-close')} aria-label="닫기"><X/></button></div></header>
   <div className="food-tools"><label><Search/><input value={search} onChange={e=>{setSearch(e.target.value);event('food_search',undefined,{truck:active,query:e.target.value.slice(0,50)})}} placeholder="메뉴 · 지역 · 태그 검색"/></label><nav>{filters.map(value=><button className={filter===value?'active':''} key={value} onClick={()=>{setFilter(value);event('food_filter_apply',undefined,{truck:active,categories:value==='전체'?[]:[value]})}}>{categoryIcon(value)}{value}</button>)}</nav></div>
   <div className="food-results"><span><b>{filter}</b>에서 {items.length}곳</span><small>카드를 선택하면 매장 정보를 볼 수 있어요.</small></div>
   <div className="food-truck-menu-grid">{items.map((item,index)=><article key={item.id}><button className="food-card-main" onClick={()=>openItem(item)}><div className="food-card-photo"><span className="food-rank">{String(index+1).padStart(2,'0')}</span>{item.imageUrl?<img src={foodImageUrl(item.imageUrl,import.meta.env.BASE_URL)} alt={`${item.menuName} 대표 메뉴 이미지`}/>:<div className="food-truck-fallback">{menu.emoji}</div>}</div><section><small>{item.category.slice(0,2).join(' · ')}</small><h3>{item.name}</h3><b>{item.menuName}</b><em><MapPin/>{item.district}</em></section></button><button className={`food-save ${saved.includes(item.id)?'saved':''}`} onClick={()=>toggleSave(item)} aria-label={`${item.name} ${saved.includes(item.id)?'저장 취소':'저장'}`}>{saved.includes(item.id)?<Check/>:<Bookmark/>}</button></article>)}</div>
   {!items.length&&<div className="food-empty"><Search/><b>검색 결과가 없어요</b><span>다른 메뉴나 지역으로 검색해 보세요.</span></div>}
   <footer><MapPin/><span><b>저장한 장소, 지도에서 둘러보기</b><small>마음에 드는 세종 맛집을 저장해 나만의 코스를 만들어 보세요.</small></span><strong>저장 {saved.length}</strong></footer>
  </section></div>}
  {selected?.infoSections&&<div className="food-detail-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeItem()}}><section className="food-place-detail food-local-detail" role="dialog" aria-modal="true" aria-labelledby="food-local-title"><button className="food-truck-close" onClick={closeItem}><X/></button><img src={foodImageUrl(selected.imageUrl,import.meta.env.BASE_URL)} alt={`${selected.name} 대표 이미지`}/><div className="food-place-copy"><small>{selected.sourceLabel} · {selected.verifiedAt} 확인</small><h2 id="food-local-title">{selected.name}</h2><h3>{selected.menuName}</h3><p>{selected.description}</p><div className="food-local-section-tabs">{selected.infoSections.map(section=><button key={section.id} className={activeInfoSection===section.id?'active':''} onClick={()=>markInfoSection(section.id)}>{section.title}</button>)}</div>{selected.infoSections.filter(section=>section.id===(activeInfoSection??selected.infoSections?.[0]?.id)).map(section=><article className="food-local-section" key={section.id}><Info size={18}/><div><h4>{section.title}</h4><p>{section.content}</p></div></article>)}<div className="food-place-links"><button onClick={()=>openEmbedded('map')}>지도 보기</button><button onClick={()=>openEmbedded('source')}>공식 자료 확인</button><button onClick={()=>toggleSave(selected)}>{saved.includes(selected.id)?'관심 저장 취소':'관심 저장'}</button></div></div></section></div>}
  {selected&&<div className="food-detail-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeItem()}}><section className="food-place-detail" role="dialog" aria-modal="true" aria-labelledby="food-place-title"><button className="food-truck-close" onClick={closeItem}><X/></button><img src={foodImageUrl(selected.imageUrl,import.meta.env.BASE_URL)} alt={`${selected.name} 대표 이미지`}/><div className="food-place-copy"><small>{selected.sourceLabel} · {selected.verifiedAt} 확인</small><h2 id="food-place-title">{selected.name}</h2><h3>{selected.menuName}</h3><p>{selected.description}</p><div className="food-detail-actions"><button onClick={()=>markSection('hours')}><Clock/> 영업시간</button><button onClick={()=>markSection('price')}>₩ 가격대</button>{selected.origin&&<button onClick={()=>markSection('origin')}><Info/> 원산지</button>}<button onClick={()=>markSection('nearby')}><MapPin/> 주변 명소</button></div><dl><div><dt>주소</dt><dd>{selected.address}</dd></div><div><dt>영업</dt><dd>{selected.openingHours} · {selected.closedDays}</dd></div><div><dt>가격</dt><dd>{selected.priceRange}</dd></div>{selected.origin&&<div><dt>생산·원산지</dt><dd>{selected.origin}</dd></div>}<div><dt>주변</dt><dd>{selected.nearbyPlaces.join(' · ')}</dd></div></dl><div className="food-place-links"><button onClick={()=>openEmbedded('map')}>지도 보기</button><button onClick={()=>openEmbedded('source')}>출처 확인</button><button onClick={()=>toggleSave(selected)}>{saved.includes(selected.id)?'저장 취소':'방문 후보 저장'}</button></div><p className="food-verification-note">영업시간·가격·메뉴는 바뀔 수 있으니 방문 전에 매장 또는 지도에서 다시 확인하세요.</p></div></section></div>}
  {embeddedView&&selected&&<div className="food-embedded-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeEmbedded()}}>
   <section className="food-embedded-viewer" role="dialog" aria-modal="true" aria-labelledby="food-embedded-title">
    <header><div><small>{embeddedView.kind==='map'?'KAKAO MAP':'SOURCE WEB'}</small><h2 id="food-embedded-title">{embeddedView.title}</h2></div><nav><button className={embeddedView.kind==='map'?'active':''} onClick={()=>openEmbedded('map')}>지도 보기</button><button className={embeddedView.kind==='source'?'active':''} onClick={()=>openEmbedded('source')}>출처 확인</button><button className="food-embedded-close" onClick={closeEmbedded} aria-label="내장 보기 닫기"><X/></button></nav></header>
    <div className="food-embedded-content">{embeddedView.kind==='map'
     ?<div className="food-internal-map"><iframe key={embeddedView.revision} className="food-kakao-map-frame" src={selected.mapUrl} title={`${selected.name} 카카오맵 위치`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/><aside><small>카카오맵 위치</small><h3>{selected.name}</h3><p><MapPin/>{selected.address}</p><dl><div><dt>지역</dt><dd>{selected.district}</dd></div><div><dt>주변</dt><dd>{selected.nearbyPlaces.join(' · ')}</dd></div></dl><p className="food-map-notice">카카오맵 검색 결과를 먹거리 부스 HTML 안에서 확인하고 있습니다.</p></aside></div>
     :embeddedView.loading
      ?<div className="food-source-web-state"><span className="food-source-web-spinner"/><b>원본 페이지를 불러오는 중이에요</b><p>{selected.sourceLabel}의 현재 웹 문서를 안전하게 준비하고 있습니다.</p></div>
      :embeddedView.error
       ?<div className="food-source-web-state is-error"><Info/><b>원본 페이지를 불러오지 못했어요</b><p>{embeddedView.error}</p><button type="button" onClick={()=>openEmbedded('source')}>다시 시도</button></div>
       :<iframe key={embeddedView.revision} className="food-source-web-frame" srcDoc={embeddedView.html} sandbox="" title={`${selected.name} 원본 페이지`} referrerPolicy="no-referrer"/>}
    </div>
    <footer><span>외부 탭으로 이동하지 않고 먹거리 부스 HTML 안에서 확인합니다.</span><button type="button" onClick={()=>openEmbedded(embeddedView.kind)}>{embeddedView.kind==='map'?'카카오맵 현재 화면에서 보기':'원본 페이지 현재 화면에서 보기'}</button></footer>
   </section>
  </div>}
  {stamps.length===3&&<aside className="food-complete-toast"><b>세종 미식 스탬프 3개 완료!</b><span>세종 미식 탐험가 배지와 먹거리 취향 프로필이 생성됐어요.</span></aside>}
 </>;
}
