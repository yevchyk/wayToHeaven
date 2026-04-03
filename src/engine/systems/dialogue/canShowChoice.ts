import type {
  Condition,
  ConditionTargetScope,
  EqualityComparisonOperator,
  NumericComparisonOperator,
} from '@engine/types/conditions';
import type { DialogueChoice } from '@engine/types/dialogue';
import type { FlagValue } from '@engine/types/flags';
import type { MetaKey } from '@engine/types/meta';
import type { NarrativeProfileKey } from '@engine/types/profile';
import type { TagId } from '@engine/types/tags';

export interface DialogueConditionState {
  getFlag(flagId: string): FlagValue | undefined;
  getMeta(key: MetaKey): number;
  getProfileValue(key: NarrativeProfileKey): number;
  getItemCount(itemId: string): number;
  hasTag(tag: TagId, targetScope: ConditionTargetScope, targetId?: string): boolean;
}

function evaluateEquality(left: FlagValue, right: FlagValue, operator: EqualityComparisonOperator) {
  if (operator === 'eq') {
    return left === right;
  }

  return left !== right;
}

function evaluateNumeric(left: number, right: number, operator: NumericComparisonOperator) {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return left > right;
    case 'gte':
      return left >= right;
    case 'lt':
      return left < right;
    case 'lte':
      return left <= right;
  }
}

export function evaluateDialogueCondition(condition: Condition, state: DialogueConditionState) {
  switch (condition.type) {
    case 'flag': {
      const flagValue = state.getFlag(condition.flagId);

      if (flagValue === undefined) {
        return false;
      }

      if (typeof flagValue === 'number' && typeof condition.value === 'number') {
        return evaluateNumeric(flagValue, condition.value, condition.operator);
      }

      if (condition.operator === 'eq' || condition.operator === 'neq') {
        return evaluateEquality(flagValue, condition.value, condition.operator);
      }

      return false;
    }
    case 'meta':
      return evaluateNumeric(state.getMeta(condition.key), condition.value, condition.operator);
    case 'inventory':
      return evaluateNumeric(state.getItemCount(condition.itemId), condition.value, condition.operator);
    case 'tag': {
      const hasTag = state.hasTag(condition.tag, condition.targetScope, condition.targetId);

      return condition.operator === 'has' ? hasTag : !hasTag;
    }
    case 'flagEquals':
      return state.getFlag(condition.flagId) === condition.value;
    case 'profileGte':
    case 'statGte':
      return state.getProfileValue(condition.key) >= condition.value;
    case 'profileLte':
    case 'statLte':
      return state.getProfileValue(condition.key) <= condition.value;
    case 'metaGte':
      return state.getMeta(condition.key) >= condition.value;
    case 'metaLte':
      return state.getMeta(condition.key) <= condition.value;
  }
}

export function canShowChoice(choice: DialogueChoice, state: DialogueConditionState) {
  if (!choice.conditions || choice.conditions.length === 0) {
    return true;
  }

  return choice.conditions.every((condition) => evaluateDialogueCondition(condition, state));
}

export function getVisibleChoices(choices: readonly DialogueChoice[] | undefined, state: DialogueConditionState) {
  if (!choices || choices.length === 0) {
    return [];
  }

  return choices.filter((choice) => canShowChoice(choice, state));
}
