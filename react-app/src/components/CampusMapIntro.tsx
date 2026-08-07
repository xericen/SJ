import {useEffect,useState} from 'react';
import type {MapId} from '../../shared/socket-events';

const INTRO:Partial<Record<MapId,{place:string;title:string;description:string;steps:string[]}>>={
 campus:{place:'공동캠퍼스',title:'관심사가 만나는 공동캠퍼스',description:'학생회관, 모집센터, 프로젝트실, 동아리 거리제가 연결된 세종의 협업 공간이에요.',steps:['학생회관·모집센터 둘러보기','프로젝트실에서 팀 활동 이어가기','동아리 거리제에서 커뮤니티 참여']},
 'student-hall':{place:'학생회관',title:'학생회관에 오신 것을 환영해요',description:'현재 활동 중인 이웃의 공개 프로필과 관심사를 살펴보고 대화를 시작할 수 있어요.',steps:['AI 추천 트리 확인','추천 이웃의 공개 프로필 살펴보기','함께 둘러보기 또는 대화 신청']},
 'recruitment-center':{place:'모집센터',title:'모집센터에 오신 것을 환영해요',description:'충녕이와 대화하며 지금 참여할 수 있는 모집글을 찾고, 나만의 모집글도 등록할 수 있어요.',steps:['충녕이에게 모집 찾기 요청','공개 모집글 상세 확인','모집자에게 참가 신청 전달']},
 'club-street-festival':{place:'동아리 거리제',title:'동아리 거리제에 오신 것을 환영해요',description:'관심사가 비슷한 동아리를 둘러보고 가입하거나 새 동아리를 만들어 활동을 시작해요.',steps:['동아리 부스 둘러보기','동아리 가입 또는 창설','활동 피드와 사진 기록 공유']},
 'project-room':{place:'프로젝트실',title:'프로젝트실에 오신 것을 환영해요',description:'모집글로 연결된 사람들이 역할과 장소를 정하고 함께할 활동을 구체화하는 공간이에요.',steps:['참여 중인 모집 확인','역할·일정·장소 정하기','공동 활동 계획 저장']},
 government:{place:'정부청사',title:'정부청사에 오신 것을 환영해요',description:'세종의 행정과 도시 비전을 살펴보고 중앙광장, 전망대, 스마트시티 전시관으로 이어지는 여정을 시작해요.',steps:['중앙광장에서 AI 세종 추천 확인','전망대에서 세종시 전경 감상','스마트시티에서 미래 도시 체험']},
 'government-observatory':{place:'전망대',title:'정부청사 전망대에 오신 것을 환영해요',description:'세종시의 풍경을 한눈에 바라보고 도시의 다음 장면을 발견하는 공간이에요.',steps:['전망 망원경으로 전경 보기','전시 공간 자유롭게 둘러보기','정부청사로 돌아가기']},
 'sejong-smart-city':{place:'스마트시티 전시관',title:'세종 스마트시티 국가시범도시에 오신 것을 환영해요',description:'자율주행, UAM, AI 교통관제와 스마트 에너지 등 세종의 미래 서비스를 체험해요.',steps:['스마트 서비스 전시 살펴보기','관심 있는 체험을 직접 선택하기','체험 결과를 내 활동에 저장하기']},
 'government-central-plaza':{place:'정부청사 중앙광장',title:'정부청사 중앙광장에 오신 것을 환영해요',description:'AI 세종 추천센터와 휴식 공간이 있는 정부청사의 중심 광장이에요.',steps:['AI 세종 추천센터 체험','광장 소파에서 잠시 쉬기','다음 장소로 포탈 이동']},
};

export function CampusMapIntro({mapId}:{mapId:MapId}){
 const [open,setOpen]=useState(false),content=INTRO[mapId];
 useEffect(()=>{
  if(!INTRO[mapId])return;
  const key=`campus-map-intro-seen:${mapId}`;
  try{if(localStorage.getItem(key)==='1'){setOpen(false);return}localStorage.setItem(key,'1')}catch{}
  setOpen(true);
 },[mapId]);
 if(!open||!content)return null;
 return <section className="guide-dialog tutorial-dialog lake-tutorial arts-center-tutorial campus-map-intro" role="dialog" aria-modal="true" aria-labelledby="campus-map-intro-title" tabIndex={-1} autoFocus onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}><header><span>👑</span><div><small>{content.place} · 체험 안내</small><h2 id="campus-map-intro-title">{content.title}</h2></div><b>GUIDE</b></header><p className="lake-tutorial-description">{content.description} 내가 순서대로 알려줄게!</p><div className="lake-tutorial-actions">{content.steps.map((step,index)=><article key={step}><kbd>{['🧭','✨','🤝'][index]??'✦'}</kbd><strong>{step}</strong><small>{['맵의 주요 공간을 자유롭게 둘러보세요.','마음에 드는 체험과 활동을 직접 선택해 보세요.','나만의 활동 기록으로 이어가 보세요.'][index]??'새로운 경험을 발견해 보세요.'}</small></article>)}</div><p className="lake-tutorial-hint"><span>충녕이의 팁</span>맵을 충분히 둘러본 뒤 화면 아래의 버튼을 눌러 안내를 닫고 자유롭게 걸어보세요.</p><footer className="guide-dialog-actions"><button type="button" className="guide-dialog-primary" onClick={()=>setOpen(false)}>알겠어, 둘러볼게!</button></footer></section>;
}
