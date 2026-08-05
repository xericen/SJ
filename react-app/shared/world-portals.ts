import type { MapId,PortalPosition } from './socket-events.js';

export const WORLD_PORTAL_DEFAULTS:readonly PortalPosition[]=[
  {mapId:'town',destination:'bear-tree-park',x:2122,z:944},
  {mapId:'town',destination:'campus',x:1178,z:122},
  {mapId:'town',destination:'arts-center',x:603,z:452},
  {mapId:'town',destination:'festival-experience',x:1219,z:1462},
  {mapId:'town',destination:'food-experience',x:491,z:1556},
  {mapId:'arts-center',destination:'town',x:1000,z:780},
  {mapId:'festival-experience',destination:'town',x:1200,z:1690},
  {mapId:'food-experience',destination:'town',x:980,z:1810},
  {mapId:'club-street-festival',destination:'campus',x:1200,z:1580},
  {mapId:'bear-tree-park',destination:'town',x:980,z:1580},
  {mapId:'bear-tree-park',destination:'garden',x:682,z:735},
  {mapId:'bear-tree-park',destination:'bear-play-zone',x:1616,z:601},
  {mapId:'bear-play-zone',destination:'bear-tree-park',x:1200,z:1650},
  {mapId:'garden',destination:'bear-tree-park',x:1200,z:1260},
  {mapId:'campus',destination:'town',x:1120,z:1731},
  {mapId:'campus',destination:'student-hall',x:881,z:950},
  {mapId:'campus',destination:'club-street-festival',x:450,z:882},
  {mapId:'campus',destination:'recruitment-center',x:508,z:1382},
  {mapId:'campus',destination:'project-room',x:1656,z:1501},
  {mapId:'student-hall',destination:'campus',x:1200,z:1660},
  {mapId:'recruitment-center',destination:'campus',x:1200,z:1690},
  {mapId:'project-room',destination:'campus',x:1220,z:2050},
  {mapId:'government',destination:'campus',x:1120,z:1731},
  {mapId:'government',destination:'government-central-plaza',x:720,z:1010},
  {mapId:'government',destination:'government-policy-hall',x:1200,z:760},
  {mapId:'government',destination:'government-observatory',x:1680,z:1010},
  {mapId:'government',destination:'sejong-smart-city',x:1200,z:1190},
  {mapId:'government-central-plaza',destination:'government',x:1200,z:1690},
  {mapId:'government-observatory',destination:'government',x:1200,z:1790},
  {mapId:'sejong-smart-city',destination:'government',x:1200,z:1690},
];

export const WORLD_PORTAL_LABELS:Partial<Record<MapId,string>>={
  town:'세종호수공원',campus:'공동캠퍼스','arts-center':'세종예술의전당',
  'festival-experience':'축제 부스','food-experience':'먹거리 부스',
  'club-street-festival':'동아리 거리제','bear-tree-park':'베어트리파크',
  'bear-play-zone':'AI 탐험 연구소',garden:'세종수목원','student-hall':'학생회관',
  'recruitment-center':'모집센터','project-room':'프로젝트실',government:'정부청사',
  'government-central-plaza':'중앙광장','government-policy-hall':'정책 체험관',
  'government-observatory':'전망대','sejong-smart-city':'스마트시티',
};

export const worldPortalKey=(position:Pick<PortalPosition,'mapId'|'destination'>)=>`${position.mapId}:${position.destination}`;
export const worldPortalsForMap=(mapId:MapId,positions:readonly PortalPosition[]=WORLD_PORTAL_DEFAULTS)=>positions.filter(position=>position.mapId===mapId);
