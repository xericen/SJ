const artsCenterSteps=[
  {icon:'🖼️',title:'포스터를 둘러보세요',copy:'로비의 공연 포스터 앞으로 이동한 뒤, 마음에 드는 포스터를 클릭하세요.'},
  {icon:'🎬',title:'보고 싶은 공연을 선택하세요',copy:'포스터 상세 화면에서 공연 정보와 영상을 확인하고 관람할 작품을 골라요.'},
  {icon:'💺',title:'객석에 앉아 관람하세요',copy:'공연장 의자를 클릭하거나 가까이에서 E를 누르면 영상 관람이 시작돼요.'},
] as const;
const experienceGuides={
  festival:{eyebrow:'축제부스 · 체험 안내',title:'축제부스에 잘 왔어!',description:'축제 부스와 공연 무대를 자유롭게 둘러보고, 마음에 드는 체험을 발견해 봐. 내가 순서대로 알려줄게!',steps:[
    {icon:'🎪',title:'축제 부스를 둘러보세요',copy:'각 부스 앞으로 이동하면 어떤 체험을 할 수 있는지 확인할 수 있어요.'},
    {icon:'🎤',title:'공연 무대를 찾아보세요',copy:'무대 가까이에서 공연 정보를 확인하고 축제의 분위기를 즐겨요.'},
    {icon:'📸',title:'마음에 든 순간을 기록하세요',copy:'여러 체험을 둘러보며 나만의 축제 코스를 만들어 보세요.'},
  ],hint:'충녕이의 팁|축제부스에서는 부스와 무대를 자유롭게 오가며 새로운 경험을 찾아볼 수 있어.'},
  food:{eyebrow:'먹거리부스 · 체험 안내',title:'먹거리부스에 잘 왔어!',description:'푸드트럭과 야외 테이블을 둘러보며 세종의 맛을 발견해 봐. 내가 순서대로 알려줄게!',steps:[
    {icon:'🍜',title:'푸드트럭을 둘러보세요',copy:'각 푸드트럭 앞으로 이동하면 준비된 메뉴와 먹거리 정보를 확인할 수 있어요.'},
    {icon:'🧺',title:'맛있는 메뉴를 골라보세요',copy:'마음에 드는 메뉴를 살펴보고 먹거리 광장을 천천히 둘러봐요.'},
    {icon:'🌳',title:'야외 테이블에서 쉬어가세요',copy:'테이블과 쉼터 주변에서 먹거리부스의 분위기를 즐겨 보세요.'},
  ],hint:'충녕이의 팁|먹거리부스에서는 푸드트럭과 야외 테이블 사이를 자유롭게 돌아다닐 수 있어.'},
} as const;

export function ArtsCenterTutorial({onClose}:{onClose:()=>void}){
  return <section className="guide-dialog tutorial-dialog lake-tutorial arts-center-tutorial" role="dialog" aria-modal="true" aria-labelledby="arts-center-tutorial-title" tabIndex={-1} autoFocus onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
    <header>
      <span>👑</span>
      <div><small>인공지능 동행자 충녕이 · 공연 관람 안내</small><h2 id="arts-center-tutorial-title">세종예술의전당에 잘 왔어!</h2></div>
      <b>GUIDE</b>
    </header>
    <p className="lake-tutorial-description">포스터에서 보고 싶은 공연을 고른 다음, 공연장 객석에 앉아 영상을 감상하면 돼. 내가 순서대로 알려줄게!</p>
    <div className="lake-tutorial-actions">{artsCenterSteps.map(step=><article key={step.title}><kbd>{step.icon}</kbd><strong>{step.title}</strong><small>{step.copy}</small></article>)}</div>
    <p className="lake-tutorial-hint"><span>충녕이의 팁</span>관람을 마치면 화면 아래의 <b>내리기</b> 버튼이나 E 키를 누르면 자리에서 일어날 수 있어.</p>
    <footer className="guide-dialog-actions"><button type="button" className="guide-dialog-primary" onClick={onClose}>알겠어, 공연을 골라볼게!</button></footer>
  </section>;
}

export function ExperienceTutorial({kind,onClose}:{kind:'festival'|'food';onClose:()=>void}){
  const guide=experienceGuides[kind];
  return <section className="guide-dialog tutorial-dialog lake-tutorial arts-center-tutorial" role="dialog" aria-modal="true" aria-labelledby={`${kind}-experience-tutorial-title`} tabIndex={-1} autoFocus onKeyDown={event=>event.stopPropagation()} onKeyUp={event=>event.stopPropagation()}>
    <header><span>{kind==='festival'?'🎪':'🍜'}</span><div><small>{guide.eyebrow}</small><h2 id={`${kind}-experience-tutorial-title`}>{guide.title}</h2></div><b>GUIDE</b></header>
    <p className="lake-tutorial-description">{guide.description}</p>
    <div className="lake-tutorial-actions">{guide.steps.map(step=><article key={step.title}><kbd>{step.icon}</kbd><strong>{step.title}</strong><small>{step.copy}</small></article>)}</div>
    <p className="lake-tutorial-hint"><span>{guide.hint.split('|')[0]}</span>{guide.hint.split('|')[1]}</p>
    <footer className="guide-dialog-actions"><button type="button" className="guide-dialog-primary" onClick={onClose}>알겠어, 둘러볼게!</button></footer>
  </section>;
}
