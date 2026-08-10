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
  assert.match(game, /api_config_status\?operation=chungnyeongPlaceRecommendation/);
  assert.match(wizApi, /후보에 없는 장소를 새로 만들어내지 않는다/);
  assert.match(wizApi, /세종특별자치시/);
  assert.match(game, /오늘 어디 갈지 추천해주는 세종호수공원 NPC 충녕이/);
  assert.match(game, /"✨ 장소 추천"/);
  assert.doesNotMatch(game, /placeholder="충녕이에게 메시지/);
  assert.doesNotMatch(game, /place_search\?query=/);
  assert.match(wizApi, /api\.openai\.com\/v1\/chat\/completions/);
  assert.match(wizApi, /OpenAI 추천 설정을 확인해 주세요/);
  assert.match(game, /map\.kakao\.com\/link\/map/);
  assert.match(game, /className="chungnyeong-map-expand"/);
  assert.match(game, /className="chungnyeong-inline-map"/);
  assert.doesNotMatch(game, /href=\{guidePlace\.placeUrl\} target="_blank"/);
  assert.doesNotMatch(game, /자유롭게 둘러보다가 궁금한 게 있으면/);
});

test("central plaza builds a Kakao-login profile course from live Kakao places", () => {
  const center = source("src/components/GovernmentAiRecommendationCenter.tsx");
  const game = source("src/pages/GamePage.tsx");
  const wizApi = source("../src/app/page.home/api.py");
  assert.match(game, /authenticated=\{experienceMode === "social"\}/);
  assert.match(center, /governmentProfileCourseRecommendation/);
  assert.match(center, /profileAnalysis:JSON\.stringify\(profileAnalysis\)/);
  assert.match(center, /payload\.data\?\.stops\?\.length !== 3/);
  assert.match(center, /if \(!authenticated \|\| !running \|\| recommendationAttempted\) return/);
  assert.doesNotMatch(center, /stage !== 5 \|\| recommendationAttempted/);
  assert.match(center, /stage >= 7 && routeStops\.length === 0/);
  assert.match(center, /stage === 7 && authenticated && routeStops\.length === 0/);
  assert.doesNotMatch(center, /stage === 5 && authenticated && routeStops\.length === 0/);
  assert.match(center, /const requestId = \+\+recommendationRequestRef\.current/);
  assert.match(center, /requestId === recommendationRequestRef\.current/);
  assert.doesNotMatch(center, /return \(\) => \{ cancelled = true; \}/);
  assert.match(center, /추천 경로 다시 생성/);
  assert.doesNotMatch(center, /fallbackRouteStops/);
  assert.doesNotMatch(center, /sejongDiningCodeRestaurantPlaces/);
  assert.doesNotMatch(center, /\/api\/ai\/place-recommendations/);
  assert.match(wizApi, /if not session\.get\("id"\)/);
  assert.match(wizApi, /GOVERNMENT_PROFILE_COURSE_PROMPT/);
  assert.match(wizApi, /KakaoAK/);
  assert.match(wizApi, /"source": "kakao"/);
  assert.match(wizApi, /stops=stops, ai="openai", place="kakao"/);
  assert.doesNotMatch(center, /setFinalMapStop/);
  assert.doesNotMatch(center, />지도 보기</);
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
  const projectStore = source("src/services/projectRoomProjects.ts");
  assert.match(desk, /onKeyDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  assert.match(desk, /recruitment-center-posts-updated/);
  assert.match(desk, /detail: \{ post/);
  assert.match(desk, /rememberCommunityPost\(post\)/);
  assert.match(desk, /refreshRecruitmentPosts\(\)/);
  assert.match(desk, /kind: "recruitment"/);
  assert.match(desk, /useState<Project\[\]>\(loadRecruitmentPosts\)/);
  assert.match(projectStore, /isRecruitmentProject/);
  assert.match(projectStore, /saveRecruitmentPosts/);
  assert.match(projectStore, /kind:project\.kind/);
  assert.match(desk, /disabled=\{applied\(project\)\|\|isOwner\(project\)\}/);
  assert.match(desk, /내 모집글 · 신청 불가/);
  assert.match(desk, /memberIds\.length>=item\.maxMembers\?"completed"/);
  assert.match(wizApi, /내가 만든 모집에는 신청할 수 없습니다/);
  assert.match(wizApi, /project\["status"\] = "completed"/);
  assert.match(wizApi, /action == "reviewApplication"/);
  assert.match(wizApi, /회장만 가입 신청을 처리할 수 있습니다/);
  assert.match(wizApi, /"status": "pending"/);
  assert.match(desk, /내 모집글 · 신청 불가/);
  const club = source("src/components/ClubStreetExperience.tsx");
  assert.match(club, /가입을 신청했어요\. 회장 승인을 기다려 주세요/);
  assert.match(club, /reviewClubApplication/);
  assert.match(club, /승인 대기 중/);
  assert.match(kiosk, /recruitment-center-posts-updated/);
  assert.match(kiosk, /communityActivity\(post\)/);
  assert.match(kiosk, /localCommunityPosts\(\)/);
  assert.match(lobby, /!isRecruitmentProject\(project\)/);
  assert.match(wizApi, /"kind": "recruitment" if/);
  assert.doesNotMatch(collaboration, /AI 회의 도우미/);
  assert.match(collaboration, /socket\.emit\("updateProjectIdea"/);
  assert.match(collaboration, /socket\.on\("projectIdeaUpdated"/);
  assert.match(collaboration, /socket\.emit\("enterProjectRoomInstance"/);
  assert.match(collaboration, /requestProjectCollaboration/);
  assert.match(collaboration, /const refreshCollaboration = async/);
  assert.match(collaboration, /pullSharedDraft\(true\)/);
  assert.match(collaboration, /status: current\.status/);
  assert.match(collaboration, /courseConfirmed: current\.courseConfirmed/);
  assert.match(collaboration, /다른 플레이어의 최신 프로젝트 내용을 가져왔어요/);
  assert.match(collaboration, /className="idea-board-actions"/);
  assert.match(collaboration, /className="theme-idea-actions"/);
  assert.match(collaboration, /className="project-role-refresh-button"/);
  assert.match(collaboration, /sharedRevisionRef/);
  assert.match(collaboration, /disabled=\{!canEdit\}/);
  assert.match(collaboration, /status: "completed" as const/);
  assert.match(collaboration, /정부청사로 넘어가시겠습니까\?/);
  assert.match(collaboration, /requestConsensus/);
  assert.match(collaboration, /respondConsensus/);
  assert.match(collaboration, /confirmConsensus/);
  assert.match(collaboration, /allMembersAccepted/);
  assert.match(collaboration, /const tryCompleteConsensus =/);
  assert.match(collaboration, /새로고침으로 최신 동의 상태를 확인해 주세요/);
  assert.doesNotMatch(collaboration, /onClick=\{confirmConsensusAndComplete\} disabled=\{!allMembersAccepted\}/);
  assert.match(collaboration, /코스 완성에 동의/);
  assert.match(collaboration, /await saveQueueRef\.current/);
  assert.match(collaboration, /pullAfterPendingSaves/);
  assert.match(collaboration, /변경 내용 자동 저장됨/);
  assert.match(collaboration, /PROJECT_BOARD_IDS = \["night-festival", "garden-photo", "market-culture"\]/);
  assert.match(collaboration, /cache: "no-store"/);
  assert.match(collaboration, /&_sync=\$\{syncToken\}/);
  assert.match(collaboration, /controller\.abort\(\)/);
  assert.match(collaboration, /"updateRole"/);
  assert.match(collaboration, /shared\.roles\?\.\[member\.name\]/);
  assert.match(wizApi, /member\["role"\] = state\["roles"\]\[member\["name"\]\]/);
  assert.match(wizApi, /state\["revision"\] = int\(_number\(state\.get\("revision"\), 0\)\) \+ 1/);
  assert.doesNotMatch(collaboration, /☁ 임시 저장/);
  assert.match(socketHandlers, /project-collaboration:/);
  assert.match(wizSocket, /def updateProjectIdea/);
  assert.match(wizSocket, /projectIdeaUpdated/);
  assert.match(wizApi, /merged_ideas/);
  assert.match(wizApi, /merged_messages/);
  assert.match(wizApi, /모든 참가자의 동의가 필요합니다/);
  assert.match(wizApi, /state\["revision"\]/);
  assert.match(wizApi, /if not is_leader:/);
  assert.match(centralPlaza, /item\.status==='completed'/);
});

test("Kakao relogin waits for account activity restoration before rendering profile progress",()=>{
  const app=source("src/App.tsx");
  assert.match(app,/const \[accountDataReady,setAccountDataReady\]=useState\(false\)/);
  assert.match(app,/const snapshot=await loadAccountDataSnapshot\(\)/);
  assert.match(app,/restoreAccountDataSnapshot\(snapshot,storage\)/);
  assert.match(app,/new CustomEvent\('sejong-profile-progress-updated'\)/);
  assert.match(app,/\(!behaviorStateReady\|\|!accountDataReady\)/);
  assert.match(app,/clearAllAccountData\(storage\)/);
  assert.match(app,/await refreshPersonalFarmProgress\(\)/);
  assert.match(app,/setPersonalFarmProgressUser\(profile\.nickname\)/);
});

test("MySQL personal farm progress contributes to the AI profile",()=>{
  const progress=source("src/services/profileProgress.ts");
  const profile=source("src/components/AiSejongProfile.tsx");
  assert.match(progress,/getCachedPersonalFarmProgress/);
  assert.match(progress,/id:'personal-farm-garden'/);
  assert.match(progress,/id:'personal-farm-bear-feeding'/);
  assert.match(progress,/visitedIds\.add\('garden'\)/);
  assert.match(progress,/visitedIds\.add\('bear-play-zone'\)/);
  assert.match(profile,/personal-farm-progress-changed/);
});
