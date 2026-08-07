import type { MapId } from '../../shared/socket-events';

export type LakeParkPortalConfig={
  x:number;
  z:number;
  destination:MapId;
  label:string;
  appearance:'white-circle';
  theme:'mint'|'blue'|'orange';
  chargeSeconds:3;
  activationRadius:140;
  fixedPosition:true;
  sharedPosition:false;
  arrivalDirection?:{x:number;z:number};
  arrivalClearance?:number;
};

export const LAKE_PARK_PORTALS:readonly LakeParkPortalConfig[]=[
  {x:2122,z:944,destination:'bear-tree-park',label:'베어트리파크',appearance:'white-circle',theme:'blue',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false},
  {x:1178,z:122,destination:'campus',label:'공동캠퍼스',appearance:'white-circle',theme:'blue',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false},
  {x:603,z:452,destination:'arts-center',label:'세종예술의전당',appearance:'white-circle',theme:'orange',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false},
  {x:1219,z:1462,destination:'festival-experience',label:'축제부스',appearance:'white-circle',theme:'orange',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false,arrivalDirection:{x:0,z:1},arrivalClearance:220},
  {x:491,z:1556,destination:'food-experience',label:'먹거리 부스',appearance:'white-circle',theme:'mint',chargeSeconds:3,activationRadius:140,fixedPosition:true,sharedPosition:false,arrivalDirection:{x:1,z:1},arrivalClearance:220},
];
