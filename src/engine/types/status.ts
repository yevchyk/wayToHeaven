import type { DamageKind } from '@engine/types/combat';
import type { TagId } from '@engine/types/tags';

export type StatusType =
  | 'poison'
  | 'burn'
  | 'bleed'
  | 'stun'
  | 'charm'
  | 'fear'
  | 'shield'
  | 'regen'
  | (string & {});

export type StatusTickTiming = 'none' | 'turnStart' | 'turnEnd' | 'roundStart' | 'roundEnd';

export type StatusStackPolicy = 'refresh' | 'stack' | 'replace' | 'ignore';

export type StatusMetadataValue = string | number | boolean | null;

export type StatusCategory = 'damage' | 'control' | 'support' | 'barrier';

export interface StatusPayload {
  kind: 'damage' | 'heal';
  amount: number;
  damageKind?: DamageKind;
  scalesWithStacks?: boolean;
}

export interface StatusEffectInstance {
  id: string;
  type: StatusType;
  remainingDuration: number;
  stacks: number;
  tickTiming: StatusTickTiming;
  sourceUnitId?: string;
  potency?: number;
  grantedTags?: TagId[];
  metadata?: Record<string, StatusMetadataValue>;
}

export interface StatusDefinition {
  type: StatusType;
  name: string;
  description?: string;
  category?: StatusCategory;
  defaultDuration: number;
  tickTiming: StatusTickTiming;
  stackPolicy: StatusStackPolicy;
  isNegative: boolean;
  maxStacks?: number;
  defaultPotency?: number;
  payload?: StatusPayload;
  grantsTags?: TagId[];
  blockedByTags?: TagId[];
  grantsImmunities?: StatusType[];
}
