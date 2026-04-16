import type { BattleActionSelection, BattleActionType } from '@engine/types/battle';
import type { DamageKind } from '@engine/types/combat';
import { skillPatternRequiresTarget, type SkillData } from '@engine/types/skill';
import type { BattleUnitRuntime } from '@engine/types/unit';

function applyDefenseMitigation(value: number, isDefending: boolean) {
  return isDefending ? Math.max(1, Math.floor(value / 2)) : value;
}

export function calculateAttackDamage(
  attacker: BattleUnitRuntime,
  target: BattleUnitRuntime,
  isCritical = false,
) {
  const baseDamage = Math.max(
    1,
    attacker.derivedStats.physicalAttack - Math.floor(target.derivedStats.armor / 4),
  );
  const criticalDamage = isCritical
    ? Math.floor(baseDamage * attacker.derivedStats.critPower)
    : baseDamage;

  return applyDefenseMitigation(criticalDamage, target.isDefending);
}

export function calculateSkillDamage(
  attacker: BattleUnitRuntime,
  target: BattleUnitRuntime,
  skill: SkillData | null,
  isCritical = false,
) {
  const scalingStat =
    skill?.scalingStat === 'physicalAttack'
      ? attacker.derivedStats.physicalAttack
      : attacker.derivedStats.magicalAttack;
  const mitigationStat =
    skill?.damageKind === 'physical'
      ? target.derivedStats.armor
      : target.derivedStats.resistance;
  const baseDamage = Math.max(
    1,
    scalingStat + (skill?.basePower ?? 0) - Math.floor(mitigationStat / 4),
  );
  const criticalDamage = isCritical
    ? Math.floor(baseDamage * attacker.derivedStats.critPower)
    : baseDamage;

  return applyDefenseMitigation(criticalDamage, target.isDefending);
}

export function actionUsesTarget(actionType: BattleActionType) {
  return actionType === 'attack' || actionType === 'skill';
}

export function skillUsesTarget(skill: SkillData | null) {
  return skill ? skillPatternRequiresTarget(skill.targetPattern) : true;
}

export function resolveActionDamageKind(
  selection: BattleActionSelection,
  skill: SkillData | null = null,
): DamageKind {
  if (selection.type === 'skill') {
    if (skill) {
      return skill.damageKind;
    }

    if (selection.skillId?.includes('fire')) {
      return 'fire';
    }

    if (selection.skillId?.includes('poison')) {
      return 'poison';
    }

    if (selection.skillId?.includes('bleed')) {
      return 'bleed';
    }

    return 'arcane';
  }

  return 'physical';
}
