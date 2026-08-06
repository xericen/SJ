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

test('T 상호작용 메뉴는 공통 프로필·친구 삭제·신고를 제공하고 함께 둘러보기를 제거한다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const modal=read('../src/components/SocialProfileModal.tsx');
  const scene=read('../src/game/scenes/WorldScene.ts');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(page,/openEncounterProfile\(encounter\)/);
  assert.match(page,/친구 삭제/);
  assert.doesNotMatch(page,/함께 둘러보기/);
  assert.match(modal,/신고 사유/);
  assert.match(modal,/대화만 차단/);
  assert.match(modal,/캐릭터 숨기기/);
  assert.match(scene,/social-hidden-characters-changed/);
  assert.match(renderer,/hiddenCharacterIds/);
});
