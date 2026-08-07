import {useCallback,useEffect,useState} from 'react';
import {Camera,ChevronDown,RotateCcw,Save} from 'lucide-react';
import type {MapId} from '../../shared/socket-events';
import {gameEvents} from '../game/events';
import {clearWorldCameraProfileDraft,isWorldCameraEditorMap,loadWorldCameraProfileDraft,resetSharedWorldCameraProfile,saveSharedWorldCameraProfile,saveWorldCameraProfileDraft,WORLD_CAMERA_PROFILE_LIMITS,type WorldCameraProfile} from '../services/worldCameraProfiles';
import './WorldCameraEditor.css';

const CONTROLS:Array<{field:Exclude<keyof WorldCameraProfile,'mapId'>;label:string;unit:string}>=[
  {field:'characterHeight',label:'캐릭터 크기',unit:''},
  {field:'cameraElevationDeg',label:'맵 상하 각도',unit:'°'},
  {field:'cameraAzimuthDeg',label:'맵 좌우 각도',unit:'°'},
  {field:'cameraDistance',label:'캐릭터·카메라 거리',unit:''},
  {field:'cameraTargetHeight',label:'맵·카메라 높이',unit:''},
  {field:'cameraFov',label:'맵 시야 범위',unit:'°'},
];

export function WorldCameraEditor({mapId,canEdit}:{mapId:MapId;canEdit:boolean}){
  const [open,setOpen]=useState(false),[profile,setProfile]=useState<WorldCameraProfile>(),[saving,setSaving]=useState(false),[message,setMessage]=useState('');
  const requestProfile=useCallback(()=>{
    const draft=loadWorldCameraProfileDraft(mapId);
    if(draft){setProfile(draft);setMessage('이동 전 조절값 유지 중');gameEvents.emit('world-camera-profile-preview',draft);return}
    gameEvents.emit('world-camera-profile-request',mapId,(value?:WorldCameraProfile)=>{if(value?.mapId===mapId)setProfile(value)});
  },[mapId]);
  useEffect(()=>{setOpen(false);setMessage('');setProfile(loadWorldCameraProfileDraft(mapId));requestProfile();const timer=window.setTimeout(requestProfile,450);return()=>window.clearTimeout(timer)},[mapId,requestProfile]);
  useEffect(()=>{gameEvents.emit('world-camera-editor-open-changed',open);return()=>{if(open)gameEvents.emit('world-camera-editor-open-changed',false)}},[open]);
  useEffect(()=>{const ready=(readyMapId:MapId)=>{if(readyMapId===mapId)requestProfile()};gameEvents.on('world-camera-profile-ready',ready);return()=>{gameEvents.off('world-camera-profile-ready',ready)}},[mapId,requestProfile]);
  if(!canEdit||!isWorldCameraEditorMap(mapId))return null;
  const update=(field:Exclude<keyof WorldCameraProfile,'mapId'>,value:number)=>{
    if(!profile)return;
    const next={...profile,[field]:value};setProfile(next);saveWorldCameraProfileDraft(next);setMessage('미저장 변경 · 맵 이동 시 유지');gameEvents.emit('world-camera-profile-preview',next);
  };
  const save=async()=>{if(!profile||saving)return;setSaving(true);try{const result=await saveSharedWorldCameraProfile(profile);clearWorldCameraProfileDraft(mapId);setProfile(result.profile);setMessage('공용 저장 완료');gameEvents.emit('world-camera-profile-preview',result.profile)}catch(error){setMessage(error instanceof Error?error.message:'저장하지 못했어요.')}finally{setSaving(false)}};
  const reset=async()=>{if(saving)return;setSaving(true);try{const result=await resetSharedWorldCameraProfile(mapId);clearWorldCameraProfileDraft(mapId);gameEvents.emit('world-camera-profile-reset',mapId);setMessage(result.message);window.setTimeout(requestProfile,0)}catch(error){setMessage(error instanceof Error?error.message:'초기화하지 못했어요.')}finally{setSaving(false)}};
  return <aside className={`world-camera-editor${open?' is-open':''}`} onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
    <button type="button" className="world-camera-editor-toggle" onClick={()=>{setOpen(value=>!value);requestProfile()}} aria-expanded={open}><Camera size={16}/><span><small>17개 맵 개별 설정</small><b>카메라 위치 조절</b></span><ChevronDown size={15}/></button>
    {open&&<section className="world-camera-editor-panel">
      <header><div><small>현재 맵</small><b>{profile?'실시간 조절 가능':'카메라 준비 중'}</b></div>{message&&<em>{message}</em>}</header>
      <div className="world-camera-editor-controls">{CONTROLS.map(({field,label,unit})=>{const limit=WORLD_CAMERA_PROFILE_LIMITS[field],value=profile?.[field]??limit.min;return <label key={field}><span>{label}<output>{value}{unit}</output></span><input type="range" min={limit.min} max={limit.max} step={limit.step} value={value} disabled={!profile||saving} onChange={event=>update(field,Number(event.target.value))}/></label>})}</div>
      <footer><button type="button" onClick={reset} disabled={!profile||saving}><RotateCcw size={14}/> 기본값</button><button type="button" onClick={save} disabled={!profile||saving}><Save size={14}/> 전체 사용자에게 저장</button></footer>
    </section>}
  </aside>;
}
