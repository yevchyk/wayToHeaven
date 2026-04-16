import type { BattleRuntime } from '@engine/types/battle';
import type { BattleUnitRuntime, PartyUnitRuntime } from '@engine/types/unit';

export function cloneBattleUnit(unit: BattleUnitRuntime): BattleUnitRuntime {
  return {
    ...unit,
    baseStats: { ...unit.baseStats },
    derivedStats: { ...unit.derivedStats },
    tags: [...unit.tags],
    statuses: unit.statuses.map((status) => ({
      ...status,
      ...(status.grantedTags ? { grantedTags: [...status.grantedTags] } : {}),
      ...(status.metadata ? { metadata: { ...status.metadata } } : {}),
    })),
    skillIds: [...unit.skillIds],
    skillRanks: { ...(unit.skillRanks ?? {}) },
    ...(unit.battleVisual ? { battleVisual: { ...unit.battleVisual } } : {}),
  };
}

export function cloneBattleUnits(units: readonly BattleUnitRuntime[]) {
  return units.map(cloneBattleUnit);
}

export function cloneBattleRuntime(runtime: BattleRuntime): BattleRuntime {
  return {
    ...runtime,
    turnQueue: [...runtime.turnQueue],
    allies: cloneBattleUnits(runtime.allies),
    enemies: cloneBattleUnits(runtime.enemies),
    combatLog: runtime.combatLog.map((entry) => ({ ...entry })),
    selectedAction: runtime.selectedAction ? { ...runtime.selectedAction } : null,
  };
}

export function toPartyUnitRuntime(unit: BattleUnitRuntime): PartyUnitRuntime {
  const { side: _side, ...partyUnit } = unit;

  return {
    ...partyUnit,
    baseStats: { ...partyUnit.baseStats },
    derivedStats: { ...partyUnit.derivedStats },
    tags: [...partyUnit.tags],
    statuses: partyUnit.statuses.map((status) => ({
      ...status,
      ...(status.grantedTags ? { grantedTags: [...status.grantedTags] } : {}),
      ...(status.metadata ? { metadata: { ...status.metadata } } : {}),
    })),
    skillIds: [...partyUnit.skillIds],
    skillRanks: { ...(partyUnit.skillRanks ?? {}) },
    ...(partyUnit.battleVisual ? { battleVisual: { ...partyUnit.battleVisual } } : {}),
  };
}
