import { useEffect, useState, type MouseEvent } from "react";
import { ArrowRight, LoaderCircle, MapPin, Sparkles, X } from "lucide-react";
import type {
  DirectMessage,
  DirectRecommendationPlace,
  DirectRoom,
  DirectRoomMeetingPlace,
  GovernmentSessionProposal,
} from "../../shared/socket-events";
import { API_BASE_URL } from "../config/api";
import { gameEvents } from "../game/events";
import { socket } from "../game/systems/socketClient";

const allowedHosts = ["place.map.kakao.com", "map.kakao.com", "kko.to"];
const mapUrl = (place: {
  name: string;
  address: string;
  externalUrl?: string;
}) => {
  const external = place.externalUrl?.trim();
  if (external) return external;
  return place.name && place.address
    ? `https://map.kakao.com/?q=${encodeURIComponent(`${place.name} ${place.address}`)}`
    : "";
};
export function openKakaoMap(
  event: MouseEvent<HTMLButtonElement>,
  place: { name: string; address: string; externalUrl?: string },
  showToast: (message: string) => void,
) {
  event.preventDefault();
  event.stopPropagation();
  const value = mapUrl(place);
  if (!value) return showToast("카카오맵 링크를 찾을 수 없습니다.");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return showToast("올바르지 않은 카카오맵 링크입니다.");
  }
  if (
    !allowedHosts.some(
      (host) =>
        parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  )
    return showToast("허용되지 않은 지도 링크입니다.");
  const opened = window.open(
    parsed.toString(),
    "_blank",
    "noopener,noreferrer",
  );
  if (!opened)
    showToast("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
}

export function DirectRecommendationControls({
  room,
  messageCount,
}: {
  room: DirectRoom;
  messageCount: number;
}) {
  const [consentOpen, setConsentOpen] = useState(false),
    [loading, setLoading] = useState(false),
    [stage, setStage] = useState(""),
    [error, setError] = useState(""),
    [userRequest, setUserRequest] = useState("");
  useEffect(() => {
    const started = (data: {
      directRoomId: string;
      stage: "analyzing" | "searching";
    }) => {
      if (data.directRoomId !== room.id) return;
      setLoading(true);
      setStage(
        data.stage === "analyzing"
          ? "충녕이가 두 분의 대화를 살펴보고 있어요"
          : "조치원의 실제 장소를 찾고 있어요",
      );
    };
    const completed = (data: { directRoomId: string }) => {
      if (data.directRoomId !== room.id) return;
      setLoading(false);
      setConsentOpen(false);
      setStage("");
      setError("");
    };
    const failed = (data: { directRoomId: string; message: string }) => {
      if (data.directRoomId !== room.id) return;
      setLoading(false);
      setStage("");
      setError(data.message);
    };
    socket.on("directRecommendationStarted", started);
    socket.on("directRecommendationCompleted", completed);
    socket.on("directRecommendationFailed", failed);
    return () => {
      socket.off("directRecommendationStarted", started);
      socket.off("directRecommendationCompleted", completed);
      socket.off("directRecommendationFailed", failed);
    };
  }, [room.id]);
  const request = async () => {
    setLoading(true);
    setStage("최근 대화를 안전하게 분석하고 있어요");
    setError("");
    try {
      if (import.meta.env.PROD) {
        (socket as unknown as {emit:(event:string,payload:unknown)=>void}).emit("directRecommendationRequest", { directRoomId: room.id, userRequest: userRequest.trim() });
        return;
      }
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(
        `${API_BASE_URL}/direct-rooms/${encodeURIComponent(room.id)}/recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Socket-Id": socket.id ?? "",
          },
          body: JSON.stringify(
            userRequest.trim() ? { userRequest: userRequest.trim() } : {},
          ),
          signal: controller.signal,
        },
      );
      window.clearTimeout(timeout);
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "추천 요청에 실패했어요.");
      }
    } catch (error) {
      setLoading(false);
      setStage("");
      setError(
        error instanceof Error ? error.message : "네트워크 오류가 발생했어요.",
      );
    }
  };
  const enabled =
    room.active &&
    room.participants.some((participant) => participant.id === socket.id) &&
    messageCount >= 2 &&
    !loading;
  return (
    <div className="direct-recommendation-controls">
      <button
        type="button"
        disabled={!enabled}
        onClick={() => setConsentOpen(true)}
      >
        <Sparkles size={15} /> 대화 보고 장소 추천
      </button>
      {messageCount < 2 && (
        <small>대화를 2개 이상 나누면 추천할 수 있어요.</small>
      )}
      {error && <small className="error">{error}</small>}
      {consentOpen && (
        <div className="recommendation-overlay">
          <section className={`recommendation-modal direct-consent-modal ${loading ? "is-loading" : ""}`} aria-live="polite">
            <button
              type="button"
              className="close"
              disabled={loading}
              onClick={() => setConsentOpen(false)}
            >
              <X />
            </button>
            {loading ? <div className="direct-analysis-progress"><LoaderCircle/><small>AI PLACE MATCHING</small><h2>두 분에게 맞는 장소를 찾는 중이에요</h2><p>{stage}</p><ol><li className="done">최근 대화 확인</li><li className={stage.includes("실제 장소") ? "done" : "active"}>관심 활동 분석</li><li className={stage.includes("실제 장소") ? "active" : ""}>세종 실제 장소 검색</li></ol><span>잠시만 기다려 주세요. 추천 결과는 채팅에 바로 표시됩니다.</span></div> : <><div className="direct-consent-icon"><Sparkles/></div><small>대화 기반 실제 장소 추천</small><h2>최근 대화로 장소를 찾아볼까요?</h2><p>최근 메시지 최대 20개를 A/B로 익명화해 분석하고, 카카오에서 확인된 세종의 실제 장소만 추천해요.</p><label><span>원하는 조건이 있다면 알려주세요 <em>선택</em></span><textarea value={userRequest} maxLength={300} onChange={(event) => setUserRequest(event.target.value)} placeholder="예: 조용한 카페, 주차하기 편한 곳"/></label><div className="direct-consent-actions"><button type="button" onClick={() => setConsentOpen(false)}>취소</button><button type="button" className="primary" onClick={() => void request()}><Sparkles size={16}/> 분석하고 추천받기</button></div><small className="privacy-note">민감정보는 보내지 않으며, 버튼을 누를 때만 분석합니다.</small></>}
          </section>
        </div>
      )}
    </div>
  );
}

export function DirectRecommendationMessage({
  message,
  room,
  showToast,
}: {
  message: DirectMessage;
  room: DirectRoom;
  showToast: (message: string) => void;
}) {
  const recommendation = message.recommendation,
    [selected, setSelected] = useState<DirectRecommendationPlace | null>(null),
    [mapPlace, setMapPlace] = useState<DirectRecommendationPlace | null>(null),
    [saving, setSaving] = useState(false);
  if (!recommendation) return null;
  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/direct-rooms/${encodeURIComponent(room.id)}/meeting-place`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Socket-Id": socket.id ?? "",
          },
          body: JSON.stringify({
            recommendationId: recommendation.recommendationId,
            placeId: selected.id,
          }),
        },
      );
      const body = (await response.json()) as {
        error?: string;
        changed?: boolean;
      };
      if (!response.ok)
        throw new Error(
          body.error ?? "모임 장소를 등록하지 못했습니다. 다시 시도해 주세요.",
        );
      showToast(
        body.changed
          ? "모임 장소가 변경되었습니다."
          : "모임 장소로 등록되었습니다.",
      );
      setSelected(null);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "모임 장소를 등록하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <article className="direct-ai-message">
      <b>✨ 대화 보고 찾은 장소</b>
      <p>{recommendation.summary}</p>
      {recommendation.places.map((place) => (
        <section className="place-card recommendation-card" key={place.id}>
          <small>{place.category}</small>
          <h3>{place.name}</h3>
          <p>
            <MapPin size={14} />
            {place.roadAddress || place.address}
          </p>
          <p>{place.recommendationReason}</p>
          <div>
            <button
              type="button"
              disabled={!mapUrl(place)}
              title={
                mapUrl(place)
                  ? undefined
                  : "지도 링크가 제공되지 않은 장소입니다."
              }
              onClick={() => setMapPlace(place)}
            >
              중앙에서 장소 보기
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelected(place);
              }}
            >
              모임 장소로 선택
            </button>
          </div>
        </section>
      ))}
      {mapPlace && (
        <div className="recommendation-overlay">
          <section className="recommendation-modal kakao-map-modal">
            <header><div><small>카카오맵 장소 정보</small><h2>{mapPlace.name}</h2><p>{mapPlace.roadAddress || mapPlace.address}</p></div><button type="button" className="close" onClick={() => setMapPlace(null)}><X /></button></header>
            <iframe title={`${mapPlace.name} 카카오맵`} src={mapUrl(mapPlace)} referrerPolicy="no-referrer-when-downgrade" />
          </section>
        </div>
      )}
      {selected && (
        <div className="recommendation-overlay">
          <section className="recommendation-modal meeting-confirm">
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <h2>
              {room.meetingPlace
                ? "기존 모임 장소를 이 장소로 변경할까요?"
                : "이 장소를 모임 장소로 등록할까요?"}
            </h2>
            <h3>{selected.name}</h3>
            <p>{selected.category}</p>
            <p>{selected.roadAddress || selected.address}</p>
            <p>등록하면 두 채팅 참여자에게 공지됩니다.</p>
            <div>
              <button type="button" onClick={() => setSelected(null)}>
                취소
              </button>
              <button
                type="button"
                className="primary"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? "등록 중..." : "모임 장소로 등록"}
              </button>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}

export function MeetingPlaceBanner({
  room,
  showToast,
}: {
  room: DirectRoom;
  showToast: (message: string) => void;
}) {
  const place = room.meetingPlace;
  const remove = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/direct-rooms/${encodeURIComponent(room.id)}/meeting-place`,
        { method: "DELETE", headers: { "X-Socket-Id": socket.id ?? "" } },
      );
      const body = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(body.error ?? "모임 장소 등록을 해제하지 못했습니다.");
      showToast("모임 장소 등록이 해제되었습니다.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "모임 장소 등록을 해제하지 못했습니다.",
      );
    }
  };
  return (
    <aside className="meeting-place-banner">
      {place ? (
        <>
          <b>모임 장소 · {place.placeName}</b>
          <small>{place.roadAddress || place.address}</small>
          <small>
            {place.selectedByNickname} ·{" "}
            {new Date(place.selectedAt).toLocaleString("ko-KR")}
          </small>
          <div>
            <button
              type="button"
              onClick={(event) =>
                openKakaoMap(
                  event,
                  {
                    name: place.placeName,
                    address: place.address,
                    externalUrl: place.externalUrl,
                  },
                  showToast,
                )
              }
            >
              카카오맵 보기
            </button>
            <button type="button" onClick={() => void remove()}>
              등록 해제
            </button>
          </div>
        </>
      ) : (
        <small>아직 등록된 모임 장소가 없습니다.</small>
      )}
    </aside>
  );
}

export function MeetingPlaceSystemMessage({
  message,
  showToast,
}: {
  message: DirectMessage;
  showToast: (message: string) => void;
}) {
  const place = message.meetingPlace;
  return (
    <article className="meeting-place-system">
      <b>[공지]</b>
      <p>{message.message}</p>
      {place && (
        <>
          <strong>{place.placeName}</strong>
          <small>{place.roadAddress || place.address}</small>
          <button
            type="button"
            onClick={(event) =>
              openKakaoMap(
                event,
                {
                  name: place.placeName,
                  address: place.address,
                  externalUrl: place.externalUrl,
                },
                showToast,
              )
            }
          >
            카카오맵에서 보기
          </button>
        </>
      )}
    </article>
  );
}

export function GovernmentSessionPanel({
  room,
  showToast,
  onSessionReady,
}: {
  room: DirectRoom;
  showToast: (message: string) => void;
  onSessionReady?: (sessionId: string) => void;
}) {
  const [proposal, setProposal] = useState<GovernmentSessionProposal | null>(
    null,
  );
  const nickname =
    room.participants.find((participant) => participant.id === socket.id)
      ?.nickname ?? "";
  let clubContext: { clubName?: string; topic?: string; place?: string } = {};
  try {
    clubContext = JSON.parse(
      localStorage.getItem(`campus-club-government-context:${nickname}`) ??
        "{}",
    ) as typeof clubContext;
  } catch {
    clubContext = {};
  }
  const savedTopic = localStorage
    .getItem(`campus-activity-vote:${nickname}`)
    ?.replaceAll("-", " ");
  const topic =
    [
      clubContext.clubName ? `${clubContext.clubName} 공동 활동` : undefined,
      clubContext.topic ? `주제 ${clubContext.topic}` : savedTopic,
      clubContext.place ? `희망 장소 ${clubContext.place}` : undefined,
    ]
      .filter(Boolean)
      .join(" · ") || undefined;
  useEffect(() => {
    const updated = (next: GovernmentSessionProposal) => {
      if (next.directRoomId !== room.id) return;
      setProposal(next);
      if (next.status === "accepted")
        showToast("두 사람의 정부청사 계획 세션이 만들어졌어요.");
      if (next.status === "rejected")
        showToast("상대방이 이번 이동 제안을 정중히 거절했어요.");
    };
    socket.on("governmentSessionProposalUpdated", updated);
    return () => {
      socket.off("governmentSessionProposalUpdated", updated);
    };
  }, [room.id, showToast]);
  useEffect(() => {
    if (proposal?.status === "accepted" && proposal.sessionId)
      onSessionReady?.(proposal.sessionId);
  }, [proposal, onSessionReady]);
  const mine = proposal?.fromId === socket.id;
  if (proposal?.status === "accepted")
    return (
      <section className="government-session-panel accepted">
        <span>🏛️</span>
        <div>
          <small>공유 계획 세션 생성 완료</small>
          <b>정부청사에서 함께 장소를 정해요</b>
          <p>세션 코드 {proposal.sessionId?.slice(-8).toUpperCase()}</p>
        </div>
        <button
          type="button"
          onClick={() => gameEvents.emit("travel-to-map", "government")}
        >
          정부청사 이동
        </button>
      </section>
    );
  if (proposal?.status === "pending")
    return (
      <section className="government-session-panel">
        <span>🏛️</span>
        <div>
          <small>{mine ? "응답 대기 중" : "정부청사 이동 제안"}</small>
          <b>
            {mine
              ? "상대방의 선택을 기다리고 있어요"
              : `${proposal.fromNickname}님이 함께 장소를 정하고 싶어 해요`}
          </b>
          {proposal.activityTopic && (
            <p>모임 주제 · {proposal.activityTopic}</p>
          )}
        </div>
        {!mine && (
          <aside>
            <button
              type="button"
              onClick={() =>
                socket.emit("respondGovernmentSession", {
                  proposalId: proposal.id,
                  accept: false,
                })
              }
            >
              다음에
            </button>
            <button
              type="button"
              onClick={() =>
                socket.emit("respondGovernmentSession", {
                  proposalId: proposal.id,
                  accept: true,
                })
              }
            >
              수락
            </button>
          </aside>
        )}
      </section>
    );
  return (
    <button
      type="button"
      className="government-proposal-button"
      onClick={() =>
        socket.emit("proposeGovernmentSession", {
          directRoomId: room.id,
          activityTopic: topic,
        })
      }
    >
      <span>🏛️</span>
      <div>
        <small>AI와 같은 세종 여행 코스를 편집해요</small>
        <b>같이 코스 만들기</b>
      </div>
      <ArrowRight size={16} />
    </button>
  );
}
