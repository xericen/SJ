import {FLOWER_CATALOG_BY_ID} from '../../../../shared/flower-catalog.js';
import {createEmptyUnifiedUserProfile,PROFILE_COMPLETION_WEIGHTS,UNIFIED_PROFILE_DOMAINS,type UnifiedProfileDomain,type UnifiedUserProfile} from '../../../../shared/unified-user-profile.js';
import {isGardenFlowerId,type FlowerInterestRecord} from '../../../../shared/flower-interest.js';
import {ClubModel} from '../../models/Club.js';
import {ProjectApplicationModel,ProjectModel} from '../../models/Project.js';
import {UserModel} from '../../models/User.js';

type Plain=Record<string,any>;
export interface UnifiedProfileSources {user?:Plain|null;clubs?:Plain[];projects?:Plain[];applications?:Plain[]}
export interface UnifiedProfileRepository {load(userId:string):Promise<UnifiedProfileSources>}

const strings=(value:unknown)=>Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'&&Boolean(item.trim())).map(item=>item.trim()):[];
const unique=(values:string[])=>[...new Set(values.filter(Boolean))];
const positiveScores=(value:unknown)=>Object.entries(value&&typeof value==='object'?value as Plain:{}).filter(([,score])=>Number(score)>0).map(([key])=>key);
const evidenceLength=(...values:unknown[])=>values.reduce<number>((total,value)=>total+(Array.isArray(value)?value.length:0),0);
const latestIso=(fallback:string,...values:unknown[])=>{
  const times=values.map(value=>new Date(value as any).getTime()).filter(Number.isFinite);
  return times.length?new Date(Math.max(...times)).toISOString():fallback;
};

const genreLabels:Record<string,string>={musical:'뮤지컬',play:'연극',jazz:'재즈',traditional:'전통공연',classical:'클래식'};
const festivalStyleLabels:Record<string,string>={participation:'체험 참여형',exploration:'탐색형',social:'함께 참여형',recording:'기록형',planningStyle:'계획형',visitIntent:'방문 계획형'};
const artsStyleLabels:Record<string,string>={immersion:'몰입 감상형',exploration:'탐색형',variety:'비교 감상형',appreciation:'객석 감상형',presence:'현장 감상형',preference:'관심 저장형'};
const roleLabels:Record<string,string>={chair:'회장',executive:'운영진',member:'회원'};

function calculateCompletedDomains(profile:UnifiedUserProfile):UnifiedProfileDomain[]{
  return UNIFIED_PROFILE_DOMAINS.filter(domain=>{
    if(domain==='festivalFood')return profile.festivalFood.festivalTypes.length>0||profile.festivalFood.foodTypes.length>0;
    if(domain==='gardenNature')return profile.gardenNature.exploredFlowerCount>0;
    if(domain==='arts')return profile.arts.preferredGenres.length>0||profile.arts.evidenceCount>0;
    if(domain==='clubs')return profile.clubs.categories.length>0;
    return profile.collaborationProjects.interests.length>0||profile.collaborationProjects.preferredRoles.length>0||Boolean(profile.collaborationProjects.collaborationStyle);
  });
}

export function calculateProfileCompletion(profile:UnifiedUserProfile){
  const completed=calculateCompletedDomains(profile);
  return {completedDomains:completed,profileCompletion:Math.max(0,Math.min(100,completed.reduce((sum,domain)=>sum+PROFILE_COMPLETION_WEIGHTS[domain],0)))};
}

export function buildUnifiedUserProfileFromSources(userId:string,sources:UnifiedProfileSources,now=new Date()):UnifiedUserProfile{
  const user=sources.user??{},harness=user.experienceHarness??{},storedFestival=user.festivalFood??{},storedArts=user.arts??{};
  const dto=createEmptyUnifiedUserProfile(userId,now.toISOString());
  const saved=Array.isArray(harness.savedInterests)?harness.savedInterests:[];
  const activities=Array.isArray(harness.activityRecords)?harness.activityRecords:[];
  const festivalSummary=harness.festival?.sessionSummary??{},foodSummary=harness.food?.sessionSummary??{};

  dto.festivalFood.festivalTypes=unique([
    ...strings(storedFestival.festivalTypes),...strings(festivalSummary.mostViewedCategories),
    ...saved.filter((item:Plain)=>item?.domain==='festival').flatMap((item:Plain)=>strings(item.tags)),
  ]);
  dto.festivalFood.foodTypes=unique([
    ...strings(storedFestival.foodTypes),...strings(foodSummary.mostViewedCategories),
    ...saved.filter((item:Plain)=>item?.domain==='food').flatMap((item:Plain)=>strings(item.tags)),
  ]);
  dto.festivalFood.participationStyles=unique([
    ...strings(storedFestival.participationStyles),
    ...positiveScores(harness.festival?.scores).map(key=>festivalStyleLabels[key]).filter((value):value is string=>Boolean(value)),
  ]);
  dto.festivalFood.evidenceCount=evidenceLength(storedFestival.evidenceRecords,harness.festival?.evidence,harness.food?.evidence,saved.filter((item:Plain)=>item?.domain==='festival'||item?.domain==='food'),activities.filter((item:Plain)=>item?.mapId==='festival-experience'||item?.mapId==='food-experience'));

  const flowerRecords:FlowerInterestRecord[]=(Array.isArray(user.profile?.gardenNature?.flowerInterests)?user.profile.gardenNature.flowerInterests:[])
    .filter((record:unknown):record is FlowerInterestRecord=>Boolean(record&&typeof record==='object'&&isGardenFlowerId((record as Plain).flowerId)&&Number((record as Plain).interestScore)>0));
  dto.gardenNature.topFlowers=flowerRecords.map(record=>{
    const catalog=FLOWER_CATALOG_BY_ID.get(record.flowerId);
    return {flowerId:record.flowerId,displayName:catalog?.displayName??record.flowerId,meanings:[...(catalog?.meanings??[])],interestScore:Number(record.interestScore)||0};
  }).sort((a,b)=>b.interestScore-a.interestScore||a.flowerId.localeCompare(b.flowerId)).slice(0,5);
  dto.gardenNature.exploredFlowerCount=new Set(flowerRecords.map(record=>record.flowerId)).size;
  dto.gardenNature.evidenceCount=flowerRecords.reduce((sum,record)=>sum+record.infoViewCount+record.nearbyVisitCount+record.revisitCount,0);
  const garden=user.profile?.gardenNature??{};
  if(typeof garden.observationStyle==='string'&&garden.observationStyle.trim())dto.gardenNature.observationStyle=garden.observationStyle.trim();

  dto.arts.preferredGenres=unique([
    ...strings(storedArts.preferredGenres),
    ...positiveScores(harness.performance?.scores).map(key=>genreLabels[key]).filter((value):value is string=>Boolean(value)),
    ...saved.filter((item:Plain)=>item?.domain==='performance').flatMap((item:Plain)=>strings(item.tags).filter(tag=>tag!=='문화예술')),
  ]);
  dto.arts.viewingStyles=unique([...strings(storedArts.viewingStyles),...positiveScores(harness.performance?.scores).map(key=>artsStyleLabels[key]).filter((value):value is string=>Boolean(value))]);
  dto.arts.evidenceCount=evidenceLength(storedArts.evidenceRecords,harness.performance?.evidence,saved.filter((item:Plain)=>item?.domain==='performance'),activities.filter((item:Plain)=>item?.mapId==='arts-center'));

  const joinedClubs=(sources.clubs??[]).filter(club=>club?.ownerId===userId||club?.members?.some((member:Plain)=>member?.userId===userId));
  const memberships=joinedClubs.flatMap(club=>club.members?.filter((member:Plain)=>member?.userId===userId)??[]);
  const campusSignals=Array.isArray(user.clubs?.campusProfileSignals)?user.clubs.campusProfileSignals:[];
  dto.clubs.categories=unique([...strings(user.clubs?.categories),...joinedClubs.flatMap(club=>strings([club.category])),...campusSignals.flatMap((signal:Plain)=>strings(signal.keywords))]);
  if(typeof user.clubs?.preferredGroupSize==='string'&&user.clubs.preferredGroupSize.trim())dto.clubs.preferredGroupSize=user.clubs.preferredGroupSize.trim();
  else if(joinedClubs.length){const average=joinedClubs.reduce((sum,club)=>sum+(Number(club.capacity)||0),0)/joinedClubs.length;dto.clubs.preferredGroupSize=average<=6?'소규모':average<=15?'중규모':'대규모'}
  if(typeof user.clubs?.participationRole==='string'&&user.clubs.participationRole.trim())dto.clubs.participationRole=user.clubs.participationRole.trim();
  else {const role=memberships.map((member:Plain)=>roleLabels[String(member.role)]).find(Boolean);if(role)dto.clubs.participationRole=role}
  dto.clubs.evidenceCount=joinedClubs.length+campusSignals.length;

  const relatedProjects=(sources.projects??[]).filter(project=>project?.leaderUserId===userId||strings(project?.memberUserIds).includes(userId));
  const applications=(sources.applications??[]).filter(application=>application?.applicantUserId===userId);
  const storedCollaboration=user.collaborationProjects??{};
  dto.collaborationProjects.interests=unique([
    ...strings(storedCollaboration.interests),...relatedProjects.flatMap(project=>[...strings(project.tags),...strings(project.activityTypes)]),
    ...applications.flatMap(application=>[...strings(application.profileSnapshot?.activities),...strings(application.profileSnapshot?.festivals),...strings(application.tags),...strings(application.activityTypes)]),
  ]);
  dto.collaborationProjects.preferredRoles=unique([...strings(storedCollaboration.preferredRoles),...applications.flatMap(application=>strings([application.recommendedRole]))]);
  dto.collaborationProjects.availableTimes=unique([...strings(storedCollaboration.availableTimes),...applications.flatMap(application=>strings(application.availableTimes))]);
  if(typeof storedCollaboration.collaborationStyle==='string'&&storedCollaboration.collaborationStyle.trim())dto.collaborationProjects.collaborationStyle=storedCollaboration.collaborationStyle.trim();
  dto.collaborationProjects.evidenceCount=relatedProjects.length+applications.length+evidenceLength(storedCollaboration.evidenceRecords);

  const explicitVisited=strings(user.placeBehavior?.visitedPlaceIds),visitRecords=Array.isArray(user.placeBehavior?.visitRecords)?user.placeBehavior.visitRecords:[];
  const activityPlaces:string[]=activities.map((item:Plain)=>typeof item?.mapId==='string'?item.mapId:'').filter((value:string)=>Boolean(value));
  const aggregate=new Map<string,{visits:number;activeSeconds:number}>();
  visitRecords.forEach((record:Plain)=>{if(typeof record?.placeId!=='string'||!record.placeId.trim())return;const current=aggregate.get(record.placeId)??{visits:0,activeSeconds:0};current.visits+=Math.max(1,Number(record.visitCount)||1);current.activeSeconds+=Math.max(0,Number(record.activeDurationSeconds)||0);aggregate.set(record.placeId,current)});
  activityPlaces.forEach(placeId=>{if(!aggregate.has(placeId))aggregate.set(placeId,{visits:1,activeSeconds:0})});
  dto.placeBehavior.visitedPlaceIds=unique([...explicitVisited,...aggregate.keys()]);
  const maxVisits=Math.max(0,...[...aggregate.values()].map(value=>value.visits)),maxStay=Math.max(0,...[...aggregate.values()].map(value=>value.activeSeconds));
  dto.placeBehavior.mostVisitedPlaceIds=maxVisits?[...aggregate].filter(([,value])=>value.visits===maxVisits).map(([id])=>id):[];
  dto.placeBehavior.longestStayedPlaceIds=maxStay?[...aggregate].filter(([,value])=>value.activeSeconds===maxStay).map(([id])=>id):[];
  dto.placeBehavior.revisitPlaceIds=unique([...strings(user.placeBehavior?.revisitPlaceIds),...[...aggregate].filter(([,value])=>value.visits>1).map(([id])=>id)]);

  const completion=calculateProfileCompletion(dto);
  dto.completedDomains=completion.completedDomains;dto.profileCompletion=completion.profileCompletion;
  dto.updatedAt=latestIso(now.toISOString(),user.updatedAt,...joinedClubs.map(club=>club.updatedAt),...relatedProjects.map(project=>project.updatedAt),...applications.map(application=>application.updatedAt));
  return dto;
}

export const mysqlUnifiedProfileRepository:UnifiedProfileRepository={
  async load(userId){
    const [user,clubs,projects,applications]=await Promise.all([
      UserModel.findById(userId).select('experienceHarness profile festivalFood arts clubs collaborationProjects placeBehavior updatedAt').lean(),
      ClubModel.find().lean(),ProjectModel.find().lean(),ProjectApplicationModel.find({applicantUserId:userId}).lean(),
    ]);
    return {user,clubs,projects,applications};
  },
};

export async function buildUnifiedUserProfile(userId:string):Promise<UnifiedUserProfile>{
  return buildUnifiedUserProfileFromSources(userId,await mysqlUnifiedProfileRepository.load(userId));
}
