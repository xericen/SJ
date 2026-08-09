import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateGlbBuffer} from '../src/utils/createGltfLoader';

const rendererSource=readFileSync(new URL('../src/game/renderers/VillageMapRenderer.ts',import.meta.url),'utf8');
const bearTreeGlb=readFileSync(new URL('../src/assets/maps/new-beartree.glb',import.meta.url));

test('베어트리파크 원본 GLB 헤더와 선언 길이가 유효하다',()=>{
  const buffer=bearTreeGlb.buffer.slice(bearTreeGlb.byteOffset,bearTreeGlb.byteOffset+bearTreeGlb.byteLength) as ArrayBuffer;
  assert.equal(validateGlbBuffer(buffer).byteLength,bearTreeGlb.byteLength);
});

test('빈 GLB 응답은 GLTFLoader에 전달하기 전에 차단한다',()=>{
  assert.throws(()=>validateGlbBuffer(new ArrayBuffer(0)),/비어 있거나 너무 짧습니다/);
});

test('베어트리파크 월드는 검증·재시도 로더를 사용한다',()=>{
  assert.match(rendererSource,/url\.includes\('new-beartree-'\)\?loadValidatedGlb\(url\)/);
});
