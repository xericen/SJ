import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {foodImageUrl,kakaoMapSearchUrl} from '../src/data/sejongFoodTypes';
import {loadFoodSourcePreview} from '../src/services/foodSourcePreview';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('먹거리 장소는 카카오맵 검색 링크와 배포 이미지 경로를 사용한다',()=>{
  const mapUrl=kakaoMapSearchUrl('카페 노호','세종특별자치시 부강면 금강자전거길 13020');
  assert.match(mapUrl,/^https:\/\/map\.kakao\.com\/link\/search\//);
  assert.match(decodeURIComponent(mapUrl),/카페 노호 세종특별자치시/);
  assert.equal(
    foodImageUrl('/images/food-shops/specialties/sejong-pear.png','/auth/jochwon-assets/'),
    '/auth/jochwon-assets/images/food-shops/specialties/sejong-pear.png',
  );
});

test('지도와 출처는 카페 상세와 같은 현재 화면 패널 흐름을 사용한다',()=>{
  const component=read('../src/components/FoodTruckExperience.tsx');
  const styles=read('../src/components/FoodTruckEmbedded.css');
  const previewService=read('../src/services/foodSourcePreview.ts');
  assert.match(component,/className="food-kakao-map-frame"/);
  assert.match(component,/className="food-source-web-frame"/);
  assert.match(component,/srcDoc=\{embeddedView\.html\}/);
  assert.match(component,/sandbox=""/);
  assert.doesNotMatch(component,/target="_top"/);
  assert.doesNotMatch(component,/target="_blank"/);
  assert.match(previewService,/\/wiz\/api\/page\.home\/portal_positions/);
  assert.match(previewService,/foodSourceUrl:url/);
  assert.match(previewService,/https:\/\/r\.jina\.ai\/http:\/\//);
  assert.match(previewService,/renderReaderDocument/);
  assert.match(component,/foodImageUrl\(selected\.imageUrl,import\.meta\.env\.BASE_URL\)/);
  assert.match(styles,/width:min\(900px,96vw\)/);
  assert.match(styles,/height:min\(600px,90vh\)/);
});

test('먹거리 맵 포탈은 승인 좌표에 고정되고 하단 카메라는 포탈 아래로 내려가지 않는다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const sharedPortals=read('../shared/world-portals.ts');
  const guidePortals=read('../src/game/worldGuideEntryPoints.ts');
  const api=read('../../src/app/page.home/api.py');
  assert.doesNotMatch(page,/currentMapId==='food-experience'&&canEditPortals/);
  assert.doesNotMatch(page,/currentMapId==='food-experience'.*portal-position-editor/);
  assert.match(sharedPortals,/mapId:'food-experience',destination:'town',x:1193,z:546/);
  assert.match(guidePortals,/'food-experience':\{x:1193,z:546\}/);
  assert.match(api,/\("food-experience", "town", 1193, 546\)/);
  assert.match(api,/\("food-experience", "town"\),/);
  assert.match(renderer,/const FOOD_EXPERIENCE_CAMERA_DOWN_LIMIT_Z=FOOD_LAKE_RETURN_PORTAL_POSITION\.z/);
  assert.match(renderer,/export const FOOD_EXPERIENCE_RENDERER_OPTIONS[\s\S]*?cameraDownScreenLimitZ:FOOD_EXPERIENCE_CAMERA_DOWN_LIMIT_Z/);
  assert.doesNotMatch(renderer,/export const FESTIVAL_EXPERIENCE_RENDERER_OPTIONS[\s\S]*?cameraDownScreenLimitZ:FOOD_EXPERIENCE_CAMERA_DOWN_LIMIT_Z[\s\S]*?export const FOOD_EXPERIENCE_RENDERER_OPTIONS/);
});

test('로컬푸드 트럭 카메라와 원본 웹 프록시는 실제 사용자·허용 출처만 사용한다',()=>{
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  const api=read('../../src/app/page.home/api.py');
  assert.match(renderer,/const viewerDirection=new THREE\.Vector3\(this\.localX,center\.y,this\.worldToSceneZ\(this\.localZ\)\)\.sub\(center\)/);
  assert.match(renderer,/if\(normal\.dot\(viewerDirection\)<0\)normal\.negate\(\)/);
  assert.match(api,/FOOD_SOURCE_PREVIEW_HOSTS/);
  assert.match(api,/class _FoodSourcePreviewSanitizer\(HTMLParser\)/);
  assert.match(api,/def food_source_preview\(\)/);
});

test('WIZ 함수가 아직 갱신되지 않은 경우에도 최신 원본 읽기 화면을 내부 HTML로 만든다',async()=>{
  const originalFetch=globalThis.fetch;
  let calls=0;
  globalThis.fetch=(async()=>{
    calls+=1;
    if(calls===1)return new Response(JSON.stringify({code:200,data:{positions:[]}}),{status:200,headers:{'Content-Type':'application/json'}});
    return new Response('Title: 카페 노호\n\n## 카페 노호\n\n![대표 사진](https://example-cdn.test/cafe.jpg)',{status:200});
  }) as typeof fetch;
  try{
    const preview=await loadFoodSourcePreview('https://www.diningcode.com/profile.php?rid=p9TCcuEDkBlA');
    assert.equal(calls,2);
    assert.match(preview.html,/현재 원본 웹 읽기 화면/);
    assert.match(preview.html,/<h2>카페 노호<\/h2>/);
    assert.match(preview.html,/<img src="https:\/\/example-cdn\.test\/cafe\.jpg"/);
  }finally{
    globalThis.fetch=originalFetch;
  }
});
