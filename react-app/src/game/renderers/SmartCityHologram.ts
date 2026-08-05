import * as THREE from 'three';

export type SmartCityTechnologyId='brt'|'uam'|'traffic'|'energy'|'twin'|'health';

const TECHNOLOGY_COPY:Record<SmartCityTechnologyId,{eyebrow:string;title:string;lines:string[];accent:string}>={
  brt:{eyebrow:'SEJONG BRT SERVICE',title:'자율주행 BRT',lines:['BRT 전용도로 활성화','자율주행 버스와 정류장 연결','국내 최초 간선도로 자율주행버스 운행 사례'],accent:'#38d9ff'},
  uam:{eyebrow:'URBAN AIR MOBILITY',title:'UAM',lines:['도심 상공 UAM 비행','버티포트와 항공 이동 경로','미래 도심항공교통 연구 서비스'],accent:'#b694ff'},
  traffic:{eyebrow:'AI TRAFFIC CONTROL',title:'AI 교통관제',lines:['교차로 AI 신호 제어','실시간 교통량 분석','혼잡도 감소 시뮬레이션'],accent:'#ffb85c'},
  energy:{eyebrow:'SMART ENERGY SERVICE',title:'스마트 에너지',lines:['건물 옥상 태양광 발전','도시 전력 흐름과 ESS 연결','에너지 사용량 최적화'],accent:'#71f3d2'},
  twin:{eyebrow:'LIVE CITY DATA',title:'디지털 트윈',lines:['교통·공기질·전력 실시간 시각화','BRT 운행과 인구 분포 모니터링','도시 데이터 기반 예측'],accent:'#6f9cff'},
  health:{eyebrow:'SMART HEALTHCARE',title:'스마트 헬스케어',lines:['병원·응급차·AED 연결','응급 차량 최적 이동 경로','AI 기반 응급의료 안전망'],accent:'#ff7fcf'},
};
const TECHNOLOGY_COLORS:Record<SmartCityTechnologyId,number>={
  brt:0x38d9ff,uam:0xb694ff,traffic:0xffb85c,energy:0x55e9a7,twin:0x6f9cff,health:0xff7fcf,
};
const HOLOGRAM_SCALE=1.24;

const hologramMaterial=(color=0x53ddff,opacity=.34)=>new THREE.MeshBasicMaterial({
  color,transparent:true,opacity,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide,toneMapped:false,
});
const lineMaterial=(color=0x72eaff,opacity=.74)=>new THREE.LineBasicMaterial({
  color,transparent:true,opacity,depthWrite:false,blending:THREE.NormalBlending,toneMapped:false,
});
const setHologramName=(object:THREE.Object3D,name:string)=>{object.name=`SmartCityHologram_${name}`;return object};

function building(width:number,height:number,depth:number,x:number,z:number,color=0x55dcff){
  const root=new THREE.Group();root.position.set(x,height/2,z);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),hologramMaterial(color,.18));
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),lineMaterial(color,.74));
  root.add(mesh,edges);
  for(const ratio of [.36,.68]){
    const bandGeometry=new THREE.BoxGeometry(width*1.01,.018,depth*1.01);
    const band=new THREE.LineSegments(new THREE.EdgesGeometry(bandGeometry),lineMaterial(color,.34));
    band.position.y=-height/2+height*ratio;root.add(band);bandGeometry.dispose();
  }
  const roof=new THREE.Mesh(new THREE.PlaneGeometry(width*.72,depth*.72),hologramMaterial(0x73eaff,.3));
  roof.rotation.x=-Math.PI/2;roof.position.y=height/2+.015;root.add(roof);
  return root;
}

function path(points:readonly [number,number][],color=0x43dfff,opacity=.86){
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map(([x,z])=>new THREE.Vector3(x,.08,z)));
  return new THREE.Line(geometry,lineMaterial(color,opacity));
}

function tubePath(points:readonly [number,number][],color=0x43dfff,radius=.055,opacity=.82){
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.13,z)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*8),radius,8,false),hologramMaterial(color,opacity));
}

function labelSprite(text:string,subtext:string,color='#7deaff'){
  const canvas=document.createElement('canvas');canvas.width=420;canvas.height=150;
  const context=canvas.getContext('2d')!;
  context.fillStyle='rgba(3,20,34,.86)';context.strokeStyle=color;context.lineWidth=3;
  context.beginPath();context.roundRect(4,4,412,142,20);context.fill();context.stroke();
  context.fillStyle=color;context.font='800 30px Pretendard, sans-serif';context.fillText(text,26,57);
  context.fillStyle='#dffaff';context.font='700 39px Pretendard, sans-serif';context.fillText(subtext,26,112);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));
  sprite.name='SmartCityHologram_DataLabel';sprite.renderOrder=50;sprite.scale.set(1.9,.68,1);sprite.userData.hologramTexture=texture;return sprite;
}

function createScreenTexture(){
  const canvas=document.createElement('canvas');canvas.width=4096;canvas.height=2048;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=16;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
  return {canvas,texture};
}

export class SmartCityHologram{
  readonly root=setHologramName(new THREE.Group(),'Root') as THREE.Group;
  private readonly city=setHologramName(new THREE.Group(),'RotatingCity') as THREE.Group;
  private readonly themes:Record<SmartCityTechnologyId,THREE.Group>={
    brt:new THREE.Group(),uam:new THREE.Group(),traffic:new THREE.Group(),energy:new THREE.Group(),twin:new THREE.Group(),health:new THREE.Group(),
  };
  private readonly pulseRing:THREE.Mesh;
  private readonly beam:THREE.Mesh;
  private readonly serviceField:THREE.Mesh;
  private readonly government:THREE.Group;
  private readonly hospital:THREE.Group;
  private readonly materials:THREE.Material[]=[];
  private readonly cityBaseMaterials:THREE.Material[]=[];
  private readonly screenCanvas:HTMLCanvasElement;
  private readonly screenTexture:THREE.CanvasTexture;
  private readonly screen:THREE.Mesh;
  private technology:SmartCityTechnologyId='brt';
  private active=false;
  private transition=0;
  private elapsed=0;

  constructor(private readonly model:THREE.Object3D){
    this.root.visible=false;
    this.root.position.set(0,.42,-6.1);
    this.root.scale.setScalar(HOLOGRAM_SCALE);
    model.add(this.root);

    const projector=new THREE.Mesh(new THREE.CylinderGeometry(5.8,6.5,.12,64,1,true),hologramMaterial(0x39cfff,.18));
    projector.position.y=.06;this.root.add(projector);
    this.serviceField=new THREE.Mesh(new THREE.CircleGeometry(5.65,72),hologramMaterial(0x03283a,.58));
    this.serviceField.rotation.x=-Math.PI/2;this.serviceField.position.y=.075;this.root.add(this.serviceField);
    const cityGrid=new THREE.GridHelper(10.8,18,0x44cbe8,0x1b7188);
    cityGrid.position.y=.09;
    const cityGridMaterials=Array.isArray(cityGrid.material)?cityGrid.material:[cityGrid.material];
    cityGridMaterials.forEach(material=>{material.transparent=true;material.opacity=.24;material.depthWrite=false;material.toneMapped=false});
    this.root.add(cityGrid);
    for(const [radius,opacity] of [[5.7,.68],[4.45,.42],[3.2,.3]] as const){
      const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.035,radius+.035,96),hologramMaterial(0x73eaff,opacity));
      ring.rotation.x=-Math.PI/2;ring.position.y=.14;this.root.add(ring);
    }
    this.beam=new THREE.Mesh(new THREE.CylinderGeometry(2.4,5.4,5.8,32,1,true),hologramMaterial(0x3dd9ff,.08));
    this.beam.position.y=3;this.root.add(this.beam);
    this.pulseRing=new THREE.Mesh(new THREE.RingGeometry(1.1,1.2,72),hologramMaterial(0xb5f7ff,.76));
    this.pulseRing.rotation.x=-Math.PI/2;this.pulseRing.position.y=.18;this.root.add(this.pulseRing);

    this.city.position.y=.18;this.root.add(this.city);
    const buildings=[
      [-3.8,2.5,-1.8,.75,.7],[-2.8,3.4,-1.9,.82,.76],[-1.7,2.15,-2.25,.68,.66],[-.6,4.05,-2,.9,.8],[.65,2.65,-2.15,.72,.7],[1.75,3.65,-1.9,.82,.78],[3,2.35,-2,.74,.7],
      [-4,1.7,-.15,.66,.72],[-2.9,2.8,.15,.78,.75],[-1.75,1.65,-.2,.68,.64],[-.65,3.2,.05,.8,.78],[.6,4.35,-.05,.88,.8],[1.8,2.1,.2,.7,.7],[3.05,3.05,.05,.84,.76],[4,1.8,.3,.7,.68],
      [-3.5,2.25,2,.76,.72],[-2.2,3.5,1.85,.86,.8],[-.85,1.75,2.15,.68,.72],[.45,2.7,1.9,.78,.74],[1.7,1.6,2.15,.66,.7],[2.85,2.45,1.9,.78,.72],
    ] as const;
    buildings.forEach(([x,h,z,w,d],index)=>{const item=building(w,h,d,x,z,index%5===0?0x8deeff:0x4bd8ff);item.userData.roof=true;this.city.add(item)});
    this.government=building(2.7,1.25,1.4,-.35,-.05,0xa4f4ff);this.government.name='SmartCityHologram_Government';this.city.add(this.government);
    this.hospital=building(1.25,2.05,1.05,3.55,1.85,0x8ceeff);this.hospital.name='SmartCityHologram_Hospital';this.city.add(this.hospital);
    const lake=new THREE.Mesh(new THREE.CircleGeometry(1.25,48),hologramMaterial(0x48cfff,.35));lake.rotation.x=-Math.PI/2;lake.scale.y=.55;lake.position.set(-3.15,.06,2);this.city.add(lake);
    const park=new THREE.Mesh(new THREE.CircleGeometry(.85,32),hologramMaterial(0x63f3cf,.2));park.rotation.x=-Math.PI/2;park.scale.y=.72;park.position.set(2.5,.055,-.65);this.city.add(park);
    [[[-5,-1.1],[5,-.8]],[[-4.5,1.25],[4.7,1.55]],[[-2.1,-3],[-1.6,3.2]],[[1.25,-3],[1.7,3.1]]].forEach(points=>this.city.add(path(points as [number,number][])));
    this.city.traverse(object=>{
      if(object instanceof THREE.Mesh||object instanceof THREE.Line||object instanceof THREE.LineSegments){
        const list=Array.isArray(object.material)?object.material:[object.material];
        list.forEach(material=>{
          const colored=material as THREE.Material&{color?:THREE.Color};
          if(colored.color)material.userData.baseColor=colored.color.getHex();
          this.cityBaseMaterials.push(material);
        });
      }
    });

    Object.entries(this.themes).forEach(([id,group])=>{
      group.name=`SmartCityHologram_Theme_${id}`;
      const color=TECHNOLOGY_COLORS[id as SmartCityTechnologyId];
      const zone=new THREE.Mesh(new THREE.RingGeometry(4.75,5.25,72),hologramMaterial(color,.16));
      zone.rotation.x=-Math.PI/2;zone.position.y=.1;zone.name=`SmartCityHologram_ServiceZone_${id}`;group.add(zone);
      this.city.add(group);
    });

    const traffic=this.themes.traffic;
    [[[-5,-1.1],[5,-.8]],[[-4.5,1.25],[4.7,1.55]],[[-2.1,-3],[-1.6,3.2]],[[1.25,-3],[1.7,3.1]]].forEach(points=>traffic.add(tubePath(points as [number,number][],0xffa83d,.085,.9)));
    [[-1.8,-.95],[1.5,-.82],[-1.72,1.37],[1.55,1.45]].forEach(([x,z],index)=>{const signal=new THREE.Group();signal.position.set(x,.55,z);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.055,1.15,8),hologramMaterial(0xffb85c,.88));const light=new THREE.Mesh(new THREE.SphereGeometry(.2,16,16),hologramMaterial(index%2?0x64f0d2:0xffb85c,.98));light.position.y=.58;const intersection=new THREE.Mesh(new THREE.RingGeometry(.3,.42,28),hologramMaterial(0xffb85c,.82));intersection.rotation.x=-Math.PI/2;intersection.position.y=-.43;signal.add(pole,light,intersection);traffic.add(signal)});
    const congestion=labelSprite('AI 신호 제어','혼잡도 －28%','#ffb85c');congestion.position.set(0,5.15,.1);traffic.add(congestion);

    const brtTheme=this.themes.brt;
    const brt=new THREE.Group();brt.name='SmartCityHologram_BRT';
    const busBody=new THREE.Mesh(new THREE.BoxGeometry(1.35,.62,.58),hologramMaterial(0x079fcf,.9));busBody.position.y=.42;brt.add(busBody);
    const busRoof=new THREE.Mesh(new THREE.BoxGeometry(.9,.09,.6),hologramMaterial(0x86edff,.94));busRoof.position.y=.77;brt.add(busRoof);
    brtTheme.add(brt);brtTheme.userData.brt=brt;
    [[-3.6,-.98],[-.4,-.91],[2.8,-.84]].forEach(([x,z])=>{const station=new THREE.Group();station.position.set(x,.18,z);station.add(new THREE.Mesh(new THREE.BoxGeometry(.58,.3,.22),hologramMaterial(0x8ceaff,.72)));const halo=new THREE.Mesh(new THREE.RingGeometry(.32,.39,24),hologramMaterial(0xb7f7ff,.72));halo.rotation.x=-Math.PI/2;halo.position.y=.18;station.add(halo);brtTheme.add(station)});
    brtTheme.add(tubePath([[-5,-1.1],[5,-.8]],0x26d8ff,.1,.95));
    const brtLane=new THREE.Mesh(new THREE.BoxGeometry(10.2,.035,.72),hologramMaterial(0x38d9ff,.42));brtLane.position.set(0,.1,-.94);brtTheme.add(brtLane);
    const brtLabel=labelSprite('BRT 전용도로','3개 정류장 ACTIVE','#55d8ff');brtLabel.position.set(0,4.7,-1.15);brtTheme.add(brtLabel);

    const uamTheme=this.themes.uam;
    const uam=new THREE.Group();uam.name='SmartCityHologram_UAM';uam.add(new THREE.Mesh(new THREE.BoxGeometry(.72,.2,.34),hologramMaterial(0x8f69e8,.9)));
    [-.52,.52].forEach(x=>{const rotor=new THREE.Mesh(new THREE.RingGeometry(.23,.29,24),hologramMaterial(0xc6b6ff,.86));rotor.rotation.x=-Math.PI/2;rotor.position.set(x,.08,0);uam.add(rotor)});
    uamTheme.add(uam);uamTheme.userData.uam=uam;
    const vertiport=new THREE.Mesh(new THREE.RingGeometry(.72,.94,40),hologramMaterial(0xa7f3ff,.78));vertiport.rotation.x=-Math.PI/2;vertiport.position.set(3.7,.28,-2.4);uamTheme.add(vertiport);
    const airRoute=tubePath([[-3.8,-2.2],[0,-.4],[3.7,-2.4]],0xb694ff,.075,.92);airRoute.position.y=3.2;uamTheme.add(airRoute);
    const vertiportTower=new THREE.Mesh(new THREE.CylinderGeometry(.72,.9,1.8,32),hologramMaterial(0xaa8cff,.38));vertiportTower.position.set(3.7,.9,-2.4);uamTheme.add(vertiportTower);
    const uamLabel=labelSprite('UAM 항로','버티포트 CONNECTED','#b49aff');uamLabel.position.set(-.4,5.15,-1.2);uamTheme.add(uamLabel);

    const energy=this.themes.energy;
    buildings.filter((_,index)=>index%2===0).forEach(([x,h,z])=>{const panel=new THREE.Mesh(new THREE.PlaneGeometry(.48,.32),hologramMaterial(0x70f5db,.7));panel.rotation.x=-Math.PI/2;panel.position.set(x,h+.22,z);energy.add(panel)});
    [-4.6,4.4].forEach((x,index)=>{const turbine=new THREE.Group();turbine.position.set(x,1.3,index?2.8:-2.7);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.025,.045,2.3,10),hologramMaterial(0x9affdf,.75));turbine.add(mast);const blades=new THREE.Group();blades.position.y=1.05;for(let blade=0;blade<3;blade+=1){const arm=new THREE.Mesh(new THREE.BoxGeometry(.05,.75,.035),hologramMaterial(0xcaffed,.8));arm.position.y=.35;arm.rotation.z=blade*Math.PI*2/3;arm.geometry.translate(0,.32,0);blades.add(arm)}turbine.add(blades);energy.add(turbine);(energy.userData.turbines??=[]).push(blades)});
    [[[-4.6,-2.7],[-.35,-.05]],[[4.4,2.8],[-.35,-.05]],[[-.35,-.05],[-3.5,2]],[[-.35,-.05],[3,-2]]].forEach(points=>energy.add(tubePath(points as [number,number][],0x43f0b5,.065,.9)));
    const ess=labelSprite('SMART GRID','ESS 충전 86%','#71f3d2');ess.position.set(1.5,4.85,1.2);energy.add(ess);

    const twin=this.themes.twin;
    const labels=[['교통량','72%',-3.7,3.2,-.5],['공기질','좋음',-.9,4.4,-1.7],['전력','68%',2,3.8,-.7],['BRT','정상 운행',3.7,2.9,1],['인구 분포','402,103',-2.3,3.1,2.1]] as const;
    labels.forEach(([title,value,x,y,z])=>{const sprite=labelSprite(title,value);sprite.position.set(x,y,z);twin.add(sprite)});
    [[-3.7,2.1,-.5],[-.9,3.2,-1.7],[2,2.7,-.7],[3.7,1.9,1],[-2.3,2.1,2.1]].forEach(([x,height,z])=>{const beam=new THREE.Mesh(new THREE.CylinderGeometry(.055,.11,height,12),hologramMaterial(0x6f9cff,.72));beam.position.set(x,height/2,z);twin.add(beam)});
    const grid=new THREE.GridHelper(11,14,0x7deaff,0x2b91b5);grid.position.y=.04;(grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.3;twin.add(grid);

    const health=this.themes.health;
    [[3.55,1.85],[-2.8,-1.9],[-.6,-2],[1.8,.2],[-2.2,1.85]].forEach(([x,z])=>health.add(tubePath([[3.55,1.85],[x,z]],0xff64c3,.07,.9)));
    const healthHalo=new THREE.Mesh(new THREE.RingGeometry(.75,.88,48),hologramMaterial(0xff7fcf,.78));healthHalo.rotation.x=-Math.PI/2;healthHalo.position.set(3.55,.22,1.85);health.add(healthHalo);health.userData.halo=healthHalo;
    const ambulance=new THREE.Mesh(new THREE.BoxGeometry(.48,.24,.28),hologramMaterial(0xf04d9f,.9));ambulance.name='SmartCityHologram_Ambulance';ambulance.position.y=.25;health.add(ambulance);health.userData.ambulance=ambulance;
    [[-2.6,-1.8],[-.4,2.1],[1.8,-2]].forEach(([x,z])=>{const aed=labelSprite('AED','READY','#ff8fd5');aed.scale.set(.6,.227,1);aed.position.set(x,1.45,z);health.add(aed)});
    const healthLabel=labelSprite('응급 네트워크','병원 · AED CONNECTED','#ff7fcf');healthLabel.position.set(0,5.05,.2);health.add(healthLabel);

    const screenData=createScreenTexture();this.screenCanvas=screenData.canvas;this.screenTexture=screenData.texture;
    this.screen=new THREE.Mesh(new THREE.PlaneGeometry(14.4,6.25),new THREE.MeshBasicMaterial({map:this.screenTexture,transparent:true,opacity:.98,side:THREE.DoubleSide,toneMapped:false}));
    this.screen.name='SmartCityHologram_MainScreen';this.screen.position.set(0,5.65,-16.72);model.add(this.screen);
    this.screen.visible=false;
    this.collectMaterials();
    this.setTechnology('brt',true);
  }

  private collectMaterials(){
    this.root.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Line||object instanceof THREE.Points){const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(material=>{this.materials.push(material);if(material.userData.baseOpacity===undefined)material.userData.baseOpacity=(material as THREE.Material&{opacity?:number}).opacity??1})}});
  }

  setActive(active:boolean){
    this.active=active;
    this.root.visible=active;this.screen.visible=active;
    if(active){this.transition=0;this.root.scale.setScalar(HOLOGRAM_SCALE*.48)}
  }

  setTechnology(technology:SmartCityTechnologyId,immediate=false){
    this.technology=technology;
    const color=TECHNOLOGY_COLORS[technology];
    this.cityBaseMaterials.forEach(material=>{
      const colored=material as THREE.Material&{color?:THREE.Color};
      const baseColor=material.userData.baseColor as number|undefined;
      if(colored.color&&baseColor!==undefined)colored.color.setHex(baseColor).lerp(new THREE.Color(color),.46);
    });
    (this.beam.material as THREE.MeshBasicMaterial).color.setHex(color);
    (this.pulseRing.material as THREE.MeshBasicMaterial).color.setHex(color);
    Object.entries(this.themes).forEach(([id,group])=>{
      group.visible=id===technology;
      if(id===technology)group.traverse(child=>{child.visible=true});
    });
    this.themes[technology].scale.setScalar(immediate?1.12:.76);
    this.transition=immediate?1:0;
    if(!immediate)this.root.scale.setScalar(HOLOGRAM_SCALE*.48);
    this.drawScreen();
  }

  private drawScreen(){
    const copy=TECHNOLOGY_COPY[this.technology],context=this.screenCanvas.getContext('2d')!;
    context.setTransform(4,0,0,4,0,0);
    const gradient=context.createLinearGradient(0,0,1024,512);
    gradient.addColorStop(0,'rgba(3,17,31,.96)');gradient.addColorStop(.58,'rgba(7,43,66,.96)');gradient.addColorStop(1,'rgba(3,20,34,.96)');
    context.clearRect(0,0,1024,512);context.fillStyle=gradient;context.fillRect(0,0,1024,512);
    context.strokeStyle=copy.accent;context.lineWidth=4;context.strokeRect(18,18,988,476);
    context.fillStyle=copy.accent;context.font='800 24px Pretendard, sans-serif';context.letterSpacing='5px';context.fillText(copy.eyebrow,64,88);
    context.fillStyle='#effcff';context.font='900 70px Pretendard, sans-serif';context.letterSpacing='0px';context.fillText(copy.title,62,178);
    context.fillStyle='rgba(111,229,255,.3)';context.fillRect(64,208,900,2);
    copy.lines.forEach((line,index)=>{context.fillStyle=copy.accent;context.beginPath();context.arc(76,270+index*67,7,0,Math.PI*2);context.fill();context.fillStyle='#ccebf3';context.font='700 31px Pretendard, sans-serif';context.fillText(line,106,281+index*67)});
    context.fillStyle='#70e8ff';context.font='800 18px Pretendard, sans-serif';context.fillText('FUTURE SEJONG · LIVE CITY 2035',650,468);
    this.screenTexture.needsUpdate=true;
  }

  update(delta:number){
    if(!this.active||!this.root.visible)return;
    this.elapsed+=delta;this.transition=Math.min(1,this.transition+delta/6.2);
    const eased=1-Math.pow(1-this.transition,3),pulse=.96+Math.sin(this.elapsed*2.1)*.025;
    this.root.scale.setScalar(HOLOGRAM_SCALE*(.48+.52*eased)*pulse);
    this.city.rotation.y+=delta*.12;
    this.city.position.y=.18+Math.sin(this.elapsed*1.35)*.08;
    this.beam.rotation.y-=delta*.13;
    const ringProgress=(this.transition*1.8)%1;this.pulseRing.scale.setScalar(.35+ringProgress*5.1);
    const brt=this.themes.brt.userData.brt as THREE.Group,uam=this.themes.uam.userData.uam as THREE.Group;
    brt.position.set(-4.5+(this.elapsed*.95)%9,.18,-.92);
    uam.position.set(Math.sin(this.elapsed*.65)*3.7,3.8+Math.sin(this.elapsed*1.5)*.35,Math.cos(this.elapsed*.52)*1.8);
    (this.themes.energy.userData.turbines as THREE.Group[]).forEach((turbine,index)=>{turbine.rotation.z+=delta*(index?.85:1)});
    const halo=this.themes.health.userData.halo as THREE.Mesh;halo.scale.setScalar(1+Math.sin(this.elapsed*2.4)*.14);
    const ambulance=this.themes.health.userData.ambulance as THREE.Mesh;ambulance.position.set(3.55-((this.elapsed*.7)%1)*6.2,.25,1.85-((this.elapsed*.7)%1)*3.1);
    this.themes[this.technology].scale.setScalar(.76+.36*eased);
    this.hospital.scale.setScalar(this.technology==='health'?1+Math.sin(this.elapsed*3)*.07:1);
    this.materials.forEach(material=>{const value=material as THREE.Material&{opacity:number};const base=material.userData.baseOpacity as number;value.opacity=Math.min(1,base*(.78+.22*eased)*(1+Math.sin(this.elapsed*2+base)*.04))});
    (this.pulseRing.material as THREE.MeshBasicMaterial).opacity=(1-ringProgress)*.72;
  }

  dispose(){
    this.root.removeFromParent();this.screen.removeFromParent();
    const disposedTextures=new Set<THREE.Texture>();
    [this.root,this.screen].forEach(root=>root.traverse(object=>{
      if(object instanceof THREE.Mesh||object instanceof THREE.Line||object instanceof THREE.Points||object instanceof THREE.Sprite){
        const geometry=(object as THREE.Mesh).geometry;geometry?.dispose();
        const rawMaterial=(object as THREE.Mesh).material as THREE.Material|THREE.Material[];
        const materials:THREE.Material[]=Array.isArray(rawMaterial)?rawMaterial:[rawMaterial];
        materials.forEach(material=>{const map=(material as THREE.MeshBasicMaterial).map;if(map&&!disposedTextures.has(map)){map.dispose();disposedTextures.add(map)}material.dispose()});
      }
    }));
  }
}
