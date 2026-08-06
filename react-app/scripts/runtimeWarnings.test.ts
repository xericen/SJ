import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {readOptionalJson} from '../src/services/optionalJson';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Three.js 폐기 API를 렌더링 경로에서 사용하지 않는다',()=>{
  const sources=[
    read('../src/components/ThreeCharacterPreview.tsx'),
    read('../src/game/renderers/VillageMapRenderer.ts'),
    read('../../src/app/page.home/avatar-preview-renderer.ts'),
  ].join('\n');
  assert.doesNotMatch(sources,/\bClock\b|PCFSoftShadowMap/);
  assert.match(sources,/PCFShadowMap/);
});

test('운영 API가 HTML을 반환해도 JSON으로 파싱하지 않는다',async()=>{
  const htmlResponse=new Response('<!DOCTYPE html><html></html>',{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}});
  assert.equal(await readOptionalJson(htmlResponse),null);
  const jsonResponse=new Response(JSON.stringify({data:{profile:null}}),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
  assert.deepEqual(await readOptionalJson(jsonResponse),{data:{profile:null}});
});
