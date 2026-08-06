import {useMemo,useState} from 'react';
import {EyeOff,Flag,MapPin,MessageCircle,MessageCircleOff,ShieldCheck,Sparkles,UserMinus,UserPlus,X} from 'lucide-react';
import type {Appearance,CharacterModel,PlayerState} from '../../shared/socket-events';
import {CharacterPreview} from './CharacterPreview';
import type {SocialBlockMode,SocialReportReason} from '../services/socialSafety';
import './SocialProfileModal.css';

export interface SocialProfilePerson{
  kind:'npc'|'player';
  id:string;
  nickname:string;
  appearance:Appearance;
  model:CharacterModel;
  status:string;
  mbti?:string;
  interests:string[];
  usagePurposes:string[];
  preferredPlaceCategories:string[];
  experienceRecords:string[];
  chatEnabled:boolean;
}

export const socialProfileFromPlayer=(player:PlayerState):SocialProfilePerson=>({
  kind:'player',id:player.id,nickname:player.nickname,appearance:player.appearance,model:player.model,
  status:player.isMoving?'다음 체험으로 이동 중':'함께할 신호를 기다리는 중',
  mbti:player.matchProfile?.mbti,
  interests:player.matchProfile?.interests??[],usagePurposes:player.matchProfile?.usagePurposes??[],
  preferredPlaceCategories:player.matchProfile?.preferredPlaceCategories??[],
  experienceRecords:player.matchProfile?.recordVisibility==='private'?[]:player.matchProfile?.experienceRecords??[],
  chatEnabled:player.matchProfile?.chatEnabled??true,
});

const REPORT_REASONS:Array<{value:SocialReportReason;label:string;copy:string}>=[
  {value:'abuse',label:'욕설·부적절한 언어',copy:'모욕적이거나 불쾌한 표현을 사용했어요.'},
  {value:'harassment',label:'괴롭힘·위협',copy:'반복적으로 따라오거나 불편하게 했어요.'},
  {value:'spam',label:'도배·광고',copy:'같은 메시지나 홍보 내용을 반복했어요.'},
  {value:'inappropriate',label:'부적절한 프로필',copy:'닉네임이나 프로필 내용에 문제가 있어요.'},
  {value:'other',label:'기타',copy:'위 항목에 없는 문제를 신고할게요.'},
];

const BLOCK_OPTIONS:Array<{value:SocialBlockMode;label:string;copy:string;icon:typeof ShieldCheck}>=[
  {value:'none',label:'차단하지 않기',copy:'신고만 접수하고 캐릭터와 대화는 그대로 보여요.',icon:ShieldCheck},
  {value:'chat',label:'대화만 차단',copy:'이 사용자의 채팅과 1:1 대화 요청을 받지 않아요.',icon:MessageCircleOff},
  {value:'hidden',label:'캐릭터 숨기기',copy:'월드, 주변 목록, 채팅에서 이 캐릭터를 보이지 않게 해요.',icon:EyeOff},
];

export function SocialProfileModal({person,location,isFriend,blockMode,openReportInitially=false,onClose,onToggleFriend,onDirectChat,onReport}:{person:SocialProfilePerson;location:string;isFriend:boolean;blockMode:SocialBlockMode;openReportInitially?:boolean;onClose:()=>void;onToggleFriend:()=>void;onDirectChat:()=>void;onReport:(reason:SocialReportReason,mode:SocialBlockMode,detail:string)=>void}){
  const [reportOpen,setReportOpen]=useState(openReportInitially),[reason,setReason]=useState<SocialReportReason|null>(null),[mode,setMode]=useState<SocialBlockMode>(blockMode),[detail,setDetail]=useState('');
  const keywords=useMemo(()=>[...person.interests,...person.preferredPlaceCategories,...person.usagePurposes].filter(Boolean).slice(0,8),[person]);
  const records=person.experienceRecords.slice(0,5);
  const blocked=blockMode==='chat'||blockMode==='hidden'||!person.chatEnabled;
  const submit=()=>{if(!reason)return;onReport(reason,mode,detail.trim())};
  return <div className="social-profile-overlay" role="dialog" aria-modal="true" aria-labelledby="social-profile-title" onClick={onClose}>
    <section className="social-profile" onClick={event=>event.stopPropagation()}>
      <button type="button" className="social-profile-close" onClick={onClose} aria-label="프로필 닫기"><X size={19}/></button>
      <header className="social-profile-hero">
        <div className="social-profile-avatar"><CharacterPreview parts={person.appearance}/><i/></div>
        <div className="social-profile-identity"><small>{person.kind==='npc'?'세종에서 만난 NPC':'세종에서 만난 친구'}</small><h2 id="social-profile-title">친구 프로필 <Sparkles size={18}/></h2><div><strong>{person.nickname}</strong><span>{isFriend?'내 친구':'새로운 이웃'}</span></div><p>{person.status}</p></div>
        <div className="social-profile-actions"><button type="button" className={isFriend?'is-friend':''} onClick={onToggleFriend}>{isFriend?<UserMinus/>:<UserPlus/>}{isFriend?'친구 삭제':'친구 추가'}</button><button type="button" disabled={blocked} onClick={onDirectChat}>{blocked?<MessageCircleOff/>:<MessageCircle/>}{blocked?'대화 차단됨':'1:1 대화'}</button></div>
      </header>
      <div className="social-profile-grid">
        <section className="social-profile-card social-about"><header><MapPin/><div><small>현재 활동</small><h3>{location}</h3></div></header><p>{person.kind==='npc'?`${location}의 공간과 체험을 안내하고 있어요.`:'같은 공간에서 세종을 탐험하고 있어요.'}</p><dl><div><dt>프로필 유형</dt><dd>{person.kind==='npc'?'로컬 가이드 NPC':'실시간 사용자'}</dd></div><div><dt>MBTI</dt><dd>{person.mbti||'공개하지 않음'}</dd></div><div><dt>대화 상태</dt><dd>{blockMode==='hidden'?'캐릭터 숨김':blockMode==='chat'?'대화 차단':'대화 가능'}</dd></div></dl></section>
        <section className="social-profile-card"><header><Sparkles/><div><small>공개 관심사</small><h3>좋아하는 세종 경험</h3></div></header>{keywords.length?<div className="social-profile-keywords">{keywords.map(keyword=><span key={keyword}>#{keyword}</span>)}</div>:<div className="social-profile-empty">아직 공개한 관심사가 없어요.</div>}</section>
        <section className="social-profile-card social-records"><header><ShieldCheck/><div><small>공개 기록</small><h3>최근 세종 활동</h3></div></header>{records.length?<ul>{records.map(record=><li key={record}>{record}</li>)}</ul>:<div className="social-profile-empty">공개된 활동 기록이 없어요.</div>}</section>
      </div>
      <footer className="social-profile-footer"><span><ShieldCheck size={15}/> 친구 여부와 안전 설정은 이 기기에 저장돼요.</span><button type="button" onClick={()=>setReportOpen(true)}><Flag size={15}/> 신고하기</button></footer>
      {reportOpen&&<div className="social-report-backdrop" onClick={()=>setReportOpen(false)}><section className="social-report" onClick={event=>event.stopPropagation()}><header><div><small>REPORT & SAFETY</small><h2>{person.nickname}님 신고하기</h2><p>신고 사유와 신고 후 적용할 안전 설정을 선택해 주세요.</p></div><button type="button" onClick={()=>setReportOpen(false)} aria-label="신고 화면 닫기"><X/></button></header><fieldset><legend>신고 사유</legend><div className="social-report-reasons">{REPORT_REASONS.map(item=><label className={reason===item.value?'selected':''} key={item.value}><input type="radio" name="report-reason" value={item.value} checked={reason===item.value} onChange={()=>setReason(item.value)}/><span><b>{item.label}</b><small>{item.copy}</small></span></label>)}</div></fieldset><label className="social-report-detail"><span>추가 설명 <small>선택</small></span><textarea value={detail} maxLength={300} onChange={event=>setDetail(event.target.value)} placeholder="상황을 확인하는 데 도움이 될 내용을 적어 주세요."/><em>{detail.length}/300</em></label><fieldset><legend>신고 후 안전 설정</legend><div className="social-block-options">{BLOCK_OPTIONS.map(item=>{const Icon=item.icon;return <label className={mode===item.value?'selected':''} key={item.value}><input type="radio" name="block-mode" value={item.value} checked={mode===item.value} onChange={()=>setMode(item.value)}/><Icon/><span><b>{item.label}</b><small>{item.copy}</small></span></label>})}</div></fieldset><footer><button type="button" onClick={()=>setReportOpen(false)}>취소</button><button type="button" disabled={!reason} onClick={submit}>신고 접수</button></footer></section></div>}
    </section>
  </div>;
}
