import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  DEFAULT_MINIGAME_SKILLS,
  type FishingMiniGameSession,
  type MiniGameSession,
  type MiniGameSkillId,
  type MiniGameStoreSnapshot,
} from '@engine/types/minigame';

function cloneMiniGameSession(session: MiniGameSession): MiniGameSession {
  if (session.kind === 'fishing') {
    return { ...session };
  }

  return {
    ...session,
    prompts: session.prompts.map((prompt) => ({ ...prompt })),
  };
}

function cloneSkillLevels() {
  return { ...DEFAULT_MINIGAME_SKILLS };
}

export class MiniGameStore {
  readonly rootStore: GameRootStore;

  activeSession: MiniGameSession | null = null;
  skillLevels = cloneSkillLevels();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get hasActiveSession() {
    return this.activeSession !== null;
  }

  get activeMinigameId() {
    return this.activeSession?.minigameId ?? null;
  }

  get fishingSession(): FishingMiniGameSession | null {
    if (!this.activeSession || this.activeSession.kind !== 'fishing') {
      return null;
    }

    return this.activeSession;
  }

  get snapshot(): MiniGameStoreSnapshot {
    return {
      activeSession: this.activeSession ? cloneMiniGameSession(this.activeSession) : null,
      skillLevels: { ...this.skillLevels },
    };
  }

  getSkillLevel(skillId: MiniGameSkillId) {
    return this.skillLevels[skillId] ?? 0;
  }

  setSkillLevel(skillId: MiniGameSkillId, value: number) {
    this.skillLevels = {
      ...this.skillLevels,
      [skillId]: Math.max(0, Math.floor(value)),
    };
  }

  incrementSkillLevel(skillId: MiniGameSkillId, amount = 1) {
    this.setSkillLevel(skillId, this.getSkillLevel(skillId) + amount);
  }

  startSession(session: MiniGameSession) {
    this.activeSession = cloneMiniGameSession(session);
  }

  updateSession(session: MiniGameSession) {
    this.activeSession = cloneMiniGameSession(session);
  }

  setFishingHolding(isHolding: boolean) {
    if (!this.activeSession || this.activeSession.kind !== 'fishing' || this.activeSession.result) {
      return;
    }

    this.activeSession = {
      ...this.activeSession,
      isHolding,
    };
  }

  finishActiveSession() {
    const session = this.activeSession;

    if (!session) {
      return;
    }

    const returnScreenId = session.returnScreenId;

    this.activeSession = null;

    if (this.rootStore.ui.activeScreen === 'minigame') {
      this.rootStore.ui.setScreen(returnScreenId ?? (this.rootStore.world.hasActiveLocation ? 'world' : 'home'));
    }
  }

  restore(snapshot?: MiniGameStoreSnapshot) {
    this.skillLevels = {
      ...DEFAULT_MINIGAME_SKILLS,
      ...(snapshot?.skillLevels ?? {}),
    };
    this.activeSession = snapshot?.activeSession ? cloneMiniGameSession(snapshot.activeSession) : null;
  }

  reset() {
    this.activeSession = null;
    this.skillLevels = cloneSkillLevels();
  }
}
