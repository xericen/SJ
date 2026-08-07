import {useEffect,useMemo,useRef,useState} from 'react';
import type {MapId} from '../../shared/socket-events';
import {
  BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,GARDEN_PLANTABLE_FLOWER_IDS,
  type BearFeedSpotId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../shared/personal-farm';
import {flowerCatalogByFlowerId,flowerCatalogByPlantId} from '../services/flowerInterestProfile';
import {gameEvents} from '../game/events';
import {
  PERSONAL_FARM_PROGRESS_CHANGED,completeBearFeedSpot,feedBear,getCachedPersonalFarmProgress,
  personalFarmErrorMessage,plantGardenFlower,removeGardenFlower,refreshPersonalFarmProgress,setPersonalFarmProgressUser,type PersonalFarmApiError,
} from '../services/personalFarmApi';
import './PersonalFarmProgressExperience.css';
import './PersonalFarmGuide.css';

const plantName=(id:GardenFlowerId)=>flowerCatalogByFlowerId.get(id)?.displayName??id;

export function PersonalFarmProgressExperience({mapId,userKey,authenticated,onNotice}:{mapId:MapId;userKey:string;authenticated:boolean;onNotice?:(message:string)=>void}){
  setPersonalFarmProgressUser(userKey);
  const [progress,setProgress]=useState<PersonalFarmProgressDto|undefined>(()=>getCachedPersonalFarmProgress());
  const [feedSpot,setFeedSpot]=useState<BearFeedSpotId|null>(null),[bearNearby,setBearNearby]=useState(false),[farmAnchor,setFarmAnchor]=useState(false),[farmDoor,setFarmDoor]=useState<{inside:boolean}|null>(null),[farmFlower,setFarmFlower]=useState<GardenFlowerId|null>(null);
  const [selectedFlower,setSelectedFlower]=useState<GardenFlowerId|''>(''),[pending,setPending]=useState<string>(),[error,setError]=useState('');
  const userRef=useRef(userKey),reportedLoadErrorRef=useRef(''),previousProgressRef=useRef<PersonalFarmProgressDto|undefined>(undefined);
  const availableToPlant=useMemo(()=>progress?.gardenMission.collectedFlowerIds.filter(id=>(GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(id)&&!progress.gardenMission.plantedFlowerIds.includes(id))??[],[progress]);

  useEffect(()=>{
    const previous=previousProgressRef.current;
    if(progress&&previous){
      if(!previous.bearMission.completed&&progress.bearMission.completed)onNotice?.('곰 체험소 먹이 미션 완료! 마이홈에 곰 동상이 추가되었습니다.');
      if(!previous.gardenMission.interestCompleted&&progress.gardenMission.interestCompleted)onNotice?.('수목원 미션 완료! 마이홈 화단에 식물을 심을 수 있습니다.');
      if(!previous.natureChapter.completed&&progress.natureChapter.completed)onNotice?.('자연 체험을 모두 완료했습니다. 마이홈 보상이 준비되었습니다.');
    }
    previousProgressRef.current=progress;
  },[onNotice,progress]);

  useEffect(()=>{
    if(userRef.current!==userKey){userRef.current=userKey;previousProgressRef.current=undefined;setProgress(undefined)}
    let active=true;setError('');
    void refreshPersonalFarmProgress().then(value=>{if(active){reportedLoadErrorRef.current='';setProgress(value)}}).catch(reason=>{if(active){const message=personalFarmErrorMessage(reason);if(reportedLoadErrorRef.current!==message){reportedLoadErrorRef.current=message;setError(message)}}});
    const changed=(event:Event)=>{const detail=(event as CustomEvent<PersonalFarmProgressDto>).detail;if(detail)setProgress(detail)};
    window.addEventListener(PERSONAL_FARM_PROGRESS_CHANGED,changed);
    window.addEventListener('personal-farm-progress-refresh',changed);
    return()=>{active=false;window.removeEventListener(PERSONAL_FARM_PROGRESS_CHANGED,changed);window.removeEventListener('personal-farm-progress-refresh',changed)};
  },[authenticated,userKey]);

  useEffect(()=>{
    const spot=(id:BearFeedSpotId|null)=>setFeedSpot(id),bear=(nearby:boolean)=>setBearNearby(nearby),anchor=(nearby:boolean)=>setFarmAnchor(nearby),door=(value:{inside:boolean}|null)=>setFarmDoor(value),planted=(value:GardenFlowerId|null)=>setFarmFlower(value);
    gameEvents.on('bear-feed-spot-proximity-changed',spot);gameEvents.on('bear-feeding-proximity-changed',bear);gameEvents.on('personal-farm-plant-anchor-proximity-changed',anchor);gameEvents.on('personal-farm-door-proximity-changed',door);gameEvents.on('personal-farm-flower-proximity-changed',planted);
    return()=>{gameEvents.off('bear-feed-spot-proximity-changed',spot);gameEvents.off('bear-feeding-proximity-changed',bear);gameEvents.off('personal-farm-plant-anchor-proximity-changed',anchor);gameEvents.off('personal-farm-door-proximity-changed',door);gameEvents.off('personal-farm-flower-proximity-changed',planted)};
  },[]);
  useEffect(()=>{const locked=()=>{const message='마이홈은 수목원과 베어트리파크 미션 결과에 따라 꾸며집니다.';setError(message);onNotice?.(message)};gameEvents.on('personal-farm-locked',locked);gameEvents.on('personal-farm-login-required',locked);return()=>{gameEvents.off('personal-farm-locked',locked);gameEvents.off('personal-farm-login-required',locked)}},[onNotice]);

  const run=async(key:string,operation:()=>Promise<PersonalFarmProgressDto>,success:string|((next:PersonalFarmProgressDto)=>string))=>{if(pending)return;setPending(key);setError('');try{const next=await operation();setProgress(next);onNotice?.(typeof success==='function'?success(next):success)}catch(reason){const message=personalFarmErrorMessage(reason as PersonalFarmApiError);setError(message);onNotice?.(message)}finally{setPending(undefined)}};
  const pickup=feedSpot?BEAR_FEED_PICKUPS[feedSpot]:undefined;
  const flowerBedFull=(progress?.gardenMission.plantedFlowerIds.length??0)>=5;
  const spotDone=feedSpot?progress?.bearMission.completedFeedSpotIds.includes(feedSpot):false;
  const pickedFeedCount=progress?.bearMission.completedFeedSpotIds.length??0;
  const fedFeedCount=progress?.bearMission.fedFeedSpotIds.length??0;
  const hasPendingFeed=pickedFeedCount>fedFeedCount;
  const canPickUpFeed=!hasPendingFeed&&!progress?.bearMission.bearFed;
  const canFeedBear=mapId==='bear-play-zone'&&bearNearby&&hasPendingFeed&&!progress?.bearMission.bearFed;
  const feedSuccess=(next:PersonalFarmProgressDto)=>next.bearMission.completed
    ?'다섯 번 급여 완료! 마이홈에 곰 동상이 세워졌어요.'
    :`곰에게 먹이를 줬어요. (${next.bearMission.fedFeedSpotIds.length}/${BEAR_FEED_SPOT_IDS.length})`;

  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.defaultPrevented||event.key.toLowerCase()!=='e'||event.repeat||pending)return;
      const focused=document.activeElement;if(focused instanceof HTMLInputElement||focused instanceof HTMLTextAreaElement||focused instanceof HTMLSelectElement)return;
      if(canFeedBear){event.preventDefault();void run('bear-feed',feedBear,feedSuccess);return}
      if(mapId==='bear-play-zone'&&feedSpot&&pickup&&!spotDone&&canPickUpFeed){event.preventDefault();void run(`spot:${feedSpot}`,()=>completeBearFeedSpot(feedSpot),`${pickup.name}을(를) 주웠어요. 곰에게 가져다주세요.`);return}
      if(mapId==='personal-farm'&&farmAnchor&&!farmDoor&&!farmFlower&&!flowerBedFull&&selectedFlower){event.preventDefault();void run(`plant:${selectedFlower}`,()=>plantGardenFlower(selectedFlower),`${plantName(selectedFlower)}을(를) 마이홈에 심었어요.`).then(()=>setSelectedFlower(''))}
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[authenticated,canFeedBear,canPickUpFeed,farmAnchor,farmDoor,farmFlower,feedSpot,flowerBedFull,mapId,pending,pickup,selectedFlower,spotDone]);

  return <div className="personal-farm-mission-ui" aria-live="polite">
    {mapId==='personal-farm'&&!farmDoor&&!farmAnchor&&<aside className="personal-farm-guide-card"><span>🏡</span><div><b>마이홈과 작은 화단</b><small>현관 앞에서 E키를 누르면 집 안에 들어갑니다. 수목원에서 꽃을 채집한 뒤 집 앞 5칸 화단에 원하는 꽃을 심을 수 있어요.</small></div></aside>}
    {mapId==='personal-farm'&&farmFlower&&!farmDoor&&<section className="personal-farm-action-card farm-remove-card"><span>✂️</span><div><small>심어진 꽃</small><b>{plantName(farmFlower)} 제거하기</b></div><button type="button" disabled={!!pending} onClick={()=>void run(`remove:${farmFlower}`,()=>removeGardenFlower(farmFlower),`${plantName(farmFlower)}을(를) 화단에서 제거했어요.`)}>{pending===`remove:${farmFlower}`?'제거 중…':'제거'}</button></section>}
    {mapId==='bear-play-zone'&&bearNearby&&<section className="personal-farm-action-card"><span>🐻</span><div><small>곰 체험소 가상 먹이 체험 · 급여 {fedFeedCount}/5</small><b>{progress?.bearMission.bearFed?'급여 완료! 마이홈에 곰 동상이 추가됐어요.':canFeedBear?'곰들이 먹이를 기다리고 있어요':'길가에서 먹이를 하나 찾아 주세요'}</b></div><button type="button" disabled={!canFeedBear||!!pending} onClick={()=>void run('bear-feed',feedBear,feedSuccess)}>{pending==='bear-feed'?'처리 중…':progress?.bearMission.bearFed?'완료':'E · 곰에게 먹이 주기'}</button></section>}
    {error&&<button type="button" className="personal-farm-api-error" onClick={()=>setError('')}>{error}</button>}
    {!authenticated&&mapId!=='personal-farm'&&feedSpot&&<aside className="personal-farm-guest-note">게스트 진행도는 현재 접속 중에만 유지됩니다.</aside>}
    {mapId==='bear-play-zone'&&feedSpot&&pickup&&<section className="personal-farm-action-card"><span>{pickup.emoji}</span><div><small>길가에 떨어진 곰 먹이</small><b>{spotDone?'주운 먹이':hasPendingFeed?'먼저 곰에게 전달해 주세요':`${pickup.name} 줍기`}</b></div><button type="button" disabled={!!spotDone||!canPickUpFeed||!!pending} onClick={()=>void run(`spot:${feedSpot}`,()=>completeBearFeedSpot(feedSpot),`${pickup.name}을(를) 주웠어요. 곰에게 가져다주세요.`)}>{pending===`spot:${feedSpot}`?'저장 중…':spotDone?'완료':hasPendingFeed?'전달 대기':'E · 줍기'}</button></section>}
    {mapId==='bear-play-zone'&&!feedSpot&&!bearNearby&&progress&&<aside className="personal-farm-reward-status"><b>곰 먹이 체험</b><span>급여 {fedFeedCount}/{BEAR_FEED_SPOT_IDS.length}</span><em>{progress.bearMission.bearFed?'급여 완료 · 마이홈에 곰 동상이 추가됐어요':hasPendingFeed?'곰에게 가져다주세요':'길을 따라 먹이를 하나 찾아보세요'}</em></aside>}
    {mapId==='personal-farm'&&farmAnchor&&!farmFlower&&<section className="personal-farm-action-card farm-plant-card"><span>🌱</span><div><small>집 앞 5칸 화단</small><b>{flowerBedFull?'화단이 가득 찼어요. 꽃 앞에서 먼저 제거해 주세요.':'수집한 꽃 심기'}</b><select disabled={flowerBedFull} value={selectedFlower} onChange={event=>setSelectedFlower(event.target.value as GardenFlowerId|'')}><option value="">{flowerBedFull?'빈 칸이 필요합니다':'심을 꽃 선택'}</option>{availableToPlant.map(id=><option value={id} key={id}>{plantName(id)}</option>)}</select></div><button type="button" disabled={flowerBedFull||!selectedFlower||!!pending} onClick={()=>selectedFlower&&void run(`plant:${selectedFlower}`,()=>plantGardenFlower(selectedFlower),`${plantName(selectedFlower)}을(를) 마이홈에 심었어요.`).then(()=>setSelectedFlower(''))}>{pending?.startsWith('plant:')?'저장 중…':'E · 꽃 심기'}</button></section>}
    {mapId==='personal-farm'&&progress&&<aside className="personal-farm-reward-status"><b>정원 현황</b><span>꽃 {progress.gardenMission.plantedFlowerIds.length}/5</span><span>곰 급여 {fedFeedCount}/{BEAR_FEED_SPOT_IDS.length}</span><em>{progress.bearMission.completed&&progress.gardenMission.completed?'모두 완료':'진행 중'}</em></aside>}
  </div>;
}
