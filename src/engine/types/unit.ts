import type { GameEffect } from '@engine/types/effects';
import type { CharacterVisualConfig, EquippedItemIds } from '@engine/types/appearance';
import type { LootTableData } from '@engine/types/loot';
import type { StatusEffectInstance, StatusType } from '@engine/types/status';
import type { TagId } from '@engine/types/tags';

export type UnitTag = TagId;

export interface BaseStats {
  strength: number;
  agility: number;
  sexuality: number;
  magicAffinity: number;
  initiative: number;
  mana: number;
  health: number;
}

export interface DerivedStats {
  physicalAttack: number;
  magicalAttack: number;
  armor: number;
  resistance: number;
  accuracy: number;
  evasion: number;
  critChance: number;
  critPower: number;
  maxHp: number;
  maxMana: number;
  initiative: number;
}

export type BattleAuraPreset = 'fire' | 'holy' | 'violet';

export interface BattleVisualConfig {
  portraitAssetId?: string;
  portraitSourcePath?: string;
  defaultAuraPreset?: BattleAuraPreset;
}

export interface CharacterTemplate {
  id: string;
  kind: 'character';
  name: string;
  description?: string;
  portraitId?: string;
  battleVisual?: BattleVisualConfig;
  faction: 'player' | 'ally' | 'neutral';
  baseStats: BaseStats;
  startingTags: UnitTag[];
  startingStatuses?: StatusType[];
  skillIds: string[];
  itemIds?: string[];
  preview?: CharacterVisualConfig;
  startingEquipment?: EquippedItemIds;
}

export interface CharacterInstance {
  id: string;
  templateId: string;
  level: number;
  experience?: number;
  displayName?: string;
  currentHp?: number;
  currentMana?: number;
  tags?: UnitTag[];
  statusEffects?: StatusEffectInstance[];
  skillRanks?: Record<string, number>;
  bonusMaxHp?: number;
  bonusMaxMana?: number;
  equippedItemIds?: EquippedItemIds;
  previewOverrides?: CharacterVisualConfig;
}

export interface EnemyTemplate {
  id: string;
  kind: 'enemy';
  name: string;
  description?: string;
  portraitId?: string;
  battleVisual?: BattleVisualConfig;
  faction: 'enemy';
  aiProfile: 'random';
  level?: number;
  baseStats: BaseStats;
  startingTags: UnitTag[];
  startingStatuses?: StatusType[];
  skillIds: string[];
  experienceReward?: number;
  rewardItemIds?: string[];
  rewardTableId?: LootTableData['id'];
  rewardEffects?: GameEffect[];
}

export interface PartyUnitRuntime {
  unitId: string;
  templateId: string;
  name: string;
  level: number;
  experience: number;
  currentHp: number;
  currentMana: number;
  baseStats: BaseStats;
  derivedStats: DerivedStats;
  tags: UnitTag[];
  statuses: StatusEffectInstance[];
  skillIds: string[];
  skillRanks: Record<string, number>;
  bonusMaxHp: number;
  bonusMaxMana: number;
  battleVisual?: BattleVisualConfig;
  isDefending: boolean;
}

export interface BattleUnitRuntime extends PartyUnitRuntime {
  side: 'ally' | 'enemy';
}

export type UnitTemplate = CharacterTemplate | EnemyTemplate;
