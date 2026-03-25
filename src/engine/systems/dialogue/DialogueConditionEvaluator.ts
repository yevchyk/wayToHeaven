import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { DialogueChoice } from '@engine/types/dialogue';
import type { Condition } from '@engine/types/conditions';
import {
  canShowChoice,
  evaluateDialogueCondition,
  getVisibleChoices,
} from '@engine/systems/dialogue/canShowChoice';

export class DialogueConditionEvaluator {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  evaluate(condition: Condition) {
    return evaluateDialogueCondition(condition, {
      getFlag: (flagId) => this.rootStore.flags.getFlag(flagId),
      getMeta: (key) => this.rootStore.meta[key],
      getStat: (key) => this.rootStore.stats.getStat(key),
      hasTag: (tag, targetScope, targetId) =>
        this.rootStore.party.hasTagInScope(targetScope, tag, targetId),
    });
  }

  evaluateAll(conditions?: readonly Condition[]) {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => this.evaluate(condition));
  }

  getVisibleChoices(choices?: readonly DialogueChoice[]) {
    return getVisibleChoices(choices, {
      getFlag: (flagId) => this.rootStore.flags.getFlag(flagId),
      getMeta: (key) => this.rootStore.meta[key],
      getStat: (key) => this.rootStore.stats.getStat(key),
      hasTag: (tag, targetScope, targetId) =>
        this.rootStore.party.hasTagInScope(targetScope, tag, targetId),
    });
  }

  canShowChoice(choice: DialogueChoice) {
    return canShowChoice(choice, {
      getFlag: (flagId) => this.rootStore.flags.getFlag(flagId),
      getMeta: (key) => this.rootStore.meta[key],
      getStat: (key) => this.rootStore.stats.getStat(key),
      hasTag: (tag, targetScope, targetId) =>
        this.rootStore.party.hasTagInScope(targetScope, tag, targetId),
    });
  }
}
