import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
import {parseArtsCenterFavorites,toggleArtsCenterFavorite} from '../src/game/artsCenterFavorites';
import {ARTS_CENTER_PERFORMANCES,artsCenterPerformanceImageUrl} from '../src/game/artsCenterPerformances';
import {loadPerformanceSourcePreview,renderPerformanceReaderDocument,renderPerformanceSummaryDocument} from '../src/services/foodSourcePreview';

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
  assert.match(component,/loadPerformanceSourcePreview\(performance\.detailUrl\)/);
  assert.match(component,/<iframe srcDoc=\{detailPreview\?\.html\?\?performanceSummaryHtml\} sandbox=""/);
  assert.doesNotMatch(component,/공식 공연 정보를 준비하고 있어요/);
  assert.doesNotMatch(component,/<iframe src=\{performance\.detailUrl\}/);
  assert.doesNotMatch(component,/새 창/);
  assert.doesNotMatch(component,/target="_blank"/);
  assert.match(renderer,/source\.toDataURL\('image\/png'\)/);
  assert.match(renderer,/posterDataUrl:this\.artsCenterPosterDataUrl/);
  assert.match(renderer,/posterImage\.src=artsCenterPerformanceImageUrl/);
  assert.match(renderer,/▶  영상 선택/);
  assert.match(renderer,/♡  관심 있어요/);
  assert.match(renderer,/ⓘ  자세히 보기/);
});

test('공연 상세는 네트워크 응답 전에도 공식 포스터와 기본 정보를 즉시 표시한다',()=>{
  const performance=ARTS_CENTER_PERFORMANCES[0];
  const html=renderPerformanceSummaryDocument(performance,performance.image);
  assert.match(html,new RegExp(performance.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(html,/공연 일정/);
  assert.match(html,/관람 등급/);
  assert.match(html,/러닝타임/);
  assert.match(html,/공연 포스터/);
  assert.doesNotMatch(html,/준비하고 있어요|loading|spinner/i);
});

test('공식 공연 상세는 외부 스크립트를 실행하지 않는 읽기 전용 HTML을 사용한다',()=>{
  const previewService=readFileSync(new URL('../src/services/foodSourcePreview.ts',import.meta.url),'utf8');
  const wizApi=readFileSync(new URL('../../src/app/page.home/api.py',import.meta.url),'utf8');
  assert.match(previewService,/PERFORMANCE_SOURCE_HOSTS/);
  assert.match(previewService,/https:\/\/r\.jina\.ai\/http:\/\//);
  assert.match(previewService,/loadPerformanceSourcePreview=.*loadSourcePreview\(url,'performanceSourceUrl'/);
  assert.match(previewService,/renderPerformanceReaderDocument/);
  assert.match(wizApi,/PERFORMANCE_SOURCE_PREVIEW_HOSTS/);
  assert.match(wizApi,/performanceSourceUrl/);
  assert.match(wizApi,/def _performance_source_preview_response/);
});

test('공연 원본 읽기 폴백은 수집 메타데이터와 사이트 메뉴를 제거한다',()=>{
  const html=renderPerformanceReaderDocument(`Title: 세종예술의전당

URL Source: http://www.sjac.or.kr/base/nrr/performance/read?performanceNo=650

Markdown Content:
**바로가기 메뉴**[본문내용 바로가기](http://www.sjac.or.kr/#cont-sbj)[메인메뉴 바로가기](http://www.sjac.or.kr/#gnb)

## 프로그램

[모두보기 닫기](http://www.sjac.or.kr/#)

![뮤지컬 서편제](https://www.sjac.or.kr/storage/performance/poster.jpg)

### 세종예술의전당

기획공연 뮤지컬 <서편제>

*   **기간**
2026.07.30 ~ 2026.08.01`);
  assert.doesNotMatch(html,/Title:|URL Source:|Markdown Content:|바로가기 메뉴|본문내용 바로가기|메인메뉴 바로가기|모두보기 닫기/);
  assert.doesNotMatch(html,/\[[^\]]+]\([^)]+\)/);
  assert.match(html,/<strong>공연 상세 정보<\/strong>/);
  assert.match(html,/<img src="https:\/\/www\.sjac\.or\.kr\/storage\/performance\/poster\.jpg"/);
  assert.match(html,/<h3>세종예술의전당<\/h3>/);
  assert.match(html,/<h4>기간<\/h4>/);
});

test('공연 상세는 WIZ 원본 HTML을 우선하고 실패하면 정돈된 읽기 화면을 사용한다',async()=>{
  const originalFetch=globalThis.fetch;
  const bodies:string[]=[];
  globalThis.fetch=(async(_input,init)=>{
    bodies.push(String(init?.body??''));
    if(bodies.length===1)return new Response(JSON.stringify({code:502,data:{message:'원본 접근 실패'}}),{status:502,headers:{'Content-Type':'application/json'}});
    return new Response('Title: 세종예술의전당\n\nMarkdown Content:\n[모두보기 닫기](http://www.sjac.or.kr/#)\n\n### 세종예술의전당\n\n기획공연 뮤지컬 <서편제>',{status:200});
  }) as typeof fetch;
  try{
    const preview=await loadPerformanceSourcePreview(ARTS_CENTER_PERFORMANCES[0].detailUrl);
    assert.equal(bodies.length,2);
    assert.match(bodies[0],/performanceSourceUrl=/);
    assert.doesNotMatch(preview.html,/Title:|Markdown Content:|모두보기 닫기/);
    assert.match(preview.html,/공연 상세 정보/);
  }finally{
    globalThis.fetch=originalFetch;
  }
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
