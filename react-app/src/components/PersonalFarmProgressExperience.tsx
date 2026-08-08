import {useEffect,useMemo,useRef,useState} from 'react';
import type {MapId} from '../../shared/socket-events';
import {
  BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS,GARDEN_PLANTABLE_FLOWER_IDS,
  type BearFeedSpotId,type GardenFlowerId,type PersonalFarmProgressDto,
} from '../../shared/personal-farm';
import {greenhousePlantById} from '../data/greenhouse-plants';
import {flowerCatalogByFlowerId,flowerCatalogByPlantId} from '../services/flowerInterestProfile';
import {gameEvents} from '../game/events';
import {recordExperienceAction} from '../services/experienceHarness';
import {
  PERSONAL_FARM_PROGRESS_CHANGED,collectGardenFlower,completeBearFeedSpot,feedBear,getCachedPersonalFarmProgress,
  personalFarmErrorMessage,plantGardenFlower,plantGardenFlowerInSlot,removeGardenFlower,refreshPersonalFarmProgress,setPersonalFarmProgressUser,type PersonalFarmApiError,
} from '../services/personalFarmApi';
import './PersonalFarmProgressExperience.css';
import './PersonalFarmGuide.css';

const gardenFlowerByPlantId=new Map([...flowerCatalogByPlantId].map(([plantId,entry])=>[plantId,entry.flowerId]));
const plantName=(id:GardenFlowerId)=>flowerCatalogByFlowerId.get(id)?.displayName??id;

export function PersonalFarmProgressExperience({mapId,userKey,authenticated,onNotice}:{mapId:MapId;userKey:string;authenticated:boolean;onNotice?:(message:string)=>void}){
  setPersonalFarmProgressUser(userKey);
  const [progress,setProgress]=useState<PersonalFarmProgressDto|undefined>(()=>getCachedPersonalFarmProgress());
  const [gardenNearby,setGardenNearby]=useState<string|null>(null),[feedSpot,setFeedSpot]=useState<BearFeedSpotId|null>(null),[bearNearby,setBearNearby]=useState(false),[farmAnchor,setFarmAnchor]=useState(false),[farmDoor,setFarmDoor]=useState<{inside:boolean}|null>(null),[farmFlower,setFarmFlower]=useState<GardenFlowerId|null>(null);
  const [farmSlot,setFarmSlot]=useState<{slot:1|2|3|4|5;flowerId?:GardenFlowerId}|null>(null);
  const [selectedFlower,setSelectedFlower]=useState<GardenFlowerId|''>(''),[selectedSlot,setSelectedSlot]=useState<1|2|3|4|5>(1),[pending,setPending]=useState<string>(),[error,setError]=useState('');
  const userRef=useRef(userKey),reportedLoadErrorRef=useRef(''),previousProgressRef=useRef<PersonalFarmProgressDto|undefined>(undefined);
  const availableToPlant=useMemo(()=>progress?[...new Set([...progress.gardenMission.favoriteFlowerIds,...progress.gardenMission.collectedFlowerIds])].filter(id=>(GARDEN_PLANTABLE_FLOWER_IDS as readonly string[]).includes(id)):[],[progress]);

  useEffect(()=>{
    const previous=previousProgressRef.current;
    if(progress&&previous){
      if(previous.gardenMission.favoriteFlowerIds.length<5&&progress.gardenMission.favoriteFlowerIds.length>=5)onNotice?.('수목원 꽃 5개를 모두 모았어요. 마이홈에서 집 앞 화단에 꽃을 심을 수 있습니다.');
      if(!previous.gardenMission.interestCompleted&&progress.gardenMission.interestCompleted)onNotice?.('수목원 미션 완료! 마이홈 화단에 식물을 심을 수 있습니다.');
      if(!previous.natureChapter.completed&&progress.natureChapter.completed)onNotice?.('자연 체험을 모두 완료했습니다. 마이홈 보상이 준비되었습니다.');
      if(!previous.gardenMission.completed&&progress.gardenMission.completed)recordExperienceAction({type:'garden-experience-complete',subject:'garden',title:'수목원 체험 완료'});
    }
    previousProgressRef.current=progress;
  },[onNotice,progress]);

  useEffect(()=>{
    const photoCompleted=()=>recordExperienceAction({type:'photo',subject:'bear-photo-zone',title:'포토존 체험 완료'});
    gameEvents.on('bear-photo-captured',photoCompleted);
    return()=>{gameEvents.off('bear-photo-captured',photoCompleted)};
  },[]);

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
    const garden=(value:{kind:string;plantId?:string}|null)=>setGardenNearby(value?.kind==='plant'&&value.plantId?value.plantId:null);
    const spot=(id:BearFeedSpotId|null)=>setFeedSpot(id),bear=(nearby:boolean)=>setBearNearby(nearby),anchor=(nearby:boolean)=>setFarmAnchor(nearby),door=(value:{inside:boolean}|null)=>setFarmDoor(value),planted=(value:GardenFlowerId|null)=>setFarmFlower(value),slot=(value:{slot:1|2|3|4|5;flowerId?:GardenFlowerId}|null)=>{setFarmSlot(value);if(value)setSelectedSlot(value.slot);else setSelectedFlower('')};
    gameEvents.on('greenhouse-nearby-changed',garden);gameEvents.on('bear-feed-spot-proximity-changed',spot);gameEvents.on('bear-feeding-proximity-changed',bear);gameEvents.on('personal-farm-plant-anchor-proximity-changed',anchor);gameEvents.on('personal-farm-door-proximity-changed',door);gameEvents.on('personal-farm-flower-proximity-changed',planted);gameEvents.on('personal-farm-flower-slot-proximity-changed',slot);
    return()=>{gameEvents.off('greenhouse-nearby-changed',garden);gameEvents.off('bear-feed-spot-proximity-changed',spot);gameEvents.off('bear-feeding-proximity-changed',bear);gameEvents.off('personal-farm-plant-anchor-proximity-changed',anchor);gameEvents.off('personal-farm-door-proximity-changed',door);gameEvents.off('personal-farm-flower-proximity-changed',planted);gameEvents.off('personal-farm-flower-slot-proximity-changed',slot)};
  },[]);
  useEffect(()=>{const locked=()=>{const message='마이홈은 수목원과 베어트리파크 미션 결과에 따라 꾸며집니다.';setError(message);onNotice?.(message)};gameEvents.on('personal-farm-locked',locked);gameEvents.on('personal-farm-login-required',locked);return()=>{gameEvents.off('personal-farm-locked',locked);gameEvents.off('personal-farm-login-required',locked)}},[onNotice]);

  const notify=(message:string)=>{onNotice?.(message);window.dispatchEvent(new CustomEvent('sj-game-notice',{detail:message}))};
  const run=async(key:string,operation:()=>Promise<PersonalFarmProgressDto>,success:string|((next:PersonalFarmProgressDto)=>string))=>{if(pending)return;setPending(key);setError('');try{const next=await operation();setProgress(next);notify(typeof success==='function'?success(next):success)}catch(reason){const message=personalFarmErrorMessage(reason as PersonalFarmApiError);setError(message);notify(message)}finally{setPending(undefined)}};
  const gardenFlower=gardenNearby?gardenFlowerByPlantId.get(gardenNearby):undefined;
  const pickup=feedSpot?BEAR_FEED_PICKUPS[feedSpot]:undefined;
  const canCollectFlower=gardenFlower&&!progress?.gardenMission.collectedFlowerIds.includes(gardenFlower);
  const flowerBedFull=(progress?.gardenMission.plantedFlowerIds.length??0)>=5;
  const repeatReady=Boolean(progress?.bearMission.completed&&!progress.bearMission.repeatFeedSpotId&&(!progress.bearMission.repeatFeedAvailableAt||Date.parse(progress.bearMission.repeatFeedAvailableAt)<=Date.now()));
  const spotDone=feedSpot?progress?.bearMission.completed?!repeatReady:progress?.bearMission.completedFeedSpotIds.includes(feedSpot):false;
  const pickedFeedCount=progress?.bearMission.completedFeedSpotIds.length??0;
  const fedFeedCount=progress?.bearMission.fedFeedSpotIds.length??0;
  const hasPendingFeed=progress?.bearMission.completed?Boolean(progress.bearMission.repeatFeedSpotId):pickedFeedCount>fedFeedCount;
  const canPickUpFeed=progress?.bearMission.completed?repeatReady&&!hasPendingFeed:!hasPendingFeed;
  const canFeedBear=mapId==='bear-play-zone'&&bearNearby&&hasPendingFeed;
  const bearStatueWasUnlocked=Boolean(progress?.bearMission.completed||progress?.farm.unlockedRewardIds.includes('bear-statue'));
  const feedSuccess=(next:PersonalFarmProgressDto)=>next.bearMission.completed&&!bearStatueWasUnlocked
    ?'곰 급여 완료! 베어트리파크 곰동상이 마이홈에 설치되었습니다.'
    :`곰에게 먹이를 줬어요. (${next.bearMission.fedFeedSpotIds.length}/${BEAR_FEED_SPOT_IDS.length})`;
  const feedBearAndRecord=async()=>{
    const wasComplete=Boolean(progress?.bearMission.completed);
    const next=await feedBear();
    if(!wasComplete&&next.bearMission.completed)recordExperienceAction({type:'bear-experience-complete',subject:'bear-zone',title:'곰 체험소 체험 완료'});
    return next;
  };

  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.defaultPrevented||event.key.toLowerCase()!=='e'||event.repeat||pending)return;
      const focused=document.activeElement;if(focused instanceof HTMLInputElement||focused instanceof HTMLTextAreaElement||focused instanceof HTMLSelectElement)return;
      // Flower selection is intentionally handled only by GreenhouseExperience's detail dialog.
      if(canFeedBear){event.preventDefault();void run('bear-feed',feedBearAndRecord,feedSuccess);return}
      if(mapId==='bear-play-zone'&&feedSpot&&pickup&&!spotDone&&canPickUpFeed){event.preventDefault();void run(`spot:${feedSpot}`,()=>completeBearFeedSpot(feedSpot),`${pickup.name}을(를) 주웠어요. 곰에게 가져다주세요.`);return}
      if(mapId==='personal-farm'&&farmSlot&&selectedFlower){event.preventDefault();void run(`slot:${farmSlot.slot}`,()=>plantGardenFlowerInSlot(selectedFlower,farmSlot.slot),`${farmSlot.slot}번 자리에 ${plantName(selectedFlower)}을(를) 심었어요.`).then(()=>setSelectedFlower(''))}
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[authenticated,canCollectFlower,canFeedBear,canPickUpFeed,farmSlot,feedSpot,gardenFlower,mapId,pending,pickup,selectedFlower,spotDone]);

  return <div className={`personal-farm-mission-ui map-${mapId}`} aria-live="polite">

    {mapId==='bear-play-zone'&&bearNearby&&<section className="personal-farm-action-card"><span>🐻</span><div><small>곰 체험소 가상 먹이 체험 · 급여 {fedFeedCount}/5</small><b>{progress?.bearMission.bearFed?'곰 급여 완료':canFeedBear?'곰들이 먹이를 기다리고 있어요':'길가에서 먹이를 하나 찾아 주세요'}</b></div><button type="button" disabled={!canFeedBear||!!pending} onClick={()=>void run('bear-feed',feedBearAndRecord,feedSuccess)}>{pending==='bear-feed'?'처리 중…':progress?.bearMission.bearFed?'완료':'E · 곰에게 먹이 주기'}</button></section>}
    {error&&<button type="button" className="personal-farm-api-error" onClick={()=>setError('')}>{error}</button>}
    {!authenticated&&mapId!=='personal-farm'&&(gardenFlower||feedSpot)&&<aside className="personal-farm-guest-note">게스트 진행도는 현재 접속 중에만 유지됩니다.</aside>}
    {mapId==='bear-play-zone'&&feedSpot&&pickup&&<section className="personal-farm-action-card"><span>{pickup.emoji}</span><div><small>길가에 떨어진 곰 먹이</small><b>{spotDone?'주운 먹이':hasPendingFeed?'먼저 곰에게 전달해 주세요':`${pickup.name} 줍기`}</b></div><button type="button" disabled={!!spotDone||!canPickUpFeed||!!pending} onClick={()=>void run(`spot:${feedSpot}`,()=>completeBearFeedSpot(feedSpot),`${pickup.name}을(를) 주웠어요. 곰에게 가져다주세요.`)}>{pending===`spot:${feedSpot}`?'저장 중…':spotDone?'완료':hasPendingFeed?'전달 대기':'E · 줍기'}</button></section>}
    {mapId==='bear-play-zone'&&!feedSpot&&!bearNearby&&progress&&!progress.bearMission.bearFed&&<aside className="personal-farm-reward-status"><b>곰 먹이 체험</b><span>급여 {fedFeedCount}/{BEAR_FEED_SPOT_IDS.length}</span><em>{hasPendingFeed?'곰에게 가져다주세요':'길을 따라 먹이를 하나 찾아보세요'}</em></aside>}
    {mapId==='personal-farm'&&farmSlot&&<section className="personal-farm-action-card farm-plant-card"><span>🌱</span><div><small>{farmSlot.slot}번 꽃 심기 자리</small><b>{farmSlot.flowerId?`${plantName(farmSlot.flowerId!)}이(가) 심어져 있어요`:'이 위치에 수집한 꽃 심기'}</b>{farmSlot.flowerId?null:<select value={selectedFlower} onChange={event=>setSelectedFlower(event.target.value as GardenFlowerId|'')}><option value="">심을 꽃 선택</option>{availableToPlant.map(id=><option value={id} key={id}>{plantName(id)}</option>)}</select>}</div>{farmSlot.flowerId?<button type="button" disabled={!!pending} onClick={()=>void run(`remove:${farmSlot.flowerId}`,()=>removeGardenFlower(farmSlot.flowerId!),`${plantName(farmSlot.flowerId!)}을(를) 화단에서 제거했어요.`)}>{pending?.startsWith('remove:')?'제거 중…':'식물 제거'}</button>:<button type="button" disabled={!selectedFlower||!!pending} onClick={()=>selectedFlower&&void run(`slot:${farmSlot.slot}`,()=>plantGardenFlowerInSlot(selectedFlower,farmSlot.slot),`${farmSlot.slot}번 자리에 ${plantName(selectedFlower)}을(를) 심었어요.`).then(()=>setSelectedFlower(''))}>{pending?.startsWith('slot:')?'심는 중…':'E · 꽃 심기'}</button>}</section>}
    {mapId==='personal-farm'&&progress&&<aside className="personal-farm-reward-status"><b>정원 현황</b><span>꽃 {progress.gardenMission.plantedFlowerIds.length}/5</span><span>곰 급여 {fedFeedCount}/{BEAR_FEED_SPOT_IDS.length}</span><em>{progress.bearMission.completed&&progress.gardenMission.completed?'모두 완료':'진행 중'}</em></aside>}
    {mapId==='garden'&&progress&&<aside className="personal-farm-reward-status"><b>수목원 꽃 체험</b><span>꽃 {progress.gardenMission.favoriteFlowerIds.length}/5</span><span>채집 {progress.gardenMission.collectedFlowerIds.length}</span><em>{progress.gardenMission.favoriteFlowerIds.length===5?'선택 완료':'진행 중'}</em></aside>}
  </div>;
}
