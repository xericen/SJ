import {API_BASE_URL} from '../config/api';

const endpoint=(path:string)=>`${API_BASE_URL}/account/me/unified-profile${path}`;
const WIZ_PROJECTS_ENDPOINT='/wiz/api/page.home/behavior_state';
const WIZ_SHARED_PROJECTS_ENDPOINT='/wiz/api/page.home/community';
const useWizRuntime=()=>window.location.hostname.endsWith('.wizide.com')||window.location.pathname.startsWith('/assets/jochwon-app/');
async function send(path:string,value:unknown){
  const response=await fetch(endpoint(path),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
  if(!response.ok)throw new Error(`Unified profile sync failed (${response.status})`);
}
async function sendWizProject(project:unknown){
  const response=await fetch(`${WIZ_PROJECTS_ENDPOINT}?resource=projectRoomProjects&payload=${encodeURIComponent(JSON.stringify(project))}`,{method:'POST',credentials:'include'});
  const body=await response.json() as {code?:number;data?:{message?:string}};
  if(!response.ok||body.code!==200)throw new Error(body.data?.message??`Project sync failed (${response.status})`);
}
const sendWizShared=async(kind:string,value:unknown)=>{
  const payload={kind,...value as Record<string,unknown>};
  const response=await fetch(`${WIZ_SHARED_PROJECTS_ENDPOINT}?action=create&payload=${encodeURIComponent(JSON.stringify(payload))}`,{credentials:'include'});
  if(!response.ok)throw new Error(`Shared project sync failed (${response.status})`);
};

export const syncCampusProfileSignal=(signal:unknown)=>send('/campus-signal',signal);
export const syncUnifiedProject=(project:unknown)=>useWizRuntime()?sendWizProject(project):send('/projects',project);
export const deleteUnifiedProject=(project:Pick<{id:string;leaderId:string},'id'|'leaderId'>)=>useWizRuntime()?Promise.allSettled([
  fetch(`${WIZ_PROJECTS_ENDPOINT}?resource=projectRoomProjects&action=delete`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({payload:JSON.stringify(project)})}).then(response=>{if(!response.ok)throw new Error('Project delete failed') }),
  fetch(`${WIZ_SHARED_PROJECTS_ENDPOINT}?action=delete&payload=${encodeURIComponent(JSON.stringify(project))}`,{credentials:'include'}).then(response=>{if(!response.ok)throw new Error('Shared project delete failed') }),
]).then(results=>{if(results.every(result=>result.status==='rejected'))throw new Error('Project delete failed');}):Promise.resolve();
export const syncUnifiedProjectApplication=(application:unknown)=>useWizRuntime()?sendWizShared('project-room-application',application):send('/project-applications',application);
export type ProjectConsensus={requestId:string;status:'pending'|'rejected'|'confirmed';requestedAt:string;course:Array<{id:string;name:string;time:string;duration:number}>;decisions:Record<string,'accepted'|'rejected'>;confirmedAt?:string};
export type ProjectCollaboration={roles:Record<string,string>;consensus:ProjectConsensus|null;finalCourse:Array<{id:string;name:string;time:string;duration:number}>|null;draft?:unknown};
const projectCollaborationRequest=async(action:string,payload:Record<string,unknown>)=>{
  const response=await fetch(`${WIZ_PROJECTS_ENDPOINT}?resource=projectRoomProjects&action=${encodeURIComponent(action)}&payload=${encodeURIComponent(JSON.stringify(payload))}`,{credentials:'include'});
  const body=await response.json() as {code:number;data?:{message?:string;collaboration?:ProjectCollaboration;projectStatus?:string}};
  if(body.code>=400||!body.data?.collaboration)throw new Error(body.data?.message??'프로젝트 협업 정보를 처리하지 못했어요.');
  return body.data;
};
export const fetchProjectCollaboration=(projectId:string)=>projectCollaborationRequest('collaboration',{projectId});
export const saveProjectCollaborationDraft=(projectId:string,draft:unknown)=>projectCollaborationRequest('saveDraft',{projectId,draft});
export const updateProjectMemberRole=(projectId:string,memberName:string,role:string)=>projectCollaborationRequest('updateRole',{projectId,memberName,role});
export const requestProjectConsensus=(projectId:string,course:ProjectConsensus['course'])=>projectCollaborationRequest('requestConsensus',{projectId,course});
export const respondProjectConsensus=(projectId:string,decision:'accepted'|'rejected')=>projectCollaborationRequest('respondConsensus',{projectId,decision});
export const confirmProjectConsensus=(projectId:string)=>projectCollaborationRequest('confirmConsensus',{projectId});

export async function fetchUnifiedProjectApplications(){
  const response=await fetch(useWizRuntime()?WIZ_SHARED_PROJECTS_ENDPOINT:endpoint('/project-applications'),{credentials:'include'});
  const body=await response.json() as {code?:number;data?:{items?:unknown[];applications?:unknown[]};success?:boolean};
  const values=useWizRuntime()?body.data?.items:body.data?.applications;
  if(!response.ok||!Array.isArray(values)||(useWizRuntime()?body.code!==200:body.success!==true))throw new Error(`Project application load failed (${response.status})`);
  return values.filter((item:unknown)=>Boolean(item&&typeof item==='object'&&(item as {kind?:unknown}).kind==='project-room-application'));
}

export async function fetchUnifiedProjects(){
  if(useWizRuntime()){
    const [primary,shared]=await Promise.all([
      fetch(`${WIZ_PROJECTS_ENDPOINT}?resource=projectRoomProjects`,{credentials:'include'}).then(response=>response.json() as Promise<{code?:number;data?:{projects?:unknown[]}}>),
      fetch(WIZ_SHARED_PROJECTS_ENDPOINT,{credentials:'include'}).then(response=>response.json() as Promise<{code?:number;data?:{items?:unknown[]}}>)
    ]);
    const projects=[...(primary.code===200&&Array.isArray(primary.data?.projects)?primary.data.projects:[]),...(shared.code===200&&Array.isArray(shared.data?.items)?shared.data.items.filter((item:unknown)=>Boolean(item&&typeof item==='object'&&(item as {kind?:unknown}).kind==='project-room-project')):[])];
    return [...new Map(projects.map((project:unknown)=>[String((project as {id?:unknown})?.id??''),project])).values()].filter(project=>Boolean((project as {id?:unknown})?.id));
  }
  const response=await fetch(endpoint('/projects'),{credentials:'include'});
  const body=await response.json() as {success?:boolean;data?:{projects?:unknown[]}};
  const projects=body.data?.projects;
  if(!response.ok||!Array.isArray(projects)||body.success!==true)throw new Error(`Project load failed (${response.status})`);
  return projects;
}
