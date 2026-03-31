import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { loadJsonFromStorage, saveJsonToStorage } from '@engine/systems/storage/browserStorage';

const SEEN_CONTENT_STORAGE_KEY = 'wey-to-heaven/seen-content/v1';

interface SeenContentSnapshot {
  sceneFlowIds: string[];
  nodeKeys: string[];
}

function buildNodeKey(flowId: string, nodeId: string) {
  return `${flowId}:${nodeId}`;
}

export class SeenContentStore {
  readonly rootStore: GameRootStore;

  sceneFlowIds: string[] = [];
  nodeKeys: string[] = [];

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    const snapshot = loadJsonFromStorage<SeenContentSnapshot>(SEEN_CONTENT_STORAGE_KEY, {
      sceneFlowIds: [],
      nodeKeys: [],
    });

    this.sceneFlowIds = [...new Set(snapshot.sceneFlowIds)];
    this.nodeKeys = [...new Set(snapshot.nodeKeys)];

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  hasSeenFlow(flowId: string | null) {
    return Boolean(flowId) && this.sceneFlowIds.includes(flowId);
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

  private persist() {
    saveJsonToStorage(SEEN_CONTENT_STORAGE_KEY, {
      sceneFlowIds: this.sceneFlowIds,
      nodeKeys: this.nodeKeys,
    } satisfies SeenContentSnapshot);
  }
}
