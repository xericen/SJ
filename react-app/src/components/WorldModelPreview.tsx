import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import '@google/model-viewer';
import type {ModelViewerElement} from '@google/model-viewer';
import {createGltfLoader} from '../utils/createGltfLoader';

type PreviewProps={src:string;poster:string;name:string};

function StandardWorldModelPreview({src,poster,name}:PreviewProps){
  const hostRef=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');

  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;
    setStatus('loading');
    const viewer=document.createElement('model-viewer') as ModelViewerElement;
    viewer.src=src;
    viewer.poster=poster;
    viewer.alt=`${name} 3D 월드 모형`;
    viewer.setAttribute('camera-controls','');
    viewer.setAttribute('auto-rotate','');
    viewer.setAttribute('interaction-prompt','none');
    viewer.setAttribute('shadow-intensity','1');
    viewer.setAttribute('exposure','1.05');
    const onLoad=()=>setStatus('ready');
    const onError=(event:Event)=>{console.error('[WorldModelPreview] standard GLB load error',event);setStatus('error')};
    viewer.addEventListener('load',onLoad);
    viewer.addEventListener('error',onError);
    host.append(viewer);
    return()=>{viewer.removeEventListener('load',onLoad);viewer.removeEventListener('error',onError);viewer.remove()};
  },[name,poster,src]);

  return <div className={`world-model-preview is-${status}`} ref={hostRef}>
    {status==='loading'&&<div className="world-model-loading"><i/><b>3D 월드를 불러오는 중</b><small>스마트시티 GLB를 준비하고 있어요.</small></div>}
    {status==='error'&&<div className="world-model-error"><span>🗺️</span><b>3D 모형을 불러오지 못했어요.</b><small>잠시 후 다시 열어 주세요.</small></div>}
  </div>;
}

function MeshoptWorldModelPreview({src,poster,name}:PreviewProps){
  const hostRef=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');

  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;
    let disposed=false,model:THREE.Object3D|undefined;
    setStatus('loading');

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(28,1,.01,10000);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.setClearColor(0x000000,0);
    renderer.domElement.setAttribute('aria-label',`${name} 3D 월드 모형`);
    host.append(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf4fff9,0x49665b,2.4));
    const key=new THREE.DirectionalLight(0xfff4dc,3.2);key.position.set(4,8,5);scene.add(key);
    const fill=new THREE.DirectionalLight(0xbbeaff,1.4);fill.position.set(-5,3,-4);scene.add(fill);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.enablePan=false;controls.autoRotate=!['정부청사 중앙광장','세종예술의전당'].includes(name);controls.autoRotateSpeed=.8;

    const resize=()=>{
      const width=Math.max(host.clientWidth,1),height=Math.max(host.clientHeight,1);
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
    };
    const observer=new ResizeObserver(resize);observer.observe(host);resize();

    createGltfLoader().load(src,gltf=>{
      if(disposed)return;
      model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
      const radius=Math.max(size.length()*.5,1),distance=radius*2.35,azimuth=name==='세종예술의전당'?Math.PI:THREE.MathUtils.degToRad(42),polar=THREE.MathUtils.degToRad(62);
      controls.target.copy(center);
      camera.near=Math.max(radius/1000,.01);camera.far=Math.max(radius*30,100);
      camera.position.set(center.x+Math.sin(azimuth)*Math.sin(polar)*distance,center.y+Math.cos(polar)*distance,center.z+Math.cos(azimuth)*Math.sin(polar)*distance);
      camera.updateProjectionMatrix();controls.minDistance=radius*.7;controls.maxDistance=radius*5;controls.update();
      setStatus('ready');
    },undefined,error=>{
      console.error('[WorldModelPreview] GLB load error',error);
      if(!disposed)setStatus('error');
    });

    renderer.setAnimationLoop(()=>{if(document.hidden)return;controls.update();renderer.render(scene,camera)});
    return()=>{
      disposed=true;observer.disconnect();renderer.setAnimationLoop(null);controls.dispose();
      model?.traverse(object=>{if(!(object instanceof THREE.Mesh))return;object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{for(const value of Object.values(material)){if(value instanceof THREE.Texture)value.dispose()}material.dispose()})});
      renderer.dispose();renderer.domElement.remove();
    };
  },[name,src]);

  return <div className={`world-model-preview is-${status}`} ref={hostRef}>
    {status!=='ready'&&<img className="world-model-poster" src={poster} alt=""/>}
    {status==='loading'&&<div className="world-model-loading"><i/><b>3D 월드를 불러오는 중</b><small>Meshopt 압축 월드를 준비하고 있어요.</small></div>}
    {status==='error'&&<div className="world-model-error"><span>🗺️</span><b>3D 모형을 불러오지 못했어요.</b><small>잠시 후 다시 열어 주세요.</small></div>}
  </div>;
}

export function WorldModelPreview(props:PreviewProps){
  // 동아리 거리제는 EXT_meshopt_compression을 사용하므로 decoder가 명시된 로더가 필요하다.
  // 그 외 월드는 model-viewer로 격리해 메인 Three 렌더러의 WebGL program 상태와 충돌하지 않게 한다.
  return props.name==='동아리 거리제'?<MeshoptWorldModelPreview {...props}/>:<StandardWorldModelPreview {...props}/>;
}
