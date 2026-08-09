import * as THREE from 'three';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import bearTreeModelUrl from '../assets/maps/new-beartree.glb?url';
import {createGltfLoader} from '../utils/createGltfLoader';

const STATUE_NODE_NAME='tripo_node_663ac3ae-202d-4035-bde3-3b143688b477';

let sourcePromise:Promise<THREE.Object3D>|undefined;

async function loadSource(){
  if(!sourcePromise){
    sourcePromise=new Promise<THREE.Object3D>((resolve,reject)=>{
      createGltfLoader().load(bearTreeModelUrl,gltf=>{
        const source=gltf.scene;source.updateMatrixWorld(true);
        const statue=source.getObjectByName(STATUE_NODE_NAME);
        if(!statue){reject(new Error(`Bear statue node not found: ${STATUE_NODE_NAME}`));return}
        statue.name='bear-tree-statue-source';
        resolve(statue);
      },undefined,reject);
    }).catch(error=>{sourcePromise=undefined;throw error});
  }
  return sourcePromise;
}

export async function createBearStatueObject(options:{targetHeight?:number;rotationY?:number}={}){
  const bear=cloneSkeleton(await loadSource()) as THREE.Group;
  bear.name='personal-farm-bear-statue-model';
  bear.traverse(child=>{if(child instanceof THREE.Mesh){child.castShadow=true;child.receiveShadow=true}});
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
