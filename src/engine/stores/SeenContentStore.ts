import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { loadJsonFromStorage, saveJsonToStorage } from '@engine/systems/storage/browserStorage';
import type { SeenContentSnapshot } from '@engine/types/save';

const SEEN_CONTENT_STORAGE_KEY = 'wey-to-heaven/seen-content/v1';

function buildNodeKey(flowId: string, nodeId: string) {
  return `${flowId}:${nodeId}`;
}

function normalizeSeenContentSnapshot(
  snapshot: Partial<SeenContentSnapshot> | null | undefined,
): SeenContentSnapshot {
  return {
    sceneFlowIds: [...new Set(snapshot?.sceneFlowIds ?? [])],
    nodeKeys: [...new Set(snapshot?.nodeKeys ?? [])],
    discoveredCharacterIds: [...new Set(snapshot?.discoveredCharacterIds ?? [])],
    discoveredLocationEntryIds: [...new Set(snapshot?.discoveredLocationEntryIds ?? [])],
  };
}

export class SeenContentStore {
  readonly rootStore: GameRootStore;

  sceneFlowIds: string[] = [];
  nodeKeys: string[] = [];
  discoveredCharacterIds: string[] = [];
  discoveredLocationEntryIds: string[] = [];

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    const snapshot = loadJsonFromStorage<Partial<SeenContentSnapshot>>(SEEN_CONTENT_STORAGE_KEY, {
      sceneFlowIds: [],
      nodeKeys: [],
      discoveredCharacterIds: [],
      discoveredLocationEntryIds: [],
    });

    const normalizedSnapshot = normalizeSeenContentSnapshot(snapshot);

    this.sceneFlowIds = normalizedSnapshot.sceneFlowIds;
    this.nodeKeys = normalizedSnapshot.nodeKeys;
    this.discoveredCharacterIds = normalizedSnapshot.discoveredCharacterIds;
    this.discoveredLocationEntryIds = normalizedSnapshot.discoveredLocationEntryIds;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  hasSeenFlow(flowId: string | null) {
    if (!flowId) {
      return false;
    }

    return this.sceneFlowIds.includes(flowId);
  }

  get snapshot(): SeenContentSnapshot {
    return {
      sceneFlowIds: [...this.sceneFlowIds],
      nodeKeys: [...this.nodeKeys],
      discoveredCharacterIds: [...this.discoveredCharacterIds],
      discoveredLocationEntryIds: [...this.discoveredLocationEntryIds],
    };
  }

  hasSeenNode(flowId: string | null, nodeId: string | null) {
    if (!flowId || !nodeId) {
      return false;
    }

    return this.nodeKeys.includes(buildNodeKey(flowId, nodeId));
  }

  markFlowSeen(flowId: string | null) {
    if (!flowId || this.sceneFlowIds.includes(flowId)) {
      return;
    }

    this.sceneFlowIds = [...this.sceneFlowIds, flowId];
    this.persist();
  }

  markNodeSeen(flowId: string | null, nodeId: string | null) {
    if (!flowId || !nodeId) {
      return;
    }

    const nodeKey = buildNodeKey(flowId, nodeId);

    if (this.nodeKeys.includes(nodeKey)) {
      return;
    }

    this.nodeKeys = [...this.nodeKeys, nodeKey];
    this.persist();
  }

  hasDiscoveredCharacter(characterId: string | null) {
    if (!characterId) {
      return false;
    }

    return this.discoveredCharacterIds.includes(characterId);
  }

  markCharacterDiscovered(characterId: string | null) {
    if (!characterId || this.discoveredCharacterIds.includes(characterId)) {
      return;
    }

    this.discoveredCharacterIds = [...this.discoveredCharacterIds, characterId];
    this.persist();
  }

  markCharactersDiscovered(characterIds: readonly string[]) {
    const nextCharacterIds = Array.from(
      new Set(
        characterIds.filter(
          (characterId): characterId is string => Boolean(characterId),
        ),
      ),
    ).filter((characterId) => !this.discoveredCharacterIds.includes(characterId));

    if (nextCharacterIds.length === 0) {
      return;
    }

    this.discoveredCharacterIds = [...this.discoveredCharacterIds, ...nextCharacterIds];
    this.persist();
  }

  hasDiscoveredLocationEntry(entryId: string | null) {
    if (!entryId) {
      return false;
    }

    return this.discoveredLocationEntryIds.includes(entryId);
  }

  markLocationEntryDiscovered(entryId: string | null) {
    if (!entryId || this.discoveredLocationEntryIds.includes(entryId)) {
      return;
    }

    this.discoveredLocationEntryIds = [...this.discoveredLocationEntryIds, entryId];
    this.persist();
  }

  restore(snapshot: SeenContentSnapshot) {
    const normalizedSnapshot = normalizeSeenContentSnapshot(snapshot);

    this.sceneFlowIds = normalizedSnapshot.sceneFlowIds;
    this.nodeKeys = normalizedSnapshot.nodeKeys;
    this.discoveredCharacterIds = normalizedSnapshot.discoveredCharacterIds;
    this.discoveredLocationEntryIds = normalizedSnapshot.discoveredLocationEntryIds;
    this.persist();
  }

  private persist() {
    saveJsonToStorage(SEEN_CONTENT_STORAGE_KEY, {
      sceneFlowIds: this.sceneFlowIds,
      nodeKeys: this.nodeKeys,
      discoveredCharacterIds: this.discoveredCharacterIds,
      discoveredLocationEntryIds: this.discoveredLocationEntryIds,
    } satisfies SeenContentSnapshot);
  }
}
