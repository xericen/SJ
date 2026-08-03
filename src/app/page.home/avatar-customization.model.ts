export interface AvatarCustomization {
    baseModelId: string;
    faceId: string;
    hairStyleId: string;
    hairColor: string;
    skinColor: string;
    topId: string;
    topColor: string;
    bottomId: string;
    bottomColor: string;
    shoesId: string;
    shoesColor: string;
    accessoryIds: string[];
}

export const DEFAULT_AVATAR_CUSTOMIZATION: AvatarCustomization = {
    baseModelId: 'cozy-beaver',
    faceId: 'smile',
    hairStyleId: 'short',
    hairColor: '#2e302f',
    skinColor: '#e9b995',
    topId: 'hoodie',
    topColor: '#237a61',
    bottomId: 'pants',
    bottomColor: '#31594e',
    shoesId: 'sneakers',
    shoesColor: '#f7f7f3',
    accessoryIds: []
};

const LEGACY_COLORS: Record<string, string> = {
    light: '#f7d8c3',
    warm: '#e9b995',
    deep: '#a96f50',
    black: '#2e302f',
    brown: '#6e4937',
    chestnut: '#9a5c3f',
    green: '#237a61',
    blue: '#4c80b2',
    coral: '#d77762',
    white: '#f7f7f3',
    yellow: '#e7bd4d',
    navy: '#29435d'
};

const HAIR_IDS = new Set(['short', 'parted', 'bob', 'curly', 'ponytail']);
const FACE_IDS = new Set(['smile', 'bright', 'calm', 'surprised']);
const TOP_IDS = new Set(['hoodie', 'tshirt', 'sweatshirt', 'jacket']);
const BOTTOM_IDS = new Set(['pants', 'shorts', 'joggers']);
const SHOES_IDS = new Set(['sneakers', 'hightop', 'boots']);
const BASE_IDS = new Set(['cozy-beaver', 'chungnyeong', 'toy-rounded', 'toy-rounded-v3', 'toy-active-v3', 'experimental-active-v2']);
const ACCESSORY_IDS = new Set(['glasses', 'flower', 'headphones', 'hat', 'backpack', 'beard']);

function color(value: unknown, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
    return LEGACY_COLORS[value] || fallback;
}

function valueFrom(set: Set<string>, value: unknown, fallback: string): string {
    return typeof value === 'string' && set.has(value) ? value : fallback;
}

export function normalizeAvatarCustomization(value: unknown): AvatarCustomization {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const legacyOutfit = typeof source.outfit === 'string' ? source.outfit : 'green';
    const topId = valueFrom(TOP_IDS, source.topId, legacyOutfit === 'blue' ? 'tshirt' : legacyOutfit === 'coral' ? 'jacket' : 'hoodie');
    const bottomId = valueFrom(BOTTOM_IDS, source.bottomId, legacyOutfit === 'blue' ? 'shorts' : legacyOutfit === 'coral' ? 'joggers' : 'pants');
    const legacyAccessory = typeof source.accessory === 'string' && source.accessory !== 'none'
        ? [source.accessory]
        : [];
    const accessories = Array.isArray(source.accessoryIds) ? source.accessoryIds : legacyAccessory;

    return {
        baseModelId: valueFrom(
            BASE_IDS,
            source.baseModelId,
            DEFAULT_AVATAR_CUSTOMIZATION.baseModelId
        ),
        faceId: valueFrom(FACE_IDS, source.faceId, DEFAULT_AVATAR_CUSTOMIZATION.faceId),
        hairStyleId: valueFrom(
            HAIR_IDS,
            source.hairStyleId,
            source.hair === 'bob' ? 'parted' : valueFrom(HAIR_IDS, source.hair, DEFAULT_AVATAR_CUSTOMIZATION.hairStyleId)
        ),
        hairColor: color(source.hairColor, DEFAULT_AVATAR_CUSTOMIZATION.hairColor),
        skinColor: color(source.skinColor || source.skin, DEFAULT_AVATAR_CUSTOMIZATION.skinColor),
        topId,
        topColor: color(source.topColor || source.outfit, DEFAULT_AVATAR_CUSTOMIZATION.topColor),
        bottomId,
        bottomColor: color(
            source.bottomColor,
            legacyOutfit === 'blue' ? '#354f70' : legacyOutfit === 'coral' ? '#80524e' : DEFAULT_AVATAR_CUSTOMIZATION.bottomColor
        ),
        shoesId: valueFrom(SHOES_IDS, source.shoesId, source.shoes === 'navy' ? 'boots' : DEFAULT_AVATAR_CUSTOMIZATION.shoesId),
        shoesColor: color(source.shoesColor || source.shoes, DEFAULT_AVATAR_CUSTOMIZATION.shoesColor),
        accessoryIds: accessories.filter((item): item is string => typeof item === 'string' && ACCESSORY_IDS.has(item)).slice(0, 1)
    };
}

export function cloneAvatarCustomization(value: AvatarCustomization): AvatarCustomization {
    return { ...value, accessoryIds: [...value.accessoryIds] };
}

function pick<T>(items: readonly T[], random: () => number): T {
    return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

export function createRandomAvatarCustomization(random: () => number = Math.random): AvatarCustomization {
    const outfit = pick([
        { topId: 'hoodie', topColor: '#237a61', bottomId: 'pants', bottomColor: '#31594e' },
        { topId: 'tshirt', topColor: '#4c80b2', bottomId: 'shorts', bottomColor: '#354f70' },
        { topId: 'jacket', topColor: '#d77762', bottomId: 'joggers', bottomColor: '#80524e' }
    ], random);
    const shoes = pick([
        { shoesId: 'sneakers', shoesColor: '#f7f7f3' },
        { shoesId: 'sneakers', shoesColor: '#e7bd4d' },
        { shoesId: 'boots', shoesColor: '#29435d' }
    ], random);
    const accessory = pick([[], ['glasses'], ['flower'], ['headphones']] as string[][], random);

    return {
        baseModelId: 'cozy-beaver',
        faceId: pick(['smile', 'bright', 'calm'], random),
        hairStyleId: pick(['short', 'parted', 'curly'], random),
        hairColor: pick(['#2e302f', '#6e4937', '#4a2f2a', '#456f9d', '#39785f', '#c56d8f'], random),
        skinColor: pick(['#f7d8c3', '#e9b995', '#a96f50'], random),
        ...outfit,
        ...shoes,
        accessoryIds: [...accessory]
    };
}
