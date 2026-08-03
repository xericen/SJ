import fs from 'node:fs/promises';
import process from 'node:process';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const file = process.argv[2];
const stable = process.argv.includes('--stable');
const generic = process.argv.includes('--generic');
if (!file) {
    console.error('Usage: node tools/validate-avatar-glb.mjs <model.glb> [--generic|--stable]');
    process.exit(2);
}

if (!globalThis.ProgressEvent) globalThis.ProgressEvent = class ProgressEvent {};
if (!globalThis.self) globalThis.self = globalThis;
if (!globalThis.createImageBitmap) {
    globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });
}
const bytes = await fs.readFile(file);
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const gltf = await new GLTFLoader().parseAsync(buffer, '');
const errors = [];
const aliases = {
    Root: ['Root','root','AvatarRoot'], Hips: ['Hips','hips'], Spine: ['Spine','spine'], Chest: ['Chest','chest'], Neck: ['Neck','neck'], Head: ['Head','head'],
    UpperArm_L: ['UpperArm_L','leftUpperArm'], LowerArm_L: ['LowerArm_L','leftLowerArm'], Hand_L: ['Hand_L','leftHand'],
    UpperArm_R: ['UpperArm_R','rightUpperArm'], LowerArm_R: ['LowerArm_R','rightLowerArm'], Hand_R: ['Hand_R','rightHand'],
    UpperLeg_L: ['UpperLeg_L','leftUpperLeg'], LowerLeg_L: ['LowerLeg_L','leftLowerLeg'], Foot_L: ['Foot_L','leftFoot'],
    UpperLeg_R: ['UpperLeg_R','rightUpperLeg'], LowerLeg_R: ['LowerLeg_R','rightLowerLeg'], Foot_R: ['Foot_R','rightFoot']
};
const find = (names) => names.map((name) => gltf.scene.getObjectByName(name)).find(Boolean);
if (!generic) {
    Object.entries(aliases).forEach(([name,names]) => { if (!find(names)) errors.push(`missing bone: ${name}`); });
    const clips = new Set(gltf.animations.map((clip) => clip.name.toLowerCase()));
    ['idle','walk','run','jump','wave','happy','surprised','heart','sit'].forEach((name) => { if (!clips.has(name)) errors.push(`missing clip: ${name}`); });
}

gltf.scene.updateMatrixWorld(true);
const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
if (!size.toArray().every(Number.isFinite) || size.y <= 0) errors.push('invalid bounding box');
gltf.scene.traverse((object) => {
    const values = [...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray()];
    if (!values.every(Number.isFinite)) errors.push(`invalid transform: ${object.name || object.type}`);
});

if (!stable && !generic) {
    if (size.y < 1.5 || size.y > 2.2) errors.push(`height out of range: ${size.y.toFixed(3)}`);
    let skinned = 0;
    const materials = new Set();
    gltf.scene.traverse((object) => {
        if (object.isSkinnedMesh) skinned += 1;
        if (!object.isMesh) return;
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => materials.add(material.name.toLowerCase()));
        if (/(body|torso|chest)/i.test(object.name) && object.geometry?.attributes?.position) {
            const p = object.geometry.attributes.position;
            const axes = [new Set(),new Set(),new Set()];
            for (let i=0;i<p.count;i+=1) { axes[0].add(Math.round(p.getX(i)*1000)); axes[1].add(Math.round(p.getY(i)*1000)); axes[2].add(Math.round(p.getZ(i)*1000)); }
            if (axes.every((axis)=>axis.size<=3)) errors.push(`exposed box-like torso: ${object.name}`);
        }
    });
    if (!skinned) errors.push('missing SkinnedMesh');
    ['skin','hair','top','bottom','shoes','face'].forEach((name) => {
        if (![...materials].some((material)=>material.includes(name))) errors.push(`missing material: ${name}`);
    });
}

if (errors.length) {
    console.error(`Avatar validation failed: ${file}`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}
console.log(`Avatar validation passed: ${file}`, { mode: generic ? 'generic' : stable ? 'stable' : 'strict', size: size.toArray(), clips: gltf.animations.length });
