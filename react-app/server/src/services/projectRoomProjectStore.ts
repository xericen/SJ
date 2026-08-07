import {ProjectModel} from '../models/Project.js';

type StoredProject=Record<string,any>;

export const PROJECT_ROOM_DATABASE_SEEDS=[
  {id:'garden-photo',title:'수목원 사진 기록 프로젝트',summary:'계절별 식물과 풍경을 사진으로 기록해요.',description:'국립세종수목원을 함께 걸으며 대표 식물과 계절의 변화를 촬영하고 작은 온라인 도감을 완성합니다.',placeIds:['국립세종수목원'],activityTypes:['사진','자연','조사'],tags:['사진','자연','수목원','기록'],leaderUserId:'seed:garden-photo',leaderNickname:'초록산책',memberUserIds:[],memberNicknames:['초록산책','하늘여우'],applicantNicknames:[],maxMembers:5,startDate:'2026-08-08',deadline:'2026-08-05',preferredTraits:['사진 기록형','여유형','대화 중심'],status:'recruiting',visibility:'public',thumbnail:'🌸',createdAt:'2026-07-20T09:00:00.000Z'},
  {id:'night-festival',title:'세종 야간축제 탐방 프로젝트',summary:'공연과 야경을 함께 탐방하고 축제 지도를 만들어요.',description:'호수공원 야간축제의 공연, 먹거리, 포토존을 나누어 조사한 뒤 방문자용 추천 지도를 제작합니다.',placeIds:['세종호수공원'],activityTypes:['축제','탐방','사진'],tags:['야간축제','공연','사진','호수공원'],leaderUserId:'seed:night-festival',leaderNickname:'별빛여행',memberUserIds:[],memberNicknames:['별빛여행','밤산책'],applicantNicknames:[],maxMembers:6,startDate:'2026-08-15',deadline:'2026-08-10',preferredTraits:['탐색형','자유형','실행 중심'],status:'recruiting',visibility:'public',thumbnail:'🎆',createdAt:'2026-07-22T09:00:00.000Z'},
  {id:'market-culture',title:'전통시장 문화 기록 프로젝트',summary:'상인 인터뷰와 로컬 먹거리를 기록해요.',description:'전통시장의 오래된 가게와 새로운 청년 상점을 찾아 인터뷰하고 세종의 생활문화를 카드뉴스로 남깁니다.',placeIds:['전통시장'],activityTypes:['문화','인터뷰','조사'],tags:['전통시장','문화','인터뷰','먹거리'],leaderUserId:'seed:market-culture',leaderNickname:'시장탐험가',memberUserIds:[],memberNicknames:['시장탐험가','복숭아소다','기록자'],applicantNicknames:[],maxMembers:5,startDate:'2026-08-22',deadline:'2026-08-16',preferredTraits:['계획형','대화 중심','실행 중심'],status:'recruiting',visibility:'public',thumbnail:'🏮',createdAt:'2026-07-24T09:00:00.000Z'},
] as const;

const strings=(value:unknown)=>Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[];
const iso=(value:unknown)=>{
  const date=value instanceof Date?value:new Date(typeof value==='string'||typeof value==='number'?value:Date.now());
  return Number.isNaN(date.getTime())?new Date().toISOString():date.toISOString();
};

export function projectRoomProjectDto(document:StoredProject){
  return {
    id:String(document.id??document._id??''),title:String(document.title??''),summary:String(document.summary??''),description:String(document.description??''),
    placeIds:strings(document.placeIds),activityTypes:strings(document.activityTypes),tags:strings(document.tags),
    leaderId:String(document.leaderNickname||document.leaderUserId||'프로젝트 운영팀'),
    memberIds:strings(document.memberNicknames).length?strings(document.memberNicknames):strings(document.memberUserIds),
    applicantIds:strings(document.applicantNicknames),maxMembers:Number(document.maxMembers)||5,
    startDate:typeof document.startDate==='string'?document.startDate:undefined,deadline:typeof document.deadline==='string'?document.deadline:undefined,
    preferredTraits:strings(document.preferredTraits),status:['recruiting','planning','active','completed'].includes(document.status)?document.status:'recruiting',
    visibility:document.visibility==='private'?'private':'public',thumbnail:typeof document.thumbnail==='string'?document.thumbnail:undefined,
    createdAt:iso(document.createdAt),
  };
}

export async function listProjectRoomProjects(){
  await Promise.all(PROJECT_ROOM_DATABASE_SEEDS.map(seed=>ProjectModel.findOneAndUpdate({id:seed.id},{$setOnInsert:{...seed}},{upsert:true,returnDocument:'after'})));
  const rows=await ProjectModel.find({visibility:{$ne:'private'}}).sort({createdAt:-1}).lean();
  return rows.map(projectRoomProjectDto);
}
