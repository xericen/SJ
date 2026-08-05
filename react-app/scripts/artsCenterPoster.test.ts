import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
import {parseArtsCenterFavorites,toggleArtsCenterFavorite} from '../src/game/artsCenterFavorites';
import {ARTS_CENTER_PERFORMANCES,artsCenterPerformanceImageUrl} from '../src/game/artsCenterPerformances';

test('5개 공연은 공식 페이지 원본 이미지의 로컬 사본을 사용한다',()=>{
  assert.equal(ARTS_CENTER_PERFORMANCES.length,5);
  ARTS_CENTER_PERFORMANCES.forEach(performance=>{
    assert.match(performance.originalImageUrl,/^https:\/\/www\.sjac\.or\.kr\/storage\/performance\//);
    assert.equal(existsSync(new URL(`../public/${performance.image.replace(/^\/+/, '')}`,import.meta.url)),true);
    assert.match(artsCenterPerformanceImageUrl(performance,'/auth/jochwon-assets/'),/^\/auth\/jochwon-assets\/images\/performances\/.+\?poster=20260805-original-v62$/);
  });
});

test('클릭 전 3D 포스터 캔버스를 클릭 후 HTML 포스터가 그대로 사용한다',()=>{
  const component=readFileSync(new URL('../src/components/ArtsCenterPosterKiosk.tsx',import.meta.url),'utf8');
  const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  assert.match(component,/className="arts-center-html-poster"/);
  assert.match(component,/src=\{focus\.posterDataUrl\}/);
  assert.doesNotMatch(component,/arts-center-object-badge/);
  assert.match(component,/className="arts-center-poster-detail"/);
  assert.match(component,/<iframe src=\{performance\.detailUrl\}/);
  assert.match(renderer,/source\.toDataURL\('image\/png'\)/);
  assert.match(renderer,/posterDataUrl:this\.artsCenterPosterDataUrl/);
  assert.match(renderer,/posterImage\.src=artsCenterPerformanceImageUrl/);
  assert.match(renderer,/▶  영상 선택/);
  assert.match(renderer,/♡  관심 있어요/);
  assert.match(renderer,/ⓘ  자세히 보기/);
});

test('장소 정보와 영상 선택 사이에 가림 없는 여백을 둔다',()=>{
  const renderer=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
  const venueBaselines=[...renderer.matchAll(/fillText\(performance\.venue,122,(\d+)\)/g)].map(match=>Number(match[1]));
  const videoTop=Number(renderer.match(/roundedRect\(44,(\d+),632,38,14\)/)?.[1]);
  assert.equal(venueBaselines.length>=2,true);
  venueBaselines.forEach(baseline=>assert.equal(videoTop-baseline>=30,true));
});

test('관심 공연은 각 포스터별로 저장과 해제가 즉시 전환된다',()=>{
  assert.deepEqual(parseArtsCenterFavorites('[0,2]'),[0,2]);
  assert.deepEqual(parseArtsCenterFavorites('invalid'),[]);
  assert.deepEqual(toggleArtsCenterFavorite([0,2],1),[0,2,1]);
  assert.deepEqual(toggleArtsCenterFavorite([0,2],2),[0]);
});
