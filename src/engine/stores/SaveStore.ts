import { makeAutoObservable, runInAction } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { createSavePersistence, type SavePersistence } from '@engine/systems/save/savePersistence';
import type { GameSaveSlotKind, GameSaveSummary } from '@engine/types/save';

export const SAVE_SLOT_DEFINITIONS = [
  { slotId: 'quick', kind: 'quick', label: 'Quick Save' },
  { slotId: 'auto-1', kind: 'auto', label: 'Autosave 1' },
  { slotId: 'auto-2', kind: 'auto', label: 'Autosave 2' },
  { slotId: 'auto-3', kind: 'auto', label: 'Autosave 3' },
  { slotId: 'manual-1', kind: 'manual', label: 'Slot 1' },
  { slotId: 'manual-2', kind: 'manual', label: 'Slot 2' },
  { slotId: 'manual-3', kind: 'manual', label: 'Slot 3' },
  { slotId: 'manual-4', kind: 'manual', label: 'Slot 4' },
  { slotId: 'manual-5', kind: 'manual', label: 'Slot 5' },
  { slotId: 'manual-6', kind: 'manual', label: 'Slot 6' },
] as const;

const AUTOSAVE_SLOT_IDS = SAVE_SLOT_DEFINITIONS
  .filter((definition) => definition.kind === 'auto')
  .map((definition) => definition.slotId);

export class SaveStore {
  readonly rootStore: GameRootStore;
  readonly persistence: SavePersistence;

  summaries: GameSaveSummary[] = [];
  isBusy = false;
  isReady = false;
  errorMessage: string | null = null;

  private autosaveIndex = 0;
  private readyPromise: Promise<void> | null = null;

  constructor(rootStore: GameRootStore, persistence: SavePersistence = createSavePersistence()) {
    this.rootStore = rootStore;
    this.persistence = persistence;

    makeAutoObservable(this, {
      rootStore: false,
      persistence: false,
    }, { autoBind: true });
  }

  get slotEntries() {
    return SAVE_SLOT_DEFINITIONS.map((definition) => ({
      ...definition,
      summary: this.getSummary(definition.slotId),
    }));
  }

  get hasQuickSave() {
    return this.getSummary('quick') !== null;
  }

  getSummary(slotId: string) {
    return this.summaries.find((summary) => summary.slotId === slotId) ?? null;
  }

  async ensureReady() {
    if (!this.readyPromise) {
      this.readyPromise = this.refreshSummaries();
    }

    await this.readyPromise;
  }

  async refreshSummaries() {
    runInAction(() => {
      this.isBusy = true;
      this.errorMessage = null;
    });

    try {
      const summaries = await this.persistence.listSummaries();

      runInAction(() => {
        this.summaries = summaries;
        this.isReady = true;
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : 'Unable to load save slots.';
      });
    } finally {
      runInAction(() => {
        this.isBusy = false;
      });
    }
  }

  async saveToSlot(slotId: string, options: { kind?: GameSaveSlotKind; label?: string } = {}) {
    await this.ensureReady();
    runInAction(() => {
      this.isBusy = true;
      this.errorMessage = null;
    });

    try {
      const currentSummary = this.getSummary(slotId);
      const slotDefinition = SAVE_SLOT_DEFINITIONS.find((entry) => entry.slotId === slotId) ?? null;
      const kind = options.kind ?? slotDefinition?.kind ?? currentSummary?.kind ?? 'manual';
      const label = options.label ?? slotDefinition?.label ?? currentSummary?.label ?? slotId;
      const snapshot = this.rootStore.createSaveSnapshot({
        slotId,
        kind,
        label,
      });

      await this.persistence.save(snapshot);
      runInAction(() => {
        this.upsertSummary(snapshot.summary);
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : 'Unable to save the game.';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isBusy = false;
      });
    }
  }

  async loadFromSlot(slotId: string) {
    await this.ensureReady();
    runInAction(() => {
      this.isBusy = true;
      this.errorMessage = null;
    });

    try {
      const snapshot = await this.persistence.load(slotId);

      if (!snapshot) {
        throw new Error(`Save slot "${slotId}" is empty.`);
      }

      runInAction(() => {
        this.rootStore.restoreSaveSnapshot(snapshot);
        this.upsertSummary(snapshot.summary);
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : 'Unable to load the game.';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isBusy = false;
      });
    }
  }

  async deleteSlot(slotId: string) {
    await this.ensureReady();
    runInAction(() => {
      this.isBusy = true;
      this.errorMessage = null;
    });

    try {
      await this.persistence.delete(slotId);
      runInAction(() => {
        this.summaries = this.summaries.filter((summary) => summary.slotId !== slotId);
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : 'Unable to delete the save slot.';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isBusy = false;
      });
    }
  }

  async quickSave() {
    await this.saveToSlot('quick', {
      kind: 'quick',
      label: 'Quick Save',
    });
  }

  async quickLoad() {
    await this.loadFromSlot('quick');
  }

  async autoSave(label: string) {
    const slotId = AUTOSAVE_SLOT_IDS[this.autosaveIndex % AUTOSAVE_SLOT_IDS.length] ?? 'auto-1';

    this.autosaveIndex = (this.autosaveIndex + 1) % AUTOSAVE_SLOT_IDS.length;

    await this.saveToSlot(slotId, {
      kind: 'auto',
      label,
    });
  }

  private upsertSummary(nextSummary: GameSaveSummary) {
    const withoutCurrent = this.summaries.filter((summary) => summary.slotId !== nextSummary.slotId);

    this.summaries = [...withoutCurrent, nextSummary].sort((left, right) =>
      right.savedAt.localeCompare(left.savedAt),
    );
  }
}
