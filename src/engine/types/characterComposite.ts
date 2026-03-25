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

export interface CharacterCompositeTransform {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  z?: number;
  transformOrigin?: string;
}

export interface NormalizedCharacterCompositeTransform {
  x: number;
  y: number;
  width: number;
  scale: number;
  rotate: number;
  opacity: number;
  z: number;
  transformOrigin: string;
  height?: number;
}

export interface CharacterCompositeAssetDefinition {
  assetId: string;
  label?: string;
  sourcePath?: string;
  transform?: CharacterCompositeTransform;
}

export interface CharacterCompositeHandsDefinition {
  left: CharacterCompositeAssetDefinition;
  right: CharacterCompositeAssetDefinition;
}

export interface CharacterCompositeWeaponPoseTransforms {
  leftHand?: CharacterCompositeTransform;
  weapon?: CharacterCompositeTransform;
  rightHand?: CharacterCompositeTransform;
}

export interface CharacterCompositeLayerTransforms {
  body?: CharacterCompositeTransform;
  clothes?: CharacterCompositeTransform;
  head?: CharacterCompositeTransform;
  hair?: CharacterCompositeTransform;
  leftHand?: CharacterCompositeTransform;
  weapon?: CharacterCompositeTransform;
  rightHand?: CharacterCompositeTransform;
}

export interface CharacterCompositeDefinition {
  id: string;
  chapterId: string;
  displayName: string;
  kind: CharacterCompositeKind;
  defaultEmotion: string;
  defaultWeaponPosePreset?: WeaponPosePresetId;
  assets: {
    body: CharacterCompositeAssetDefinition;
    clothes?: CharacterCompositeAssetDefinition;
    headByEmotion: Record<string, CharacterCompositeAssetDefinition>;
    hair?: CharacterCompositeAssetDefinition;
    hands?: CharacterCompositeHandsDefinition;
    weapon?: CharacterCompositeAssetDefinition;
  };
  transforms?: CharacterCompositeLayerTransforms;
  weaponPosePresets?: Partial<Record<WeaponPosePresetId, CharacterCompositeWeaponPoseTransforms>>;
}

export interface CharacterCompositeLayer {
  id: CharacterCompositeLayerId;
  assetId: string;
  label: string;
  sourcePath?: string;
  transform: NormalizedCharacterCompositeTransform;
  source: 'base' | 'emotion' | 'heroine-hands' | 'weapon';
  emotion?: string;
}

export interface CharacterCompositeBuildOptions {
  emotion?: string | null;
  weaponPosePreset?: WeaponPosePresetId | null;
}
