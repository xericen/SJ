import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("chat whitespace and IME are not captured by the game runtime", () => {
  assert.match(source("src/game/GameCanvas.tsx"), /keyboard:\{capture:\[\]\}/);
  assert.match(
    source("src/game/renderers/VillageMapRenderer.ts"),
    /event\.isComposing/,
  );
  const sentence = "오늘 세종 어디 갈까?";
  assert.equal(sentence.trim(), sentence);
  assert.equal(`  ${sentence}  `.trim(), sentence);
});

test("direct recommendation only exposes the Kakao map action", () => {
  const direct = source("src/components/DirectRecommendation.tsx");
  assert.match(direct, /지도보기/);
  assert.doesNotMatch(direct, /모임장소로 선택/);
  assert.match(direct, /분석하고 장소 추천받기/);
  assert.match(direct, /<iframe[^>]+embeddedMapUrl/);
  assert.match(direct, /카카오맵에서 크게 보기/);
  assert.match(direct, /socket\.emit\("directRecommendationRequest"/);
  assert.match(direct, /direct-recommendation-progress/);
  assert.doesNotMatch(direct, /conversation_place_recommendation/);
});

test("government course has one real-place-only prompt and no fallback course", () => {
  const course = source("server/src/services/ai/governmentCourse.ts");
  assert.equal(
    (course.match(/GOVERNMENT_COURSE_RECOMMENDER_PROMPT=`/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(course, /return fallback\(\)/);
  assert.match(course, /min\(2\)\.max\(4\)/);
});

test("lake Chungnyeong recommends one verified Kakao place and embeds its map", () => {
  const game = source("src/pages/GamePage.tsx");
  const wizApi = source("../src/app/page.home/api.py");
  assert.match(wizApi, /CHUNGNYEONG_LAKE_PLACE_PROMPT/);
  assert.match(wizApi, /chungnyeongPlaceRecommendation/);
  assert.match(wizApi, /후보에 없는 장소를 새로 만들어내지 않는다/);
  assert.match(wizApi, /세종특별자치시/);
  assert.match(wizApi, /오늘 가볼 세종 장소를 추천해주는 충녕이/);
  assert.match(game, /map\.kakao\.com\/link\/map/);
  assert.match(game, /place_search\?query=/);
  assert.doesNotMatch(game, /자유롭게 둘러보다가 궁금한 게 있으면/);
});

test("recruitment posts stay in the recruitment kiosk and project ideas sync live", () => {
  const desk = source("src/components/RecruitmentCenterDesk.tsx");
  const kiosk = source("src/components/RecruitmentCenterKiosk.tsx");
  const lobby = source("src/components/ProjectLobbyBoard.tsx");
  const collaboration = source("src/components/ProjectRoomInteractions.tsx");
  const socketHandlers = source("server/src/socket/registerSocketHandlers.ts");
  const wizSocket = source("../src/app/page.home/socket.py");
  const wizApi = source("../src/app/page.home/api.py");
  const centralPlaza = source("src/components/GovernmentCentralPlazaWebUI.tsx");
  assert.match(desk, /onKeyDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  assert.match(desk, /recruitment-center-posts-updated/);
  assert.match(desk, /detail: \{ post/);
  assert.match(desk, /rememberCommunityPost\(post\)/);
  assert.match(kiosk, /recruitment-center-posts-updated/);
  assert.match(kiosk, /communityActivity\(post\)/);
  assert.match(kiosk, /localCommunityPosts\(\)/);
  assert.match(lobby, /!project\.id\.startsWith\("recruitment-"\)/);
  assert.doesNotMatch(collaboration, /AI 회의 도우미/);
  assert.match(collaboration, /socket\.emit\("updateProjectIdea"/);
  assert.match(collaboration, /socket\.on\("projectIdeaUpdated"/);
  assert.match(collaboration, /socket\.emit\("enterProjectRoomInstance"/);
  assert.match(collaboration, /requestProjectCollaboration/);
  assert.match(collaboration, /sharedRevisionRef/);
  assert.match(collaboration, /disabled=\{!canEdit\}/);
  assert.match(collaboration, /status: "completed" as const/);
  assert.match(collaboration, /정부청사로 넘어가시겠습니까\?/);
  assert.match(collaboration, /> 코스 완성\s*</);
  assert.match(socketHandlers, /project-collaboration:/);
  assert.match(wizSocket, /def updateProjectIdea/);
  assert.match(wizSocket, /projectIdeaUpdated/);
  assert.match(wizApi, /merged_ideas/);
  assert.match(wizApi, /state\["revision"\]/);
  assert.match(wizApi, /if not is_leader:/);
  assert.match(centralPlaza, /item\.status==='completed'/);
});
