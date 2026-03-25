import type { DialogueEffect } from '@engine/types/dialogue';
import type { EffectBatchResult, EffectExecutionResult } from '@engine/types/effects';

export interface DialogueEffectState {
  executeEffect(effect: DialogueEffect): EffectExecutionResult;
}

export function applyEffects(
  effects: readonly DialogueEffect[] | undefined,
  state: DialogueEffectState,
): EffectBatchResult {
  if (!effects || effects.length === 0) {
    return {
      results: [],
      appliedCount: 0,
      skippedCount: 0,
      missingScriptCount: 0,
    };
  }

  const results = effects.map((effect) => state.executeEffect(effect));

  return {
    results,
    appliedCount: results.filter((result) => result.status === 'applied').length,
    skippedCount: results.filter((result) => result.status === 'skipped').length,
    missingScriptCount: results.filter((result) => result.status === 'missingScript').length,
  };
}
