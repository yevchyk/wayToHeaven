import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { BattleStore } from '@engine/stores/BattleStore';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('UI shell screens', () => {
  it('renders the start menu with only the play action enabled', () => {
    const rootStore = new GameRootStore();

    renderWithStore(rootStore);

    expect(screen.getByRole('button', { name: 'Вхід у гру' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Грати' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Налаштування' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Збереження' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Вийти' })).toBeDisabled();
  });

  it('renders screens based on the active UI state', () => {
    const rootStore = new GameRootStore();

    renderWithStore(rootStore);

    expect(screen.getByRole('heading', { name: 'Wey To Heaven' })).toBeInTheDocument();

    act(() => {
      rootStore.startNewGame();
    });

    expect(screen.getByRole('heading', { name: 'Пролог — Над містом, під землею' })).toBeInTheDocument();
    expect(screen.queryByText(/Mansion Dining Hall/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ранок у домі Торнів завжди починався красиво\./i)).toBeInTheDocument();
  });

  it('lets the player leave dialogue with Escape without choosing a reply', async () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    renderWithStore(rootStore);

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Temple Exit Plaza' }).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ashen Reach/i)).toBeInTheDocument();
    });
  });

  it('opens and closes the character menu modal', async () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    rootStore.dialogue.endDialogue();
    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('button', { name: 'Character Menu' }));

    expect(screen.getByRole('dialog', { name: 'Character Menu' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Character Menu' })).not.toBeInTheDocument();
    });
  });

  it('allows dialogue choices to be clicked through the dialogue screen', () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('button', { name: 'Далі' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далі' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далі' }));
    fireEvent.click(screen.getByRole('button', { name: 'Підтримати батька про порядок.' }));

    expect(rootStore.dialogue.currentNodeId).toBe('n6');
    expect(screen.getByRole('button', { name: 'Далі' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Підтримати батька про порядок.' })).not.toBeInTheDocument();
    expect(rootStore.stats.getStat('pragmatism')).toBe(1);
  });

  it('allows clicking reachable world nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');
    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('button', { name: 'Move to City Gate' }));

    expect(rootStore.world.currentNodeId).toBe('city-gate');
    expect(screen.getByRole('heading', { name: 'City Gate' })).toBeInTheDocument();
  });

  it('routes battle action buttons into the battle runtime', async () => {
    const performPlayerActionSpy = vi.spyOn(BattleStore.prototype, 'performPlayerAction');
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('button', { name: 'Defend' }));

    await waitFor(() => {
      expect(performPlayerActionSpy).toHaveBeenCalledWith('defend');
    });
  });
});
