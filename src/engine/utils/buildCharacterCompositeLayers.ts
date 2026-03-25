import type {
  CharacterCompositeAssetDefinition,
  CharacterCompositeBuildOptions,
  CharacterCompositeDefinition,
  CharacterCompositeLayer,
  CharacterCompositeLayerId,
  CharacterCompositeTransform,
  NormalizedCharacterCompositeTransform,
  WeaponPosePresetId,
} from '@engine/types/characterComposite';

const LAYER_ORDER: CharacterCompositeLayerId[] = [
  'body',
  'clothes',
  'head',
  'hair',
  'leftHand',
  'weapon',
  'rightHand',
];

const DEFAULT_TRANSFORMS: Record<CharacterCompositeLayerId, CharacterCompositeTransform> = {
  body: {
    x: 50,
    y: 60,
    width: 70,
    scale: 1,
    rotate: 0,
    opacity: 1,
    z: 10,
    transformOrigin: 'center top',
  },
  clothes: {
    x: 50,
    y: 60,
    width: 70,
    scale: 1,
    rotate: 0,
    opacity: 1,
    z: 20,
    transformOrigin: 'center top',
  },
  head: {
    x: 50,
    y: 18,
    width: 28,
    scale: 1,
    rotate: 0,
    opacity: 1,
    z: 30,
    transformOrigin: 'center top',
  },
  hair: {
    x: 50,
    y: 15,
    width: 36,
    scale: 1,
    rotate: 0,
    opacity: 1,
    z: 40,
    transformOrigin: 'center top',
  },
  leftHand: {
    x: 36,
    y: 61,
    width: 18,
    scale: 1,
    rotate: -8,
    opacity: 1,
    z: 50,
    transformOrigin: 'center top',
  },
  weapon: {
    x: 60,
    y: 55,
    width: 22,
    scale: 1,
    rotate: -6,
    opacity: 1,
    z: 60,
    transformOrigin: 'center top',
  },
  rightHand: {
    x: 66,
    y: 60,
    width: 18,
    scale: 1,
    rotate: 10,
    opacity: 1,
    z: 70,
    transformOrigin: 'center top',
  },
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeTransform(
  layerId: CharacterCompositeLayerId,
  ...overrides: Array<CharacterCompositeTransform | undefined>
): NormalizedCharacterCompositeTransform {
  const merged = overrides.reduce<CharacterCompositeTransform>(
    (result, transform) => ({ ...result, ...transform }),
    DEFAULT_TRANSFORMS[layerId],
  );
  const normalized: NormalizedCharacterCompositeTransform = {
    x: merged.x ?? DEFAULT_TRANSFORMS[layerId].x ?? 50,
    y: merged.y ?? DEFAULT_TRANSFORMS[layerId].y ?? 50,
    width: merged.width ?? DEFAULT_TRANSFORMS[layerId].width ?? 100,
    scale: merged.scale ?? DEFAULT_TRANSFORMS[layerId].scale ?? 1,
    rotate: merged.rotate ?? DEFAULT_TRANSFORMS[layerId].rotate ?? 0,
    opacity: merged.opacity ?? DEFAULT_TRANSFORMS[layerId].opacity ?? 1,
    z: merged.z ?? DEFAULT_TRANSFORMS[layerId].z ?? 0,
    transformOrigin:
      merged.transformOrigin ?? DEFAULT_TRANSFORMS[layerId].transformOrigin ?? 'center center',
  };

  if (merged.height !== undefined) {
    normalized.height = merged.height;
  }

  return normalized;
}

function buildLayer(
  layerId: CharacterCompositeLayerId,
  source: CharacterCompositeLayer['source'],
  character: CharacterCompositeDefinition,
  asset: CharacterCompositeAssetDefinition | null | undefined,
  emotion: string | null,
  poseOverrides?: CharacterCompositeTransform,
): CharacterCompositeLayer | null {
  if (!asset?.assetId) {
    return null;
  }

  return {
    id: layerId,
    assetId: asset.assetId,
    ...(asset.sourcePath ? { sourcePath: asset.sourcePath } : {}),
    label: asset.label ?? `${character.displayName} ${layerId}`,
    source,
    ...(emotion ? { emotion } : {}),
    transform: normalizeTransform(
      layerId,
      character.transforms?.[layerId],
      asset.transform,
      poseOverrides,
    ),
  };
}

function resolveEmotion(character: CharacterCompositeDefinition, preferredEmotion?: string | null) {
  const availableEmotions = getCharacterCompositeEmotions(character);

  if (preferredEmotion && character.assets.headByEmotion[preferredEmotion]) {
    return preferredEmotion;
  }

  if (character.assets.headByEmotion[character.defaultEmotion]) {
    return character.defaultEmotion;
  }

  return availableEmotions[0] ?? character.defaultEmotion;
}

function resolveWeaponPosePreset(
  character: CharacterCompositeDefinition,
  preferredPreset?: WeaponPosePresetId | null,
) {
  if (preferredPreset && character.weaponPosePresets?.[preferredPreset]) {
    return preferredPreset;
  }

  if (character.defaultWeaponPosePreset && character.weaponPosePresets?.[character.defaultWeaponPosePreset]) {
    return character.defaultWeaponPosePreset;
  }

  const firstPreset = Object.keys(character.weaponPosePresets ?? {})[0];

  return (firstPreset as WeaponPosePresetId | undefined) ?? null;
}

export function getCharacterCompositeEmotions(character: CharacterCompositeDefinition) {
  return uniqueValues([
    character.defaultEmotion,
    ...Object.keys(character.assets.headByEmotion),
  ]).filter(Boolean);
}

export function buildCharacterCompositeLayers(
  character: CharacterCompositeDefinition,
  options: CharacterCompositeBuildOptions = {},
) {
  const selectedEmotion = resolveEmotion(character, options.emotion);
  const selectedWeaponPosePreset = resolveWeaponPosePreset(character, options.weaponPosePreset);
  const poseOverrides = selectedWeaponPosePreset
    ? character.weaponPosePresets?.[selectedWeaponPosePreset]
    : undefined;
  const layers = LAYER_ORDER.flatMap((layerId) => {
    switch (layerId) {
      case 'body': {
        const layer = buildLayer(layerId, 'base', character, character.assets.body, null);

        return layer ? [layer] : [];
      }
      case 'clothes': {
        const layer = buildLayer(layerId, 'base', character, character.assets.clothes, null);

        return layer ? [layer] : [];
      }
      case 'head': {
        const layer = buildLayer(
          layerId,
          'emotion',
          character,
          character.assets.headByEmotion[selectedEmotion],
          selectedEmotion,
        );

        return layer ? [layer] : [];
      }
      case 'hair': {
        const layer = buildLayer(layerId, 'base', character, character.assets.hair, null);

        return layer ? [layer] : [];
      }
      case 'leftHand': {
        const layer = buildLayer(
          layerId,
          'heroine-hands',
          character,
          character.assets.hands?.left,
          null,
          poseOverrides?.leftHand,
        );

        return layer ? [layer] : [];
      }
      case 'weapon': {
        const layer = buildLayer(
          layerId,
          'weapon',
          character,
          character.assets.weapon,
          null,
          poseOverrides?.weapon,
        );

        return layer ? [layer] : [];
      }
      case 'rightHand': {
        const layer = buildLayer(
          layerId,
          'heroine-hands',
          character,
          character.assets.hands?.right,
          null,
          poseOverrides?.rightHand,
        );

        return layer ? [layer] : [];
      }
      default:
        return [];
    }
  });

  return {
    selectedEmotion,
    selectedWeaponPosePreset,
    layers,
  };
}
