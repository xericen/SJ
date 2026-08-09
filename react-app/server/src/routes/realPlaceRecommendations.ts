import { Router } from "express";
import { env } from "../config/env.js";
import { KakaoPlaceProvider } from "../providers/places/kakaoPlaceProvider.js";
import { createConversationAnalysisProvider } from "../providers/providerFactory.js";
import { roomStore } from "../rooms/roomStore.js";
import { getSocketServer } from "../socket/socketRuntime.js";
import type {
  ConversationMessage,
  PlaceCandidate,
  RecommendationUser,
} from "../types/recommendation.js";
import type {
  DirectMessage,
  DirectRecommendation,
} from "../../../shared/socket-events.js";
import { getOpenAIClient } from "../services/ai/openaiClient.js";

export const realPlaceRecommendationsRouter = Router();
const recentChungnyeongPlaces = new Map<string, string>();
const categories = [
  "카페",
  "맛집",
  "공원",
  "산책",
  "관광명소",
  "문화시설",
  "전시",
  "체험",
  "디저트",
];
const isSejong = (place: PlaceCandidate) =>
  `${place.roadAddress} ${place.address}`.includes("세종특별자치시");
const chungnyeongMessage = async (place: PlaceCandidate) => {
  const fallback = `오늘은 ${place.name} 한번 가보는 거 어때요?`;
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return fallback;
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: env.OPENAI_MODEL,
      max_completion_tokens: 100,
      messages: [
        {
          role: "system",
          content:
            "너는 친근한 세종 안내 NPC 충녕이다. 제공된 실제 장소 이름을 그대로 유지하고, 확인되지 않은 가격·영업시간·평점·메뉴를 말하지 말며 한두 문장으로만 추천한다.",
        },
        {
          role: "user",
          content: JSON.stringify({
            placeName: place.name,
            category: place.category,
            address: place.roadAddress || place.address,
          }),
        },
      ],
    });
    return response.choices[0]?.message.content?.trim() || fallback;
  } catch {
    return fallback;
  }
};
const strictSearch = async (queries: string[]) => {
  const provider = new KakaoPlaceProvider(),
    unique = new Map<string, PlaceCandidate>();
  for (const query of queries.slice(0, 5))
    for (const place of await provider.searchPlacesByKeyword(query, {
      size: 15,
    }))
      if (isSejong(place)) unique.set(place.id, place);
  if (!unique.size) {
    const relaxed = queries
      .map((query) =>
        query.replace(/조용한|분위기 좋은|예쁜|데이트|추천/g, "").trim(),
      )
      .filter(Boolean);
    for (const query of relaxed.slice(0, 3))
      for (const place of await provider.searchPlacesByKeyword(query, {
        size: 15,
      }))
        if (isSejong(place)) unique.set(place.id, place);
  }
  return [...unique.values()].slice(0, 10);
};

realPlaceRecommendationsRouter.post(
  "/conversation-place-recommendation",
  async (req, res) => {
    const directRoomId =
        typeof req.body?.directRoomId === "string" ? req.body.directRoomId : "",
      requesterId = req.get("X-Socket-Id")?.trim() ?? "",
      io = getSocketServer(),
      room = roomStore.directRooms.get(directRoomId);
    const fail = (status: number, error: string) => {
      if (requesterId)
        io?.to(requesterId).emit("directRecommendationFailed", {
          directRoomId,
          category: "unknown",
          message: error,
        });
      return res.status(status).json({ error });
    };
    if (
      !room ||
      !requesterId ||
      !io?.sockets.sockets.has(requesterId) ||
      !room.participants.some((person) => person.id === requesterId)
    )
      return fail(403, "이 채팅방의 참여자만 추천을 요청할 수 있습니다.");
    const stored = roomStore.recentUserMessages(directRoomId, 30);
    if (stored.length < 2)
      return fail(422, "두 분의 대화를 조금 더 나눈 뒤 추천받아 보세요.");
    io.to(directRoomId).emit("directRecommendationStarted", {
      directRoomId,
      stage: "analyzing",
    });
    try {
      const ids = [...new Set(stored.map((message) => message.senderId))],
        users: RecommendationUser[] = ids.map((id) => ({
          id,
          nickname: id === ids[0] ? "A" : "B",
          interests: [],
          usagePurposes: [],
          preferredPlaceCategories: [],
          experienceRecords: [],
          mbti: "",
        }));
      const messages: ConversationMessage[] = stored.map((message) => ({
        senderId: message.senderId,
        message: message.message.slice(0, 500),
        createdAt: message.createdAt,
      }));
      const ai = createConversationAnalysisProvider(),
        analysis = await ai.analyze(
          users,
          messages,
          directRoomId,
          "세종특별자치시",
          typeof req.body?.userRequest === "string"
            ? req.body.userRequest.slice(0, 300)
            : undefined,
        );
      const queries = [
        ...new Set(
          analysis.searchKeywords.map((keyword) =>
            keyword.includes("세종") ? keyword : `세종 ${keyword}`,
          ),
        ),
      ];
      io.to(directRoomId).emit("directRecommendationStarted", {
        directRoomId,
        stage: "searching",
      });
      const candidates = await strictSearch(queries);
      if (!candidates.length)
        return fail(
          404,
          "조건에 맞는 장소를 찾지 못했어요. 다른 분위기로 다시 추천해볼까요?",
        );
      const copy = await ai.createCopy(analysis, candidates),
        chosen = copy.recommendations
          .map((item) => ({
            item,
            place: candidates.find((place) => place.id === item.placeId),
          }))
          .find((value) => value.place) ?? {
          item: { placeId: candidates[0].id, reason: analysis.summary },
          place: candidates[0],
        };
      const place = chosen.place!,
        recommendationPlaces = [
          {
            id: place.id,
            name: place.name,
            category: place.category,
            address: place.address,
            roadAddress: place.roadAddress,
            phone: place.phone,
            externalUrl: place.externalUrl,
            longitude: place.longitude,
            latitude: place.latitude,
            distanceMeters: place.distanceMeters,
            source: "kakao" as const,
            recommendationReason: chosen.item.reason,
          },
        ],
        recommendationId = roomStore.saveRecommendation(
          directRoomId,
          recommendationPlaces,
        );
      const recommendation: DirectRecommendation = {
        recommendationId,
        summary: copy.message || analysis.summary,
        basis: {
          activity: analysis.meetingIntent,
          region: "세종특별자치시",
          rejectedCategories: analysis.rejectedCategories,
          mood: analysis.preferredMood,
        },
        places: recommendationPlaces,
      };
      const message: DirectMessage = {
        id: crypto.randomUUID(),
        directRoomId,
        senderId: "chungnyeongi",
        nickname: "충녕이",
        message: recommendation.summary,
        createdAt: Date.now(),
        type: "ai-recommendation",
        recommendation,
      };
      roomStore.addDirectMessage(message);
      io.to(directRoomId).emit("directRecommendationCompleted", {
        directRoomId,
        message,
      });
      return res.json({ ok: true, message });
    } catch (error) {
      console.error(
        "[real place recommendation]",
        error instanceof Error ? error.name : "unknown",
      );
      return fail(
        502,
        "실제 세종 장소 추천을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    }
  },
);

realPlaceRecommendationsRouter.get(
  "/chungnyeong-place-recommendation",
  async (req, res) => {
    try {
      const category =
          categories[Math.floor(Math.random() * categories.length)],
        places = await strictSearch([`세종 ${category}`]),
        session = req.get("X-Socket-Id")?.trim() || req.ip || "anonymous",
        previous = recentChungnyeongPlaces.get(session),
        pool =
          places.length > 1
            ? places.filter((place) => place.id !== previous)
            : places,
        place = pool[Math.floor(Math.random() * pool.length)];
      if (!place)
        return res.status(404).json({
          error: "실제 세종 장소를 찾지 못했어요. 잠시 후 다시 눌러주세요.",
        });
      recentChungnyeongPlaces.set(session, place.id);
      return res.json({
        place: {
          placeName: place.name,
          address: place.roadAddress || place.address,
          category: place.category,
          placeUrl: place.externalUrl,
          message: await chungnyeongMessage(place),
        },
      });
    } catch (error) {
      console.error(
        "[chungnyeong real place]",
        error instanceof Error ? error.name : "unknown",
      );
      return res.status(502).json({
        error: "실제 세종 장소를 찾지 못했어요. 잠시 후 다시 눌러주세요.",
      });
    }
  },
);
