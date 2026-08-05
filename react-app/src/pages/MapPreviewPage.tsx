import { LogIn, Map, RotateCcw, X } from 'lucide-react';
import { gameEvents } from '../game/events';
import { GameCanvas } from '../game/GameCanvas';
import type { GameReturnState } from '../game/gameReturnState';
import type { UserProfile } from '../types';
import type { MapId } from '../../shared/socket-events';
import './GamePage.css';
import './MapPreviewPage.css';

const mapNames:Partial<Record<MapId,string>>={
  town:'세종호수공원',
  'arts-center':'세종예술의전당',
  'festival-experience':'축제 부스',
  'food-experience':'먹거리 부스',
  'club-street-festival':'동아리 거리제',
  'bear-tree-park':'베어트리파크',
  'bear-play-zone':'곰 체험소',
  garden:'국립세종수목원',
  campus:'공동캠퍼스',
  'student-hall':'학생회관',
  'recruitment-center':'모집센터',
  'project-room':'프로젝트실',
  government:'정부청사',
  'government-central-plaza':'정부청사 중앙광장',
  'government-observatory':'전망대',
  'sejong-smart-city':'세종 스마트시티 국가시범도시',
};

export function MapPreviewPage({profile,returnState,onExit,onLogin}:{profile:UserProfile;returnState?:GameReturnState;onExit:()=>void;onLogin:()=>void}){
  const name=mapNames[returnState?.mapId??'town']??'세종 월드';
  return <main className="game-page map-preview-page">
    <div className="game-layout"><GameCanvas profile={profile} returnState={returnState} previewOnly/></div>
    <header className="map-preview-header">
      <div><Map size={18}/><span><small>비로그인 맵 구경하기</small><b>{name}</b></span></div>
      <nav>
        <span className="map-preview-controls"><b>드래그 이동</b><i>우클릭 회전</i><i>휠 확대</i><i><kbd>WASD</kbd> 이동</i></span>
        <button type="button" className="map-preview-reset" onClick={()=>gameEvents.emit('map-preview-camera-reset')} title="처음 시점으로 돌아가기"><RotateCcw size={15}/> 시점 초기화</button>
        <button type="button" className="map-preview-login" onClick={onLogin}><LogIn size={15}/> 로그인하고 체험하기</button>
        <button type="button" className="map-preview-exit" onClick={onExit} aria-label="맵 구경하기 닫기"><X size={18}/></button>
      </nav>
    </header>
  </main>;
}
