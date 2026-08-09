import {Router,type RequestHandler} from 'express';
import {z} from 'zod';
import {requireAuthenticatedUser} from '../middleware/authenticatedUser.js';
import {ProjectApplicationModel,ProjectModel} from '../models/Project.js';
import {UserModel} from '../models/User.js';
import {buildUnifiedUserProfile} from '../services/profile/buildUnifiedUserProfile.js';
import {listProjectRoomProjects} from '../services/projectRoomProjectStore.js';
import type {UnifiedUserProfile} from '../../../shared/unified-user-profile.js';

const short=z.string().trim().min(1).max(80);
const shortList=z.array(short).max(30);
const preferencesSchema=z.object({
  clubs:z.object({categories:shortList.optional(),preferredGroupSize:short.optional(),participationRole:short.optional()}).strict().optional(),
  collaborationProjects:z.object({interests:shortList.optional(),preferredRoles:shortList.optional(),collaborationStyle:short.optional(),availableTimes:shortList.optional()}).strict().optional(),
}).strict();
const campusSignalSchema=z.object({id:short,mapId:short,zone:short,action:short,subject:short,title:short,note:z.string().trim().max(300),keywords:shortList,point:z.number().min(0).max(20),at:z.string().datetime(),count:z.number().int().min(1).max(9)}).strict();
const projectSchema=z.object({id:short,title:short,summary:z.string().trim().max(300),description:z.string().trim().max(2000),placeIds:shortList,activityTypes:shortList,tags:shortList,maxMembers:z.number().int().min(2).max(100),startDate:z.string().max(40).optional(),deadline:z.string().max(40).optional(),preferredTraits:shortList,status:z.enum(['recruiting','planning','active','completed']),visibility:z.enum(['public','private']).optional(),leaderNickname:short.optional(),memberNicknames:shortList.optional(),applicantNicknames:shortList.optional(),thumbnail:z.string().trim().max(20).optional(),createdAt:z.string().datetime().optional()}).strict();
const applicationSchema=z.object({id:short,projectId:short,profileSnapshot:z.object({festivals:shortList,activities:shortList,representativePlant:short.optional(),emotionKeywords:shortList,travelStyle:short.optional(),preferredPlaces:shortList,introduction:z.string().trim().max(500).optional()}).strict(),recommendedRole:short.optional(),availableTimes:shortList.optional(),status:z.enum(['pending','accepted','rejected']).default('pending'),createdAt:z.string().datetime()}).strict();
const placeVisitSchema=z.object({sessionId:short,placeId:short,activeDurationSeconds:z.number().min(0).max(14400),idleDurationSeconds:z.number().min(0).max(86400).default(0),visitedAt:z.string().datetime()}).strict();

type Builder=(userId:string)=>Promise<UnifiedUserProfile>;
export function createUnifiedProfileRouter(auth:RequestHandler=requireAuthenticatedUser,builder:Builder=buildUnifiedUserProfile){
  const router=Router();router.use(auth);
  router.get('/me/unified-profile',async(_req,res)=>res.json({success:true,data:await builder(res.locals.authenticatedUserId)}));
  router.get('/me/unified-profile/projects',async(_req,res)=>res.json({success:true,data:{projects:await listProjectRoomProjects()}}));
  router.put('/me/unified-profile/preferences',async(req,res)=>{
    const parsed=preferencesSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_UNIFIED_PROFILE_PREFERENCES',message:parsed.error.issues[0]?.message??'프로필 설정이 올바르지 않습니다.'}});
    const fields:Record<string,unknown>={};
    Object.entries(parsed.data.clubs??{}).forEach(([key,value])=>fields[`clubs.${key}`]=value);
    Object.entries(parsed.data.collaborationProjects??{}).forEach(([key,value])=>fields[`collaborationProjects.${key}`]=value);
    if(Object.keys(fields).length)await UserModel.findByIdAndUpdate(res.locals.authenticatedUserId,{$set:fields},{returnDocument:'after'});
    return res.json({success:true,data:await builder(res.locals.authenticatedUserId)});
  });
  router.post('/me/unified-profile/campus-signal',async(req,res)=>{
    const parsed=campusSignalSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_CAMPUS_SIGNAL',message:parsed.error.issues[0]?.message??'캠퍼스 활동 기록이 올바르지 않습니다.'}});
    const user=await UserModel.findById(res.locals.authenticatedUserId).select('clubs');if(!user)return res.status(404).json({success:false,error:{code:'USER_NOT_FOUND',message:'사용자를 찾을 수 없습니다.'}});
    const clubs=user.get('clubs')??{},previous=Array.isArray(clubs.campusProfileSignals)?clubs.campusProfileSignals:[];
    clubs.campusProfileSignals=[parsed.data,...previous.filter((item:any)=>item?.id!==parsed.data.id)].slice(0,120);user.set('clubs',clubs);await user.save();
    return res.status(201).json({success:true,data:{signal:parsed.data}});
  });
  router.post('/me/unified-profile/projects',async(req,res)=>{
    const parsed=projectSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_PROJECT',message:parsed.error.issues[0]?.message??'프로젝트 정보가 올바르지 않습니다.'}});
    const userId=res.locals.authenticatedUserId,existing=await ProjectModel.findOne({id:parsed.data.id}).lean();
    if(existing&&existing.leaderUserId!==userId)return res.status(403).json({success:false,error:{code:'PROJECT_LEADER_REQUIRED',message:'프로젝트 팀장만 프로젝트를 수정할 수 있습니다.'}});
    const project=await ProjectModel.findOneAndUpdate({id:parsed.data.id},{$set:{...parsed.data,leaderUserId:userId,memberUserIds:existing?.memberUserIds?.length?existing.memberUserIds:[userId],memberNicknames:parsed.data.memberNicknames?.length?parsed.data.memberNicknames:[parsed.data.leaderNickname??userId]}},{upsert:true,returnDocument:'after'});
    return res.status(201).json({success:true,data:{project:project?.toJSON?.()??project}});
  });
  router.patch('/me/unified-profile/projects/:projectId/members/:memberId/role',async(req,res)=>{
    const userId=res.locals.authenticatedUserId,project=await ProjectModel.findOne({id:req.params.projectId});
    if(!project)return res.status(404).json({success:false,error:{code:'PROJECT_NOT_FOUND',message:'프로젝트를 찾을 수 없습니다.'}});
    if(project.leaderUserId!==userId)return res.status(403).json({success:false,error:{code:'PROJECT_LEADER_REQUIRED',message:'프로젝트 팀장만 역할을 변경할 수 있습니다.'}});
    if(!project.memberUserIds.includes(req.params.memberId))return res.status(404).json({success:false,error:{code:'PROJECT_MEMBER_NOT_FOUND',message:'프로젝트 팀원을 찾을 수 없습니다.'}});
    const role=typeof req.body?.role==='string'?req.body.role.trim().slice(0,50):'';if(!role)return res.status(400).json({success:false,error:{code:'INVALID_ROLE',message:'역할을 입력해 주세요.'}});
    project.memberRoles={...(project.memberRoles??{}),[req.params.memberId]:role};await project.save();return res.json({success:true,data:{memberRoles:project.memberRoles}});
  });
  router.post('/me/unified-profile/project-applications',async(req,res)=>{
    const parsed=applicationSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_PROJECT_APPLICATION',message:parsed.error.issues[0]?.message??'프로젝트 지원 정보가 올바르지 않습니다.'}});
    const application=await ProjectApplicationModel.findOneAndUpdate({id:parsed.data.id},{$set:{...parsed.data,applicantUserId:res.locals.authenticatedUserId}},{upsert:true,returnDocument:'after'});
    return res.status(201).json({success:true,data:{application:application?.toJSON?.()??application}});
  });
  router.post('/me/unified-profile/place-visits',async(req,res)=>{
    const parsed=placeVisitSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_PLACE_VISIT',message:parsed.error.issues[0]?.message??'방문 기록이 올바르지 않습니다.'}});
    const user=await UserModel.findById(res.locals.authenticatedUserId).select('placeBehavior');if(!user)return res.status(404).json({success:false,error:{code:'USER_NOT_FOUND',message:'사용자를 찾을 수 없습니다.'}});
    const behavior=user.get('placeBehavior')??{},records=Array.isArray(behavior.visitRecords)?behavior.visitRecords:[];
    if(!records.some((item:any)=>item?.sessionId===parsed.data.sessionId))records.push({sessionId:parsed.data.sessionId,placeId:parsed.data.placeId,visitCount:1,activeDurationSeconds:parsed.data.activeDurationSeconds,visitedAt:parsed.data.visitedAt});
    behavior.visitRecords=records.slice(-300);behavior.visitedPlaceIds=[...new Set([...(Array.isArray(behavior.visitedPlaceIds)?behavior.visitedPlaceIds:[]),parsed.data.placeId])];user.set('placeBehavior',behavior);await user.save();
    return res.status(201).json({success:true,data:{recorded:true}});
  });
  return router;
}

export const unifiedProfileRouter=createUnifiedProfileRouter();
