import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import bearModelUrl from '../assets/characters/bear.glb?url';

let sourcePromise:Promise<THREE.Group>|undefined;

async function loadSource(){
  if(!sourcePromise){
    sourcePromise=new Promise<THREE.Group>((resolve,reject)=>{
      new GLTFLoader().load(bearModelUrl,gltf=>{
        const source=gltf.scene;source.name='bear-statue-source';source.updateMatrixWorld(true);
        resolve(source);
      },undefined,reject);
    }).catch(error=>{sourcePromise=undefined;throw error});
  }
  return sourcePromise;
}

export async function createBearStatueObject(options:{targetHeight?:number;rotationY?:number}={}){
  const bear=cloneSkeleton(await loadSource()) as THREE.Group;
  bear.name='personal-farm-bear-statue-model';
  bear.traverse(child=>{if(child instanceof THREE.Mesh){child.material=new THREE.MeshStandardMaterial({color:0xb68a4d,roughness:.48,metalness:.62});child.castShadow=true;child.receiveShadow=true}});
  if(options.targetHeight){
    const size=new THREE.Box3().setFromObject(bear).getSize(new THREE.Vector3());
    if(size.y>.01)bear.scale.multiplyScalar(options.targetHeight/size.y);
  }
  const bearBounds=new THREE.Box3().setFromObject(bear),bearCenter=bearBounds.getCenter(new THREE.Vector3());
  bear.position.set(-bearCenter.x,26-bearBounds.min.y,-bearCenter.z);
  const pedestal=new THREE.Mesh(
    new THREE.CylinderGeometry(62,70,26,32),
    new THREE.MeshStandardMaterial({color:0x8f806b,roughness:.78,metalness:.18}),
  );
  pedestal.name='personal-farm-bear-statue-pedestal';pedestal.position.y=13;pedestal.castShadow=true;pedestal.receiveShadow=true;
  const object=new THREE.Group();object.name='personal-farm-bear-statue';object.rotation.y=options.rotationY??0;object.add(pedestal,bear);
  return object;
}
