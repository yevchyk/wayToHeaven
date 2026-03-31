import type {
  CharacterCompositeStageRect,
  NormalizedCharacterCompositePlacement,
  NormalizedCharacterCompositeStage,
} from '@engine/types/characterComposite';

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export function buildCharacterCompositeRectSx(
  stage: NormalizedCharacterCompositeStage,
  rect: CharacterCompositeStageRect,
) {
  return {
    left: toPercent(rect.x, stage.width),
    top: toPercent(rect.y, stage.height),
    width: toPercent(rect.width, stage.width),
    height: toPercent(rect.height, stage.height),
  } as const;
}

export function buildCharacterCompositeLayerSx(
  stage: NormalizedCharacterCompositeStage,
  placement: NormalizedCharacterCompositePlacement,
) {
  return {
    position: 'absolute',
    left: toPercent(placement.anchor.x, stage.width),
    top: toPercent(placement.anchor.y, stage.height),
    width: toPercent(placement.size.width, stage.width),
    ...(placement.size.height !== undefined
      ? { height: toPercent(placement.size.height, stage.height) }
      : {}),
    transform: `translate(-${placement.assetAnchor.x * 100}%, -${placement.assetAnchor.y * 100}%) scale(${placement.scale}) rotate(${placement.rotate}deg)`,
    transformOrigin: `${placement.assetAnchor.x * 100}% ${placement.assetAnchor.y * 100}%`,
    opacity: placement.opacity,
    zIndex: placement.z,
    pointerEvents: 'none',
  } as const;
}
