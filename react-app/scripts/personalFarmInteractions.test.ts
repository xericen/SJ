import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {isPersonalFarmReturnMap,loadPersonalFarmReturnMap,PERSONAL_FARM_RETURN_MAP_IDS,savePersonalFarmReturnMap} from '../src/game/personalFarmReturnMap';
import {personalFarmCameraDistance} from '../src/game/worldNavigationProfile';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const page=read('../src/pages/GamePage.tsx');
const pageCss=read('../src/pages/GamePage.css');
const farmProgress=read('../src/components/PersonalFarmProgressExperience.tsx');
const farmCss=read('../src/components/PersonalFarmProgressExperience.css');
const farmApi=read('../src/services/personalFarmApi.ts');
const wizApi=read('../../src/app/page.home/api.py');

const glbNodeNames=()=>{
  const buffer=readFileSync(new URL('../src/assets/objects/personal-space-cottage.glb',import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString('utf8').replace(/\0+$/,'')) as {nodes?:Array<{name?:string}>};
  return new Set((json.nodes??[]).map(node=>node.name).filter((name):name is string=>!!name));
};

test('마이홈 모델은 독립 착석 대상 7개를 제공한다',()=>{
  const names=glbNodeNames();
  ['N','S','W','E'].forEach(direction=>assert.equal(names.has(`FURN_Dining_Chair_${direction}_Seat`),true));
  for(let index=0;index<3;index++)assert.equal(names.has(`FURN_Sofa_Cushion_${index}`),true);
  assert.equal(names.has('EXTERIOR_Entry_Door'),true);
  assert.equal(names.has('FURN_Dining_Table'),true);
  assert.equal(names.has('FURN_Mattress'),true);
  assert.equal(names.has('FURN_Bed_Headboard'),true);
});

test('집·가구·식물의 중첩 메시를 충돌 영역으로 등록한다',()=>{
  assert.match(renderer,/'ENV_Bush_'[^\]]*'ENV_Tree_Trunk_'/s);
  assert.match(renderer,/'FURN_Dining_Chair_'[^\]]*'DECOR_Bookcase_Plant_'/s);
  assert.match(renderer,/if\(!authoredCollider\|\|object\.parent!==model&&!this\.options\.personalFarm\)return/);
  assert.match(renderer,/PERSONAL_FARM_COLLIDER_PREFIXES\.some\(prefix=>object\.name\.startsWith\(prefix\)\)/);
});

test('문 출입과 의자·소파 착석은 E 상호작용으로만 실행한다',()=>{
  assert.match(renderer,/event\.code!=='KeyE'/);
  assert.match(renderer,/gameEvents\.emit\('personal-farm-plant-requested',this\.personalFarmFlowerSlotNearby\)/);
  assert.match(renderer,/gameEvents\.emit\('bear-feed-spot-collect-requested',this\.feedSpotNearby\)/);
  assert.match(farmProgress,/gameEvents\.on\('personal-farm-plant-requested',plantRequested\)/);
  assert.match(farmProgress,/gameEvents\.on\('bear-feed-spot-collect-requested',collectRequested\)/);
  assert.match(farmProgress,/event\.currentTarget\.blur\(\)/);
  assert.match(renderer,/this\.options\.personalFarm&&this\.personalFarmDoorNearby/);
  assert.match(renderer,/setupPersonalFarmSeats\(model\)/);
  assert.match(renderer,/\(\['N','S','W','E'\] as const\)/);
  assert.match(renderer,/for\(let index=0;index<3;index\+\+\)/);
  assert.match(renderer,/this\.personalFarmActiveSeat\?20:0/);
  assert.match(page,/E 버튼으로 집 들어가기/);
  assert.equal(page.match(/E 버튼으로 집 들어가기/g)?.length,1);
  assert.doesNotMatch(farmProgress,/personal-farm-door-card/);
  assert.match(page,/personal-farm-seat-toggle/);
  assert.match(page,/E 버튼으로 앉기/);
});

test('식탁 의자와 소파는 각각 식탁과 문을 바라보도록 착석 방향을 계산한다',()=>{
  assert.match(renderer,/const table=model\.getObjectByName\('FURN_Dining_Table'\)/);
  assert.match(renderer,/const door=model\.getObjectByName\('EXTERIOR_Entry_Door'\)/);
  assert.match(renderer,/addSeat\(seat,model\.getObjectByName\(`\$\{prefix\}_Back`\),tableCenter/);
  assert.match(renderer,/addSeat\(cushion,sofaBack,doorCenter/);
  assert.match(renderer,/yaw:Math\.atan2\(facing\.x,facing\.z\)/);
});

test('침대 가까이에서 E로 눕고 다시 일어날 수 있다',()=>{
  assert.match(renderer,/setupPersonalFarmBed\(model\)/);
  assert.match(renderer,/gameEvents\.on\('personal-farm-bed-toggle',this\.togglePersonalFarmBed\)/);
  assert.match(renderer,/this\.personalFarmSleeping&&this\.personalFarmBed/);
  assert.match(renderer,/this\.localCharacter\.setLying\(true\)/);
  assert.match(page,/personal-farm-bed-toggle/);
  assert.match(page,/E 버튼으로 잠자기/);
});

test('마이홈은 16개 원래 맵을 기억해 맵 이동으로 되돌아간다',()=>{
  const values=new Map<string,string>();
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)}};
  assert.equal(PERSONAL_FARM_RETURN_MAP_IDS.length,16);
  assert.equal(isPersonalFarmReturnMap('garden'),true);
  assert.equal(isPersonalFarmReturnMap('personal-farm'),false);
  assert.equal(savePersonalFarmReturnMap('garden',storage),'garden');
  assert.equal(loadPersonalFarmReturnMap(storage),'garden');
  assert.match(page,/destination === "personal-farm" && isPersonalFarmReturnMap\(origin\)/);
  assert.match(page,/gameEvents\.emit\("travel-to-map", personalFarmReturnMap\)/);
});

test('마이홈 정원 현황은 돌아가기 버튼과 간격을 둔 작은 카드로 표시한다',()=>{
  assert.match(page,/personal-farm-top-actions/);
  assert.doesNotMatch(page,/className="is-current"[^>]*>[^<]*<span[^>]*>🌿<\/span> 마이홈 정원/);
  assert.match(page,/맵 이동/);
  assert.match(farmProgress,/personal-farm-reward-status"><b>정원 현황<\/b><span>꽃/);
  assert.match(pageCss,/\.game-page > \.personal-farm-top-actions \{[\s\S]*?position: fixed;[\s\S]*?inset: 20px 20px auto auto;[\s\S]*?flex-wrap: nowrap;/);
  assert.match(pageCss,/\.game-page > \.personal-farm-top-actions > button \{[\s\S]*?position: static;[\s\S]*?width: 82px;[\s\S]*?flex: 0 0 82px;/);
  assert.match(pageCss,/\.game-page > \.personal-farm-top-actions > button:first-child \{[\s\S]*?width: 96px;[\s\S]*?flex-basis: 96px;/);
  assert.match(farmCss,/\.personal-farm-reward-status\{[^}]*right:226px[^}]*top:20px[^}]*max-width:calc\(100vw - 246px\)[^}]*min-height:36px[^}]*flex-wrap:nowrap/);
  assert.match(farmCss,/@media\(max-width:800px\)[\s\S]*\.personal-farm-reward-status\{[^}]*top:12px/);
});

test('마이홈 화단은 Git 기준 3칸 왼쪽·2칸 오른쪽으로 나누고 앞 수풀 네 개를 숨긴다',()=>{
  assert.match(renderer,/const slotOffsets=\[\{side:105,front:20\},\{side:195,front:-25\},\{side:285,front:45\},\{side:-300,front:30\},\{side:-420,front:-20\}\]/);
  assert.match(renderer,/hiddenObjectPrefixes:\['ENV_Bush_01_','ENV_Bush_02_','ENV_Bush_03_','ENV_Bush_04_'\]/);
  assert.match(renderer,/setupPersonalFarmGardenLayout\(model\)/);
});

test('확대형 체험 중에는 마이홈 이동 버튼도 다른 HUD와 함께 숨긴다',()=>{
  const focusMarkers=[
    'food-truck-kiosk-active-marker',
    'recruitment-kiosk-active-marker',
    'project-room-kiosk-active-marker',
    'government-webui-active-marker',
    'project-lobby-board-focused-marker',
    'observatory-telescope-active-marker',
  ];
  const focusRules=pageCss.slice(pageCss.indexOf('/* 확대형 체험 중에는'),pageCss.indexOf('@media (max-width: 800px)'));
  focusMarkers.forEach(marker=>{
    assert.match(focusRules,new RegExp(`\\.game-page:has\\(\\.${marker}\\)`));
  });
  assert.match(focusRules,/> \.world-my-home/);
  assert.match(focusRules,/> \.personal-farm-top-actions/);
  assert.match(focusRules,/display: none !important/);
});

test('마이홈 실내 카메라는 캐릭터에서 충분히 떨어진다',()=>{
  assert.equal(personalFarmCameraDistance(false),1820);
  assert.equal(personalFarmCameraDistance(true),1400);
  assert.match(renderer,/personalFarmCameraDistance\(this\.personalFarmInterior\)/);
});

test('곰 체험소에서 길가 먹이를 하나씩 주워 다섯 번 곰 급여를 MySQL API에 저장한다',()=>{
  assert.match(farmProgress,/canFeedBear/);
  assert.match(farmProgress,/mapId==='bear-play-zone'/);
  assert.match(farmProgress,/E · 줍기/);
  assert.match(farmProgress,/bear-feeding-proximity-changed/);
  assert.match(farmApi,/requestWiz\('feedBear'\)/);
  assert.match(farmApi,/requestExpress\('\/bear\/feed'/);
  assert.match(wizApi,/action == "feedBear"/);
  assert.match(wizApi,/"fedFeedSpotIds"\]\.append\(pending_spot_id\)/);
  assert.match(wizApi,/"bearFed"\] = bear_complete/);
});
