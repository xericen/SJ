import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {GARDEN_FLOWER_ASSETS,resolveGardenFlowerId} from '../shared/garden-flower-assets';
import {GARDEN_FLOWER_IDS} from '../shared/personal-farm';
import {mirroredAcrossHouseX,moveToHouseFront} from '../src/game/personalFarmLayout';
import {GuestPersonalFarmProgress} from '../src/services/guestPersonalFarmProgress';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const progressUi=read('../src/components/PersonalFarmProgressExperience.tsx');
const farmApi=read('../src/services/personalFarmApi.ts');
const wizApi=read('../../src/app/page.home/api.py');

test('수목원 14종이 동일한 꽃 ID와 GLB 노드 계약을 사용한다',()=>{
  assert.equal(GARDEN_FLOWER_IDS.length,14);
  assert.equal(GARDEN_FLOWER_ASSETS.length,14);
  for(const asset of GARDEN_FLOWER_ASSETS){
    assert.equal(resolveGardenFlowerId(asset.flowerId),asset.flowerId);
    assert.equal(resolveGardenFlowerId(asset.plantId),asset.flowerId);
    for(const node of asset.objectNames)assert.equal(resolveGardenFlowerId(node),asset.flowerId);
  }
});

test('마이홈은 5칸 화단 렌더링과 꽃 제거 동작을 제공한다',()=>{
  assert.match(renderer,/FARM_FLOWER_SLOT_05/);
  assert.match(renderer,/createFlowerObjectById\(flowerId\)/);
  assert.match(renderer,/personal-farm-flower-proximity-changed/);
  assert.match(progressUi,/removeGardenFlower\(farmFlower\)/);
  assert.match(progressUi,/집 앞 5칸 화단/);
  assert.match(farmApi,/requestWiz\('removeFlower'/);
  assert.match(farmApi,/method:'DELETE'/);
  assert.match(wizApi,/action in \("collectFlower", "plantFlower", "removeFlower"\)/);
  assert.match(wizApi,/PERSONAL_FARM_FLOWER_BED_LIMIT = 5/);
});

test('곰 체험소가 업로드한 곰 GLB와 급여 전후 애니메이션을 사용한다',()=>{
  const buffer=readFileSync(new URL('../src/assets/characters/bear.glb',import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');
  assert.match(renderer,/bearModelUrl,format:'gltf'/);
  assert.match(renderer,/playResidentFeedReward/);
  assert.match(renderer,/residentBegAction/);
  assert.match(progressUi,/곰에게 먹이 주기/);
});

test('마이홈 보상 배치 계산은 집 기준 반대편과 전면을 판정한다',()=>{
  const house={x:1200,z:951},lake={x:1918,z:1233},front={x:0,z:1};
  const mirrored=moveToHouseFront(mirroredAcrossHouseX(house,lake),house,front,180);
  assert.deepEqual(mirrored,{x:482,z:1233});
});

test('게스트도 현재 접속 중에는 수집·식재·제거 진행도를 사용할 수 있다',async()=>{
  const guest=new GuestPersonalFarmProgress();
  await guest.collectFlower('hydrangea');
  assert.deepEqual((await guest.plantFlower('hydrangea')).gardenMission.plantedFlowerIds,['hydrangea']);
  assert.deepEqual((await guest.removeFlower('hydrangea')).gardenMission.plantedFlowerIds,[]);
  guest.reset();
  assert.deepEqual((await guest.get()).gardenMission.collectedFlowerIds,[]);
});
