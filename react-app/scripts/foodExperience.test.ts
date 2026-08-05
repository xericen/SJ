import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {foodImageUrl,kakaoMapSearchUrl} from '../src/data/sejongFoodTypes';

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
  assert.match(component,/className="food-kakao-map-frame"/);
  assert.match(component,/target="_top"/);
  assert.doesNotMatch(component,/target="_blank"/);
  assert.match(component,/foodImageUrl\(selected\.imageUrl,import\.meta\.env\.BASE_URL\)/);
  assert.match(styles,/width:min\(900px,96vw\)/);
  assert.match(styles,/height:min\(600px,90vh\)/);
});

test('먹거리 맵 포탈과 로컬푸드 트럭 카메라는 실제 사용자 위치를 기준으로 처리한다',()=>{
  const page=read('../src/pages/GamePage.tsx');
  const renderer=read('../src/game/renderers/VillageMapRenderer.ts');
  assert.match(page,/currentMapId==='food-experience'&&canEditPortals/);
  assert.match(page,/emit\('world-portal-place-at-player','town'\)/);
  assert.doesNotMatch(page,/currentMapId==='food-experience'.*emit\('primary-portal-place-at-player'\)/);
  assert.match(renderer,/const viewerDirection=new THREE\.Vector3\(this\.localX,center\.y,this\.worldToSceneZ\(this\.localZ\)\)\.sub\(center\)/);
  assert.match(renderer,/if\(normal\.dot\(viewerDirection\)<0\)normal\.negate\(\)/);
});
