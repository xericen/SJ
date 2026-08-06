import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {festivalImageUrl,festivalKakaoMapSearchUrl} from '../src/data/festivalMedia';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('축제 이미지는 WIZ 정적 자산 기준 경로로 해석한다',()=>{
  assert.equal(
    festivalImageUrl('/images/festivals/hangeul-2026.jpg','/auth/jochwon-assets/'),
    '/auth/jochwon-assets/images/festivals/hangeul-2026.jpg',
  );
  assert.equal(
    festivalImageUrl('https://example.com/festival.jpg','/auth/jochwon-assets/'),
    'https://example.com/festival.jpg',
  );
});

test('한눈에 보기의 지도 링크는 축제명과 장소를 카카오 지도에 전달한다',()=>{
  const url=festivalKakaoMapSearchUrl('2026 세종한글축제','세종호수공원·중앙공원 일원');
  assert.match(url,/^https:\/\/map\.kakao\.com\/link\/search\//);
  assert.equal(decodeURIComponent(url.split('/').at(-1)??''),'2026 세종한글축제 세종호수공원·중앙공원 일원');

  const component=read('../src/components/LakeParkExperiences.tsx');
  const styles=read('../src/components/LakeParkExperiences.css');
  assert.match(component,/festivalKakaoMapSearchUrl\(festivalVisitPlan\.title,festivalVisitPlan\.venue\)/);
  assert.match(component,/className="festival-kakao-map-link"/);
  assert.match(styles,/\.festival-plan-picker button\{[^}]*flex:0 0 auto;[^}]*text-align:left/);
});

test('축제 GLB의 부스·무대·책상 주요 루트 그룹을 충돌 영역으로 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(renderer,/collisionObjectPrefixes:\[\s*'Blue_Experience_Tent','Red_Experience_Tent','Main_Stage','PicnicTable_',\s*'MapKiosk','Bin_','EntryBollard_','LampPost_',\s*\]/);
  assert.match(renderer,/groundObjectPrefixes:\['Festival_Lawn','Promenade','Island_Base'\]/);
  assert.match(renderer,/simplifiedCollision:false/);
});
