import { Router } from 'express';
import { z } from 'zod';
import { requireAuthenticatedUser } from '../middleware/authenticatedUser.js';
import { UserModel } from '../models/User.js';
import { buildPersistedActivities,mapExitSchema,scoreMapExit,updateSavedExperienceInterests,type ExperienceSessionSummary,type SavedExperienceInterest } from '../services/experience/experienceHarness.js';
import { buildDeterministicExperienceProfile,generateExperienceProfile } from '../services/experience/experienceProfile.js';

const shortList = z.array(z.string().trim().min(1).max(50)).max(30);
const characterSchema = z.object({
  hair: z.string().trim().min(1).max(80),
  hairStyle: z.enum(['hair1', 'hair2', 'both']).optional(),
  topStyle: z.enum(['style1', 'style2']).optional(),
  bottomStyle: z.enum(['style1', 'style2']).optional(),
  shoesStyle: z.enum(['style1', 'style2']).optional(),
  outfitStyle: z.enum(['outfit1', 'outfit2']).optional(),
  face: z.string().trim().min(1).max(80),
  top: z.string().trim().min(1).max(80),
  topLayer: z.string().trim().max(80).optional(),
  bottom: z.string().trim().min(1).max(80),
  shoes: z.string().trim().min(1).max(80),
  accessory: z.string().trim().max(80).optional(),
});
const profileSchema = z.object({
  nickname: z.string().trim().min(1).max(30),
  residence: z.string().trim().min(1).max(30).optional(),
  sejongVisitExperience: z.string().trim().min(1).max(30).optional(),
  mbti: z.string().trim().max(10),
  interests: shortList,
  usagePurposes: shortList,
  preferredPlaceCategories: shortList,
  recordVisibility: z.enum(['public', 'private']).default('public'),
  chatEnabled: z.boolean().default(true),
  model: z.enum(['custom', 'chungnyeong', 'girl1', 'boy1', 'cloths', 'women']),
  character: characterSchema,
}).strict();
const savedInterestSchema=z.object({id:z.string().trim().min(1).max(100),domain:z.enum(['performance','food','festival']),title:z.string().trim().min(1).max(120),subtitle:z.string().trim().max(160).default(''),tags:z.array(z.string().trim().min(1).max(40)).max(8),placeCategories:z.array(z.string().trim().min(1).max(40)).max(5),savedAt:z.string().datetime()}).strict();
const savedInterestMigrationSchema=z.object({savedInterests:z.array(savedInterestSchema).max(100)}).strict();

const mergeUnique=(first:unknown,second:unknown)=>[...new Set([...(Array.isArray(first)?first:[]),...(Array.isArray(second)?second:[])].filter((value):value is string=>typeof value==='string'))];
const mergeSessionSummary=(previous:ExperienceSessionSummary|undefined,current:ExperienceSessionSummary|undefined):ExperienceSessionSummary|undefined=>{
  if(!current)return previous;
  return {
    ...previous,...current,
    festivalsViewed:Math.max(previous?.festivalsViewed??0,current.festivalsViewed??0),
    festivalsSaved:Math.max(previous?.festivalsSaved??0,current.festivalsSaved??0),
    restaurantsViewed:Math.max(previous?.restaurantsViewed??0,current.restaurantsViewed??0),
    localFoodsViewed:Math.max(previous?.localFoodsViewed??0,current.localFoodsViewed??0),
    cafesViewed:Math.max(previous?.cafesViewed??0,current.cafesViewed??0),
    mostViewedCategories:mergeUnique(previous?.mostViewedCategories,current.mostViewedCategories).slice(-12),
    informationFocus:mergeUnique(previous?.informationFocus,current.informationFocus).slice(-12),
    reopenedFestivals:mergeUnique(previous?.reopenedFestivals,current.reopenedFestivals).slice(-20),
    savedItems:mergeUnique(previous?.savedItems,current.savedItems).slice(-50),
    reopenedItems:mergeUnique(previous?.reopenedItems,current.reopenedItems).slice(-50),
    longestViewedFestival:current.longestViewedFestival||previous?.longestViewedFestival||'',
    allStampsCompleted:Boolean(previous?.allStampsCompleted||current.allStampsCompleted),
    allTrucksCompleted:Boolean(previous?.allTrucksCompleted||current.allTrucksCompleted),
  };
};

export const accountRouter = Router();
accountRouter.use(requireAuthenticatedUser);

accountRouter.get('/me', async (_req, res) => {
  const user = await UserModel.findById(res.locals.authenticatedUserId)
    .select('nickname profileImage displayName profileImageUrl avatar explicitInterests onboardingCompleted ageGroup adultAt ageSource profile lastPosition')
    .lean();
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } });
  return res.json({
    success: true,
    data: {
      userId: String(user._id),
      kakaoNickname: user.nickname,
      profileImage: user.profileImage,
      ageGroup: user.ageGroup,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      avatar: user.avatar,
      explicitInterests: user.explicitInterests,
      onboardingCompleted: user.onboardingCompleted,
      requiresBirthConfirmation: user.ageGroup === 'unknown',
      adultAt: user.adultAt ?? null,
      ageSource: user.ageSource,
      profile: user.profile ?? null,
      lastPosition: user.lastPosition?.mapId ? user.lastPosition : null,
    },
  });
});

accountRouter.put('/me/profile', async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PROFILE', message: parsed.error.issues[0]?.message ?? '프로필 형식이 올바르지 않습니다.' } });
  }
  const user = await UserModel.findByIdAndUpdate(
    res.locals.authenticatedUserId,
    { $set: { profile: parsed.data, onboardingCompleted: true } },
    { returnDocument: 'after', runValidators: true },
  ).select('profile');
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } });
  return res.json({ success: true, data: { profile: user.profile } });
});

accountRouter.post('/me/experience/map-exit',async(req,res)=>{
  const parsed=mapExitSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_EXPERIENCE_LOG',message:parsed.error.issues[0]?.message??'행동 기록 형식이 올바르지 않습니다.'}});
  const user=await UserModel.findById(res.locals.authenticatedUserId).select('+experienceHarness.processedSessionIds experienceHarness');
  if(!user)return res.status(404).json({success:false,error:{code:'USER_NOT_FOUND',message:'사용자를 찾을 수 없습니다.'}});
  const harness=(user.get('experienceHarness')??{}) as any;
  if((harness.processedSessionIds??[]).includes(parsed.data.sessionId))return res.json({success:true,data:{duplicate:true,profile:harness.generatedProfile??null,profileFragments:harness.profileFragments??[],savedInterests:harness.savedInterests??[],activityRecords:harness.activityRecords??[]}});
  const summary=scoreMapExit(parsed.data),key=parsed.data.mapId==='arts-center'?'performance':parsed.data.mapId==='food-experience'?'food':'festival';
  const previous=harness[key] as {scores?:Map<string,number>|Record<string,number>;evidence?:string[];sessionSummary?:ExperienceSessionSummary}|undefined;
  const previousScores=previous?.scores instanceof Map?Object.fromEntries(previous.scores):previous?.scores??{};
  harness[key]={scores:Object.entries(summary.scores).reduce<Record<string,number>>((scores,[name,value])=>{scores[name]=Math.min(100,(previousScores[name]??0)+value);return scores},{...previousScores}),evidence:[...(previous?.evidence??[]),...summary.evidence].filter((value,index,all)=>all.indexOf(value)===index).slice(-20),sessionSummary:mergeSessionSummary(previous?.sessionSummary,summary.sessionSummary)};
  const bundle={performance:harness.performance,food:harness.food,festival:harness.festival};
  const generated=await generateExperienceProfile(bundle);
  harness.processedSessionIds=[...(harness.processedSessionIds??[]),parsed.data.sessionId].slice(-50);
  harness.generatedProfile={...generated.profile,generatorSource:generated.source,updatedAt:new Date()};
  const activityRecords=buildPersistedActivities(parsed.data,summary),activityIds=new Set(activityRecords.map(record=>record.id));
  if(activityRecords.length)harness.activityRecords=[...(harness.activityRecords??[]).filter((record:any)=>!activityIds.has(record?.id)),...activityRecords].slice(-100);
  const previousSaved=(harness.savedInterests??[]).map((item:any)=>({...item,savedAt:item?.savedAt instanceof Date?item.savedAt:new Date(item?.savedAt??0)})) as SavedExperienceInterest[];
  harness.savedInterests=updateSavedExperienceInterests(previousSaved,parsed.data);
  harness.savedInterestsInitialized=true;
  const fragmentBundle=key==='performance'?{performance:harness.performance}:key==='food'?{food:harness.food}:{festival:harness.festival};
  const fragment=buildDeterministicExperienceProfile(fragmentBundle);
  harness.profileFragments=[...(harness.profileFragments??[]).filter((item:any)=>item?.source!==fragment.source),{...fragment,scores:harness[key].scores,sessionSummary:harness[key].sessionSummary,updatedAt:new Date()}].slice(-12);
  user.set('experienceHarness',harness);await user.save();
  return res.json({success:true,data:{summary,profile:harness.generatedProfile,profileFragments:harness.profileFragments??[],savedInterests:harness.savedInterests??[],activityRecords:harness.activityRecords??[]}});
});

accountRouter.put('/me/experience/saved-interests',async(req,res)=>{
  const parsed=savedInterestMigrationSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_SAVED_INTERESTS',message:parsed.error.issues[0]?.message??'저장 관심사 형식이 올바르지 않습니다.'}});
  const user=await UserModel.findById(res.locals.authenticatedUserId).select('experienceHarness');
  if(!user)return res.status(404).json({success:false,error:{code:'USER_NOT_FOUND',message:'사용자를 찾을 수 없습니다.'}});
  const harness=(user.get('experienceHarness')??{}) as any;
  if(harness.savedInterestsInitialized)return res.json({success:true,data:{savedInterests:harness.savedInterests??[],migrated:false}});
  harness.savedInterests=parsed.data.savedInterests.map(item=>({...item,savedAt:new Date(item.savedAt)}));
  harness.savedInterestsInitialized=true;
  user.set('experienceHarness',harness);await user.save();
  return res.json({success:true,data:{savedInterests:harness.savedInterests,migrated:true}});
});

accountRouter.get('/me/experience/profile',async(_req,res)=>{
  const user=await UserModel.findById(res.locals.authenticatedUserId).select('experienceHarness').lean();
  if(!user)return res.status(404).json({success:false,error:{code:'USER_NOT_FOUND',message:'사용자를 찾을 수 없습니다.'}});
  const harness=(user as any).experienceHarness??{};
  const fragmentInputs=[harness.performance?{performance:harness.performance}:null,harness.food?{food:harness.food}:null,harness.festival?{festival:harness.festival}:null].filter(Boolean) as Array<{performance?:any;food?:any;festival?:any}>;
  const profileFragments=fragmentInputs.map(input=>{const fragment=buildDeterministicExperienceProfile(input),stored=(harness.profileFragments??[]).find((item:any)=>item?.source===fragment.source);return {...fragment,scores:stored?.scores??Object.values(input)[0]?.scores??{},sessionSummary:stored?.sessionSummary??Object.values(input)[0]?.sessionSummary,updatedAt:stored?.updatedAt??harness.generatedProfile?.updatedAt??new Date()}});
  return res.json({success:true,data:{profile:harness.generatedProfile??null,profileFragments,savedInterests:harness.savedInterests??[],savedInterestsInitialized:Boolean(harness.savedInterestsInitialized),activityRecords:harness.activityRecords??[]}});
});
