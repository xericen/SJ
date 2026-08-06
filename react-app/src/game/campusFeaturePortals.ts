import type {CampusFeaturePortalId,MapId} from '../../shared/socket-events';

export type CampusFeaturePortalConfig={
  id:CampusFeaturePortalId;
  x:number;
  z:number;
  destination:Extract<MapId,'student-hall'|'club-street-festival'|'recruitment-center'|'project-room'>;
  label:string;
  description:string;
  color:number;
  theme:'mint'|'blue'|'orange';
  chargeSeconds:3;
  activationRadius:140;
};

export const CAMPUS_FEATURE_PORTALS:readonly CampusFeaturePortalConfig[]=[
  {id:'people',x:881,z:950,destination:'student-hall',label:'학생회관',description:'친구 추천 · 프로필 · 게시판',color:0x56b28c,theme:'mint',chargeSeconds:3,activationRadius:140},
  {id:'clubs',x:1537,z:499,destination:'club-street-festival',label:'동아리 거리제',description:'가입 · 단체 채팅 · 활동',color:0xe9a14b,theme:'orange',chargeSeconds:3,activationRadius:140},
  {id:'recruit',x:817,z:1318,destination:'recruitment-center',label:'모집센터',description:'동행 모집 · 참가 신청',color:0x7f8ed8,theme:'blue',chargeSeconds:3,activationRadius:140},
  {id:'government',x:1590,z:1543,destination:'project-room',label:'프로젝트실',description:'코스 만들기 · 프로젝트 생성',color:0xee7b5b,theme:'orange',chargeSeconds:3,activationRadius:140},
];

export const CAMPUS_FEATURE_PORTAL_DESTINATIONS=Object.fromEntries(
  CAMPUS_FEATURE_PORTALS.map(portal=>[portal.id,portal.destination]),
) as Record<CampusFeaturePortalId,CampusFeaturePortalConfig['destination']>;
