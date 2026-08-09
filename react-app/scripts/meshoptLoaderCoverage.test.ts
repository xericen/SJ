import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const runtimeFiles=[
  '../src/game/renderers/VillageMapRenderer.ts',
  '../src/components/WorldModelPreview.tsx',
  '../src/components/ThreeCharacterPreview.tsx',
  '../src/services/bearStatueAssetFactory.ts',
  '../src/services/flowerAssetFactory.ts',
];

test('모든 런타임 GLB 로더는 공용 Meshopt 로더 팩토리를 사용한다',()=>{
  const factory=read('../src/utils/createGltfLoader.ts');
  assert.match(factory,/setMeshoptDecoder\(MeshoptDecoder\)/);
  runtimeFiles.forEach(path=>{
    const source=read(path);
    assert.doesNotMatch(source,/new GLTFLoader\(\)\.(?:load|loadAsync)\(/,path);
    assert.match(source,/createGltfLoader/,path);
  });
});

test('동아리 거리제 GLB는 Meshopt 압축 확장을 사용한다',()=>{
  const buffer=readFileSync(new URL('../src/assets/maps/club-street-festival-map.glb',import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString('utf8').replace(/\0+$/,'')) as {extensionsUsed?:string[]};
  assert.ok(json.extensionsUsed?.includes('EXT_meshopt_compression'));
});
