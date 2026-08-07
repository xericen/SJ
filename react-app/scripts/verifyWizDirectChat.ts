import assert from 'node:assert/strict';
import {io,type Socket} from 'socket.io-client';

const base=process.env.WIZ_BASE_URL??'http://127.0.0.1:3000';
const namespace='/wiz/app/main/page.home';
const password='ReviewOps123!';

const once=<T>(socket:Socket,event:string,predicate:(value:T)=>boolean=()=>true)=>new Promise<T>((resolve,reject)=>{
  const timer=setTimeout(()=>{socket.off(event,handler);reject(new Error(`${event} timed out`))},8000);
  const handler=(value:T)=>{if(!predicate(value))return;clearTimeout(timer);socket.off(event,handler);resolve(value)};
  socket.on(event,handler);
});

async function signup(label:string){
  const email=`reviewops-direct-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const response=await fetch(`${base}/wiz/api/page.home/signup`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password})});
  const body=await response.json() as {code:number;data?:{user?:{id:string}}};
  assert.equal(body.code,200);
  const cookie=response.headers.get('set-cookie')?.split(';',1)[0];
  assert.ok(cookie);assert.ok(body.data?.user?.id);
  return {cookie,userId:body.data.user.id,email};
}

const connect=(cookie:string)=>new Promise<Socket>((resolve,reject)=>{
  const socket=io(`${base}${namespace}`,{transports:['websocket'],forceNew:true,reconnection:false,extraHeaders:{Cookie:cookie}});
  const timer=setTimeout(()=>reject(new Error('WIZ socket connection timed out')),8000);
  socket.once('connect',()=>{clearTimeout(timer);resolve(socket)});
  socket.once('connect_error',error=>{clearTimeout(timer);reject(error)});
});

const join=(socket:Socket,nickname:string,x:number)=>socket.emit('joinMap',{mapId:'town',nickname,x,y:711,model:'custom',appearance:{hair:'#222222',face:'#f2c8a0',top:'#2f8f72',bottom:'#28485d',shoes:'#ffffff',accessory:'none'}});
const withdraw=(cookie:string)=>fetch(`${base}/wiz/api/page.home/withdraw`,{method:'POST',headers:{Cookie:cookie}}).catch(()=>undefined);

const accounts=await Promise.all([signup('a'),signup('b')]);
let first:Socket|undefined,second:Socket|undefined;
try{
  [first,second]=await Promise.all(accounts.map(account=>connect(account.cookie)));
  join(first,'직접대화 검증 A',1100);
  await once<any[]>(first,'currentMapUsers',players=>players.length>=1);
  const secondUsers=once<any[]>(second,'currentMapUsers',players=>players.some(player=>player.id===first?.id));
  join(second,'직접대화 검증 B',1120);
  await secondUsers;

  const moved=once<{id:string;x:number}>(second,'userMoved',player=>player.id===first?.id&&player.x===1140);
  first.emit('userMoved',{mapId:'town',x:1140,y:711,direction:'right',isMoving:true,yaw:Math.PI/2,motionState:'walk',jumpHeight:0,timestamp:Date.now()});
  await moved;

  const friendRequested=once<{requestId:string;from:{id:string}}>(second,'friendRequestReceived',request=>request.from.id===first?.id);
  first.emit('friendRequest',second.id);
  const friendRequest=await friendRequested;
  const firstFriendState=once<{friendIds:string[]}>(first,'friendState',state=>state.friendIds.includes(second!.id!));
  const secondFriendState=once<{friendIds:string[]}>(second,'friendState',state=>state.friendIds.includes(first!.id!));
  second.emit('friendAccept',friendRequest.requestId);
  await Promise.all([firstFriendState,secondFriendState]);

  const requested=once<{requestId:string;from:{id:string}}>(second,'directChatRequested',request=>request.from.id===first?.id);
  first.emit('directChatRequest',second.id);
  const request=await requested;

  const firstStarted=once<{id:string;active:boolean}>(first,'directChatStarted');
  const secondStarted=once<{id:string;active:boolean}>(second,'directChatStarted');
  second.emit('directChatAccept',request.requestId);
  const [firstRoom,secondRoom]=await Promise.all([firstStarted,secondStarted]);
  assert.equal(firstRoom.id,secondRoom.id);assert.equal(firstRoom.active,true);

  const received=once<{directRoomId:string;message:string;senderId:string}>(second,'directMessageReceived',message=>message.message==='WIZ 1대1 대화 검증');
  first.emit('directMessage',{directRoomId:firstRoom.id,message:'WIZ 1대1 대화 검증'});
  const message=await received;
  assert.equal(message.directRoomId,firstRoom.id);assert.equal(message.senderId,first.id);

  let unexpectedRequest=false;
  const unexpected=()=>{unexpectedRequest=true};second.on('directChatRequested',unexpected);
  const resumed=once<{id:string}>(first,'directChatStarted');
  first.emit('directChatRequest',second.id);
  assert.equal((await resumed).id,firstRoom.id);
  await new Promise(resolve=>setTimeout(resolve,100));
  second.off('directChatRequested',unexpected);
  assert.equal(unexpectedRequest,false);

  const closed=once<{directRoomId:string}>(first,'directChatClosed');
  second.emit('directChatClosed',firstRoom.id);
  assert.equal((await closed).directRoomId,firstRoom.id);

  const requestedAgain=once<{requestId:string}>(second,'directChatRequested');
  first.emit('directChatRequest',second.id);
  const nextRequest=await requestedAgain;
  const restartedFirst=once<{id:string}>(first,'directChatStarted');
  const restartedSecond=once<{id:string}>(second,'directChatStarted');
  second.emit('directChatAccept',nextRequest.requestId);
  const [reusedFirst,reusedSecond]=await Promise.all([restartedFirst,restartedSecond]);
  assert.equal(reusedFirst.id,firstRoom.id);assert.equal(reusedSecond.id,firstRoom.id);

  const firstPrivate=once<any[]>(first,'currentMapUsers',players=>players.length===1&&players[0]?.id===first?.id);
  const secondPrivate=once<any[]>(second,'currentMapUsers',players=>players.length===1&&players[0]?.id===second?.id);
  first.emit('changeMap',{mapId:'personal-farm',nickname:'직접대화 검증 A',x:1050,y:1510,model:'custom',appearance:{hair:'#222222',face:'#f2c8a0',top:'#2f8f72',bottom:'#28485d',shoes:'#ffffff',accessory:'none'}});
  second.emit('changeMap',{mapId:'personal-farm',nickname:'직접대화 검증 B',x:1050,y:1510,model:'custom',appearance:{hair:'#222222',face:'#f2c8a0',top:'#2f8f72',bottom:'#28485d',shoes:'#ffffff',accessory:'none'}});
  await Promise.all([firstPrivate,secondPrivate]);

  const firstRemoved=once<{friendIds:string[]}>(first,'friendState',state=>!state.friendIds.includes(second!.id!));
  const secondRemoved=once<{friendIds:string[]}>(second,'friendState',state=>!state.friendIds.includes(first!.id!));
  first.emit('friendRemove',second.id);
  await Promise.all([firstRemoved,secondRemoved]);
  console.log('WIZ realtime verification passed: private My Home, mutual friendship, friend room resume, leave and re-request, message');
}finally{
  first?.disconnect();second?.disconnect();
  await Promise.all(accounts.map(account=>withdraw(account.cookie)));
}
