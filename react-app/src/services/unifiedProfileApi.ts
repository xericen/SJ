import {API_BASE_URL} from '../config/api';

const endpoint=(path:string)=>`${API_BASE_URL}/account/me/unified-profile${path}`;
const WIZ_PROJECTS_ENDPOINT='/wiz/api/page.home/behavior_state';
const useWizRuntime=()=>window.location.hostname.endsWith('.wizide.com')||window.location.pathname.startsWith('/assets/jochwon-app/');
async function send(path:string,value:unknown){
  const response=await fetch(endpoint(path),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
  if(!response.ok)throw new Error(`Unified profile sync failed (${response.status})`);
}
async function sendWizProject(project:unknown){
  const response=await fetch(WIZ_PROJECTS_ENDPOINT,{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({resource:'projectRoomProjects',payload:JSON.stringify(project)})});
  const body=await response.json() as {code?:number,data?:{message?:string}};
  if(!response.ok||body.code!==200)throw new Error(body.data?.message??`Project sync failed (${response.status})`);
}

export const syncCampusProfileSignal=(signal:unknown)=>send('/campus-signal',signal);
export const syncUnifiedProject=(project:unknown)=>useWizRuntime()?sendWizProject(project):send('/projects',project);
export const syncUnifiedProjectApplication=(application:unknown)=>send('/project-applications',application);
export async function fetchUnifiedProjects(){
  const response=await fetch(useWizRuntime()?`${WIZ_PROJECTS_ENDPOINT}?resource=projectRoomProjects`:endpoint('/projects'),{credentials:'include'});
  const body=await response.json() as {code?:number,data?:{projects?:unknown[]};success?:boolean};
  const projects=body.data?.projects;
  if(!response.ok||!Array.isArray(projects)||(useWizRuntime()?body.code!==200:body.success!==true))throw new Error(`Project load failed (${response.status})`);
  return projects;
}
