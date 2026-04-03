import type { NarrativeAssetDefinition, NarrativeAssetKind } from '@engine/types/narrative';

import { chapter1AssetRegistry } from '@content/chapters/chapter-1/assets';
import { chapter2AssetRegistry } from '@content/chapters/chapter-2/assets';

export const narrativeAssetRegistry: Record<string, NarrativeAssetDefinition> = {
  ...chapter1AssetRegistry,
  ...chapter2AssetRegistry,
};

export function hasNarrativeAsset(assetId: string) {
  return assetId in narrativeAssetRegistry;
}

export function hasNarrativeAssetOfKind(assetId: string, kind: NarrativeAssetKind) {
  return narrativeAssetRegistry[assetId]?.kind === kind || matchesNarrativeAssetConvention(assetId, kind);
}

function matchesNarrativeAssetConvention(assetId: string, kind: NarrativeAssetKind) {
  const chapterPrefix = '(chapter-[0-9]+|prologue)';

  switch (kind) {
    case 'background':
      return new RegExp(`^${chapterPrefix}\\/backgrounds\\/.+(\\.(webp|png|jpg|jpeg))?$`).test(assetId);
    case 'portrait':
      return new RegExp(`^${chapterPrefix}\\/portraits\\/[^/]+\\/.+(\\.(webp|png|jpg|jpeg))?$`).test(assetId);
    case 'cg':
      return new RegExp(`^${chapterPrefix}\\/cg\\/.+(\\.(webp|png|jpg|jpeg))?$`).test(assetId);
    case 'overlay':
      return new RegExp(`^${chapterPrefix}\\/overlays\\/.+(\\.(webp|png|jpg|jpeg))?$`).test(assetId);
    case 'map':
      return new RegExp(`^${chapterPrefix}\\/maps\\/.+(\\.(webp|png|jpg|jpeg))?$`).test(assetId);
    case 'music':
      return (
        /^theme_[a-z0-9_]+$/.test(assetId) ||
        new RegExp(`^${chapterPrefix}\\/music\\/.+(\\.(ogg|mp3|wav))?$`).test(assetId)
      );
    case 'sfx':
      return (
        /^[a-z0-9_]+$/.test(assetId) ||
        new RegExp(`^${chapterPrefix}\\/sfx\\/.+(\\.(ogg|mp3|wav))?$`).test(assetId)
      );
  }
}
