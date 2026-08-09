const ACCOUNT_DATA_PREFIXES=[
  'yeogi-',
  'jochiwon-',
  'sejong-',
  'greenhouse-',
  'bear-',
  'nature-discovery-',
  'campus-',
  'government-',
  'festival-',
  'food-',
  'project-room-',
  'club-',
  'arts-center-',
  'world-',
  'character-debug-settings-',
] as const;

const ACCOUNT_DATA_KEYS=new Set([
  'bear-photo-zone-position',
]);

function isAccountDataKey(key:string){
  return ACCOUNT_DATA_KEYS.has(key)||ACCOUNT_DATA_PREFIXES.some(prefix=>key.startsWith(prefix));
}

export function readAccountDataSnapshot(storage:Pick<Storage,'length'|'key'|'getItem'>=localStorage){
  const data:Record<string,string>={};
  for(let index=0;index<storage.length;index+=1){
    const key=storage.key(index);
    if(!key||!isAccountDataKey(key))continue;
    const value=storage.getItem(key);
    if(value!==null)data[key]=value;
  }
  return data;
}

export function restoreAccountDataSnapshot(data:unknown,storage:Pick<Storage,'setItem'>=localStorage){
  if(!data||typeof data!=='object'||Array.isArray(data))return;
  Object.entries(data).forEach(([key,value])=>{
    if(isAccountDataKey(key)&&typeof value==='string')storage.setItem(key,value);
  });
}

export async function saveAccountDataSnapshot(){
  const formData=new URLSearchParams();
  formData.set('data',JSON.stringify(readAccountDataSnapshot()));
  const response=await fetch('/wiz/api/page.home/account_data_snapshot',{
    method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:formData,
  });
  const body=await response.json() as {code?:number;data?:{message?:string}};
  if(!response.ok||body.code!==200)throw new Error(body.data?.message||'활동 데이터를 서버에 저장하지 못했습니다.');
}

export async function loadAccountDataSnapshot(){
  const response=await fetch('/wiz/api/page.home/account_data_snapshot',{credentials:'include'});
  const body=await response.json() as {code?:number;data?:{data?:unknown;message?:string}};
  if(!response.ok||body.code!==200)throw new Error(body.data?.message||'활동 데이터를 서버에서 불러오지 못했습니다.');
  return body.data?.data??{};
}

export function clearAllAccountData(storage:Pick<Storage,'length'|'key'|'removeItem'>){
  const keys=Array.from({length:storage.length},(_,index)=>storage.key(index))
    .filter((key):key is string=>Boolean(key))
    .filter(isAccountDataKey);
  keys.forEach(key=>storage.removeItem(key));
  return keys;
}

/** Clears every account-scoped browser cache used by a game runtime. */
export function clearRuntimeAccountData(){
  const removed:string[]=[];
  for(const storage of [window.localStorage,window.sessionStorage]){
    try{removed.push(...clearAllAccountData(storage))}catch{/* restricted iframe */}
  }
  return removed;
}
