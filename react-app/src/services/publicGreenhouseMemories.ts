import { API_BASE_URL,COMMUNITY_API_BASE_URL } from '../config/api';
import type { MemoryLeaf } from './greenhouseProgress';

export interface PublicGreenhouseMemory{
  id:string;
  nickname:string;
  createdAt:string;
  originalText:string;
  aiLetter:string;
  dominantEmotion:string;
  natureType?:string;
  representativePlant?:string;
  plantNames:string[];
}

export async function loadPublicGreenhouseMemories(){
  const endpoint=import.meta.env.PROD?`${COMMUNITY_API_BASE_URL}/community?resource=greenhouse_memories`:`${API_BASE_URL}/greenhouse/public-memories?limit=60`;
  const response=await fetch(endpoint,{credentials:'include'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const result=await response.json() as {memories?:unknown;items?:unknown};
  const memories=Array.isArray(result.memories)?result.memories:Array.isArray(result.items)?result.items:[];
  return memories as PublicGreenhouseMemory[];
}

export async function publishGreenhouseMemory(nickname:string,leaf:MemoryLeaf,representativePlant:string|undefined,plantNames:string[]){
  const payload:PublicGreenhouseMemory={
    id:leaf.id,
    nickname:nickname.trim().slice(0,20)||'수목원 방문자',
    createdAt:leaf.createdAt,
    originalText:leaf.originalText,
    aiLetter:leaf.aiLetter,
    dominantEmotion:leaf.dominantEmotion,
    natureType:leaf.natureType,
    representativePlant,
    plantNames,
  };
  const response=import.meta.env.PROD
    ?await fetch(`${COMMUNITY_API_BASE_URL}/community?resource=greenhouse_memories&action=create&payload=${encodeURIComponent(JSON.stringify({...payload,kind:'greenhouse-memory'}))}`,{credentials:'include'})
    :await fetch(`${API_BASE_URL}/greenhouse/public-memories`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return payload;
}
