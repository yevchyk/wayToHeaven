import { fireEvent, screen, waitFor } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('StatsDebugModal', () => {
  it('renders current stats and recent stat changes for the active session', async () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'changeProfile',
      key: 'pragmatism',
      delta: 2,
    });
    rootStore.executeEffect({
      type: 'setStat',
      key: 'humanity',
      value: 1,
    });
    rootStore.ui.openModal('stats-debug');

    renderWithStore(rootStore);

    expect(screen.getByRole('dialog', { name: 'Stats Debug' })).toBeInTheDocument();
    expect(screen.getByText('Current Stats')).toBeInTheDocument();
    expect(screen.getByText('Recent Changes')).toBeInTheDocument();
    expect(screen.getByText('Pragmatism 2')).toBeInTheDocument();
    expect(screen.getByText('Humanity 1')).toBeInTheDocument();
    expect(screen.getByText('0 -> 2')).toBeInTheDocument();
    expect(screen.getByText('0 -> 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Stats Debug' })).not.toBeInTheDocument();
    });
  });
});
