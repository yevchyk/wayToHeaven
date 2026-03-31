export type CharacterCompositeKind = 'npc' | 'heroine';

export type CharacterCompositeLayerId =
  | 'body'
  | 'clothes'
  | 'head'
  | 'hair'
  | 'leftHand'
  | 'weapon'
  | 'rightHand';

export type WeaponPosePresetId = 'pose-1' | 'pose-2' | 'pose-3';

export interface CharacterCompositeStagePoint {
  x: number;
  y: number;
}

export interface CharacterCompositeStageSize {
  width: number;
  height: number;
}

export interface CharacterCompositeStageRect
  extends CharacterCompositeStagePoint,
    CharacterCompositeStageSize {}

export interface CharacterCompositeAssetAnchor {
  x: number;
  y: number;
}

export interface CharacterCompositeAssetAnchorPatch {
  x?: number;
  y?: number;
}

export interface CharacterCompositePlacementSize {
  width: number;
  height?: number;
}

export interface CharacterCompositePlacementSizePatch {
  width?: number;
  height?: number;
}

export interface CharacterCompositePlacement {
  anchor: CharacterCompositeStagePoint;
  size: CharacterCompositePlacementSize;
  assetAnchor?: CharacterCompositeAssetAnchor;
  scale?: number;
  rotate?: number;
  opacity?: number;
  z?: number;
}

export interface CharacterCompositePlacementPatch {
  anchor?: Partial<CharacterCompositeStagePoint>;
  size?: CharacterCompositePlacementSizePatch;
  assetAnchor?: CharacterCompositeAssetAnchorPatch;
  scale?: number;
  rotate?: number;
  opacity?: number;
  z?: number;
}

export interface NormalizedCharacterCompositePlacement {
  anchor: CharacterCompositeStagePoint;
  size: CharacterCompositePlacementSize;
  assetAnchor: CharacterCompositeAssetAnchor;
  scale: number;
  rotate: number;
  opacity: number;
  z: number;
}

export interface CharacterCompositeStageDefinition extends CharacterCompositeStageSize {
  safeArea?: CharacterCompositeStageRect;
}

export interface NormalizedCharacterCompositeStage extends CharacterCompositeStageDefinition {
  safeArea: CharacterCompositeStageRect;
  aspectRatio: number;
}

export interface CharacterCompositeAssetDefinition {
  assetId: string;
  label?: string;
  sourcePath?: string;
  placement?: CharacterCompositePlacementPatch;
}

export interface CharacterCompositeHandsDefinition {
  left: CharacterCompositeAssetDefinition;
  right: CharacterCompositeAssetDefinition;
}

export interface CharacterCompositeWeaponPosePlacements {
  leftHand?: CharacterCompositePlacementPatch;
  weapon?: CharacterCompositePlacementPatch;
  rightHand?: CharacterCompositePlacementPatch;
}

export interface CharacterCompositeLayerPlacements {
  body?: CharacterCompositePlacementPatch;
  clothes?: CharacterCompositePlacementPatch;
  head?: CharacterCompositePlacementPatch;
  hair?: CharacterCompositePlacementPatch;
  leftHand?: CharacterCompositePlacementPatch;
  weapon?: CharacterCompositePlacementPatch;
  rightHand?: CharacterCompositePlacementPatch;
}

export interface CharacterCompositeDefinition {
  id: string;
  chapterId: string;
  displayName: string;
  kind: CharacterCompositeKind;
  stage: CharacterCompositeStageDefinition;
  defaultEmotion?: string;
  defaultWeaponPosePreset?: WeaponPosePresetId;
  assets: {
    body: CharacterCompositeAssetDefinition;
    clothes?: CharacterCompositeAssetDefinition;
    headByEmotion?: Partial<Record<string, CharacterCompositeAssetDefinition>>;
    hair?: CharacterCompositeAssetDefinition;
    hands?: CharacterCompositeHandsDefinition;
    weapon?: CharacterCompositeAssetDefinition;
  };
  placements?: CharacterCompositeLayerPlacements;
  weaponPosePresets?: Partial<Record<WeaponPosePresetId, CharacterCompositeWeaponPosePlacements>>;
}

export interface CharacterCompositeLayer {
  id: CharacterCompositeLayerId;
  assetId: string;
  label: string;
  sourcePath?: string;
  placement: NormalizedCharacterCompositePlacement;
  source: 'base' | 'emotion' | 'heroine-hands' | 'weapon';
  emotion?: string;
}

export interface CharacterCompositeBuildOptions {
  emotion?: string | null;
  weaponPosePreset?: WeaponPosePresetId | null;
}

export interface CharacterCompositeBuildResult {
  stage: NormalizedCharacterCompositeStage;
  selectedEmotion: string | null;
  selectedWeaponPosePreset: WeaponPosePresetId | null;
  layers: CharacterCompositeLayer[];
}
