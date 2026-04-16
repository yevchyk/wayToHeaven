import { fireEvent, screen, waitFor } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('QuestJournalModal', () => {
  it('renders active and completed quest groups with progress and staged objectives', async () => {
    const rootStore = new GameRootStore();

    rootStore.quests.addQuest('mq_road_to_hugen_um');
    rootStore.quests.advanceQuest('mq_road_to_hugen_um', 25);
    rootStore.quests.addQuest('cq_yarva_three_nights');
    rootStore.quests.advanceQuest('cq_yarva_three_nights', 1);
    rootStore.quests.addQuest('mq_survive');
    rootStore.quests.completeQuest('mq_survive');
    rootStore.ui.openModal('quests');

    renderWithStore(rootStore);

    expect(screen.getByRole('dialog', { name: 'Quest Journal' })).toBeInTheDocument();
    expect(screen.getByText('Main quests')).toBeInTheDocument();
    expect(screen.getByText('Character quests')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(
      screen.getByText(rootStore.quests.getQuestDefinition('mq_road_to_hugen_um')?.title ?? ''),
    ).toBeInTheDocument();
    expect(
      screen.getByText(rootStore.quests.getQuestDefinition('cq_yarva_three_nights')?.title ?? ''),
    ).toBeInTheDocument();
    expect(screen.getByText(rootStore.quests.getQuestDefinition('mq_survive')?.title ?? '')).toBeInTheDocument();
    expect(screen.getByText('25 / 100')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('Night two')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Quest Journal' })).not.toBeInTheDocument();
    });
  }, 15_000);
});
