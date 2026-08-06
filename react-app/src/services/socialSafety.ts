export type SocialBlockMode='none'|'chat'|'hidden';

export type SocialReportReason='abuse'|'harassment'|'spam'|'inappropriate'|'other';

export interface SocialReport{
  id:string;
  targetId:string;
  targetName:string;
  reason:SocialReportReason;
  blockMode:SocialBlockMode;
  detail:string;
  createdAt:string;
}

export const FRIENDS_STORAGE_KEY='sejong-friends-v1';
export const SOCIAL_BLOCKS_STORAGE_KEY='sejong-social-blocks-v1';
export const SOCIAL_REPORTS_STORAGE_KEY='sejong-social-reports-v1';

type StorageLike=Pick<Storage,'getItem'|'setItem'>;

const storageOrDefault=(storage?:StorageLike)=>storage??window.localStorage;

export const loadFriendIds=(storage?:StorageLike):string[]=>{
  try{
    const value=JSON.parse(storageOrDefault(storage).getItem(FRIENDS_STORAGE_KEY)??'[]');
    return Array.isArray(value)?value.filter((id):id is string=>typeof id==='string'):[];
  }catch{return []}
};
export const saveFriendIds=(ids:string[],storage?:StorageLike)=>{
  const unique=[...new Set(ids)];
  storageOrDefault(storage).setItem(FRIENDS_STORAGE_KEY,JSON.stringify(unique));
  return unique;
};

export const toggleFriendId=(ids:string[],targetId:string)=>saveFriendIds(ids.includes(targetId)?ids.filter(id=>id!==targetId):[...ids,targetId]);

export const loadSocialBlocks=(storage?:StorageLike):Record<string,SocialBlockMode>=>{
  try{
    const value=JSON.parse(storageOrDefault(storage).getItem(SOCIAL_BLOCKS_STORAGE_KEY)??'{}');
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter((entry):entry is [string,SocialBlockMode]=>['chat','hidden'].includes(String(entry[1]))));
  }catch{return {}}
};

export const saveSocialBlock=(blocks:Record<string,SocialBlockMode>,targetId:string,mode:SocialBlockMode,storage?:StorageLike)=>{
  const next={...blocks};
  if(mode==='none')delete next[targetId];else next[targetId]=mode;
  storageOrDefault(storage).setItem(SOCIAL_BLOCKS_STORAGE_KEY,JSON.stringify(next));
  return next;
};

export const saveSocialReport=(report:Omit<SocialReport,'id'|'createdAt'>,storage?:StorageLike)=>{
  const target=storageOrDefault(storage);
  let reports:SocialReport[]=[];
  try{const value=JSON.parse(target.getItem(SOCIAL_REPORTS_STORAGE_KEY)??'[]');if(Array.isArray(value))reports=value}catch{reports=[]}
  const saved:SocialReport={...report,id:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${report.targetId}`,createdAt:new Date().toISOString()};
  target.setItem(SOCIAL_REPORTS_STORAGE_KEY,JSON.stringify([...reports,saved].slice(-50)));
  return saved;
};
