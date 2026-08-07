import { useState } from 'react';

const BEAR_TUTORIAL_HIDDEN_KEY='bear-tree-park-tutorial-hidden-v2';

const tutorialSteps=[
  {
    icon:'🌳',
    label:'베어트리파크 · 숲길 자연 탐험',
    title:'베어트리파크의 숲과 곰 체험을 둘러봐요',
    description:'숲길을 걸으며 곰 가족 포토존을 체험하고, 필요하면 수목원과 곰 체험소로 이어지는 포탈을 이용해 보세요.',
    actions:[
      {key:'📸',title:'곰 가족 포토존',copy:'곰 가족과 사진을 남기는 공간'},
      {key:'🌿',title:'세종수목원',copy:'식물을 관찰하고 채집하는 공간'},
      {key:'🐻',title:'곰 체험소',copy:'길가의 먹이를 찾아 곰에게 전달하는 공간'},
    ],
    hint:'원하는 순서로 숲길을 탐험하세요. 포탈 가까이에서 E키를 누르면 다음 자연 체험으로 이동할 수 있습니다.',
  },
] as const;

export function BearTreeParkTutorial({step,onPrevious,onNext}:{step:number;onPrevious:()=>void;onNext:()=>void}){
  const [neverShowAgain,setNeverShowAgain]=useState(false);
  const current=tutorialSteps[Math.min(step,tutorialSteps.length-1)],last=step===tutorialSteps.length-1;
  const proceed=()=>{
    if(last&&neverShowAgain)localStorage.setItem(BEAR_TUTORIAL_HIDDEN_KEY,'true');
    onNext();
  };
  return <section className="guide-dialog tutorial-dialog lake-tutorial bear-tree-tutorial" role="dialog" aria-modal="true" aria-labelledby="bear-tree-tutorial-title" tabIndex={-1} autoFocus onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
    <header>
      <span>{current.icon}</span>
      <div><small>{current.label}</small><h2 id="bear-tree-tutorial-title">{current.title}</h2></div>
      <b>{step+1} / {tutorialSteps.length}</b>
    </header>
    <div className="tutorial-progress">{tutorialSteps.map((_,index)=><i key={index} className={index<=step?'active':''}/>)}</div>
    <p className="lake-tutorial-description">{current.description}</p>
    <div className="lake-tutorial-actions">{current.actions.map(action=><article key={action.title}><kbd>{action.key}</kbd><strong>{action.title}</strong><small>{action.copy}</small></article>)}</div>
    <p className="lake-tutorial-hint"><span>인공지능 동행자 충녕이</span>{current.hint}</p>
    <label className="lake-tutorial-never-show"><input type="checkbox" checked={neverShowAgain} onChange={event=>setNeverShowAgain(event.target.checked)}/><span>다시는 이 시작 안내를 보지 않기</span></label>
    <footer className="guide-dialog-actions">{step>0&&<button type="button" onClick={onPrevious}>이전</button>}<button type="button" className="guide-dialog-primary" onClick={proceed}>체험 시작하기</button></footer>
  </section>;
}
