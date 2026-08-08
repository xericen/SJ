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
import { gameEvents } from "../game/events";
import { buildAiSejongProfile } from "../services/aiSejongProfile";
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
    duration: 2200,
  },
  {
    title: "AI 분석 결과",
    detail: "활동과 성향을 세종 추천 일정에 반영합니다.",
    progress: 100,
    duration: 2200,
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
const dataCards = [
  {
    icon: "🎪",
    title: "축제 활동",
    lines: ["공연 참여", "음식 체험", "부스 체험"],
  },
  {
    icon: "💡",
    title: "프로젝트",
    lines: ["AI 프로젝트", "환경 프로젝트", "창업 프로젝트"],
  },
  { icon: "🤝", title: "동아리", lines: ["개발", "디자인"] },
  { icon: "🌿", title: "식물도감", lines: ["3 / 3 완료"] },
  {
    icon: "📍",
    title: "방문 장소",
    lines: ["세종호수공원", "학생회관", "정부청사", "국립세종수목원"],
  },
] as const;
type RouteStop = { name: string; category: string; reason: string };
const fallbackRouteStops: RouteStop[] = [
  {
    name: "세종 로컬 맛집", category: "맛집",
    reason: "최근 활동에서 확인된 미식·로컬 관심을 바탕으로 추천합니다.",
  },
  {
    name: "세종 도시전망·도시체험", category: "세종도시",
    reason: "프로젝트와 도시 탐험 활동을 좋아하는 성향에 맞는 장소입니다.",
  },
  {
    name: "세종 감성 카페", category: "카페",
    reason: "분석된 관심 키워드를 정리하며 쉬어갈 수 있는 장소입니다.",
  },
] as const;
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
    [saved, setSaved] = useState(false),
    [recommendedStops, setRecommendedStops] = useState(fallbackRouteStops),
    [recommendationSource, setRecommendationSource] = useState<"openai" | "fallback">("fallback"),
    [recommendationLoading, setRecommendationLoading] = useState(false);
  const routeStops = recommendedStops;
  const ai = useMemo(() => buildAiSejongProfile(profile), [profile]);
  const interests = ai.interests.length
    ? ai.interests.slice(0, 4)
    : [
        { emoji: "🌿", label: "자연" },
        { emoji: "🤖", label: "AI" },
        { emoji: "🤝", label: "협업" },
        { emoji: "🚀", label: "창업" },
      ];
  const close = () => {
    setRunning(false);
    setStage(0);
    setDisplayProgress(0);
    setCardIndex(0);
    setSelectedStop(null);
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
      courseConfirmed: true,
      status: "approved",
    });
    setSaved(true);
    onNotice("AI 추천 일정을 저장했어요.");
  };
  const startTrip = () => {
    if (!saved) saveRoute();
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
      const activityRecords = ai.experienceProfiles.flatMap((fragment) => [...fragment.tags, fragment.summary]).slice(0, 20);
      const candidates = fallbackRouteStops.map((stop, index) => ({
        placeId: `sejong-ai-${index + 1}`, name: stop.name, category: stop.category,
        address: "세종특별자치시", tags: [stop.category, ...interests.map((item) => item.label)].slice(0, 10),
        isLocalBusiness: stop.category !== "세종도시", description: stop.reason, source: "admin" as const,
      }));
      try {
        const response = await fetch("/api/ai/place-recommendations", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requester: {
              userId: profile.nickname || "guest", interests: interests.map((item) => item.label).slice(0, 20),
              currentNeeds: [ai.oneLineAnalysis, `프로필 완성도 ${ai.completion}%`],
              campusInterests: profile.preferredPlaceCategories.slice(0, 20),
              plantProfile: { representativePlant: ai.representativePlant?.name, discoveredPlants: [], completionRate: ai.completion },
              festivalProfile: { visitedFestivals: activityRecords, likedBooths: [], likedActivities: activityRecords },
            },
            conversationSummary: { sharedInterests: interests.map((item) => item.label).slice(0, 10), wantedActivities: [...activityRecords, ...profile.usagePurposes].slice(0, 20), avoidActivities: [], preferredMood: [ai.oneLineAnalysis] },
            candidatePlaces: candidates,
          }),
        });
        if (!response.ok) throw new Error("recommendation request failed");
        const payload = await response.json() as { data?: { route?: Array<{ placeId: string; reason: string }> } };
        const reasons = new Map((payload.data?.route ?? []).map((item) => [item.placeId, item.reason]));
        if (!cancelled) {
          setRecommendedStops(candidates.map((candidate) => ({ name: candidate.name, category: candidate.category, reason: reasons.get(candidate.placeId) ?? candidate.description })));
          setRecommendationSource("openai");
          onNotice("내 프로필과 최근 활동을 분석해 OpenAI 장소 추천을 완성했어요.");
        }
      } catch {
        if (!cancelled) onNotice("OpenAI 연결이 지연되어 기본 장소 추천으로 이어갑니다.");
      } finally { if (!cancelled) setRecommendationLoading(false); }
    };
    void request();
    return () => { cancelled = true; };
  }, [ai, interests, onNotice, onExit, profile, recommendationLoading, recommendationSource, running, stage]);
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
  }, [running, stage, saved]);

  const current = stages[stage],
    analysisScores = [
      ["프로필 완성도", `${ai.completion}%`],
      ["최근 활동 신호", `${Math.min(99, ai.experienceProfiles.length * 18 + ai.interests.length * 3)}%`],
      ["관심 키워드 반영", `${Math.min(99, ai.interests.length * 8)}%`],
      ["성장 예측 신뢰도", `${Math.min(99, 55 + ai.experienceProfiles.length * 8)}%`],
    ],
    activities = [
      ["프로젝트", `${Math.max(0, ai.experienceProfiles.filter((item) => /project|프로젝트/i.test(item.source)).length)}개`],
      ["최근 활동", `${ai.experienceProfiles.length}개 신호`],
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
              {["축제", "프로젝트", "동아리", "자연", "방문"].map((item) => (
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
              <h2>협업형 라이프 크리에이터</h2>
              <div className="profile-tags">
                <span>AI 관심 높음</span>
                <span>자연 선호</span>
                <span>창업 관심</span>
              </div>
              <p>
                새로운 사람과 협업을 선호합니다.
                <br />
                자연 속 활동을 좋아하며 프로젝트 참여율이 높습니다.
              </p>
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
                    <b>{stop.name}</b>
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
                <div>
                  {routeStops.map((stop, index) => (
                    <span key={stop.name}>
                      <i>{index + 1}</i>
                      {stop.name}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="save-route"
                  onClick={saveRoute}
                >
                  <Save /> {saved ? "저장 완료" : "여행 일정 저장"}
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
