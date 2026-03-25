import type { FlagValue } from '@engine/types/flags';
import type { MetaKey } from '@engine/types/meta';
import type { GameStatKey } from '@engine/types/stats';
import type { TagId } from '@engine/types/tags';

export type NumericComparisonOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

export type EqualityComparisonOperator = 'eq' | 'neq';

export type TagConditionOperator = 'has' | 'missing';

export type ConditionTargetScope = 'player' | 'party' | 'unit';

export interface FlagCondition {
  type: 'flag';
  flagId: string;
  operator: NumericComparisonOperator;
  value: FlagValue;
}

export interface MetaCondition {
  type: 'meta';
  key: MetaKey;
  operator: NumericComparisonOperator;
  value: number;
}

export interface TagCondition {
  type: 'tag';
  tag: TagId;
  operator: TagConditionOperator;
  targetScope: ConditionTargetScope;
  targetId?: string;
}

export interface FlagEqualsCondition {
  type: 'flagEquals';
  flagId: string;
  value: FlagValue;
}

export interface StatGteCondition {
  type: 'statGte';
  key: GameStatKey;
  value: number;
}

export interface StatLteCondition {
  type: 'statLte';
  key: GameStatKey;
  value: number;
}

export interface MetaGteCondition {
  type: 'metaGte';
  key: MetaKey;
  value: number;
}

export interface MetaLteCondition {
  type: 'metaLte';
  key: MetaKey;
  value: number;
}

export type Condition =
  | FlagCondition
  | MetaCondition
  | TagCondition
  | FlagEqualsCondition
  | StatGteCondition
  | StatLteCondition
  | MetaGteCondition
  | MetaLteCondition;
