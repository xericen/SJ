import type {GardenFlowerId} from '../../shared/personal-farm';
import {GARDEN_FLOWER_ASSETS} from '../../shared/garden-flower-assets';

export interface FlowerAssetNodeDefinition {
  objectName:string;
  userDataName:string;
}

export const FLOWER_ASSET_NODES:Record<GardenFlowerId,FlowerAssetNodeDefinition>=Object.fromEntries(
  GARDEN_FLOWER_ASSETS.map(asset=>[asset.flowerId,{objectName:asset.objectNames[0],userDataName:asset.objectNames[0]}]),
) as Record<GardenFlowerId,FlowerAssetNodeDefinition>;

export const normalizeFlowerNodeName=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
