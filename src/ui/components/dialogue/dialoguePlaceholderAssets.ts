const PORTRAIT_PLACEHOLDER_SOURCE_PATHS = {
  youngWoman: 'src/content/shared/placeholders/portraits/young-woman.jpg',
  oldWoman: 'src/content/shared/placeholders/portraits/old-woman.jpg',
  nobleMan: 'src/content/shared/placeholders/portraits/noble-man.jpg',
  roughMan: 'src/content/shared/placeholders/portraits/rough-man.jpg',
} as const;

const BACKDROP_PLACEHOLDER_SOURCE_PATHS = {
  interiorRoom: 'src/content/shared/placeholders/backgrounds/interior-room.jpg',
  prisonCell: 'src/content/shared/placeholders/backgrounds/prison-cell.jpg',
  cityGates: 'src/content/shared/placeholders/backgrounds/city-gates.jpg',
} as const;

const OLDER_WOMAN_IDS = new Set([
  'mother',
  'grandmother',
  'lady-sera',
]);

const YOUNGER_WOMAN_IDS = new Set([
  'servant_girl',
  'tanya',
  'servant-lyna',
  'marna-voss',
  'tessa-grey',
  'scarred-woman',
  'orma',
  'liena',
  'nadra',
  'sivra',
]);

const ROUGH_MAN_IDS = new Set([
  'old-prisoner',
  'orc-raider',
  'grom',
  'khazruk',
  'krivozub',
  'ner-azet',
]);

const ARMORED_OR_HARD_MAN_IDS = new Set([
  'aren',
  'father',
  'lord-guy',
  'edran',
  'guard',
  'sir-raust',
  'kael',
  'yarva',
  'rashek',
  'salver',
  'tris',
  'galen',
  'derun',
]);

function includesAny(value: string, parts: string[]) {
  return parts.some((part) => value.includes(part));
}

export function resolveDialoguePortraitPlaceholderSourcePath(speakerId: string) {
  if (OLDER_WOMAN_IDS.has(speakerId) || includesAny(speakerId, ['mother', 'grandmother', 'lady'])) {
    return PORTRAIT_PLACEHOLDER_SOURCE_PATHS.oldWoman;
  }

  if (
    YOUNGER_WOMAN_IDS.has(speakerId) ||
    includesAny(speakerId, ['woman', 'girl', 'servant', 'liena', 'nadra', 'sivra', 'yarva'])
  ) {
    return PORTRAIT_PLACEHOLDER_SOURCE_PATHS.youngWoman;
  }

  if (
    ROUGH_MAN_IDS.has(speakerId) ||
    includesAny(speakerId, ['orc', 'raider', 'prisoner', 'scar', 'khaz', 'krivo', 'grom'])
  ) {
    return PORTRAIT_PLACEHOLDER_SOURCE_PATHS.roughMan;
  }

  if (
    ARMORED_OR_HARD_MAN_IDS.has(speakerId) ||
    includesAny(speakerId, ['guard', 'lord', 'sir', 'edran', 'galen', 'rashek'])
  ) {
    return PORTRAIT_PLACEHOLDER_SOURCE_PATHS.nobleMan;
  }

  return PORTRAIT_PLACEHOLDER_SOURCE_PATHS.nobleMan;
}

export function resolveDialogueBackdropPlaceholderSourcePath(assetId: string | null) {
  if (!assetId) {
    return null;
  }

  const normalizedAssetId = assetId.toLowerCase();

  if (includesAny(normalizedAssetId, ['cell', 'prison', 'dungeon', 'gaol'])) {
    return BACKDROP_PLACEHOLDER_SOURCE_PATHS.prisonCell;
  }

  if (includesAny(normalizedAssetId, ['gate', 'wall', 'roadside'])) {
    return BACKDROP_PLACEHOLDER_SOURCE_PATHS.cityGates;
  }

  if (includesAny(normalizedAssetId, ['room', 'hall', 'chamber', 'manor', 'house'])) {
    return BACKDROP_PLACEHOLDER_SOURCE_PATHS.interiorRoom;
  }

  return null;
}
