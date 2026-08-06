export async function readOptionalJson<T>(response:Response):Promise<T|null>{
  const contentType=(response.headers.get('content-type')??'').toLowerCase();
  if(!contentType.includes('application/json'))return null;
  try{return await response.json() as T}catch{return null}
}
