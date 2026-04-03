import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { BacklogEntry, BacklogEntryKind } from '@engine/types/playerShell';
import type { BacklogSnapshot } from '@engine/types/save';
import { getNarrativePlainText } from '@engine/utils/narrativeHtml';

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

  get snapshot(): BacklogSnapshot {
    return {
      entries: this.entries.map((entry) => ({ ...entry })),
    };
  }

  appendEntry(input: AppendBacklogEntryInput) {
    const normalizedText = getNarrativePlainText(input.text).trim();

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
      text: input.text.trim(),
    };

    this.entries = [...this.entries, entry];

    return entry;
  }

  reset() {
    this.entries = [];
    this.sequence = 0;
  }

  restore(snapshot: BacklogSnapshot) {
    this.entries = snapshot.entries.map((entry) => ({ ...entry }));
    this.sequence = this.entries.length;
  }
}
