import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { NarrativeCharacterOutfitDefinition } from '@engine/types/narrative';

export class NarrativeAppearanceStore {
  readonly rootStore: GameRootStore;

  outfitOverridesByCharacterId: Record<string, string> = {};

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  getCurrentOutfitId(characterId: string) {
    return (
      this.outfitOverridesByCharacterId[characterId] ??
      this.rootStore.getNarrativeCharacterById(characterId)?.defaultOutfitId ??
      null
    );
  }

  getCurrentOutfit(characterId: string): NarrativeCharacterOutfitDefinition | null {
    const outfitId = this.getCurrentOutfitId(characterId);

    if (!outfitId) {
      return null;
    }

    return this.rootStore.getNarrativeCharacterById(characterId)?.outfits?.[outfitId] ?? null;
  }

  setCharacterOutfit(characterId: string, outfitId: string) {
    this.outfitOverridesByCharacterId = {
      ...this.outfitOverridesByCharacterId,
      [characterId]: outfitId,
    };
  }

  reset() {
    this.outfitOverridesByCharacterId = {};
  }
}
