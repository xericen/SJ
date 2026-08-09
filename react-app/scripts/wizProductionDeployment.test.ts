import assert from 'node:assert/strict';
import test from 'node:test';

const productionOrigin=(process.env.WIZ_PRODUCTION_URL??'https://sj.wizide.com').replace(/\/$/,'');
const probe=Date.now().toString(36);

test('운영 기본 세션이 강제 카카오 재인증 API를 사용한다',async()=>{
  const response=await fetch(`${productionOrigin}/wiz/api/page.home/kakao_start?reauth=1&deploy_probe=${probe}`,{
    redirect:'manual',
  });
  assert.equal(response.status,302);
  const location=response.headers.get('location');
  assert.ok(location);
  const authorizeUrl=new URL(location);
  assert.equal(authorizeUrl.hostname,'kauth.kakao.com');
  assert.equal(authorizeUrl.searchParams.get('prompt'),'login');
});

test('운영 기본 세션이 카카오와 OpenAI 장소 추천 분기를 실행한다',async()=>{
  const response=await fetch(`${productionOrigin}/wiz/api/page.home/api_config_status?operation=chungnyeongPlaceRecommendation&deploy_probe=${probe}`);
  assert.equal(response.status,200);
  const body=await response.json() as {
    code?:number;
    data?:{place?:{placeName?:string;address?:string;placeUrl?:string;message?:string}};
  };
  const place=body.data?.place;
  assert.equal(body.code,200);
  assert.ok(place?.placeName);
  assert.match(place?.address??'',/세종특별자치시/);
  assert.match(place?.placeUrl??'',/^https?:\/\/place\.map\.kakao\.com\//);
  assert.match(place?.message??'',new RegExp(place?.placeName??'$^'));
  assert.equal('providers' in (body.data??{}),false,'설정 상태 응답은 추천 성공으로 취급하지 않는다');
});
