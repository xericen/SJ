import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {loadFriendIds,loadSocialBlocks,saveFriendIds,saveSocialBlock,saveSocialReport,SOCIAL_REPORTS_STORAGE_KEY} from '../src/services/socialSafety';

class MemoryStorage{
  values=new Map<string,string>();
  getItem(key:string){return this.values.get(key)??null}
  setItem(key:string,value:string){this.values.set(key,value)}
}

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('친구 추가와 삭제 상태를 같은 저장소에서 전환한다',()=>{
  const storage=new MemoryStorage();
  assert.deepEqual(loadFriendIds(storage),[]);
  saveFriendIds(['npc-guide'],storage);
  assert.deepEqual(loadFriendIds(storage),['npc-guide']);
  saveFriendIds([],storage);
  assert.deepEqual(loadFriendIds(storage),[]);
});
test('신고와 대화 차단·캐릭터 숨김 결정을 저장한다',()=>{
  const storage=new MemoryStorage();
  const chat=saveSocialBlock({},'player-1','chat',storage);
  assert.equal(loadSocialBlocks(storage)['player-1'],'chat');
  const hidden=saveSocialBlock(chat,'player-1','hidden',storage);
  assert.equal(hidden['player-1'],'hidden');
  saveSocialReport({targetId:'player-1',targetName:'테스트 사용자',reason:'harassment',blockMode:'hidden',detail:'반복적으로 따라옴'},storage);
  const reports=JSON.parse(storage.getItem(SOCIAL_REPORTS_STORAGE_KEY)??'[]');
  assert.equal(reports.length,1);
  assert.equal(reports[0].reason,'harassment');
  assert.equal(reports[0].blockMode,'hidden');
});

test('T 상호작용 메뉴는 양방향 친구 요청·수락과 신고를 제공한다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const modal=read('../src/components/SocialProfileModal.tsx');
  const scene=read('../src/game/scenes/WorldScene.ts');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(page,/openEncounterProfile\(encounter\)/);
  assert.match(page,/친구 삭제/);
  assert.match(page,/socket\.emit\('friendRequest'/);
  assert.match(page,/socket\.emit\('friendAccept'/);
  assert.match(page,/친구 요청이 수락되었어요/);
  assert.match(page,/friendRequestPending=/);
  assert.match(modal,/상대 수락 대기 중/);
  assert.match(modal,/친구 요청 보내기/);
  assert.match(page,/함께 만든 연결/);
  assert.match(page,/님이 연락을 보냈습니다/);
  assert.match(page,/채팅방 나가기/);
  assert.match(page,/directChatResumeRequired/);
  assert.match(page,/socket\.emit\('directChatFocusEnded'/);
  assert.match(page,/socket\.on\('directChatFocusEnded'/);
  assert.doesNotMatch(page,/함께 둘러보기/);
  assert.match(modal,/신고 사유/);
  assert.match(modal,/대화만 차단/);
  assert.match(modal,/캐릭터 숨기기/);
  assert.match(scene,/social-hidden-characters-changed/);
  assert.match(renderer,/hiddenCharacterIds/);
});

test('체험 집중 맵은 친구 패널을 숨기고 활동 목록을 자동 접는다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const css=read('../src/pages/GamePage.css');
  assert.match(page,/FOCUSED_EXPERIENCE_MAPS/);
  assert.match(page,/setOnlineCollapsed\(true\);setFriendsOpen\(false\)/);
  assert.match(css,/\.game-page\.is-focused-experience \.game-friend-dock\{display:none\}/);
  assert.match(css,/is-focused-experience:has\(\.quest-overlay,\.bear-coop-status/);
});

test('주변 반응 패널과 선택형 주변 메시지 입력창을 렌더링하지 않는다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  assert.doesNotMatch(page,/className="chat-panel"/);
  assert.doesNotMatch(page,/주변의 반응|선택형 주변 메시지/);
  assert.match(page,/className="direct-panel/);
  assert.match(page,/className="direct-panel npc-direct-panel/);
});

test('월드 HUD는 현재 위치·현재 활동 중·내 친구만 간결하게 유지한다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const lake=read('../src/components/LakeParkExperiences.tsx');
  assert.match(page,/현재 위치/);
  assert.match(page,/현재 활동 중/);
  assert.match(page,/내 친구/);
  assert.doesNotMatch(page,/className="group-box"|className="controls"|discoveryLabel|demo-pass/);
  assert.doesNotMatch(lake,/호수공원 취향 여정|lake-journey-guide|showJourneyComplete/);
});

test('친구 프로필은 내 프로필과 같은 캐릭터 크기와 헤더 구조를 사용한다',()=>{
  const friend=read('../src/components/SocialProfileModal.tsx');
  const friendStyle=read('../src/components/SocialProfileModal.css');
  const myStyle=read('../src/components/AiSejongProfile.css');
  assert.match(friend,/CharacterPreview parts=\{person\.appearance\} small/);
  assert.match(friend,/social-profile-basic-info/);
  assert.match(friendStyle,/\.social-profile-avatar\{[^}]*width:104px;height:104px/);
  assert.match(friendStyle,/\.social-profile-avatar \.avatar\{transform:scale\(1\.5\)\}/);
  assert.match(myStyle,/\.profile-avatar\{[^}]*width:104px;height:104px/);
  assert.match(myStyle,/\.profile-avatar \.avatar\{transform:scale\(1\.5\)\}/);
});

test('작은 화면에서도 핵심 HUD 한글을 읽을 수 있는 크기와 줄바꿈 규칙을 유지한다',()=>{
  const css=read('../src/pages/GamePage.css');
  assert.match(css,/작은 창에서 핵심 HUD 한글/);
  assert.match(css,/\.world-location-chip small\{font-size:10px;line-height:1\.2\}/);
  assert.match(css,/\.online-heading h3\{font-size:13px;line-height:1\.25;white-space:nowrap\}/);
  assert.match(css,/\.game-page \.online small\{font-size:9px;line-height:1\.35\}/);
  assert.match(css,/\.game-friend-toggle b,\.game-friend-list b\{font-size:11px;line-height:1\.3\}/);
  assert.match(css,/word-break:keep-all/);
  assert.match(css,/@media\(max-width:520px\)[\s\S]*?max-width:none/);
});
