import type {
  CharacterCompositeAssetDefinition,
  CharacterCompositeBuildOptions,
  CharacterCompositeBuildResult,
  CharacterCompositeDefinition,
  CharacterCompositeLayer,
  CharacterCompositeLayerId,
  CharacterCompositePlacement,
  CharacterCompositePlacementPatch,
  CharacterCompositeStageDefinition,
  CharacterCompositeStageRect,
  NormalizedCharacterCompositePlacement,
  NormalizedCharacterCompositeStage,
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

const DEFAULT_SAFE_AREA_RATIOS = {
  x: 0.09,
  y: 0.07,
  width: 0.82,
  height: 0.86,
} as const;

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundStageUnit(value: number) {
  return Math.round(value * 1000) / 1000;
}

function createDefaultPlacement(
  stage: CharacterCompositeStageDefinition,
  layerId: CharacterCompositeLayerId,
): CharacterCompositePlacement {
  switch (layerId) {
    case 'body':
      return {
        anchor: { x: stage.width * 0.5, y: stage.height * 0.5 },
        size: { width: stage.width * 0.84 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        opacity: 1,
        z: 10,
      };
    case 'clothes':
      return {
        anchor: { x: stage.width * 0.5, y: stage.height * 0.5 },
        size: { width: stage.width * 0.84 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        opacity: 1,
        z: 20,
      };
    case 'head':
      return {
        anchor: { x: stage.width * 0.5, y: stage.height * 0.18 },
        size: { width: stage.width * 0.28 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        opacity: 1,
        z: 30,
      };
    case 'hair':
      return {
        anchor: { x: stage.width * 0.5, y: stage.height * 0.15 },
        size: { width: stage.width * 0.36 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        opacity: 1,
        z: 40,
      };
    case 'leftHand':
      return {
        anchor: { x: stage.width * 0.36, y: stage.height * 0.61 },
        size: { width: stage.width * 0.18 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: -8,
        opacity: 1,
        z: 50,
      };
    case 'weapon':
      return {
        anchor: { x: stage.width * 0.6, y: stage.height * 0.55 },
        size: { width: stage.width * 0.22 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: -6,
        opacity: 1,
        z: 60,
      };
    case 'rightHand':
      return {
        anchor: { x: stage.width * 0.66, y: stage.height * 0.6 },
        size: { width: stage.width * 0.18 },
        assetAnchor: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 10,
        opacity: 1,
        z: 70,
      };
  }
}

function normalizeSafeArea(stage: CharacterCompositeStageDefinition): CharacterCompositeStageRect {
  const fallbackSafeArea: CharacterCompositeStageRect = {
    x: stage.width * DEFAULT_SAFE_AREA_RATIOS.x,
    y: stage.height * DEFAULT_SAFE_AREA_RATIOS.y,
    width: stage.width * DEFAULT_SAFE_AREA_RATIOS.width,
    height: stage.height * DEFAULT_SAFE_AREA_RATIOS.height,
  };
  const safeArea = stage.safeArea ?? fallbackSafeArea;
  const clampedX = clamp(safeArea.x, 0, stage.width);
  const clampedY = clamp(safeArea.y, 0, stage.height);

  return {
    x: roundStageUnit(clampedX),
    y: roundStageUnit(clampedY),
    width: roundStageUnit(clamp(safeArea.width, 0, stage.width - clampedX)),
    height: roundStageUnit(clamp(safeArea.height, 0, stage.height - clampedY)),
  };
}

export function normalizeCharacterCompositeStage(
  stage: CharacterCompositeStageDefinition,
): NormalizedCharacterCompositeStage {
  return {
    ...stage,
    safeArea: normalizeSafeArea(stage),
    aspectRatio: stage.width / stage.height,
  };
}

function mergePlacementPatch(
  placement: CharacterCompositePlacement,
  patch?: CharacterCompositePlacementPatch,
): CharacterCompositePlacement {
  if (!patch) {
    return placement;
  }

  return {
    anchor: {
      x: patch.anchor?.x ?? placement.anchor.x,
      y: patch.anchor?.y ?? placement.anchor.y,
    },
    size: {
      width: patch.size?.width ?? placement.size.width,
      ...(patch.size?.height !== undefined
        ? { height: patch.size.height }
        : placement.size.height !== undefined
          ? { height: placement.size.height }
          : {}),
    },
    assetAnchor: {
      x: patch.assetAnchor?.x ?? placement.assetAnchor?.x ?? 0.5,
      y: patch.assetAnchor?.y ?? placement.assetAnchor?.y ?? 0.5,
    },
    scale: patch.scale ?? placement.scale ?? 1,
    rotate: patch.rotate ?? placement.rotate ?? 0,
    opacity: patch.opacity ?? placement.opacity ?? 1,
    z: patch.z ?? placement.z ?? 0,
  };
}

function normalizePlacement(
  stage: CharacterCompositeStageDefinition,
  layerId: CharacterCompositeLayerId,
  ...overrides: Array<CharacterCompositePlacementPatch | undefined>
): NormalizedCharacterCompositePlacement {
  const merged = overrides.reduce<CharacterCompositePlacement>(
    (result, patch) => mergePlacementPatch(result, patch),
    createDefaultPlacement(stage, layerId),
  );

  return {
    anchor: merged.anchor,
    size: merged.size,
    assetAnchor: merged.assetAnchor ?? { x: 0.5, y: 0.5 },
    scale: merged.scale ?? 1,
    rotate: merged.rotate ?? 0,
    opacity: merged.opacity ?? 1,
    z: merged.z ?? 0,
  };
}

function buildLayer(
  layerId: CharacterCompositeLayerId,
  source: CharacterCompositeLayer['source'],
  character: CharacterCompositeDefinition,
  asset: CharacterCompositeAssetDefinition | null | undefined,
  emotion: string | null,
  poseOverrides?: CharacterCompositePlacementPatch,
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
    placement: normalizePlacement(
      character.stage,
      layerId,
      character.placements?.[layerId],
      asset.placement,
      poseOverrides,
    ),
  };
}

function resolveEmotion(character: CharacterCompositeDefinition, preferredEmotion?: string | null) {
  const headByEmotion = character.assets.headByEmotion ?? {};
  const availableEmotions = getCharacterCompositeEmotions(character);

  if (preferredEmotion && headByEmotion[preferredEmotion]) {
    return preferredEmotion;
  }

  if (character.defaultEmotion && headByEmotion[character.defaultEmotion]) {
    return character.defaultEmotion;
  }

  return availableEmotions[0] ?? null;
}

function resolveWeaponPosePreset(
  character: CharacterCompositeDefinition,
  preferredPreset?: WeaponPosePresetId | null,
) {
  if (preferredPreset && character.weaponPosePresets?.[preferredPreset]) {
    return preferredPreset;
  }

  if (
    character.defaultWeaponPosePreset &&
    character.weaponPosePresets?.[character.defaultWeaponPosePreset]
  ) {
    return character.defaultWeaponPosePreset;
  }

  const firstPreset = Object.keys(character.weaponPosePresets ?? {})[0];

  return (firstPreset as WeaponPosePresetId | undefined) ?? null;
}

export function getCharacterCompositeEmotions(character: CharacterCompositeDefinition) {
  return uniqueValues([
    ...(character.defaultEmotion ? [character.defaultEmotion] : []),
    ...Object.keys(character.assets.headByEmotion ?? {}),
  ]).filter(Boolean);
}

export function buildCharacterCompositeLayers(
  character: CharacterCompositeDefinition,
  options: CharacterCompositeBuildOptions = {},
): CharacterCompositeBuildResult {
  const stage = normalizeCharacterCompositeStage(character.stage);
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
        const headAsset = selectedEmotion
          ? character.assets.headByEmotion?.[selectedEmotion]
          : undefined;
        const layer = buildLayer(
          layerId,
          'emotion',
          character,
          headAsset,
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
    stage,
    selectedEmotion,
    selectedWeaponPosePreset,
    layers,
  };
}
