import type { GameEffect } from '@engine/types/effects';
import type { ScreenId } from '@engine/types/ui';

export const MINIGAME_SKILLS = ['fishing', 'dance'] as const;

export type MiniGameSkillId = (typeof MINIGAME_SKILLS)[number];
export type MiniGameKind = 'fishing' | 'dance';
export type DanceArrowDirection = 'up' | 'right' | 'down' | 'left';
export type MiniGameOutcome = 'success' | 'failure';
export type DancePromptStatus = 'pending' | 'hit' | 'miss';
export type DanceHitQuality = 'perfect' | 'good' | 'miss';

export interface MiniGameBaseData {
  id: string;
  kind: MiniGameKind;
  title: string;
  description?: string;
  skillId: MiniGameSkillId;
  successEffects?: readonly GameEffect[];
  failureEffects?: readonly GameEffect[];
}

export interface FishingMiniGameData extends MiniGameBaseData {
  kind: 'fishing';
  durationMs: number;
  goal: number;
  zoneWidth: number;
  tensionRisePerSecond: number;
  tensionFallPerSecond: number;
  zoneDriftPerSecond: number;
  progressGainPerSecond: number;
  progressDecayPerSecond: number;
}

export interface DancePromptDefinition {
  id: string;
  direction: DanceArrowDirection;
  beatTimeMs: number;
}

export interface DanceMiniGameData extends MiniGameBaseData {
  kind: 'dance';
  previewWindowMs: number;
  hitWindowMs: number;
  requiredHits: number;
  prompts: readonly DancePromptDefinition[];
}

export type MiniGameData = FishingMiniGameData | DanceMiniGameData;

export interface MiniGameResult {
  outcome: MiniGameOutcome;
  score: number;
  summary: string;
}

export interface MiniGameSessionBase {
  minigameId: string;
  kind: MiniGameKind;
  title: string;
  description: string | null;
  skillId: MiniGameSkillId;
  skillLevelAtStart: number;
  elapsedMs: number;
  returnScreenId: ScreenId | null;
  result: MiniGameResult | null;
}

export interface FishingMiniGameSession extends MiniGameSessionBase {
  kind: 'fishing';
  tension: number;
  zoneCenter: number;
  zoneVelocity: number;
  catchProgress: number;
  isHolding: boolean;
  remainingMs: number;
}

export interface DancePromptRuntime {
  id: string;
  direction: DanceArrowDirection;
  scheduledTimeMs: number;
  status: DancePromptStatus;
  quality: DanceHitQuality | null;
  hitOffsetMs: number | null;
}

export interface DanceMiniGameSession extends MiniGameSessionBase {
  kind: 'dance';
  prompts: DancePromptRuntime[];
  streak: number;
  bestStreak: number;
  score: number;
  flashDirection: DanceArrowDirection | null;
  flashRemainingMs: number;
}

export type MiniGameSession = FishingMiniGameSession | DanceMiniGameSession;

export type MiniGameSkillSnapshot = Record<MiniGameSkillId, number>;

export const DEFAULT_MINIGAME_SKILLS: MiniGameSkillSnapshot = {
  fishing: 0,
  dance: 0,
};

export interface MiniGameStoreSnapshot {
  activeSession: MiniGameSession | null;
  skillLevels: MiniGameSkillSnapshot;
}
