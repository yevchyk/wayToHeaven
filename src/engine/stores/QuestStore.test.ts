import { GameRootStore } from '@engine/stores/GameRootStore';

describe('QuestStore', () => {
  it('supports staged counter quests without rewriting authored advanceQuest effects', () => {
    const rootStore = new GameRootStore();

    rootStore.quests.addQuest('cq_yarva_three_nights');

    expect(rootStore.quests.getQuestState('cq_yarva_three_nights')).toEqual(
      expect.objectContaining({
        questId: 'cq_yarva_three_nights',
        status: 'active',
        progress: 0,
        activeStageId: 'night-one',
      }),
    );

    rootStore.quests.advanceQuest('cq_yarva_three_nights', 1);

    expect(rootStore.quests.getQuestState('cq_yarva_three_nights')).toEqual(
      expect.objectContaining({
        progress: 1,
        activeStageId: 'night-two',
      }),
    );

    rootStore.quests.advanceQuest('cq_yarva_three_nights', 1);
    rootStore.quests.advanceQuest('cq_yarva_three_nights', 1);

    expect(rootStore.quests.getQuestState('cq_yarva_three_nights')).toEqual(
      expect.objectContaining({
        status: 'completed',
        progress: 3,
        activeStageId: null,
      }),
    );
  });

  it('syncs condition-based quest stages from relationship and meta changes', () => {
    const rootStore = new GameRootStore();

    rootStore.quests.addQuest('mq_what_are_you_to_caravan');

    expect(rootStore.quests.getQuestState('mq_what_are_you_to_caravan')).toEqual(
      expect.objectContaining({
        activeStageId: 'caravan-first-impression',
        status: 'active',
      }),
    );

    rootStore.executeEffect({
      type: 'changeRelationship',
      relationshipId: 'yarva',
      axis: 'trust',
      delta: 1,
    });

    expect(rootStore.quests.getQuestState('mq_what_are_you_to_caravan')).toEqual(
      expect.objectContaining({
        activeStageId: 'caravan-visible-value',
        status: 'active',
      }),
    );

    rootStore.executeEffect({
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    });

    expect(rootStore.quests.getQuestState('mq_what_are_you_to_caravan')).toEqual(
      expect.objectContaining({
        status: 'completed',
        activeStageId: null,
      }),
    );
  });

  it('keeps chapter two branching quest progress on staged rails', () => {
    const rootStore = new GameRootStore();

    rootStore.quests.addQuest('cq_nena_first_deal');
    rootStore.quests.advanceQuest('cq_nena_first_deal', 1);

    expect(rootStore.quests.getQuestState('cq_nena_first_deal')).toEqual(
      expect.objectContaining({
        progress: 1,
        activeStageId: 'nena-settlement',
      }),
    );

    rootStore.quests.advanceQuest('cq_nena_first_deal', 1);

    expect(rootStore.quests.getQuestState('cq_nena_first_deal')).toEqual(
      expect.objectContaining({
        status: 'completed',
        progress: 2,
      }),
    );
  });
});
