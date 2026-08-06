import type { PortalPosition } from '../../../shared/socket-events.js';
import { WORLD_PORTAL_DEFAULTS,worldPortalKey } from '../../../shared/world-portals.js';
import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

const WorldPortalPositionModel=createMysqlJsonModel('world_portal_positions');
const worldPortalKeys=new Set(WORLD_PORTAL_DEFAULTS.map(worldPortalKey));
const fixedArtsCenterPortal=WORLD_PORTAL_DEFAULTS.find(
  position=>position.mapId==='arts-center'&&position.destination==='town',
);
const fixedFestivalPortal=WORLD_PORTAL_DEFAULTS.find(
  position=>position.mapId==='festival-experience'&&position.destination==='town',
);
const fixedBearTreePortals=WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='bear-tree-park'&&['town','garden','bear-play-zone'].includes(position.destination));
const fixedGardenPortals=WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='garden');
const fixedCampusPortals=WORLD_PORTAL_DEFAULTS.filter(position=>position.mapId==='campus');
const fixedClubStreetPortal=WORLD_PORTAL_DEFAULTS.find(position=>position.mapId==='club-street-festival'&&position.destination==='campus');
const fixedRecruitmentCenterPortal=WORLD_PORTAL_DEFAULTS.find(position=>position.mapId==='recruitment-center'&&position.destination==='campus');
const fixedProjectRoomPortal=WORLD_PORTAL_DEFAULTS.find(position=>position.mapId==='project-room'&&position.destination==='campus');

const normalized=(position:PortalPosition):PortalPosition=>{
  const value=
    position.mapId==='arts-center'&&position.destination==='town'&&fixedArtsCenterPortal
      ?fixedArtsCenterPortal
      :position.mapId==='festival-experience'&&position.destination==='town'&&fixedFestivalPortal
        ?fixedFestivalPortal
        :position.mapId==='campus'
          ?fixedCampusPortals.find(portal=>portal.destination===position.destination)??position
          :position.mapId==='club-street-festival'&&position.destination==='campus'&&fixedClubStreetPortal
            ?fixedClubStreetPortal
          :position.mapId==='recruitment-center'&&position.destination==='campus'&&fixedRecruitmentCenterPortal
            ?fixedRecruitmentCenterPortal
          :position.mapId==='project-room'&&position.destination==='campus'&&fixedProjectRoomPortal
            ?fixedProjectRoomPortal
          :position.mapId==='bear-tree-park'
          ?fixedBearTreePortals.find(portal=>portal.destination===position.destination)??position
          :position.mapId==='garden'
          ?fixedGardenPortals.find(portal=>portal.destination===position.destination)??position
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
  return positions.map(normalized).filter(position=>worldPortalKeys.has(worldPortalKey(position)));
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
