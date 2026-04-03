import {
  clamp,
  clamp01,
  getDanceHitWindowMs,
  getFishingDecayPerSecond,
  getFishingGainPerSecond,
  resolveDanceHitQuality,
} from '@engine/formulas/minigame';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  DanceArrowDirection,
  DanceMiniGameData,
  DanceMiniGameSession,
  DancePromptRuntime,
  FishingMiniGameSession,
  MiniGameData,
  MiniGameSession,
} from '@engine/types/minigame';

export class MiniGameController {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  startMinigame(minigameId: string) {
    const definition = this.rootStore.getMinigameById(minigameId);

    if (!definition) {
      throw new Error(`Mini-game "${minigameId}" was not found.`);
    }

    const skillLevel = this.rootStore.miniGame.getSkillLevel(definition.skillId);
    const returnScreenId =
      this.rootStore.ui.activeScreen === 'minigame' ? null : this.rootStore.ui.activeScreen;
    const session = this.createSession(definition, skillLevel, returnScreenId);

    this.rootStore.miniGame.startSession(session);
    this.rootStore.ui.setScreen('minigame');

    return session;
  }

  tick(deltaMs: number) {
    const session = this.rootStore.miniGame.activeSession;

    if (!session || session.result) {
      return;
    }

    const clampedDeltaMs = clamp(deltaMs, 0, 48);

    if (session.kind === 'fishing') {
      this.tickFishing(session, clampedDeltaMs);
      return;
    }

    this.tickDance(session, clampedDeltaMs);
  }

  setFishingHolding(isHolding: boolean) {
    this.rootStore.miniGame.setFishingHolding(isHolding);
  }

  pressDanceDirection(direction: DanceArrowDirection) {
    const session = this.rootStore.miniGame.activeSession;

    if (!session || session.kind !== 'dance' || session.result) {
      return;
    }

    const definition = this.requireDanceDefinition(session.minigameId);
    const windowMs = getDanceHitWindowMs(definition, this.rootStore.miniGame.getSkillLevel(definition.skillId));
    const currentIndex = session.prompts.findIndex((prompt) => prompt.status === 'pending');

    if (currentIndex === -1) {
      return;
    }

    const currentPrompt = session.prompts[currentIndex];

    if (!currentPrompt) {
      return;
    }

    const offsetMs = session.elapsedMs - currentPrompt.scheduledTimeMs;
    let nextSession: DanceMiniGameSession = {
      ...session,
      flashDirection: direction,
      flashRemainingMs: 160,
      prompts: session.prompts.map((prompt) => ({ ...prompt })),
    };

    const quality = resolveDanceHitQuality(offsetMs, windowMs);

    if (currentPrompt.direction === direction && quality) {
      nextSession.prompts[currentIndex] = {
        ...currentPrompt,
        status: 'hit',
        quality,
        hitOffsetMs: offsetMs,
      };
      nextSession.streak += 1;
      nextSession.bestStreak = Math.max(nextSession.bestStreak, nextSession.streak);
      nextSession.score += quality === 'perfect' ? 2 : 1;
    } else if (session.elapsedMs >= currentPrompt.scheduledTimeMs - windowMs * 0.45) {
      nextSession.prompts[currentIndex] = {
        ...currentPrompt,
        status: 'miss',
        quality: 'miss',
        hitOffsetMs: offsetMs,
      };
      nextSession.streak = 0;
    } else {
      this.rootStore.miniGame.updateSession(nextSession);
      return;
    }

    this.rootStore.miniGame.updateSession(nextSession);
    this.resolveDanceIfFinished(nextSession, definition);
  }

  finishSession() {
    this.rootStore.miniGame.finishActiveSession();
  }

  private createSession(definition: MiniGameData, skillLevel: number, returnScreenId: string | null): MiniGameSession {
    const description = definition.description ?? null;

    if (definition.kind === 'fishing') {
      return {
        minigameId: definition.id,
        kind: definition.kind,
        title: definition.title,
        description,
        skillId: definition.skillId,
        skillLevelAtStart: skillLevel,
        elapsedMs: 0,
        returnScreenId,
        result: null,
        tension: 0.45,
        zoneCenter: 0.52,
        zoneVelocity: definition.zoneDriftPerSecond,
        catchProgress: 0,
        isHolding: false,
        remainingMs: definition.durationMs,
      };
    }

    const prompts: DancePromptRuntime[] = definition.prompts.map((prompt) => ({
      id: prompt.id,
      direction: prompt.direction,
      scheduledTimeMs: prompt.beatTimeMs,
      status: 'pending',
      quality: null,
      hitOffsetMs: null,
    }));

    return {
      minigameId: definition.id,
      kind: definition.kind,
      title: definition.title,
      description,
      skillId: definition.skillId,
      skillLevelAtStart: skillLevel,
      elapsedMs: 0,
      returnScreenId,
      result: null,
      prompts,
      streak: 0,
      bestStreak: 0,
      score: 0,
      flashDirection: null,
      flashRemainingMs: 0,
    };
  }

  private tickFishing(session: FishingMiniGameSession, deltaMs: number) {
    const definition = this.requireFishingDefinition(session.minigameId);
    const skillLevel = this.rootStore.miniGame.getSkillLevel(definition.skillId);
    const deltaSeconds = deltaMs / 1000;
    const nextTension = clamp01(
      session.tension +
        (session.isHolding ? definition.tensionRisePerSecond : -definition.tensionFallPerSecond) * deltaSeconds,
    );
    const zoneHalfWidth = (definition.zoneWidth + skillLevel * 0.018) / 2;
    let nextZoneCenter = session.zoneCenter + session.zoneVelocity * deltaSeconds;
    let nextZoneVelocity = session.zoneVelocity;

    if (nextZoneCenter >= 1 - zoneHalfWidth) {
      nextZoneCenter = 1 - zoneHalfWidth;
      nextZoneVelocity *= -1;
    } else if (nextZoneCenter <= zoneHalfWidth) {
      nextZoneCenter = zoneHalfWidth;
      nextZoneVelocity *= -1;
    }

    const inZone = Math.abs(nextTension - nextZoneCenter) <= zoneHalfWidth;
    const nextCatchProgress = clamp(
      session.catchProgress +
        (inZone
          ? getFishingGainPerSecond(definition, skillLevel) * deltaSeconds
          : -getFishingDecayPerSecond(definition, skillLevel) * deltaSeconds),
      0,
      definition.goal,
    );
    const nextSession: FishingMiniGameSession = {
      ...session,
      elapsedMs: session.elapsedMs + deltaMs,
      remainingMs: Math.max(0, session.remainingMs - deltaMs),
      tension: nextTension,
      zoneCenter: nextZoneCenter,
      zoneVelocity: nextZoneVelocity,
      catchProgress: nextCatchProgress,
    };

    this.rootStore.miniGame.updateSession(nextSession);

    if (nextCatchProgress >= definition.goal) {
      this.completeSession(
        nextSession,
        'success',
        Math.round(nextSession.remainingMs / 100 + nextCatchProgress),
        'Риба втримана. Рибальський ритм став упевненішим.',
      );
      return;
    }

    if (nextSession.remainingMs <= 0) {
      this.completeSession(
        nextSession,
        'failure',
        Math.round(nextCatchProgress),
        'Риба зірвалася. Треба точніше тримати натяг у зоні.',
      );
    }
  }

  private tickDance(session: DanceMiniGameSession, deltaMs: number) {
    const definition = this.requireDanceDefinition(session.minigameId);
    const skillLevel = this.rootStore.miniGame.getSkillLevel(definition.skillId);
    const hitWindowMs = getDanceHitWindowMs(definition, skillLevel);
    const flashRemainingMs = Math.max(0, session.flashRemainingMs - deltaMs);
    const nextSession: DanceMiniGameSession = {
      ...session,
      elapsedMs: session.elapsedMs + deltaMs,
      flashRemainingMs,
      flashDirection: flashRemainingMs > 0 ? session.flashDirection : null,
      prompts: session.prompts.map((prompt) => ({ ...prompt })),
    };

    const currentIndex = nextSession.prompts.findIndex((prompt) => prompt.status === 'pending');

    if (currentIndex !== -1) {
      const currentPrompt = nextSession.prompts[currentIndex];

      if (currentPrompt && nextSession.elapsedMs > currentPrompt.scheduledTimeMs + hitWindowMs) {
        nextSession.prompts[currentIndex] = {
          ...currentPrompt,
          status: 'miss',
          quality: 'miss',
          hitOffsetMs: nextSession.elapsedMs - currentPrompt.scheduledTimeMs,
        };
        nextSession.streak = 0;
      }
    }

    this.rootStore.miniGame.updateSession(nextSession);
    this.resolveDanceIfFinished(nextSession, definition);
  }

  private resolveDanceIfFinished(session: DanceMiniGameSession, definition: DanceMiniGameData) {
    const unresolvedPrompt = session.prompts.some((prompt) => prompt.status === 'pending');

    if (unresolvedPrompt) {
      return;
    }

    const hitCount = session.prompts.filter((prompt) => prompt.status === 'hit').length;
    const outcome = hitCount >= definition.requiredHits ? 'success' : 'failure';
    const summary =
      outcome === 'success'
        ? 'Ритм зловлено. Стрілки відчуваються вже не як хаос, а як малюнок кроку.'
        : 'Ритм розсипався. Потрібно ловити активну стрілку ближче до її удару.';

    this.completeSession(session, outcome, session.score, summary);
  }

  private completeSession(
    session: MiniGameSession,
    outcome: 'success' | 'failure',
    score: number,
    summary: string,
  ) {
    const definition = this.rootStore.getMinigameById(session.minigameId);

    if (!definition) {
      throw new Error(`Mini-game "${session.minigameId}" was not found during resolution.`);
    }

    const nextSession: MiniGameSession = {
      ...session,
      result: {
        outcome,
        score,
        summary,
      },
    };

    this.rootStore.miniGame.updateSession(nextSession);

    if (outcome === 'success') {
      this.rootStore.miniGame.incrementSkillLevel(definition.skillId, 1);

      if (definition.successEffects && definition.successEffects.length > 0) {
        this.rootStore.executeEffects(definition.successEffects);
      }

      return;
    }

    if (definition.failureEffects && definition.failureEffects.length > 0) {
      this.rootStore.executeEffects(definition.failureEffects);
    }
  }

  private requireFishingDefinition(minigameId: string) {
    const definition = this.rootStore.getMinigameById(minigameId);

    if (!definition || definition.kind !== 'fishing') {
      throw new Error(`Fishing mini-game "${minigameId}" was not found.`);
    }

    return definition;
  }

  private requireDanceDefinition(minigameId: string) {
    const definition = this.rootStore.getMinigameById(minigameId);

    if (!definition || definition.kind !== 'dance') {
      throw new Error(`Dance mini-game "${minigameId}" was not found.`);
    }

    return definition;
  }
}
