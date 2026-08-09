import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {LoaderUtils} from 'three';
import {MeshoptDecoder} from 'meshoptimizer';

/** Register Meshopt before any runtime GLB parsing starts. */
export const createGltfLoader=()=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

const GLB_MAGIC=0x46546c67;

export function validateGlbBuffer(buffer:ArrayBuffer){
  if(buffer.byteLength<12)throw new Error(`GLB 응답이 비어 있거나 너무 짧습니다 (${buffer.byteLength} bytes)`);
  const header=new DataView(buffer,0,12);
  if(header.getUint32(0,true)!==GLB_MAGIC)throw new Error('GLB 헤더가 올바르지 않습니다.');
  const declaredLength=header.getUint32(8,true);
  if(declaredLength!==buffer.byteLength)throw new Error(`GLB 길이가 올바르지 않습니다 (${buffer.byteLength}/${declaredLength})`);
  return buffer;
}

export async function loadValidatedGlb(url:string){
  let lastError:unknown;
  for(let attempt=0;attempt<2;attempt+=1){
    try{
      const requestUrl=attempt===0?url:`${url}${url.includes('?')?'&':'?'}_glb_retry=${Date.now()}`;
      const response=await fetch(requestUrl,{cache:attempt===0?'default':'reload'});
      if(!response.ok)throw new Error(`GLB 요청 실패 (${response.status})`);
      const buffer=validateGlbBuffer(await response.arrayBuffer());
      return await createGltfLoader().parseAsync(buffer,LoaderUtils.extractUrlBase(url));
    }catch(error){lastError=error}
  }
  throw lastError;
}
