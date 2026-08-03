import { AvatarCustomization } from './avatar-customization.model';

export const AVATAR_MODEL_VERSION = 'beaver-v1';
export const ENABLE_EXPERIMENTAL_AVATAR = false;
export const AVATAR_FALLBACK_PATH = '/assets/avatar/toy-avatar.glb';
export const AVATAR_FALLBACK_MODEL_ID = 'toy-rounded';

export interface AvatarCapabilities {
    faces: readonly string[];
    hairStyles: readonly string[];
    tops: readonly string[];
    bottoms: readonly string[];
    shoes: readonly string[];
    accessories: readonly string[];
    colorSlots: readonly string[];
}

export type AvatarMovementDirection =
    | 'down' | 'downRight' | 'right' | 'upRight'
    | 'up' | 'upLeft' | 'left' | 'downLeft';

export type AvatarDirectionYawDegrees = Readonly<Record<AvatarMovementDirection, number>>;

export interface AvatarBaseModelAsset {
    id: string;
    label: string;
    description: string;
    path: string;
    fallbackPath: string;
    previewImage: string;
    previewPosition: string;
    previewSize: string;
    scale: [number, number, number];
    mapScale: number;
    position: [number, number, number];
    rotation: [number, number, number];
    frontRotationY: number;
    poseCorrection?: Readonly<{
        idlePitchDeg: number;
        walkPitchDeg: number;
        runPitchDeg: number;
    }>;
    directionMode?: 'full' | 'cameraFriendly';
    directionYawDeg?: AvatarDirectionYawDegrees;
    maxYawDeg?: number;
    removeRootMotion?: boolean;
    animationMap?: Readonly<Record<'idle' | 'walk' | 'run', string | number>>;
    animationSources?: Readonly<Record<string, { path: string; clip?: string | number }>>;
    rigState: 'static-mesh' | 'rigged-without-animation' | 'animated';
    enabled: boolean;
    verified: boolean;
    experimental?: boolean;
    validationMode: 'generic' | 'stable' | 'strict';
    capabilities: AvatarCapabilities;
}

const STABLE_CAPABILITIES: AvatarCapabilities = {
    faces: ['smile', 'bright', 'calm'],
    hairStyles: ['short', 'parted', 'curly'],
    tops: ['tshirt', 'hoodie', 'jacket'],
    bottoms: ['pants', 'shorts', 'joggers'],
    shoes: ['sneakers', 'boots'],
    accessories: ['glasses', 'flower', 'headphones'],
    colorSlots: ['skinColor', 'hairColor', 'topId', 'shoesId']
};

const V3_CAPABILITIES: AvatarCapabilities = {
    faces: ['smile', 'bright', 'calm', 'surprised'],
    hairStyles: ['short', 'parted', 'bob', 'curly', 'ponytail'],
    tops: ['tshirt', 'sweatshirt', 'hoodie', 'jacket'],
    bottoms: ['pants', 'shorts', 'joggers'],
    shoes: ['sneakers', 'hightop', 'boots'],
    accessories: ['glasses', 'headphones', 'hat', 'backpack', 'beard'],
    colorSlots: ['skinColor', 'hairColor', 'topId', 'shoesId']
};

const COMPLETE_MODEL_CAPABILITIES: AvatarCapabilities = {
    faces: [], hairStyles: [], tops: [], bottoms: [], shoes: [], accessories: [], colorSlots: []
};

export const AVATAR_BASE_MODELS: AvatarBaseModelAsset[] = [
    {
        id: 'cozy-beaver',
        label: '포근한 비버 친구',
        description: '업로드한 Meshy 완성형 GLB 캐릭터',
        path: '/assets/avatar/models/cozy-beaver.glb',
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/models/cozy-beaver-preview.png',
        previewPosition: '50% 50%',
        previewSize: 'contain',
        scale: [1, 1, 1],
        mapScale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: 0,
        rigState: 'static-mesh',
        enabled: true,
        verified: true,
        validationMode: 'generic',
        capabilities: COMPLETE_MODEL_CAPABILITIES
    },
    {
        id: 'chungnyeong',
        label: '충녕이',
        description: '세종을 지키는 충녕이 GLB 캐릭터',
        path: '/assets/avatar/models/chungnyeong-idle.glb',
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/models/chungnyeong-preview.png',
        previewPosition: '50% 50%',
        previewSize: 'contain',
        scale: [1.9, 1.9, 1.9],
        mapScale: 1.5,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: Math.PI,
        poseCorrection: { idlePitchDeg: 0, walkPitchDeg: 4, runPitchDeg: 12 },
        directionMode: 'cameraFriendly',
        directionYawDeg: {
            down: 0,
            downRight: 35,
            right: 50,
            upRight: 70,
            up: 60,
            upLeft: -70,
            left: -50,
            downLeft: -35
        },
        maxYawDeg: 70,
        removeRootMotion: true,
        animationMap: { idle: 0, walk: 'Walk', run: 'Run' },
        animationSources: {
            Walk: { path: '/assets/avatar/models/chungnyeong-walk.glb', clip: 0 },
            Run: { path: '/assets/avatar/models/chungnyeong-run.glb', clip: 0 }
        },
        rigState: 'animated',
        enabled: true,
        verified: true,
        validationMode: 'generic',
        capabilities: COMPLETE_MODEL_CAPABILITIES
    },
    {
        id: 'toy-rounded',
        label: '둥근 토이 친구',
        description: '검증된 안정 버전 토이 아바타',
        path: AVATAR_FALLBACK_PATH,
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/shared-models/cheerful-characters.jpg',
        previewPosition: '33.333% 0%',
        previewSize: '400% 200%',
        scale: [1, 1, 1],
        mapScale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: 0,
        rigState: 'animated',
        enabled: false,
        verified: true,
        validationMode: 'stable',
        capabilities: STABLE_CAPABILITIES
    },
    {
        id: 'toy-rounded-v3',
        label: '둥근 토이 친구 v3',
        description: 'Blender 제작 모델 검수 후 공개',
        path: '/assets/avatar/models/toy-rounded-v3.glb',
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/shared-models/cheerful-characters.jpg',
        previewPosition: '33.333% 0%',
        previewSize: '400% 200%',
        scale: [1, 1, 1],
        mapScale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: 0,
        rigState: 'animated',
        enabled: false,
        verified: false,
        validationMode: 'strict',
        capabilities: V3_CAPABILITIES
    },
    {
        id: 'toy-active-v3',
        label: '액티브 토이 친구 v3',
        description: 'Blender 제작 모델 검수 후 공개',
        path: '/assets/avatar/models/toy-active-v3.glb',
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/shared-models/colorful-characters.jpg',
        previewPosition: '66.667% 100%',
        previewSize: '400% 200%',
        scale: [1, 1, 1],
        mapScale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: 0,
        rigState: 'animated',
        enabled: false,
        verified: false,
        validationMode: 'strict',
        capabilities: V3_CAPABILITIES
    },
    {
        id: 'experimental-active-v2',
        label: '실험용 액티브 v2',
        description: '개발 비교 전용 비공개 모델',
        path: '/assets/avatar/experimental/toy-avatar-v2-active.glb',
        fallbackPath: AVATAR_FALLBACK_PATH,
        previewImage: '/assets/avatar/shared-models/colorful-characters.jpg',
        previewPosition: '66.667% 100%',
        previewSize: '400% 200%',
        scale: [1, 1, 1],
        mapScale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        frontRotationY: 0,
        rigState: 'animated',
        enabled: ENABLE_EXPERIMENTAL_AVATAR,
        verified: false,
        experimental: true,
        validationMode: 'stable',
        capabilities: V3_CAPABILITIES
    }
];

export const AVATAR_PARTS = {
    face: { smile: ['Face_Smile'], bright: ['Face_Bright'], calm: ['Face_Calm'], surprised: ['Face_Surprised'] },
    hair: { short: ['Hair_Short'], parted: ['Hair_Parted'], bob: ['Hair_Bob'], curly: ['Hair_Curly'], ponytail: ['Hair_Ponytail'] },
    top: {
        tshirt: ['Top_Tshirt', 'Top_Tshirt_Torso', 'Top_Tshirt_LeftSleeve', 'Top_Tshirt_RightSleeve'],
        sweatshirt: ['Top_Sweatshirt', 'Top_Sweatshirt_Details'],
        hoodie: ['Top_Hoodie', 'Top_Hoodie_Details', 'Top_Hoodie_Torso', 'Top_Hoodie_Pocket', 'Top_Hoodie_LeftSleeve', 'Top_Hoodie_RightSleeve'],
        jacket: ['Top_Jacket', 'Top_Jacket_Details', 'Top_Jacket_Torso', 'Top_Jacket_LapelLeft', 'Top_Jacket_LapelRight', 'Top_Jacket_LeftSleeve', 'Top_Jacket_RightSleeve']
    },
    bottom: {
        pants: ['Bottom_Pants', 'Bottom_Pants_LeftUpper', 'Bottom_Pants_LeftLower', 'Bottom_Pants_RightUpper', 'Bottom_Pants_RightLower'],
        shorts: ['Bottom_Shorts', 'Bottom_Shorts_Left', 'Bottom_Shorts_Right', 'Body_LeftLowerLeg', 'Body_RightLowerLeg'],
        joggers: ['Bottom_Joggers', 'Bottom_Joggers_LeftUpper', 'Bottom_Joggers_LeftLower', 'Bottom_Joggers_RightUpper', 'Bottom_Joggers_RightLower']
    },
    shoes: {
        sneakers: ['Shoes_Sneakers_Left', 'Shoes_Sneakers_Right'],
        hightop: ['Shoes_HighTop_Left', 'Shoes_HighTop_Right'],
        boots: ['Shoes_Boots_Left', 'Shoes_Boots_Right', 'Shoes_Boots_LeftCuff', 'Shoes_Boots_RightCuff']
    },
    accessory: {
        glasses: ['Accessory_Glasses'], flower: ['Accessory_Flower'], headphones: ['Accessory_Headphones'],
        hat: ['Accessory_Hat'], backpack: ['Accessory_Backpack'], beard: ['Accessory_Beard']
    }
} as const;

export const AVATAR_MATERIAL_NAMES = {
    skin: 'SkinMaterial', hair: 'HairMaterial', top: 'TopMaterial', bottom: 'BottomMaterial',
    shoes: 'ShoesMaterial', accessory: 'AccessoryMaterial'
} as const;

export function getEnabledAvatarModels(): AvatarBaseModelAsset[] {
    return AVATAR_BASE_MODELS.filter((model) => model.enabled && (model.verified || model.experimental));
}

export function getAvatarBaseModel(id: string): AvatarBaseModelAsset {
    const available = getEnabledAvatarModels();
    return available.find((model) => model.id === id) || available[0] || AVATAR_BASE_MODELS[0];
}

export function getAvatarFallbackModel(): AvatarBaseModelAsset {
    return AVATAR_BASE_MODELS.find((model) => model.id === AVATAR_FALLBACK_MODEL_ID) || AVATAR_BASE_MODELS[0];
}

export function constrainAvatarCustomization(value: AvatarCustomization): AvatarCustomization {
    const model = getAvatarBaseModel(value.baseModelId);
    const supported = model.capabilities;
    return {
        ...value,
        baseModelId: model.id,
        faceId: supported.faces.includes(value.faceId) ? value.faceId : 'smile',
        hairStyleId: supported.hairStyles.includes(value.hairStyleId) ? value.hairStyleId : 'short',
        topId: supported.tops.includes(value.topId) ? value.topId : 'hoodie',
        bottomId: supported.bottoms.includes(value.bottomId) ? value.bottomId : 'pants',
        shoesId: supported.shoes.includes(value.shoesId) ? value.shoesId : 'sneakers',
        accessoryIds: value.accessoryIds.filter((id) => supported.accessories.includes(id)).slice(0, 1)
    };
}

export function getAvatarModelPath(customization: AvatarCustomization): string {
    return getAvatarBaseModel(customization.baseModelId).path;
}

export function getAvatarFallbackPath(customization: AvatarCustomization): string {
    return getAvatarBaseModel(customization.baseModelId).fallbackPath;
}
