import * as THREE from 'three';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import gardenModelUrl from '../assets/maps/garden.glb?url';
import {greenhousePlantById} from '../data/greenhouse-plants';
import {flowerCatalogByFlowerId} from './flowerInterestProfile';
import type {GardenFlowerId} from '../../shared/personal-farm';
import {FLOWER_ASSET_NODES,normalizeFlowerNodeName,type FlowerAssetNodeDefinition} from './flowerAssetNodes';
import {createGltfLoader} from '../utils/createGltfLoader';

function findFlowerNode(source:THREE.Object3D,definition:FlowerAssetNodeDefinition){
  const targets=new Set([definition.objectName,definition.userDataName].map(normalizeFlowerNodeName));
  let match:THREE.Object3D|undefined;
  source.traverse(object=>{
    if(match)return;
    const userDataName=typeof object.userData?.name==='string'?object.userData.name:'';
    if(targets.has(normalizeFlowerNodeName(object.name))||targets.has(normalizeFlowerNodeName(userDataName)))match=object;
  });
  return match;
}

function cloneFlower(source:THREE.Object3D){
  let skinned=false;
  source.traverse(object=>{if(object instanceof THREE.SkinnedMesh)skinned=true});
  return skinned?cloneSkeleton(source):source.clone(true);
}

let sourceScenePromise:Promise<THREE.Object3D>|undefined;
const loadSourceScene=()=>sourceScenePromise??=new Promise<THREE.Object3D>((resolve,reject)=>{
  createGltfLoader().load(gardenModelUrl,gltf=>resolve(gltf.scene),undefined,reject);
});

export async function createFlowerObjectById(flowerId:GardenFlowerId){
  const plantId=flowerCatalogByFlowerId.get(flowerId)?.plantId;
  const catalogEntry=plantId?greenhousePlantById.get(plantId):undefined;
  const definition=FLOWER_ASSET_NODES[flowerId];
  if(!definition||!catalogEntry)throw new Error(`Unknown flower asset: ${flowerId}`);
  const sourceObject=findFlowerNode(await loadSourceScene(),definition);
  if(!sourceObject)throw new Error(`Missing flower asset node: ${flowerId}`);
  const clone=cloneFlower(sourceObject);
  clone.userData={...clone.userData,name:definition.userDataName,flowerId,sourceObjectName:sourceObject.name};
  return clone;
}
