import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { gameEvents } from '../game/events';
import { SEJONG_SMART_CITY_SPAWN } from '../game/renderers/VillageMapRenderer';
import type { UserProfile } from '../types';
import { SmartCityExperience } from './SmartCityExperience';
import '../pages/GamePage.css';
import '../pages/MapPreviewPage.css';
import './SmartCityWorldPreview.css';

export function SmartCityWorldPreview({profile}:{profile:UserProfile}){
  const previewRef=useRef<HTMLDivElement>(null);
  const [wallLayerStyle,setWallLayerStyle]=useState<CSSProperties>();
  useEffect(()=>{
    const preview=previewRef.current;if(!preview)return;
    const updateClip=()=>{
      const rect=preview.getBoundingClientRect();
      setWallLayerStyle({clipPath:`inset(${Math.max(0,rect.top)}px ${Math.max(0,window.innerWidth-rect.right)}px ${Math.max(0,window.innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px round 19px)`});
    };
    const observer=new ResizeObserver(updateClip);observer.observe(preview);
    window.addEventListener('resize',updateClip);updateClip();
    return()=>{observer.disconnect();window.removeEventListener('resize',updateClip)};
  },[]);
  useEffect(()=>{
    const showCompletedMap=()=>{
      gameEvents.emit('smart-city-technology-changed','twin');
      gameEvents.emit('smart-city-experience-active-changed',true);
    };
    const timer=window.setTimeout(showCompletedMap,0);
    gameEvents.on('map-travel-complete',showCompletedMap);
    return()=>{
      window.clearTimeout(timer);
      gameEvents.off('map-travel-complete',showCompletedMap);
      gameEvents.emit('smart-city-experience-active-changed',false);
    };
  },[]);

  return <div ref={previewRef} className="smart-city-world-preview game-page map-preview-page" aria-label="수정된 스마트시티 실제 맵 미리보기">
    <div className="game-layout">
      <GameCanvas
        profile={profile}
        returnState={{mapId:'sejong-smart-city',...SEJONG_SMART_CITY_SPAWN}}
        previewOnly
        previewDragRotate
      />
    </div>
    <SmartCityExperience active profile={profile} wallLayerStyle={wallLayerStyle}/>
  </div>;
}
