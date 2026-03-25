import type { NarrativeAssetDefinition, NarrativeAssetKind } from '@engine/types/narrative';

import { chapter1AssetRegistry } from '@content/chapters/chapter-1/assets';

export const narrativeAssetRegistry: Record<string, NarrativeAssetDefinition> = {
  ...chapter1AssetRegistry,
};

export function hasNarrativeAsset(assetId: string) {
  return assetId in narrativeAssetRegistry;
}

export function hasNarrativeAssetOfKind(assetId: string, kind: NarrativeAssetKind) {
  return narrativeAssetRegistry[assetId]?.kind === kind || matchesNarrativeAssetConvention(assetId, kind);
}

function matchesNarrativeAssetConvention(assetId: string, kind: NarrativeAssetKind) {
  switch (kind) {
    case 'background':
      return /^chapter-1\/backgrounds\/.+(\.(webp|png|jpg|jpeg))?$/.test(assetId);
    case 'portrait':
      return /^chapter-1\/portraits\/[^/]+\/.+(\.(webp|png|jpg|jpeg))?$/.test(assetId);
    case 'cg':
      return /^chapter-1\/cg\/.+(\.(webp|png|jpg|jpeg))?$/.test(assetId);
    case 'overlay':
      return /^chapter-1\/overlays\/.+(\.(webp|png|jpg|jpeg))?$/.test(assetId);
    case 'map':
      return /^chapter-1\/maps\/.+(\.(webp|png|jpg|jpeg))?$/.test(assetId);
    case 'music':
      return /^theme_[a-z0-9_]+$/.test(assetId) || /^chapter-1\/music\/.+(\.(ogg|mp3|wav))?$/.test(assetId);
    case 'sfx':
      return /^[a-z0-9_]+$/.test(assetId) || /^chapter-1\/sfx\/.+(\.(ogg|mp3|wav))?$/.test(assetId);
  }
}
