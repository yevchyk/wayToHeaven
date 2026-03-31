import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { BacklogEntry, BacklogEntryKind } from '@engine/types/playerShell';

interface AppendBacklogEntryInput {
  kind: BacklogEntryKind;
  flowId: string | null;
  nodeId: string | null;
  speakerId: string | null;
  speakerName: string | null;
  text: string;
}

export class BacklogStore {
  readonly rootStore: GameRootStore;

  entries: BacklogEntry[] = [];

  private sequence = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  appendEntry(input: AppendBacklogEntryInput) {
    const normalizedText = input.text.trim();

    if (!normalizedText) {
      return null;
    }

    this.sequence += 1;

    const entry: BacklogEntry = {
      id: `backlog-entry-${this.sequence}`,
      kind: input.kind,
      flowId: input.flowId,
      nodeId: input.nodeId,
      speakerId: input.speakerId,
      speakerName: input.speakerName,
      text: normalizedText,
    };

    this.entries = [...this.entries, entry];

    return entry;
  }

  reset() {
    this.entries = [];
    this.sequence = 0;
  }
}
