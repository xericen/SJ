import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {BEAR_FEED_PICKUPS,BEAR_FEED_SPOT_IDS} from '../shared/personal-farm';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
const component=read('../src/components/PersonalFarmProgressExperience.tsx');
const service=read('../server/src/services/personalFarmProgressService.ts');
const wizApi=read('../../src/app/page.home/api.py');
const bearPlay=renderer.slice(renderer.indexOf('export const BEAR_PLAY_ZONE_RENDERER_OPTIONS'),renderer.indexOf('const PERSONAL_FARM_COLLIDER_PREFIXES'));

test('첨부한 곰 GLB와 요청 모션을 그대로 사용한다',()=>{
  const buffer=readFileSync(new URL('../src/assets/characters/bear.glb',import.meta.url));
  assert.equal(createHash('sha256').update(buffer).digest('hex'),'996fdc922bc9a0f0e4dbf116101d7e376639b00953cda5f3cf1b0d9624163252');
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString('utf8').replace(/\0+$/,'')) as {animations?:Array<{name?:string}>};
  const names=(json.animations??[]).map(animation=>animation.name??'');
  ['praying','breakdance','Jump'].forEach(name=>assert.equal(names.some(value=>value.toLowerCase().includes(name.toLowerCase())),true));
});

test('곰 체험소는 새 곰 두 마리가 중앙에 서서 구걸·급여 후 랜덤 보상 모션을 사용한다',()=>{
  assert.match(bearPlay,/resident:\{modelUrl:bearModelUrl/);
  assert.match(bearPlay,/stationary:true/);
  assert.match(bearPlay,/residentDecor:\[\{modelUrl:bearModelUrl/);
  assert.doesNotMatch(bearPlay,/patrol:\[|bearCubModelUrl|grizzlyBearModelUrl/);
  assert.match(renderer,/\/praying\/i/);
  assert.match(renderer,/filter\(clip=>!\/praying\/i\.test\(clip\.name\)\)/);
  assert.match(renderer,/Math\.random\(\)\*this\.residentRewardActions\.length/);
  assert.match(renderer,/residentDecorBearActors/);
  assert.match(renderer,/먹이를 주세요! 🙏/);
});

test('길가의 먹이는 한 개씩 주워 곰에게 총 다섯 번 전달한다',()=>{
  assert.deepEqual(BEAR_FEED_SPOT_IDS.map(id=>BEAR_FEED_PICKUPS[id].feedId),['apple','carrot','acorn','apple','carrot']);
  BEAR_FEED_SPOT_IDS.forEach(id=>assert.match(bearPlay,new RegExp(id)));
  assert.match(component,/mapId==='bear-play-zone'/);
  assert.match(component,/E · 줍기/);
  assert.match(service,/BEAR_FEED_PICKUPS\[spotId\]\.feedId/);
  assert.match(service,/FEED_PENDING_DELIVERY/);
  assert.match(service,/fedFeedSpotIds\.push\(pending\)/);
  assert.match(wizApi,/PERSONAL_FARM_FEED_BY_SPOT\[spot_id\]/);
  assert.match(wizApi,/fedFeedSpotIds/);
  assert.match(component,/급여 \{fedFeedCount\}\/5/);
});

test('모든 먹이를 급여하면 업로드한 곰 모델 기반 마이홈 동상이 열린다',()=>{
  const factory=read('../src/services/bearStatueAssetFactory.ts');
  assert.match(service,/if\(bearComplete\)rewards\.push\('bear-statue'\)/);
  assert.match(renderer,/renderPersonalFarmBearStatue\(bearStatueUnlocked\)/);
  assert.match(factory,/assets\/characters\/bear\.glb\?url/);
  assert.match(factory,/personal-farm-bear-statue/);
  assert.match(factory,/personal-farm-bear-statue-pedestal/);
});
