import * as THREE from 'three';

export type AvatarValidationMode = 'generic' | 'stable' | 'strict';

export interface AvatarValidationReport {
    valid: boolean;
    errors: string[];
    warnings: string[];
    size: THREE.Vector3;
}

const REQUIRED_CLIPS = ['idle', 'walk', 'run', 'jump', 'wave', 'happy', 'surprised', 'heart', 'sit'];
const REQUIRED_BONES: Record<string, string[]> = {
    Root: ['Root', 'root', 'AvatarRoot'], Hips: ['Hips', 'hips'], Spine: ['Spine', 'spine'], Chest: ['Chest', 'chest'], Neck: ['Neck', 'neck'], Head: ['Head', 'head'],
    UpperArm_L: ['UpperArm_L', 'leftUpperArm'], LowerArm_L: ['LowerArm_L', 'leftLowerArm'], Hand_L: ['Hand_L', 'leftHand'],
    UpperArm_R: ['UpperArm_R', 'rightUpperArm'], LowerArm_R: ['LowerArm_R', 'rightLowerArm'], Hand_R: ['Hand_R', 'rightHand'],
    UpperLeg_L: ['UpperLeg_L', 'leftUpperLeg'], LowerLeg_L: ['LowerLeg_L', 'leftLowerLeg'], Foot_L: ['Foot_L', 'leftFoot'],
    UpperLeg_R: ['UpperLeg_R', 'rightUpperLeg'], LowerLeg_R: ['LowerLeg_R', 'rightLowerLeg'], Foot_R: ['Foot_R', 'rightFoot']
};

function findAlias(model: THREE.Object3D, aliases: string[]): THREE.Object3D | undefined {
    return aliases.map((name) => model.getObjectByName(name)).find(Boolean);
}

function isFiniteTransform(object: THREE.Object3D): boolean {
    return [...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray()].every(Number.isFinite);
}

function looksLikeExposedBox(mesh: THREE.Mesh, modelSize: THREE.Vector3): boolean {
    if (!/(body|torso|chest)/i.test(mesh.name) || !mesh.geometry?.attributes?.position) return false;
    const position = mesh.geometry.attributes.position;
    const axes = [new Set<number>(), new Set<number>(), new Set<number>()];
    for (let index = 0; index < position.count; index += 1) {
        axes[0].add(Math.round(position.getX(index) * 1000));
        axes[1].add(Math.round(position.getY(index) * 1000));
        axes[2].add(Math.round(position.getZ(index) * 1000));
    }
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    return axes.every((axis) => axis.size <= 3) && size.y > modelSize.y * 0.2;
}

export function validateAvatarModel(
    model: THREE.Object3D,
    clips: THREE.AnimationClip[],
    mode: AvatarValidationMode
): AvatarValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    if (box.isEmpty() || !size.toArray().every(Number.isFinite) || size.y <= 0) errors.push('유효한 모델 경계가 없습니다.');
    model.traverse((object) => {
        if (!isFiniteTransform(object)) errors.push(`${object.name || object.type}에 NaN/Infinity transform이 있습니다.`);
    });

    if (mode !== 'generic') {
        const clipNames = new Set(clips.map((clip) => clip.name.toLowerCase()));
        REQUIRED_CLIPS.filter((name) => !clipNames.has(name)).forEach((name) => errors.push(`필수 애니메이션 누락: ${name}`));
        Object.entries(REQUIRED_BONES).forEach(([name, aliases]) => {
            if (!findAlias(model, aliases)) errors.push(`필수 본 누락: ${name}`);
        });
    } else {
        if (!clips.length) warnings.push('애니메이션 클립이 없는 완성형 모델입니다.');
        if (!Object.values(REQUIRED_BONES).some((aliases) => findAlias(model, aliases))) warnings.push('Skeleton이 없는 완성형 모델입니다.');
    }

    if (mode === 'strict') {
        if (size.y < 1.5 || size.y > 2.2) errors.push(`캐릭터 높이(${size.y.toFixed(2)})가 허용 범위(1.5~2.2)를 벗어났습니다.`);
        if (size.x / size.y < 0.18 || size.x / size.y > 0.85) errors.push('전체 신체 폭 비율이 비정상적입니다.');
        let skinnedMeshes = 0;
        const materialNames = new Set<string>();
        model.traverse((object) => {
            if (object instanceof THREE.SkinnedMesh) skinnedMeshes += 1;
            if (object instanceof THREE.Mesh) {
                if (looksLikeExposedBox(object, size)) errors.push(`상자형 몸통 Mesh 노출: ${object.name}`);
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach((material) => materialNames.add(material.name.toLowerCase()));
            }
        });
        if (!skinnedMeshes) errors.push('SkinnedMesh가 없습니다.');
        ['skin', 'hair', 'top', 'bottom', 'shoes', 'face'].forEach((name) => {
            if (![...materialNames].some((material) => material.includes(name))) errors.push(`필수 Material 누락: ${name}`);
        });

        const maxJointGap = size.y * 0.32;
        [['Head', 'Neck'], ['UpperArm_L', 'LowerArm_L'], ['LowerArm_L', 'Hand_L'], ['UpperArm_R', 'LowerArm_R'], ['LowerArm_R', 'Hand_R'],
            ['Hips', 'UpperLeg_L'], ['UpperLeg_L', 'LowerLeg_L'], ['Hips', 'UpperLeg_R'], ['UpperLeg_R', 'LowerLeg_R']]
            .forEach(([from, to]) => {
                const first = findAlias(model, REQUIRED_BONES[from]);
                const second = findAlias(model, REQUIRED_BONES[to]);
                if (first && second && first.getWorldPosition(new THREE.Vector3()).distanceTo(second.getWorldPosition(new THREE.Vector3())) > maxJointGap) {
                    errors.push(`관절 간격 비정상: ${from}-${to}`);
                }
            });

        const bodyBox = new THREE.Box3();
        const attachments: THREE.Object3D[] = [];
        model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            if (/(face|accessory)/i.test(object.name)) attachments.push(object);
            else bodyBox.union(new THREE.Box3().setFromObject(object));
        });
        if (!bodyBox.isEmpty()) {
            const margin = size.y * 0.15;
            bodyBox.expandByScalar(margin);
            attachments.forEach((attachment) => {
                const attachmentBox = new THREE.Box3().setFromObject(attachment);
                if (!bodyBox.containsBox(attachmentBox)) errors.push(`얼굴/액세서리 위치가 신체 범위를 벗어남: ${attachment.name}`);
            });
        }
    } else if (!model.children.length) {
        warnings.push('안정 모델에 표시 가능한 루트 자식이 없습니다.');
    }

    return { valid: errors.length === 0, errors: [...new Set(errors)], warnings, size };
}
