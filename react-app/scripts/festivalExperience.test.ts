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

test('한눈에 보기의 지도는 주소만 전달하고 패널 내부에서 연다',()=>{
  const url=festivalKakaoMapSearchUrl('세종호수공원');
  assert.match(url,/^https:\/\/map\.kakao\.com\/link\/search\//);
  assert.equal(decodeURIComponent(url.split('/').at(-1)??''),'세종호수공원');

  const component=read('../src/components/LakeParkExperiences.tsx');
  const styles=read('../src/components/LakeParkExperiences.css');
  assert.match(component,/festivalKakaoMapSearchUrl\(selectedFestivalVisitInfo\.mapAddress\)/);
  assert.match(component,/className="festival-kakao-map-link"/);
  assert.match(component,/<iframe src=\{festivalKakaoMapSearchUrl/);
  assert.doesNotMatch(component,/className="festival-kakao-map-link"[^>]*target="_blank"/);
  assert.match(styles,/\.festival-plan-picker button\{[^}]*flex:0 0 auto;[^}]*text-align:left/);
});

test('전통문화 체험 3개 이미지는 WIZ 자산 경로를 사용한다',()=>{
  const component=read('../src/components/LakeParkExperiences.tsx');
  for(const image of ['dano-2026.jpg','spring-flower-2026.jpg','king-book-2026.jpg']){
    assert.match(component,new RegExp(`festivalImageUrl\\('/images/festivals/${image.replace('.','\\.')}',import\\.meta\\.env\\.BASE_URL\\)`));
  }
});

test('스탬프 미션 상태는 명확히 표시되고 축제 HUD와 겹치지 않는다',()=>{
  const component=read('../src/components/LakeParkExperiences.tsx');
  const page=read('../src/pages/GamePage.tsx');
  const pageStyles=read('../src/pages/GamePage.css');
  const componentStyles=read('../src/components/LakeParkExperiences.css');
  assert.match(component,/3개 스탬프를 모두 받았어요/);
  assert.match(component,/스탬프 \$\{3-completedCount\}개가 남았어요/);
  assert.doesNotMatch(page,/is-festival-summary|is-festival-map/);
  assert.match(componentStyles,/\.festival-experience-passport\{left:20px;top:70px;[^}]*width:245px/);
  assert.match(component,/new ResizeObserver\(updateStack\)/);
  assert.match(component,/--festival-passport-bottom/);
  assert.match(pageStyles,/\.game-page:has\(\.festival-experience-passport\) \.world-location-chip\{[^}]*width:245px/);
  assert.match(component,/const passportBottom=Math\.ceil\(passport\.getBoundingClientRect\(\)\.bottom-pageTop\)\+8/);
  assert.match(pageStyles,/\.game-page:has\(\.festival-experience-passport\) \.online\{z-index:57;display:block;left:20px;top:var\(--festival-passport-bottom,258px\);width:245px/);
  assert.match(pageStyles,/모든 월드에서 현재 위치와 현재 활동 중 패널을 하나의 좌측 스택/);
});

test('축제 GLB의 부스·무대·책상 주요 루트 그룹을 충돌 영역으로 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(renderer,/collisionObjectPrefixes:\[\s*'Blue_Experience_Tent','Red_Experience_Tent','Main_Stage','PicnicTable_',\s*'MapKiosk','Bin_','EntryBollard_','LampPost_',\s*\]/);
  assert.match(renderer,/groundObjectPrefixes:\['Festival_Lawn','Promenade','Island_Base'\]/);
  assert.match(renderer,/simplifiedCollision:false/);
});

test('축제부스 캐릭터와 귀환 포탈 시각 크기 및 렌더 품질을 보정한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const fixed=read('../src/game/fixedWorldCameraProfiles.ts');
  const npcs=read('../src/data/festivalNpc.ts');
  assert.match(fixed,/'festival-experience':\{mapId:'festival-experience',characterHeight:120/);
  assert.match(npcs,/height: 120/);
  assert.doesNotMatch(npcs,/FESTIVAL_GUIDE_CHUNGNYEONG|festival-guide-chungnyeong|nickname: '충녕이'/);
  assert.match(renderer,/portal:\{\.\.\.FESTIVAL_LAKE_RETURN_PORTAL_POSITION,destination:'town',label:'세종호수공원으로 돌아가기',appearance:'energy-rift'/);
  assert.match(renderer,/performancePixelRatio:1\.5/);
  assert.match(renderer,/minPixelRatio:1\.25/);
  assert.match(renderer,/maxPixelRatio:2/);
  assert.match(renderer,/antialias:true/);
  assert.match(renderer,/const visualScale=portalVisualScaleForMap\(this\.options\.mapName\)/);
  assert.doesNotMatch(renderer,/festivalLakeReturnPortal|label\.scale\.multiplyScalar\(2\)|0\.25:1/);
});
