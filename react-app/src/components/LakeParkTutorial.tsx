import { useState } from 'react';

export const LAKE_WELCOME_SEEN_KEY='sejong-lake-tutorial-hidden-v3';

const tutorialSteps=[
  {
    icon:'👑',
    label:'충녕이의 세종호수공원 첫 안내',
    title:'세종호수공원에 잘 왔어!',
    description:'이곳은 다른 이웃들과 같은 공간을 걸으며 공연·먹거리·축제 등 세종의 다양한 체험을 자유롭게 발견하는 메타버스야.',
    actions:[
      {key:'✨',title:'빛나는 체험존',copy:'가까이 다가가 공연·먹거리·축제 취향 체험을 시작해요.'},
      {key:'🌀',title:'포탈로 장소 이동',copy:'포탈 안에서 3초간 머물면 세종의 다른 공간으로 이동해요.'},
      {key:'👥',title:'이웃과 교류',copy:'충녕이나 가까운 이웃에게 다가가 대화하고 함께 둘러봐요.'},
    ],
    hint:'정해진 순서는 없어. 마음이 가는 곳부터 체험하면 선택과 활동이 내 프로필 기록으로 차곡차곡 쌓일 거야.',
  },
  {
    icon:'🎮',
    label:'세종 메타버스 조작 방법',
    title:'움직이는 방법부터 알려줄게!',
    description:'키보드로 길을 자유롭게 걸어 다닐 수 있어. 길이 막히거나 낮은 턱을 만나면 점프해서 이동해 봐.',
    actions:[
      {key:'↑ ↓ ← → / WASD',title:'이동하기',copy:'방향키 또는 W·A·S·D 키로 원하는 방향으로 움직여요.'},
      {key:'Shift',title:'빠르게 달리기',copy:'이동 키와 Shift를 함께 누르면 더 빠르게 달릴 수 있어요.'},
      {key:'Space',title:'점프하기',copy:'Space 키로 낮은 턱과 울퉁불퉁한 길을 가볍게 넘어요.'},
    ],
    hint:'충녕이·이웃과 대화할 때는 T, 건물이나 체험 요소를 이용할 때는 화면에 표시되는 E 안내를 확인해 줘.',
  },
] as const;

export function LakeParkTutorial({onClose}:{onClose:()=>void}){
  const [step,setStep]=useState(0);
  const current=tutorialSteps[step],last=step===tutorialSteps.length-1;
  const proceed=()=>{
    if(!last){setStep(value=>value+1);return}
    localStorage.setItem(LAKE_WELCOME_SEEN_KEY,'true');
    onClose();
  };

  return <section className="guide-dialog tutorial-dialog lake-tutorial lake-park-welcome-tutorial" role="dialog" aria-modal="true" aria-labelledby="lake-welcome-title" tabIndex={-1} autoFocus onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
    <header>
      <span>{current.icon}</span>
      <div><small>{current.label}</small><h2 id="lake-welcome-title">{current.title}</h2></div>
      <b>{step+1} / {tutorialSteps.length}</b>
    </header>
    <div className="tutorial-progress">{tutorialSteps.map((_,index)=><i key={index} className={index<=step?'active':''}/>)}</div>
    <p className="lake-tutorial-description">{current.description}</p>
    <div className="lake-tutorial-actions">{current.actions.map(action=><article key={action.title}><kbd>{action.key}</kbd><strong>{action.title}</strong><small>{action.copy}</small></article>)}</div>
    <p className="lake-tutorial-hint"><span>충녕이의 팁</span>{current.hint}</p>
    <footer className="guide-dialog-actions">{step>0&&<button type="button" onClick={()=>setStep(value=>value-1)}>이전</button>}<button type="button" className="guide-dialog-primary" onClick={proceed}>{last?'좋아, 호수공원을 둘러볼게!':'조작 방법도 알려줘!'}</button></footer>
  </section>;
}
