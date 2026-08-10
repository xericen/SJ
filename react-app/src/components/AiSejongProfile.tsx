import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BarChart3, BookOpen, Bookmark, Camera, ChevronRight, Edit3, Flower2, Heart, Leaf, LockKeyhole, Music2, Sparkles, Trophy, Utensils, X } from 'lucide-react';
import type { UserProfile } from '../types';
import { CharacterPreview } from './CharacterPreview';
import { buildAiSejongProfile } from '../services/aiSejongProfile';
import { buildProfileProgress, PROFILE_ZONES } from '../services/profileProgress';
import {buildFoodTasteProfile} from '../services/foodTasteProfile';
import {loadSavedExperienceInterests,type SavedExperienceInterest} from '../services/experienceHarness';
import {greenhousePlantById} from '../data/greenhouse-plants';
import {rankGreenhouseProfilePlants} from '../services/greenhouseProgress';
import './AiSejongProfile.css';

const courseSeed = [
  { image: '/images/festivals/nakhwa-2026.jpg', badge: 'BEST', title: '호수 야경 & 음악 코스', desc: '호수공원과 공연을 함께 즐겨요', meta: '공연 · 힐링 · 야경' },
  { image: '/images/festivals/spring-flower-2026.jpg', title: '수목원 힐링 & 카페 코스', desc: '자연에서 천천히 쉬어가요', meta: '감성 · 자연 · 기록' },
  { image: '/images/government-complex-diorama.png', title: '문화예술 & 전시 코스', desc: '호기심을 채우는 세종 여행', meta: '체험 · 문화 · 탐험' },
];
const formatTime = (at?: string) => at ? new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(at)) : '체험 완료';
const profileAssetUrl = (src: string) => src.startsWith('/images/')
  ? `/assets/jochwon-app/${src.slice(1)}`
  : src;
const profileImageFallback = profileAssetUrl('/images/government-complex-diorama.png');
const handleProfileImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = profileImageFallback;
};
type ProfileDetailKind='zones'|'keywords'|'records'|'growth'|'interests'|'analysis';

export function AiSejongProfile({ profile, onClose, onEdit }: { profile: UserProfile; onClose: () => void; onEdit: () => void }) {
  const [revision, setRevision] = useState(0);
  const [detail, setDetail] = useState<ProfileDetailKind|null>(null);
  const [selectedRecordId,setSelectedRecordId]=useState<string|null>(null);
  useEffect(() => {
    const update = () => setRevision(value => value + 1);
    window.addEventListener('sejong-profile-progress-updated', update);
    window.addEventListener('sejong-lake-interest-updated', update);
    window.addEventListener('bear-travel-style-updated', update);
    window.addEventListener('bear-habitat-decision-updated', update);
    window.addEventListener('sejong-experience-profile-updated', update);
    window.addEventListener('sejong-festival-interest-updated', update);
    window.addEventListener('sejong-food-taste-updated', update);
    window.addEventListener('sejong-travel-draft-changed', update);
    window.addEventListener('personal-farm-progress-changed', update);
    return () => {
      window.removeEventListener('sejong-profile-progress-updated', update);
      window.removeEventListener('sejong-lake-interest-updated', update);
      window.removeEventListener('bear-travel-style-updated', update);
      window.removeEventListener('bear-habitat-decision-updated', update);
      window.removeEventListener('sejong-experience-profile-updated', update);
      window.removeEventListener('sejong-festival-interest-updated', update);
      window.removeEventListener('sejong-food-taste-updated', update);
      window.removeEventListener('sejong-travel-draft-changed', update);
      window.removeEventListener('personal-farm-progress-changed', update);
    };
  }, []);
  const ai = useMemo(() => buildAiSejongProfile(profile), [profile, revision]);
  const progress = useMemo(() => buildProfileProgress(profile), [profile, revision]);
  const s = progress.scores;
  const foodTaste=useMemo(()=>buildFoodTasteProfile(),[revision]);
  const savedInterests=useMemo(()=>loadSavedExperienceInterests(profile.nickname),[profile.nickname,revision]);
  const topGardenPlants=useMemo(()=>progress.greenhouse.collected.length>=5
    ?rankGreenhouseProfilePlants(progress.greenhouse,5).flatMap((rank,index)=>{const plant=greenhousePlantById.get(rank.plantId);return plant?[{...rank,plant,rank:index+1}]:[]})
    :[],[progress.greenhouse]);
  const savedGroups:Array<{domain:SavedExperienceInterest['domain'];label:string;empty:string;icon:string}>=useMemo(()=>[
    {domain:'performance',label:'예술의전당 관심 공연',empty:'저장한 공연이 아직 없어요',icon:'🎭'},
    {domain:'food',label:'먹거리부스 저장 장소',empty:'저장한 음식점·카페가 아직 없어요',icon:'🍽️'},
    {domain:'festival',label:'관심 축제',empty:'저장한 축제가 아직 없어요',icon:'🎪'},
    {domain:'plant',label:'관심 식물',empty:'저장한 식물이 아직 없어요',icon:'🌿'},
  ],[]);
  const coreKeywords = [
    { icon: <Leaf />, label: '자연·감각', description: `${progress.greenhouse.collected.length || progress.visits.length}번의 자연·공간 탐색에서 발견했어요`, value: s.nature, tone: 'green' },
    { icon: <Music2 />, label: '공연·몰입', description: `${progress.records.filter(item => item.zone === '세종예술의전당').length}개의 공연장 행동이 반영됐어요`, value: s.culture, tone: 'purple' },
    { icon: <Heart />, label: '사람·교류', description: `${progress.campus.length}곳의 교류 공간 경험에서 발견했어요`, value: s.relation, tone: 'pink' },
    { icon: <Camera />, label: '경험·기록', description: `${progress.records.length}개의 여행 기록이 쌓였어요`, value: s.record, tone: 'orange' },
    { icon: <Utensils />, label: '먹거리·로컬', description: `${progress.records.filter(item => item.id.startsWith('harness-food-experience:') || item.id.startsWith('lake-food-')).length}개의 먹거리 선택과 부스 행동이 반영됐어요`, value: s.food, tone: 'green' },
  ].filter(item => item.value > 0);
  const festivalKeywords=progress.festivalKeywords.map(item=>({icon:<Sparkles/>,label:item.keyword,description:`${item.festivals.slice(0,3).join(' · ')}${item.festivals.length>3?` 외 ${item.festivals.length-3}개`:''}에서 발견했어요`,value:item.score,tone:'purple'}));
  const foodKeywords=foodTaste.insights.map(item=>({icon:<Utensils/>,label:item.label,description:`저장한 ${item.evidence.join(' · ')}에서 발견한 취향이에요`,value:item.score,tone:'orange'}));
  const keywords=[...coreKeywords,...foodKeywords,...festivalKeywords];
  const hasProfileExperience = progress.experienceCount > 0;
  const visibleRecords = progress.records.slice(0, 4);
  const level = Math.max(1, Math.floor(progress.points / 100) + 1);
  const courses = ai.recommendedCourse.slice(0,3).map((title, index) => ({
    ...courseSeed[index % courseSeed.length],
    badge: index === 0 ? courseSeed[0].badge : undefined,
    title,
  }));
  const selectedRecord=progress.records.find(item=>item.id===selectedRecordId)??null;

  return <div className="ai-sejong-profile-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-sejong-profile-title">
    <section className="ai-sejong-profile">
      <button type="button" className="ai-sejong-close" onClick={onClose} aria-label="프로필 닫기"><X size={19} /></button>
      <header className="profile-hero">
        <div className="profile-identity"><div className="profile-avatar"><CharacterPreview parts={profile.character} small /><button type="button" onClick={onEdit} aria-label="프로필 편집"><Edit3 size={11} /></button></div><div><small>세종을 탐험하며 완성되는</small><h2 id="ai-sejong-profile-title">내 프로필 <Sparkles size={17} /></h2><div className="profile-name">{profile.nickname || '여행자'} <span>Lv.{level} 탐험가</span></div><div className="profile-basic-info">{profile.residence&&<span><small>거주 지역</small>{profile.residence}</span>}{profile.usagePurposes[0]&&<span><small>사용 목적</small>{profile.usagePurposes[0]}</span>}{profile.mbti&&<span><small>MBTI</small>{profile.mbti}</span>}</div></div></div>
        <button className="profile-score" onClick={() => setDetail('growth')} style={{ '--score': `${progress.completion * 3.6}deg` } as CSSProperties}><div><strong>{progress.completion}<small>%</small></strong><span>프로필 완성도</span></div></button>
        <button className="profile-summary" onClick={() => setDetail('zones')}><div><Sparkles /><span>세종 공간</span><b>{progress.visitedZoneCount} / {PROFILE_ZONES.length}</b></div><div><Camera /><span>기록한 순간</span><b>{progress.records.length}</b></div><div><Trophy /><span>성장 포인트</span><b>{progress.points.toLocaleString()} P</b></div></button>
      </header>

      <div className="profile-main-grid"><div className="profile-left-column">
        <section className="profile-card keyword-card"><div className="section-title"><h3><Sparkles /> 나를 나타내는 키워드</h3>{hasProfileExperience && <button onClick={() => setDetail('keywords')}>분석 보기 <ChevronRight /></button>}</div>{hasProfileExperience && keywords.length ? <div className="festival-keyword-chips all-profile-keywords" aria-label="나를 나타내는 키워드">{keywords.map(item=><button type="button" className={item.tone} key={item.label} title={item.description} onClick={()=>setDetail('keywords')}>{item.icon}{item.label}<small>{item.value}</small></button>)}</div> : <ProfileInsightEmpty title="아직 발견된 키워드가 없어요" copy="체험을 시작하면 행동과 선택에 맞는 키워드가 채워져요." />}</section>
        <section className="profile-card radar-card"><div className="section-title"><h3><Flower2 /> 관심사 레이더</h3><span className="profile-trait-count">핵심 성향 {Math.min(4,keywords.length)}개 반영</span></div>{hasProfileExperience ? <div className="radar-content"><div className="radar-chart"><i className="axis a1"/><i className="axis a2"/><i className="axis a3"/><div className="radar-shape" style={{clipPath:radarPolygon([s.nature,s.culture,s.explore,s.record,s.relation,s.food])}}/><span className="r1">자연·힐링 <b>{s.nature}</b></span><span className="r2">문화·예술 <b>{s.culture}</b></span><span className="r3">탐험·발견 <b>{s.explore}</b></span><span className="r4">사진·기록 <b>{s.record}</b></span><span className="r5">사람·교류 <b>{s.relation}</b></span><span className="r6">먹거리·로컬 <b>{s.food}</b></span></div><div className="radar-copy"><b>매칭에 반영된 핵심 성향</b>{keywords.slice(0,4).map(item=><p key={item.label}>{item.icon}<span><strong>{item.label}</strong><small>{item.description}</small></span></p>)}</div></div> : <ProfileInsightEmpty title="아직 분석할 관심사가 없어요" copy="각 공간의 체험을 완료하면 관심 분야가 레이더에 나타나요." />}</section>
      </div>
      <section className="profile-card activity-card"><div className="section-title"><h3><BookOpen /> 최근 활동 기록</h3></div><div className="activity-list">{visibleRecords.length ? visibleRecords.map(item => <button type="button" className="activity-row" key={item.id} onClick={()=>setSelectedRecordId(item.id)}><img src={profileAssetUrl(item.image)} alt="" onError={handleProfileImageError}/><div><small>{item.zone}</small><b>{item.title}</b><p>{item.note}</p></div><aside><time>{formatTime(item.at)}</time><strong>{item.profileScope==='recent-only'?'최근 기록':`+${item.point}P`}</strong></aside></button>) : <div className="profile-empty"><BookOpen /><b>아직 활동 기록이 없어요</b><p>공간 안에서 관찰·선택·저장·신청 같은 체험을 해보세요.</p></div>}</div></section></div>

      <div className="profile-bottom-grid">
        <section className="profile-card ai-summary-card"><div className="section-title"><h3><Sparkles/> AI 종합 분석</h3>{hasProfileExperience&&<button onClick={()=>setDetail('analysis')}>자세한 분석 보기 <ChevronRight/></button>}</div>{hasProfileExperience?<><p>{ai.oneLineAnalysis}</p><div>{keywords.slice(0,3).map(item=><span key={item.label}>#{item.label}</span>)}</div></>:<div className="ai-summary-empty"><LockKeyhole/><span><b>아직 분석 결과가 없어요</b><small>프로필 영역을 더 체험하면 실제 기록을 바탕으로 분석이 생성돼요.</small></span></div>}</section>
        <section className="profile-card course-card"><div className="section-title"><div><h3>추천 세종 코스</h3><small>{courses.length ? '지금까지의 탐험 성향으로 추천했어요' : '아직 추천받은 코스가 없어요'}</small></div></div>{courses.length ? <div className="course-list">{courses.map(course => <article key={course.title}><div><img src={profileAssetUrl(course.image)} alt="" onError={handleProfileImageError}/>{course.badge && <span>{course.badge}</span>}</div><b>{course.title}</b><p>{course.desc}</p></article>)}</div> : <div className="course-empty"><Sparkles /><b>세종 코스를 준비하고 있어요</b><p>프로필을 채운 뒤 나에게 맞는 세종 코스를 추천받아 보세요.</p></div>}</section>
      </div>

      <nav className="profile-detail-tabs" aria-label="프로필 세부 정보"><button onClick={()=>setDetail('interests')}><Bookmark/> 저장한 관심사 <b>{savedInterests.length}</b></button><button onClick={()=>setDetail('growth')}><BarChart3/> 성장 히스토리</button><button onClick={()=>setDetail('records')}><BookOpen/> 전체 활동 기록</button><button onClick={()=>setDetail('analysis')}><Sparkles/> AI 상세 분석</button></nav>

      {detail && <DetailPanel kind={detail} progress={progress} keywords={keywords} savedGroups={savedGroups} savedInterests={savedInterests} experienceProfiles={ai.experienceProfiles} topGardenPlants={topGardenPlants} aiSummary={ai.oneLineAnalysis} onClose={() => setDetail(null)} />}
      {selectedRecord&&<RecordDetailPanel item={selectedRecord} onClose={()=>setSelectedRecordId(null)}/>}
    </section>
  </div>;
}

function growthBars(completion: number, zones: number) { return [8, Math.max(12, zones * 6), Math.max(18, completion * .42), Math.max(24, completion * .62), Math.max(30, completion * .78), Math.max(35, completion * .9), completion]; }
function radarPolygon(scores:number[]){
  return `polygon(${scores.map((score,index)=>{
    const angle=-Math.PI/2+index*Math.PI*2/scores.length,radius=Math.max(0,Math.min(100,score))*.46;
    return `${50+Math.cos(angle)*radius}% ${50+Math.sin(angle)*radius}%`;
  }).join(',')})`;
}

function ProfileInsightEmpty({ title, copy }: { title: string; copy: string }) {
  return <div className="profile-insight-empty"><LockKeyhole /><b>{title}</b><p>{copy}</p></div>;
}

function PointBreakdown({item}:{item:ReturnType<typeof buildProfileProgress>['records'][number]}){
  if(!item.breakdown?.length)return null;
  return <details className="record-point-breakdown"><summary>점수 산정 보기</summary><ul>{item.breakdown.map(detail=><li key={detail.label}><span>{detail.label}</span><b>+{detail.point}</b></li>)}</ul><footer><span>총점</span><b>+{item.point}P</b></footer></details>;
}

function RecordDetailPanel({item,onClose}:{item:ReturnType<typeof buildProfileProgress>['records'][number];onClose:()=>void}){
  return <div className="profile-detail-backdrop" onClick={onClose}><section className="profile-detail-panel record-focus-panel" onClick={event=>event.stopPropagation()}><header><div><small>ACTIVITY DETAIL</small><h2>{item.title}</h2></div><button onClick={onClose} aria-label="활동 상세 닫기"><X/></button></header><div className="record-focus-content"><img src={profileAssetUrl(item.image)} alt="" onError={handleProfileImageError}/><div><small>{item.zone} · {formatTime(item.at)}</small><p>{item.note}</p><strong>+{item.point}P</strong><PointBreakdown item={item}/></div></div></section></div>;
}

function DetailPanel({ kind, progress, keywords, savedGroups, savedInterests, experienceProfiles, topGardenPlants, aiSummary, onClose }: {
  kind:ProfileDetailKind;
  progress:ReturnType<typeof buildProfileProgress>;
  keywords:Array<{label:string;value:number;tone:string;icon:React.ReactNode;description:string}>;
  savedGroups:Array<{domain:SavedExperienceInterest['domain'];label:string;empty:string;icon:string}>;
  savedInterests:SavedExperienceInterest[];
  experienceProfiles:ReturnType<typeof buildAiSejongProfile>['experienceProfiles'];
  topGardenPlants:Array<{plantId:string;rank:number;score:number;infoViewCount:number;nearbyVisitCount:number;revisitCount:number;plant:{imageUrl?:string;thumbnailUrl?:string;fallbackColor?:string;displayName:string}}>;
  aiSummary:string;
  onClose:()=>void;
}) {
  const titles:Record<ProfileDetailKind,string> = { zones: '내가 방문한 세종 공간', keywords: '키워드가 자라는 방법', records: '모든 활동 기록', growth: '프로필 성장 기록', interests:'저장한 관심사', analysis:'AI 상세 분석' };
  return <div className="profile-detail-backdrop" onClick={onClose}><section className="profile-detail-panel" onClick={event => event.stopPropagation()}><header><div><small>MY SEJONG JOURNEY</small><h2>{titles[kind]}</h2></div><button onClick={onClose}><X /></button></header>
    {kind === 'zones' && <div className="zone-detail-list">{progress.zones.map(zone => <article className={zone.visited ? 'done' : ''} key={zone.id}><span>{zone.visited ? zone.icon : <LockKeyhole />}</span><div><b>{zone.label}</b><p>{zone.visited ? `${zone.mapVisits}개 세부 공간 방문 완료` : '아직 발견하지 않은 공간이에요'}</p></div><em>{zone.visited ? '탐험 완료' : '미발견'}</em></article>)}</div>}
    {kind === 'keywords' && <div className="keyword-detail-list">{keywords.map(item => <article key={item.label}><span className={item.tone}>{item.icon}</span><div><b>{item.label}</b><p>{keywordHint(item.label)}</p><i><em style={{ width: `${item.value}%` }}/></i></div><strong>{item.value}%</strong></article>)}</div>}
    {kind === 'records' && <div className="record-detail-list">{progress.records.length ? progress.records.map(item => <article key={item.id}><img src={profileAssetUrl(item.image)} alt="" onError={handleProfileImageError}/><div><small>{item.zone} · {formatTime(item.at)}</small><b>{item.title}</b><p>{item.note}</p>{item.profileScope!=='recent-only'&&<PointBreakdown item={item}/>}</div><strong>{item.profileScope==='recent-only'?'최근 기록':`+${item.point}P`}</strong></article>) : <div className="profile-empty"><BookOpen /><b>첫 활동을 기다리고 있어요</b><p>공간 안에서 선택하거나 체험을 완료하면 구체적인 결과가 기록됩니다.</p></div>}</div>}
    {kind === 'growth' && <div className="growth-detail"><div className="growth-ring" style={{ '--score': `${progress.completion * 3.6}deg` } as CSSProperties}><b>{progress.completion}%</b></div><h3>현재까지 세종 공간 {progress.visitedZoneCount}곳, {progress.records.length}개의 순간을 기록했어요.</h3><p>새로운 맵 방문은 완성도와 탐험 점수를, 식물·생태·공연·교류 체험은 관심사와 기록 점수를 높여줍니다.</p><div><span>세종 공간 <b>{progress.visitedZoneCount}/{PROFILE_ZONES.length}</b></span><span>체험 데이터 <b>{progress.experienceCount}개</b></span><span>성장 포인트 <b>{progress.points}P</b></span></div></div>}
    {kind === 'interests' && <div className="saved-interest-groups profile-tab-interest-groups">{savedGroups.map(group=>{const items=savedInterests.filter(item=>item.domain===group.domain);return <article key={group.domain}><header><span>{group.icon}</span><div><b>{group.label}</b><small>{items.length}개</small></div></header>{items.length?<ul>{items.map(item=><li key={item.id}><b>{item.title}</b>{item.subtitle&&<small>{item.subtitle}</small>}{item.tags.length>0&&<p>{item.tags.slice(0,4).map(tag=>`#${tag}`).join(' ')}</p>}</li>)}</ul>:<p className="saved-interest-empty">{group.empty}</p>}</article>})}</div>}
    {kind === 'analysis' && <div className="profile-analysis-detail"><section><Sparkles/><div><small>AI 종합 성향 요약</small><p>{aiSummary}</p><div>{keywords.slice(0,3).map(item=><span key={item.label}>#{item.label}</span>)}</div></div></section>{experienceProfiles.map(fragment=>{const domain=fragment.source==='sejong_food_trucks'?'먹거리':fragment.source==='sejong_festival_booth'?'축제':'공연',icon=domain==='먹거리'?'🍽️':domain==='축제'?'🎪':'🎭';return <article className={`festival-self-card domain-${fragment.source}`} key={fragment.source}><div className="section-title"><div><small>{domain}에서 발견한 나</small><h3>{icon} {fragment.title}</h3></div></div><p>{fragment.summary}</p><div className="festival-self-traits">{fragment.traits?.map(trait=><span key={trait.key}><b>{trait.label} {Math.round(trait.score)}%</b><small>신뢰도 {Math.round(trait.confidence*100)}%</small></span>)}</div><details><summary>판단 근거 보기</summary>{fragment.evidence?.map(item=><p key={item}>✓ {item}</p>)}</details></article>})}{topGardenPlants.length===5&&<article className="garden-top-five-card"><div className="section-title"><div><small>수목원 행동 가중치 분석</small><h3><Leaf/> 나를 꾸미는 관심 식물 TOP 5</h3></div></div><div className="garden-top-five-list">{topGardenPlants.map(item=><article key={item.plantId}>{item.plant.imageUrl?<img src={item.plant.thumbnailUrl??item.plant.imageUrl} alt="" loading="lazy"/>:<i style={{background:item.plant.fallbackColor}}>🌱</i>}<span><small>TOP {item.rank}</small><b>{item.plant.displayName}</b><em>관심 {item.score}점</em><p>정보 {item.infoViewCount}회 · 근처 {item.nearbyVisitCount}회 · 재방문 {item.revisitCount}회</p></span></article>)}</div></article>}</div>}
  </section></div>;
}

function keywordHint(label: string) {
  if (label.includes('자연')) return '호수공원·수목원·베어트리파크 방문과 식물 관찰로 성장해요.';
  if (label.includes('문화')||label.includes('공연')) return '예술의전당·축제 체험과 공연 선택으로 성장해요.';
  if (label.includes('교류')) return '공동캠퍼스 방문과 친구·동아리 활동으로 성장해요.';
  return '사진, 감정 메모, 식물과 생태 조사 기록으로 성장해요.';
}
