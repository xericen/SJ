import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import test from 'node:test';
import express,{type RequestHandler} from 'express';
import {createEmptyUnifiedUserProfile} from '../../../shared/unified-user-profile.js';
import {createUnifiedProfileRouter} from './unifiedProfile.js';

test('통합 프로필 API는 인증이 필요하고 인증 사용자 ID만 사용한다',async()=>{
  const seen:string[]=[];
  const auth:RequestHandler=(req,res,next)=>{const id=req.header('x-test-user');if(!id)return void res.status(401).json({success:false});res.locals.authenticatedUserId=id;next()};
  const app=express();app.use(express.json());app.use('/api/account',createUnifiedProfileRouter(auth,async userId=>{seen.push(userId);return createEmptyUnifiedUserProfile(userId,'2026-08-06T00:00:00.000Z')}));
  const server=createServer(app);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();assert.ok(address&&typeof address==='object');const url=`http://127.0.0.1:${address.port}/api/account/me/unified-profile?userId=other-user`;
  try{
    const denied=await fetch(url);assert.equal(denied.status,401);
    const allowed=await fetch(url,{headers:{'x-test-user':'session-user'}});assert.equal(allowed.status,200);
    const body=await allowed.json() as {data:{userId:string;profileCompletion:number}};
    assert.equal(body.data.userId,'session-user');assert.equal(body.data.profileCompletion,0);assert.deepEqual(seen,['session-user']);
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))}
});
