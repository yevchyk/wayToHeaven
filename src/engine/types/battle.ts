import type { GameEffect } from '@engine/types/effects';
import type { LootTableData } from '@engine/types/loot';
import type { BattleUnitRuntime } from '@engine/types/unit';

export type BattlePhase =
  | 'idle'
  | 'initializing'
  | 'turnStart'
  | 'playerInput'
  | 'enemyThinking'
  | 'resolvingAction'
  | 'victory'
  | 'defeat';

export type BattleActionType = 'attack' | 'skill' | 'defend' | 'item';

export type CombatLogEntryType =
  | 'system'
  | 'action'
  | 'damage'
  | 'heal'
  | 'status'
  | 'miss'
  | 'outcome';

export type BattleOutcome = Extract<BattlePhase, 'victory' | 'defeat'>;

export interface CombatLogEntry {
  id: string;
  round: number;
  type: CombatLogEntryType;
  message: string;
  sourceUnitId?: string;
  targetUnitId?: string;
  value?: number;
}

export interface BattleTemplate {
  id: string;
  title?: string;
  allyUnitIds?: string[];
  enemyUnitIds: string[];
  backgroundId?: string;
  introSceneFlowId?: string;
  introDialogueId?: string;
  rewardTableId?: LootTableData['id'];
  experienceReward?: number;
  showRewardSummary?: boolean;
  victoryEffects?: GameEffect[];
  defeatEffects?: GameEffect[];
  enemyAiProfile?: 'random';
}

export interface BattleActionSelection {
  type: BattleActionType;
  sourceUnitId: string;
  actionId?: string;
  skillId?: string;
  itemId?: string;
  targetId?: string;
}

export interface BattleResolutionResult {
  selection: BattleActionSelection;
  allies: BattleUnitRuntime[];
  enemies: BattleUnitRuntime[];
  logEntries: CombatLogEntry[];
  defeatedUnitIds: string[];
  damageDealt?: number;
  didHit?: boolean;
  didCrit?: boolean;
}

export interface BattleRuntime {
  battleId: string;
  templateId: string;
  phase: BattlePhase;
  round: number;
  turnQueue: string[];
  currentUnitId: string | null;
  allies: BattleUnitRuntime[];
  enemies: BattleUnitRuntime[];
  combatLog: CombatLogEntry[];
  selectedAction: BattleActionSelection | null;
  selectedTargetId: string | null;
}
