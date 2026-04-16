import { evaluateDialogueCondition } from '@engine/systems/dialogue/canShowChoice';
import type { DialogueConditionState } from '@engine/systems/dialogue/canShowChoice';

function createState(overrides: Partial<DialogueConditionState> = {}): DialogueConditionState {
  return {
    getFlag: () => undefined,
    getMeta: () => 0,
    getProfileValue: () => 0,
    getItemCount: () => 0,
    getRelationshipValue: () => 0,
    hasTag: () => false,
    ...overrides,
  };
}

describe('evaluateDialogueCondition', () => {
  it('supports relationship axis comparisons', () => {
    const state = createState({
      getRelationshipValue: (relationshipId, axis) => {
        if (relationshipId === 'yarva' && axis === 'trust') {
          return 2;
        }

        return 0;
      },
    });

    expect(
      evaluateDialogueCondition(
        {
          type: 'relationship',
          relationshipId: 'yarva',
          axis: 'trust',
          operator: 'gte',
          value: 1,
        },
        state,
      ),
    ).toBe(true);
    expect(
      evaluateDialogueCondition(
        {
          type: 'relationship',
          relationshipId: 'yarva',
          axis: 'trust',
          operator: 'lt',
          value: 2,
        },
        state,
      ),
    ).toBe(false);
  });
});
