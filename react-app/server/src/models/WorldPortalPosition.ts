import type { PortalPosition } from '../../../shared/socket-events.js';
import { WORLD_PORTAL_DEFAULTS,worldPortalKey } from '../../../shared/world-portals.js';
import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

const WorldPortalPositionModel=createMysqlJsonModel('world_portal_positions');
const fixedArtsCenterPortal=WORLD_PORTAL_DEFAULTS.find(
  position=>position.mapId==='arts-center'&&position.destination==='town',
);
const fixedFestivalPortal=WORLD_PORTAL_DEFAULTS.find(
  position=>position.mapId==='festival-experience'&&position.destination==='town',
);

const normalized=(position:PortalPosition):PortalPosition=>{
  const value=
    position.mapId==='arts-center'&&position.destination==='town'&&fixedArtsCenterPortal
      ?fixedArtsCenterPortal
      :position.mapId==='festival-experience'&&position.destination==='town'&&fixedFestivalPortal
        ?fixedFestivalPortal
        :position;
  return {
    mapId:value.mapId,
    destination:value.destination,
    x:Math.round(value.x),
    z:Math.round(value.z),
  };
};

export async function loadOrSeedWorldPortalPositions(){
  const saved=await loadWorldPortalPositions();
  const merged=new Map(WORLD_PORTAL_DEFAULTS.map(position=>[worldPortalKey(position),{...position}]));
  saved.forEach(position=>{
    if(position?.mapId&&position?.destination&&Number.isFinite(position.x)&&Number.isFinite(position.z))merged.set(worldPortalKey(position),normalized(position));
  });
  await Promise.all([...merged.values()].map(position=>WorldPortalPositionModel.findOneAndUpdate(
    {key:worldPortalKey(position)},
    {$set:{key:worldPortalKey(position),...position}},
    {upsert:true,returnDocument:'after'},
  )));
  return [...merged.values()];
}

export async function loadWorldPortalPositions(){
  const positions=await WorldPortalPositionModel.find().lean() as Array<PortalPosition&{key?:string}>;
  return positions.map(normalized);
}

export async function saveWorldPortalPosition(position:PortalPosition){
  const value=normalized(position);
  await WorldPortalPositionModel.findOneAndUpdate(
    {key:worldPortalKey(value)},
    {$set:{key:worldPortalKey(value),...value}},
    {upsert:true,returnDocument:'after'},
  );
  return value;
}
