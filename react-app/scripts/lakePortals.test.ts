import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLD_PORTAL_DEFAULTS } from '../shared/world-portals';
import { LAKE_PARK_PORTALS } from '../src/game/lakeParkPortals';
import { isPortalChargePositionHeld,PORTAL_TRAVEL_RETRY_MS,PortalTravelGate } from '../src/game/portalTravelGate';

const expected=[
  ['bear-tree-park',2122,944],
  ['campus',1178,122],
  ['arts-center',603,452],
  ['festival-experience',1219,1462],
  ['food-experience',491,1556],
] as const;

test('호수공원 5개 포탈 설정과 공용 좌표가 일치한다',()=>{
  assert.equal(LAKE_PARK_PORTALS.length,5);
  expected.forEach(([destination,x,z])=>{
    const portal=LAKE_PARK_PORTALS.find(item=>item.destination===destination);
    const shared=WORLD_PORTAL_DEFAULTS.find(item=>item.mapId==='town'&&item.destination===destination);
    assert.deepEqual(portal&&{x:portal.x,z:portal.z,chargeSeconds:portal.chargeSeconds,activationRadius:portal.activationRadius},{x,z,chargeSeconds:3,activationRadius:140});
    assert.deepEqual(shared&&{x:shared.x,z:shared.z},{x,z});
  });
});

test('먹거리 부스에서 돌아오면 노란 건물을 피해 호수공원 남동쪽 지면에 도착한다',()=>{
  const portal=LAKE_PARK_PORTALS.find(item=>item.destination==='food-experience');
  assert.ok(portal);
  assert.deepEqual(portal.arrivalDirection,{x:1,z:1});
  assert.equal(portal.arrivalClearance,220);
  assert.equal(portal.arrivalClearance>portal.activationRadius,true);
  const directionLength=Math.hypot(portal.arrivalDirection.x,portal.arrivalDirection.z);
  assert.deepEqual(
    {
      x:Math.round(portal.x+portal.arrivalDirection.x/directionLength*portal.arrivalClearance),
      z:Math.round(portal.z+portal.arrivalDirection.z/directionLength*portal.arrivalClearance),
    },
    {x:647,z:1712},
  );
});

for(const portal of LAKE_PARK_PORTALS){
  test(`${portal.label} 포탈은 반경을 벗어나면 충전을 취소하고 재진입 후 3초를 다시 센다`,()=>{
    const gate=new PortalTravelGate();
    let requests=0;
    const request=()=>{requests+=1};

    assert.equal(isPortalChargePositionHeld(portal.activationRadius-.01,portal.activationRadius),true);
    assert.equal(isPortalChargePositionHeld(portal.activationRadius,portal.activationRadius),false);
    assert.equal(gate.update(0,portal.chargeSeconds,request).progress,0);
    assert.equal(gate.update(2500,portal.chargeSeconds,request).progress,5/6);

    if(!isPortalChargePositionHeld(portal.activationRadius,portal.activationRadius))gate.reset();
    assert.equal(gate.update(2600,portal.chargeSeconds,request).progress,0);
    assert.equal(gate.update(5599,portal.chargeSeconds,request).progress,2999/3000);
    assert.equal(requests,0);
    assert.equal(gate.update(5600,portal.chargeSeconds,request).progress,1);
    assert.equal(requests,1);
  });

  test(`${portal.label} 포탈은 3초 후 미수신 요청을 재시도하고 수락 뒤 중복 요청하지 않는다`,()=>{
    const gate=new PortalTravelGate();
    let requests=0;
    let acceptNext=false;
    const request=(accept:()=>void)=>{
      requests+=1;
      if(acceptNext)accept();
    };

    assert.equal(gate.update(0,portal.chargeSeconds,request).progress,0);
    assert.equal(gate.update(2500,portal.chargeSeconds,request).progress,5/6);
    assert.equal(gate.update(2999,portal.chargeSeconds,request).progress,2999/3000);
    assert.equal(requests,0);

    assert.equal(gate.update(3000,portal.chargeSeconds,request).progress,1);
    assert.equal(requests,1);
    gate.update(3000+PORTAL_TRAVEL_RETRY_MS-1,portal.chargeSeconds,request);
    assert.equal(requests,1);

    acceptNext=true;
    assert.equal(gate.update(3000+PORTAL_TRAVEL_RETRY_MS,portal.chargeSeconds,request).accepted,true);
    assert.equal(requests,2);
    gate.update(5000,portal.chargeSeconds,request);
    assert.equal(requests,2);
  });
}
