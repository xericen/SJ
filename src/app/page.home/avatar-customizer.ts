import * as THREE from 'three';
import { AVATAR_MATERIAL_NAMES, AVATAR_PARTS, getAvatarBaseModel } from './avatar-assets.config';
import { AvatarCustomization } from './avatar-customization.model';

const ALL_PART_NAMES = {
    face: Object.values(AVATAR_PARTS.face).flat(),
    hair: Object.values(AVATAR_PARTS.hair).flat(),
    top: Object.values(AVATAR_PARTS.top).flat(),
    bottom: Object.values(AVATAR_PARTS.bottom).flat(),
    shoes: Object.values(AVATAR_PARTS.shoes).flat(),
    accessory: Object.values(AVATAR_PARTS.accessory).flat()
};

export interface AvatarCustomizationResult {
    activeParts: string[];
    modelScale: [number, number, number];
}

export function prepareAvatarModel(model: THREE.Object3D): THREE.Material[] {
    const ownedMaterials: THREE.Material[] = [];
    model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        if (Array.isArray(object.material)) {
            object.material = object.material.map((material) => {
                const clone = material.clone();
                ownedMaterials.push(clone);
                return clone;
            });
        } else {
            object.material = object.material.clone();
            ownedMaterials.push(object.material);
        }
    });
    return ownedMaterials;
}

function showOnly(model: THREE.Object3D, allNames: readonly string[], selectedNames: readonly string[]) {
    const selected = new Set(selectedNames);
    allNames.forEach((name) => {
        const part = model.getObjectByName(name);
        if (part) part.visible = selected.has(name);
    });
}

function setMaterialColor(model: THREE.Object3D, materialName: string, color: string) {
    const target = materialName.toLowerCase().replace(/material$/, '');
    model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
            const sourceName = material.name.toLowerCase().replace(/material$/, '');
            if (!(material instanceof THREE.MeshStandardMaterial) || sourceName !== target) return;
            material.color.set(color);
            material.roughness = Math.max(material.roughness, 0.68);
            material.metalness = 0;
            material.needsUpdate = true;
        });
    });
}

export function applyAvatarCustomization(
    model: THREE.Object3D,
    customization: AvatarCustomization
): AvatarCustomizationResult {
    const face = AVATAR_PARTS.face[customization.faceId as keyof typeof AVATAR_PARTS.face] || AVATAR_PARTS.face.smile;
    const hair = AVATAR_PARTS.hair[customization.hairStyleId as keyof typeof AVATAR_PARTS.hair] || AVATAR_PARTS.hair.short;
    const top = AVATAR_PARTS.top[customization.topId as keyof typeof AVATAR_PARTS.top] || AVATAR_PARTS.top.hoodie;
    const bottom = AVATAR_PARTS.bottom[customization.bottomId as keyof typeof AVATAR_PARTS.bottom] || AVATAR_PARTS.bottom.pants;
    const shoes = AVATAR_PARTS.shoes[customization.shoesId as keyof typeof AVATAR_PARTS.shoes] || AVATAR_PARTS.shoes.sneakers;
    const accessory = customization.accessoryIds
        .flatMap((id) => AVATAR_PARTS.accessory[id as keyof typeof AVATAR_PARTS.accessory] || []);

    showOnly(model, ALL_PART_NAMES.face, face);
    showOnly(model, ALL_PART_NAMES.hair, hair);
    showOnly(model, ALL_PART_NAMES.top, top);
    showOnly(model, ALL_PART_NAMES.bottom, bottom);
    showOnly(model, ALL_PART_NAMES.shoes, shoes);
    showOnly(model, ALL_PART_NAMES.accessory, accessory);

    setMaterialColor(model, AVATAR_MATERIAL_NAMES.skin, customization.skinColor);
    setMaterialColor(model, AVATAR_MATERIAL_NAMES.hair, customization.hairColor);
    setMaterialColor(model, AVATAR_MATERIAL_NAMES.top, customization.topColor);
    setMaterialColor(model, AVATAR_MATERIAL_NAMES.bottom, customization.bottomColor);
    setMaterialColor(model, AVATAR_MATERIAL_NAMES.shoes, customization.shoesColor);

    const scale = getAvatarBaseModel(customization.baseModelId).scale;
    return {
        activeParts: [...face, ...hair, ...top, ...bottom, ...shoes, ...accessory],
        modelScale: scale
    };
}
