import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import bearTreeParkModelUrl from '../assets/maps/new-beartree.glb?url';

export const BEAR_STATUE_NODE_NAME='tripo_node_663ac3ae-202d-4035-bde3-3b143688b477';
export const BEAR_STATUE_PEDESTAL_NODE_NAME='tripo_node_205fe7ff-0ff3-479d-8efe-efb90df4bf37';

let sourcePromise:Promise<THREE.Group>|undefined;

async function loadSource(){
  if(!sourcePromise){
    sourcePromise=new Promise<THREE.Group>((resolve,reject)=>{
      new GLTFLoader().load(bearTreeParkModelUrl,gltf=>{
        const statue=gltf.scene.getObjectByName(BEAR_STATUE_NODE_NAME);
        if(!statue){reject(new Error(`Missing bear statue node: ${BEAR_STATUE_NODE_NAME}`));return}
        const source=new THREE.Group();source.name='bear-statue-source';source.add(statue.clone(false));
        const pedestal=gltf.scene.getObjectByName(BEAR_STATUE_PEDESTAL_NODE_NAME);if(pedestal)source.add(pedestal.clone(false));
        resolve(source);
      },undefined,reject);
    }).catch(error=>{sourcePromise=undefined;throw error});
  }
  return sourcePromise;
}

export async function createBearStatueObject(options:{targetHeight?:number;rotationY?:number}={}){
  const object=cloneSkeleton(await loadSource()) as THREE.Group;
  object.name='personal-farm-bear-statue';object.rotation.y=options.rotationY??0;
  if(options.targetHeight){
    const size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    if(size.y>.01)object.scale.multiplyScalar(options.targetHeight/size.y);
  }
  return object;
}
