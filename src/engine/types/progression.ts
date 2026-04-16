import type { ResolvedLootEntry } from '@engine/types/loot';

export interface BattleRewardLootSummary extends ResolvedLootEntry {
  itemName: string;
}

export interface BattleRewardExperienceSummary {
  unitId: string;
  unitName: string;
  amount: number;
  levelBefore: number;
  levelAfter: number;
}

export type LevelUpChoiceType = 'skill' | 'hp' | 'mana';

export interface LevelUpChoice {
  id: string;
  type: LevelUpChoiceType;
  label: string;
  description: string;
  skillId?: string;
}

export interface PendingLevelUpReward {
  id: string;
  unitId: string;
  unitName: string;
  nextLevel: number;
  choices: LevelUpChoice[];
  resolvedChoiceId: string | null;
}

export interface BattleRewardSummary {
  battleId: string;
  battleTitle: string;
  loot: BattleRewardLootSummary[];
  experience: BattleRewardExperienceSummary[];
  levelUps: PendingLevelUpReward[];
}

export interface ProgressionSnapshot {
  pendingBattleSummary: BattleRewardSummary | null;
}
