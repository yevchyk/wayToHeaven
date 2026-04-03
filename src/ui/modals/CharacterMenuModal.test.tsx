import { fireEvent, screen, waitFor } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('CharacterMenuModal', () => {
  it('opens the character menu and switches between tabs', async () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    rootStore.profile.setProfileValue('superiority', 1);
    rootStore.profile.setProfileValue('corruption', 2);
    rootStore.openCharacterMenu();
    renderWithStore(rootStore);

    expect(screen.getByRole('dialog', { name: 'Character Menu' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'Equipment' }));
    expect(screen.getByText('Headwear')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Inventory' }));
    expect(screen.getByText('Basic Potion')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Profile' }));
    expect(screen.getByText('Core Axes')).toBeInTheDocument();
    expect(screen.getByText('Superiority 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Corruption' }));
    expect(screen.getByText('Corruption Pressure')).toBeInTheDocument();
    expect(screen.getByText('Corruption 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Character Menu' })).not.toBeInTheDocument();
    });
  });

  it('updates the preview and selected character when switching party members', () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    rootStore.openCharacterMenu();
    renderWithStore(rootStore);

    expect(screen.getByTestId('character-menu-selected-name')).toHaveTextContent('Pilgrim');
    expect(screen.getByTestId('character-preview-layer-weapon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Party' }));
    fireEvent.click(screen.getByRole('button', { name: /Ash/i }));

    expect(screen.getByTestId('character-menu-selected-name')).toHaveTextContent('Ash');
    expect(screen.getByTestId('character-preview-layer-headwear')).toBeInTheDocument();
  });

  it('opens the inventory modal on the inventory tab by default', () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    rootStore.ui.openModal('inventory');
    renderWithStore(rootStore);

    expect(screen.getByRole('tab', { name: 'Inventory' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Basic Potion')).toBeInTheDocument();
  });
});
