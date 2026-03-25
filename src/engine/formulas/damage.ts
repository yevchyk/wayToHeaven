import type { BattleActionSelection, BattleActionType } from '@engine/types/battle';
import type { DamageKind } from '@engine/types/combat';
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
  isCritical = false,
) {
  const baseDamage = Math.max(
    1,
    attacker.derivedStats.magicalAttack + 4 - Math.floor(target.derivedStats.resistance / 4),
  );
  const criticalDamage = isCritical
    ? Math.floor(baseDamage * attacker.derivedStats.critPower)
    : baseDamage;

  return applyDefenseMitigation(criticalDamage, target.isDefending);
}

export function actionUsesTarget(actionType: BattleActionType) {
  return actionType === 'attack' || actionType === 'skill';
}

export function resolveActionDamageKind(selection: BattleActionSelection): DamageKind {
  if (selection.type === 'skill') {
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
