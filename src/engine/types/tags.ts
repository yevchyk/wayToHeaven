import type { DamageKind } from '@engine/types/combat';
import type { StatusType } from '@engine/types/status';

export type TagId = string;

export type TagModifierStat =
  | 'damage'
  | 'damageTaken'
  | 'hitChance'
  | 'evasion'
  | 'critChance'
  | 'initiative'
  | 'defense'
  | 'healingReceived'
  | 'metaGain'
  | 'controlResistance';

export type TagToggleTarget =
  | 'canAct'
  | 'canUseItems'
  | 'canUseSkills'
  | 'isTargetable'
  | 'canReceiveHealing';

export interface NumericTagModifier {
  kind: 'numeric';
  target: TagModifierStat;
  mode: 'flat' | 'multiplier';
  value: number;
  damageKind?: DamageKind;
}

export interface BooleanTagModifier {
  kind: 'boolean';
  target: TagToggleTarget;
  value: boolean;
}

export type TagModifier = NumericTagModifier | BooleanTagModifier;

export interface TagRuleSet {
  tag: TagId;
  description?: string;
  exclusiveWith?: TagId[];
  modifiers?: TagModifier[];
  grantsStatusImmunities?: StatusType[];
}
