import { calculateDerivedStats } from '@engine/formulas/derivedStats';
import { createStatusEffectInstance } from '@engine/registries/statusDefinitionsRegistry';
import type { StatusEffectInstance } from '@engine/types/status';
import type {
  BattleUnitRuntime,
  CharacterInstance,
  CharacterTemplate,
  EnemyTemplate,
  PartyUnitRuntime,
  UnitTemplate,
  UnitTag,
} from '@engine/types/unit';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function uniqueValues<TValue>(values: TValue[]) {
  return Array.from(new Set(values));
}

function cloneStatusEffect(statusEffect: StatusEffectInstance): StatusEffectInstance {
  return {
    ...statusEffect,
    ...(statusEffect.grantedTags ? { grantedTags: [...statusEffect.grantedTags] } : {}),
    ...(statusEffect.metadata ? { metadata: { ...statusEffect.metadata } } : {}),
  };
}

function collectTemplateStatuses(template: UnitTemplate, unitId: string) {
  return (template.startingStatuses ?? []).map((statusType, index) =>
    createStatusEffectInstance(statusType, {
      id: `${unitId}-${statusType}-${index + 1}`,
    }),
  );
}

export function buildPartyUnitRuntime(
  template: CharacterTemplate,
  instance: CharacterInstance,
): PartyUnitRuntime {
  const bonusMaxHp = instance.bonusMaxHp ?? 0;
  const bonusMaxMana = instance.bonusMaxMana ?? 0;
  const baseDerivedStats = calculateDerivedStats(template.baseStats);
  const derivedStats = {
    ...baseDerivedStats,
    maxHp: baseDerivedStats.maxHp + bonusMaxHp,
    maxMana: baseDerivedStats.maxMana + bonusMaxMana,
  };
  const currentHp = clamp(instance.currentHp ?? derivedStats.maxHp, 0, derivedStats.maxHp);
  const currentMana = clamp(instance.currentMana ?? derivedStats.maxMana, 0, derivedStats.maxMana);
  const statuses = [
    ...collectTemplateStatuses(template, instance.id),
    ...(instance.statusEffects ?? []).map(cloneStatusEffect),
  ];

  return {
    unitId: instance.id,
    templateId: template.id,
    name: instance.displayName ?? template.name,
    level: instance.level,
    experience: instance.experience ?? 0,
    currentHp,
    currentMana,
    baseStats: { ...template.baseStats },
    derivedStats,
    tags: uniqueValues<UnitTag>([...template.startingTags, ...(instance.tags ?? [])]),
    statuses,
    skillIds: [...template.skillIds],
    skillRanks: { ...(instance.skillRanks ?? {}) },
    bonusMaxHp,
    bonusMaxMana,
    ...(template.battleVisual ? { battleVisual: { ...template.battleVisual } } : {}),
    isDefending: false,
  };
}

export function buildBattleUnitRuntime(
  template: CharacterTemplate | EnemyTemplate,
  options: {
    runtimeId: string;
    side: BattleUnitRuntime['side'];
    level?: number;
    displayName?: string;
    currentHp?: number;
    currentMana?: number;
    tags?: UnitTag[];
    statuses?: StatusEffectInstance[];
  },
): BattleUnitRuntime {
  const derivedStats = calculateDerivedStats(template.baseStats);
  const currentHp = clamp(options.currentHp ?? derivedStats.maxHp, 0, derivedStats.maxHp);
  const currentMana = clamp(options.currentMana ?? derivedStats.maxMana, 0, derivedStats.maxMana);
  const statuses = [
    ...collectTemplateStatuses(template, options.runtimeId),
    ...(options.statuses ?? []).map(cloneStatusEffect),
  ];

  return {
    unitId: options.runtimeId,
    templateId: template.id,
    name: options.displayName ?? template.name,
    level: options.level ?? ('level' in template ? (template.level ?? 1) : 1),
    experience: 0,
    currentHp,
    currentMana,
    baseStats: { ...template.baseStats },
    derivedStats,
    tags: uniqueValues<UnitTag>([...template.startingTags, ...(options.tags ?? [])]),
    statuses,
    skillIds: [...template.skillIds],
    skillRanks: {},
    bonusMaxHp: 0,
    bonusMaxMana: 0,
    ...(template.battleVisual ? { battleVisual: { ...template.battleVisual } } : {}),
    isDefending: false,
    side: options.side,
  };
}
