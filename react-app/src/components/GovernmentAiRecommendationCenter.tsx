import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Bot,
  Check,
  Play,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import type { UserProfile } from "../types";
import {sejongDiningCodeDessertPlaces,sejongDiningCodeRestaurantPlaces} from "../data/sejongDiningCodePlaces";
import { gameEvents } from "../game/events";
import { buildAiSejongProfile } from "../services/aiSejongProfile";
import {
  loadExperienceActivityHistory,
  loadSavedExperienceInterests,
} from "../services/experienceHarness";
import {
  loadTravelProjectDraft,
  saveTravelProjectDraft,
} from "../services/travelProjectDraft";
import "./GovernmentAiRecommendationCenter.css";

const stages = [
  {
    title: "AI 분석 시작",
    detail: "사용자 데이터를 불러오고 있습니다.",
    progress: 0,
    duration: 900,
  },
  {
    title: "프로필 데이터 수집",
    detail: "메타버스 활동 기록을 수집하고 있습니다.",
    progress: 25,
    duration: 4200,
  },
  {
    title: "AI 분석",
    detail: "관심사와 활동 사이의 연결을 찾고 있습니다.",
    progress: 40,
    duration: 1700,
  },
  {
    title: "프로필 통합",
    detail: "모든 경험 데이터를 하나의 프로필로 통합합니다.",
    progress: 80,
    duration: 1900,
  },
  {
    title: "프로필 생성",
    detail: "나만의 세종 라이프 성향이 완성되었습니다.",
    progress: 100,
    duration: 5000,
  },
  {
    title: "AI 분석 결과",
    detail: "활동과 성향을 세종 추천 일정에 반영합니다.",
    progress: 100,
    duration: 5000,
  },
  {
    title: "홀로그램 도시 생성",
    detail: "디지털 트윈 세종을 구축하고 있습니다.",
    progress: 100,
    duration: 2700,
  },
  {
    title: "추천 경로 생성",
    detail: "장소 사이의 최적 동선을 연결합니다.",
    progress: 100,
    duration: 2200,
  },
  {
    title: "AI 분석 완료",
    detail: "당신만을 위한 세종 라이프 코스가 생성되었습니다.",
    progress: 100,
    duration: 0,
  },
] as const;
const mapLabels:Record<string,string>={
  town:"세종호수공원","arts-center":"세종예술의전당","festival-experience":"축제 부스",
  "food-experience":"먹거리 부스","club-street-festival":"동아리 거리제",garden:"수목원",
  "bear-play-zone":"곰 체험소",campus:"공동캠퍼스","student-hall":"학생회관",
  "recruitment-center":"모집센터","project-room":"프로젝트실",government:"정부청사",
  "government-central-plaza":"중앙광장","government-observatory":"전망대","sejong-smart-city":"스마트시티",
};
type RouteStop = { name: string; category: "밥집"|"카페"|"세종도시"; reason: string; address:string; mapUrl:string };
const kakaoSearch=(name:string,address:string)=>`https://map.kakao.com/link/search/${encodeURIComponent(`${name} ${address}`)}`;
const fallbackRouteStops: RouteStop[] = [
  {
    name: "장원갑칼국수 세종본점", category: "밥집",address:"세종특별자치시 조치원읍 허만석1로 32 2층",mapUrl:kakaoSearch("장원갑칼국수 세종본점","세종특별자치시 조치원읍 허만석1로 32"),
    reason: "최근 활동에서 확인된 미식·로컬 관심을 바탕으로 추천합니다.",
  },
  {
    name: "국립세종수목원", category: "세종도시",address:"세종특별자치시 수목원로 136",mapUrl:kakaoSearch("국립세종수목원","세종특별자치시 수목원로 136"),
    reason: "프로젝트와 도시 탐험 활동을 좋아하는 성향에 맞는 장소입니다.",
  },
  {
    name: "테라로사 세종점", category: "카페",address:"세종특별자치시 가름로 143 KT&G 세종타워 B동 1층",mapUrl:kakaoSearch("테라로사 세종점","세종특별자치시 가름로 143"),
    reason: "분석된 관심 키워드를 정리하며 쉬어갈 수 있는 장소입니다.",
  },
];
const cityCandidates=[
  {id:"city-national-arboretum",name:"국립세종수목원",address:"세종특별자치시 수목원로 136",tags:["자연","식물","산책","사진","힐링"]},
  {id:"city-lake-park",name:"세종호수공원",address:"세종특별자치시 다솜로 216",tags:["호수","산책","공연","축제","야경"]},
  {id:"city-government-rooftop",name:"정부세종청사 옥상정원",address:"세종특별자치시 도움6로 11",tags:["도시","전망","정원","건축","스마트시티"]},
  {id:"city-presidential-archives",name:"대통령기록관",address:"세종특별자치시 다솜로 250",tags:["전시","역사","기록","도시","문화"]},
];
const logs = [
  "축제 데이터 분석",
  "관심사 분석",
  "방문지역 분석",
  "프로젝트 활동 분석",
  "성장 예측",
  "최적 일정 생성",
];

export function GovernmentAiRecommendationCenter({
  profile,
  active,
  onOpenChange,
  onNotice,
  onExit,
}: {
  profile: UserProfile;
  active: boolean;
  onOpenChange: (open: boolean) => void;
  onNotice: (message: string) => void;
  onExit: () => void;
}) {
  const [nearby, setNearby] = useState(false),
    [running, setRunning] = useState(false),
    [stage, setStage] = useState(0),
    [displayProgress, setDisplayProgress] = useState(0),
    [cardIndex, setCardIndex] = useState(0),
    [selectedStop, setSelectedStop] = useState<number | null>(null),
    [finalMapStop, setFinalMapStop] = useState<number | null>(null),
    [saved, setSaved] = useState(false),
    [recommendedStops, setRecommendedStops] = useState(fallbackRouteStops),
    [recommendationSource, setRecommendationSource] = useState<"openai" | "fallback">("fallback"),
    [recommendationLoading, setRecommendationLoading] = useState(false),
    [profileRevision, setProfileRevision] = useState(0),
    [exitConfirmationOpen, setExitConfirmationOpen] = useState(false);
  const routeStops = recommendedStops;
  const ai = useMemo(() => buildAiSejongProfile(profile), [profile,profileRevision]);
  const activityRecords=useMemo(()=>loadExperienceActivityHistory(profile.nickname),[profile.nickname,profileRevision]);
  const savedInterests=useMemo(()=>loadSavedExperienceInterests(profile.nickname),[profile.nickname,profileRevision]);
  const interests = ai.interests.length
    ? ai.interests.slice(0, 4)
    : [
        { emoji: "🌿", label: "자연" },
        { emoji: "🤖", label: "AI" },
        { emoji: "🤝", label: "협업" },
        { emoji: "🚀", label: "창업" },
      ];
  const realDataCards=useMemo(()=>{
    const recent=(pattern:RegExp)=>activityRecords.filter(item=>pattern.test(item.mapId)).slice(-3).reverse().map(item=>item.title);
    const saved=(domain:"performance"|"food"|"festival"|"plant")=>savedInterests.filter(item=>item.domain===domain).slice(0,3).map(item=>item.title);
    const cards=[
      {icon:"🎭",title:"공연·축제",lines:[...saved("performance"),...saved("festival"),...recent(/arts-center|festival-experience/)]},
      {icon:"🍽️",title:"먹거리 관심",lines:[...saved("food"),...recent(/food-experience/)]},
      {icon:"💡",title:"프로젝트·모집",lines:recent(/project-room|recruitment-center/)},
      {icon:"🌿",title:"자연·식물",lines:[...saved("plant"),...recent(/garden|bear-play-zone/)]},
      {icon:"📍",title:"최근 활동 장소",lines:[...new Set(activityRecords.slice(-12).reverse().map(item=>mapLabels[item.mapId]??item.mapId))]},
    ];
    return cards.map(card=>({...card,lines:[...new Set(card.lines)].slice(0,3)})).filter(card=>card.lines.length);
  },[activityRecords,savedInterests]);
  const dataCards=realDataCards.length?realDataCards:[{icon:"🧭",title:"내 프로필",lines:[...profile.interests,...profile.preferredPlaceCategories,...profile.usagePurposes].filter(Boolean).slice(0,3)}];
  const close = () => {
    setRunning(false);
    setStage(0);
    setDisplayProgress(0);
    setCardIndex(0);
    setSelectedStop(null);
    setFinalMapStop(null);
    setExitConfirmationOpen(false);
    gameEvents.emit("government-ai-center-stage-changed", 0);
    gameEvents.emit("government-ai-center-mode-changed", false);
  };
  const start = () => {
    if (!active) return;
    setSaved(false);
    setRunning(true);
    setStage(0);
    setDisplayProgress(0);
    setCardIndex(0);
    setRecommendedStops(fallbackRouteStops);
    setRecommendationSource("fallback");
    gameEvents.emit("government-ai-center-mode-changed", true);
    gameEvents.emit("government-ai-center-stage-changed", 1);
  };
  const advance = () =>
    setStage((value) => Math.min(stages.length - 1, value + 1));
  const saveRoute = () => {
    const draft = loadTravelProjectDraft();
    saveTravelProjectDraft({
      ...draft,
      title: `${profile.nickname}님의 AI 세종 라이프 코스`,
      concept:
        "AI가 메타버스 경험과 관심사를 분석해 생성한 개인 맞춤 세종 여행",
      courseOrder: routeStops.map((stop) => stop.name),
      ideas: routeStops.map((stop, index) => ({
        id: `ai-route-${index + 1}`,
        name: stop.name,
        category: stop.category === "밥집" ? "food" : "place",
        emoji: stop.category === "밥집" ? "🍚" : stop.category === "카페" ? "☕" : "📍",
        votes: 1,
      })),
      courseActivityMap: Object.fromEntries(
        routeStops.map((stop) => [stop.name, [stop.category, stop.address, stop.reason]]),
      ),
      courseConfirmed: true,
      status: "approved",
    });
    setSaved(true);
    onNotice("AI 추천 일정을 저장했어요.");
  };
  const startTrip = () => {
    setExitConfirmationOpen(true);
  };
  const confirmStartTrip = () => {
    if (!saved) saveRoute();
    setExitConfirmationOpen(false);
    close();
    onNotice("AI 여행 일정을 저장했어요. 홈 화면으로 이동합니다.");
    window.setTimeout(onExit, 0);
  };

  useEffect(() => {
    const proximity = (value: boolean) => setNearby(value),
      begin = () => start();
    gameEvents.on("government-ai-center-proximity-changed", proximity);
    gameEvents.on("government-ai-center-start", begin);
    return () => {
      gameEvents.off("government-ai-center-proximity-changed", proximity);
      gameEvents.off("government-ai-center-start", begin);
    };
  }, [active]);
  useEffect(()=>{
    const refresh=()=>setProfileRevision(value=>value+1);
    window.addEventListener("sejong-experience-profile-updated",refresh);
    window.addEventListener("sejong-festival-interest-updated",refresh);
    window.addEventListener("sejong-lake-interest-updated",refresh);
    gameEvents.on("experience-profile-updated",refresh);
    return()=>{
      window.removeEventListener("sejong-experience-profile-updated",refresh);
      window.removeEventListener("sejong-festival-interest-updated",refresh);
      window.removeEventListener("sejong-lake-interest-updated",refresh);
      gameEvents.off("experience-profile-updated",refresh);
    };
  },[]);
  useEffect(() => {
    if (!active) {
      setNearby(false);
      close();
    }
  }, [active]);
  useEffect(() => onOpenChange(running), [onOpenChange, running]);
  useEffect(() => {
    if (!running) return;
    gameEvents.emit("government-ai-center-stage-changed", stage + 1);
    setDisplayProgress(stages[stage].progress);
    const progressTimer =
      stage === 2 ? window.setTimeout(() => setDisplayProgress(60), 720) : 0;
    if (stage >= stages.length - 1) return;
    const timer = window.setTimeout(advance, stages[stage].duration);
    return () => {
      window.clearTimeout(timer);
      if (progressTimer) window.clearTimeout(progressTimer);
    };
  }, [running, stage]);
  useEffect(() => {
    if (!running || stage !== 5 || recommendationLoading || recommendationSource === "openai") return;
    let cancelled = false;
    const request = async () => {
      setRecommendationLoading(true);
      const activityEvidence = [...activityRecords.slice(-12).flatMap((item)=>[item.title,item.note]),...ai.experienceProfiles.flatMap((fragment) => [...fragment.tags, fragment.summary])].slice(0, 30);
      const foodCandidates=sejongDiningCodeRestaurantPlaces.slice(0,8).map(place=>({placeId:place.id,name:place.name,category:"밥집" as const,address:place.address,tags:[...place.category,...place.tags].slice(0,10),isLocalBusiness:true,description:place.description,source:"kakao" as const,mapUrl:kakaoSearch(place.name,place.address)}));
      const cafeCandidates=sejongDiningCodeDessertPlaces.slice(0,8).map(place=>({placeId:place.id,name:place.name,category:"카페" as const,address:place.address,tags:[...place.category,...place.tags].slice(0,10),isLocalBusiness:true,description:place.description,source:"kakao" as const,mapUrl:kakaoSearch(place.name,place.address)}));
      const urbanCandidates=cityCandidates.map(place=>({placeId:place.id,name:place.name,category:"세종도시" as const,address:place.address,tags:place.tags,isLocalBusiness:false,description:`세종에 실제 위치한 ${place.name}입니다.`,source:"kakao" as const,mapUrl:kakaoSearch(place.name,place.address)}));
      const candidates=[...foodCandidates,...cafeCandidates,...urbanCandidates];
      try {
        const response = await fetch("/api/ai/place-recommendations", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requester: {
              userId: profile.nickname || "guest", interests: interests.map((item) => item.label).slice(0, 20),
              currentNeeds: [ai.oneLineAnalysis, `프로필 완성도 ${ai.completion}%`, `거주지역 ${profile.residence||'미입력'}`, `세종 방문 경험 ${profile.sejongVisitExperience||'미입력'}`, `MBTI ${profile.mbti||'미입력'}`, ...profile.usagePurposes].slice(0,20),
              campusInterests: profile.preferredPlaceCategories.slice(0, 20),
              plantProfile: { representativePlant: ai.representativePlant?.name, discoveredPlants: [], completionRate: ai.completion },
              festivalProfile: { visitedFestivals: activityEvidence, likedBooths: [], likedActivities: activityEvidence },
            },
            conversationSummary: { sharedInterests: interests.map((item) => item.label).slice(0, 10), wantedActivities: [...activityEvidence, ...profile.usagePurposes].slice(0, 20), avoidActivities: [], preferredMood: [ai.oneLineAnalysis],additionalConditions:["실제 후보 중 밥집 1곳, 카페 1곳, 세종도시 장소 1곳을 정확히 추천"] },
            candidatePlaces: candidates.map(({mapUrl,...candidate})=>candidate),
          }),
        });
        if (!response.ok) throw new Error("recommendation request failed");
        const payload = await response.json() as { data?: { route?: Array<{ placeId: string; reason: string }> } };
        const reasons = new Map((payload.data?.route ?? []).map((item) => [item.placeId, item.reason]));
        if (!cancelled) {
          const orderedCategories:RouteStop["category"][]=["밥집","카페","세종도시"];
          const selected=orderedCategories.map(category=>{
            const routed=(payload.data?.route??[]).map(item=>candidates.find(candidate=>candidate.placeId===item.placeId)).find(candidate=>candidate?.category===category);
            const candidate=routed??candidates.find(item=>item.category===category)!;
            return {name:candidate.name,category,address:candidate.address,mapUrl:candidate.mapUrl,reason:reasons.get(candidate.placeId)??`${ai.oneLineAnalysis} 실제 활동과 관심사를 바탕으로 추천합니다.`};
          });
          setRecommendedStops(selected);
          setRecommendationSource("openai");
          onNotice("내 프로필과 최근 활동을 분석해 OpenAI 장소 추천을 완성했어요.");
        }
      } catch {
        if (!cancelled) onNotice("OpenAI 연결이 지연되어 기본 장소 추천으로 이어갑니다.");
      } finally { if (!cancelled) setRecommendationLoading(false); }
    };
    void request();
    return () => { cancelled = true; };
  }, [activityRecords,ai, interests, onNotice, profile, recommendationLoading, recommendationSource, running, stage]);
  useEffect(() => {
    if (!running || stage !== 1) return;
    setCardIndex(0);
    const timer = window.setInterval(
      () => setCardIndex((value) => Math.min(dataCards.length - 1, value + 1)),
      760,
    );
    return () => window.clearInterval(timer);
  }, [running, stage]);
  useEffect(() => {
    if (!running) return;
    const keydown = (event: KeyboardEvent) => {
      if(exitConfirmationOpen){
        if(event.key === "Escape")setExitConfirmationOpen(false);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (event.code === "KeyE") {
        event.preventDefault();
        event.stopImmediatePropagation();
        stage === stages.length - 1 ? saveRoute() : advance();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    };
    window.addEventListener("keydown", keydown, true);
    return () => window.removeEventListener("keydown", keydown, true);
  }, [exitConfirmationOpen, running, stage, saved]);

  const current = stages[stage],
    analysisScores = [
      ["프로필 완성도", `${ai.completion}%`],
      ["최근 활동 신호", `${Math.min(99, ai.experienceProfiles.length * 18 + ai.interests.length * 3)}%`],
      ["관심 키워드 반영", `${Math.min(99, ai.interests.length * 8)}%`],
      ["성장 예측 신뢰도", `${Math.min(99, 55 + ai.experienceProfiles.length * 8)}%`],
    ],
    activities = [
      ["프로젝트", `${Math.max(0, ai.experienceProfiles.filter((item) => /project|프로젝트/i.test(item.source)).length)}개`],
      ["최근 활동", `${activityRecords.length}개 신호`],
      ["관심 키워드", `${ai.interests.length}개`],
      ["대표 성향", ai.oneLineAnalysis.slice(0, 12)],
      ["추천 지역", "3곳"],
    ];
  return (
    <>
      {active && nearby && !running && (
        <button
          type="button"
          className="government-ai-center-prompt"
          onClick={start}
        >
          <span>
            <Bot size={21} />
          </span>
          <div>
            <small>AI 세종 추천센터 · AI READY</small>
            <b>프로필 분석을 시작하세요</b>
          </div>
          <kbd>E</kbd>
          <em>AI 분석 시작</em>
        </button>
      )}
      {active && running && (
        <section
          className={`government-ai-center-experience stage-${stage + 1}`}
          aria-live="polite"
        >
          <button
            type="button"
            className="government-ai-center-close"
            onClick={close}
            aria-label="AI 추천센터 닫기"
          >
            <X />
          </button>
          <header className="government-ai-stage-title">
            <Sparkles />
            <span>
              <small>STEP {stage + 1} / 9</small>
              <b>{current.title}</b>
              <em>{current.detail}</em>
            </span>
            {stage < stages.length - 1 && <kbd>E · 빠르게 진행</kbd>}
          </header>
          {stage <= 3 && (
            <div className="government-ai-scan-column" aria-hidden="true">
              <div className="scan-particles">
                {Array.from({ length: 20 }, (_, index) => (
                  <i
                    key={index}
                    style={
                      {
                        "--particle-x": `${5 + ((index * 37) % 91)}%`,
                        "--particle-duration": `${1.2 + (index % 5) * 0.2}s`,
                        "--particle-delay": `${index * -0.09}s`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <span>{displayProgress}%</span>
              <small>
                {stage === 0
                  ? "AI 분석 중..."
                  : stage === 3
                    ? "프로필 통합 중..."
                    : "사용자 데이터 수집 중..."}
              </small>
            </div>
          )}
          {stage === 1 && (
            <div className="government-ai-data-card-cycle">
              {dataCards.map((card, index) => (
                <article
                  className={`${index === cardIndex ? "active" : ""} ${index < cardIndex ? "collected" : ""}`}
                  key={card.title}
                >
                  <span>{card.icon}</span>
                  <small>
                    PROFILE DATA {String(index + 1).padStart(2, "0")}
                  </small>
                  <h2>{card.title}</h2>
                  {card.lines.map((line) => (
                    <p key={line}>
                      <Check /> {line}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          )}
          {stage === 2 && (
            <div className="government-ai-analysis-orbits">
              <i />
              <i />
              <i />
              <b>
                AI
                <br />
                ANALYSIS
              </b>
              {(interests.length?interests.slice(0,5).map(item=>item.label):["프로필", "활동", "관심사", "성향", "방문"]).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}
          {stage === 3 && (
            <div className="government-ai-integration">
              <i />
              <i />
              <i />
              <b>80 → 100%</b>
              <span>PROFILE CORE</span>
            </div>
          )}
          {stage === 4 && (
            <article className="government-ai-profile-card">
              <small>AI PROFILE GENERATED</small>
              <div className="profile-symbol">
                {profile.nickname.slice(0, 1) || "나"}
              </div>
              <div className="profile-stars">★★★★★</div>
              <h2>{ai.experienceProfile?.title??ai.decisionProfile?.title??"나만의 세종 라이프 프로필"}</h2>
              <div className="profile-tags">
                {interests.slice(0,3).map(item=><span key={item.label}>{item.emoji} {item.label}</span>)}
              </div>
              <p>{ai.experienceProfile?.summary??ai.oneLineAnalysis}</p>
              <em>{ai.oneLineAnalysis}</em>
            </article>
          )}
          {stage === 5 && (
            <div className="government-ai-results-board">
              <article>
                <small>지금까지의 활동</small>
                <h2>수집 데이터</h2>
                {activities.map(([label, value]) => (
                  <p key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </p>
                ))}
              </article>
              <article className="result-main">
                <small>AI 분석 결과</small>
                <h2>{profile.nickname}님의 성향</h2>
                {analysisScores.map(([label, value]) => (
                  <p key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                    <i>
                      <em style={{ width: value }} />
                    </i>
                  </p>
                ))}
              </article>
              <article>
                <small>AI 추천 일정</small>
                <h2>세종 라이프 코스</h2>
                {routeStops.map((stop, index) => (
                  <p key={stop.name}>
                    <i>{index + 1}</i>
                    <b>{stop.category} · {stop.name}</b>
                  </p>
                ))}
              </article>
            </div>
          )}
          {stage >= 6 && stage <= 7 && (
            <div className="government-ai-city-hologram" aria-hidden="true">
              <div className="city-grid" />
              <div className="city-road" />
              {Array.from({ length: 24 }, (_, index) => (
                <i
                  key={index}
                  style={
                    {
                      "--x": `${(index % 8) * 12 + 5}%`,
                      "--bottom": `${(index % 4) * 11 + 15}%`,
                      "--height": `${(index % 6) * 12 + 30}px`,
                      "--delay": `${index * 45}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}
          {stage === 7 && (
            <div className="government-ai-route-layer">
              <svg viewBox="0 0 900 330" preserveAspectRatio="none">
                <path d="M80 255 C170 80 270 265 390 120 S610 260 810 60" />
              </svg>
              {routeStops.map((stop, index) => (
                <button
                  type="button"
                  className={`route-marker marker-${index + 1}`}
                  onClick={() => setSelectedStop(index)}
                  key={stop.name}
                >
                  <i>{index + 1}</i>
                  <b>{stop.name}</b>
                </button>
              ))}
              {selectedStop !== null && (
                <article className="route-reason">
                  <button type="button" onClick={() => setSelectedStop(null)}>
                    <X />
                  </button>
                  <small>AI 추천 이유</small>
                  <h3>{routeStops[selectedStop].name}</h3>
                  <p>{routeStops[selectedStop].reason}</p>
                  <a href={routeStops[selectedStop].mapUrl} target="_blank" rel="noreferrer">카카오지도에서 보기</a>
                </article>
              )}
            </div>
          )}
          {stage === 8 && (
            <div className="government-ai-final-layout">
              <article className="government-ai-final-card">
                <small>AI PERSONALIZED ROUTE GENERATED</small>
                <Check />
                <h2>
                  당신만을 위한
                  <br />
                  세종 라이프 코스가 생성되었습니다
                </h2>
                <p>{interests.map((item) => `#${item.label}`).join(" ")}</p>
              </article>
              <article className="government-ai-save-card">
                <small>일정 저장 및 방문</small>
                <h2>{saved ? "일정 저장 완료" : "AI 추천 일정 준비 완료"}</h2>
                <div className="government-ai-final-routes">
                  {routeStops.map((stop, index) => (
                    <button type="button" key={stop.name} onClick={() => setFinalMapStop(index)}>
                      <i>{index + 1}</i>
                      <span><small>{stop.category}</small>{stop.name}</span>
                      <em>지도 보기</em>
                    </button>
                  ))}
                </div>
                {finalMapStop !== null && (
                  <div className="government-ai-inline-map">
                    <header>
                      <b>{routeStops[finalMapStop].name} 카카오지도</b>
                      <button type="button" onClick={() => setFinalMapStop(null)}><X /></button>
                    </header>
                    <iframe title={`${routeStops[finalMapStop].name} 카카오지도`} src={routeStops[finalMapStop].mapUrl} />
                  </div>
                )}
                <button
                  type="button"
                  className="save-route"
                  onClick={saveRoute}
                >
                  <Save /> {saved ? "내 프로필에 저장 완료" : "내 프로필 추천 코스에 저장"}
                </button>
                <button
                  type="button"
                  className="start-route"
                  onClick={startTrip}
                >
                  <Play /> 세종 여행 시작하기
                </button>
              </article>
            </div>
          )}
          {exitConfirmationOpen && (
            <section className="government-ai-exit-confirm" role="alertdialog" aria-modal="true" aria-labelledby="government-ai-exit-title">
              <span aria-hidden="true">🏠</span>
              <small>여행 시작 전 확인</small>
              <h2 id="government-ai-exit-title">홈 화면으로 나가시겠어요?</h2>
              <p>이동하면 현재 AI 분석 화면이 종료되고 홈 화면으로 이동합니다. 중앙광장에 계속 머물 수도 있어요.</p>
              <div>
                <button type="button" onClick={()=>setExitConfirmationOpen(false)}>중앙광장에 머무르기</button>
                <button type="button" className="confirm" onClick={confirmStartTrip}>그래도 홈으로 이동</button>
              </div>
            </section>
          )}
          <footer className="government-ai-process">
            <div>
              <Bot />
              <span>
                <small>AI 분석 과정</small>
                <b>{current.title}</b>
              </span>
            </div>
            <ol>
              {logs.map((label, index) => {
                const completeAt = [2, 3, 3, 3, 4, 8][index];
                return (
                  <li className={stage >= completeAt ? "done" : ""} key={label}>
                    <Check />
                    <span>{label}</span>
                  </li>
                );
              })}
            </ol>
            <strong>{displayProgress}% {stage === 8 ? "AI 분석 완료" : "진행 중"}</strong>
          </footer>
        </section>
      )}
    </>
  );
}
