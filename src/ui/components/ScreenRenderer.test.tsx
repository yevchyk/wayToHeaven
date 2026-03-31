import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { chapter1CgIds, chapter1OverlayIds } from '@content/chapters/chapter-1/assets';
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
    expect(screen.queryByText('Runtime Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Chapter 1 Build')).not.toBeInTheDocument();
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
    expect(screen.getByLabelText('stage portrait mirella')).toHaveAttribute('data-speaker-id', 'mirella');
    expect(screen.getByLabelText('stage portrait mirella')).toHaveAttribute('data-outfit-id', 'dress-pristine');
  });

  it('renders authored scene-generation nextSceneId transitions through the dialogue UI', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/awakening');
    renderWithStore(rootStore);

    expect(screen.getByRole('heading', { name: 'Awakening' })).toBeInTheDocument();
    expect(screen.getByText(/Камінь дихає сирістю/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Далі' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далі' }));
    fireEvent.click(screen.getByRole('button', { name: 'Зібратись і йти далі.' }));

    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/awakening/road');
    expect(screen.getByRole('heading', { name: 'The First Road' })).toBeInTheDocument();
    expect(screen.getByText(/Попереду чекає маршрут крізь затоплені проходи/i)).toBeInTheDocument();
  });

  it('renders CG and overlay scene layers from the active sequence presentation state', () => {
    const rootStore = new GameRootStore();

    rootStore.sceneFlowRegistry['tests/scene-flow/presentation-layers'] = {
      id: 'tests/scene-flow/presentation-layers',
      title: 'Presentation Layers',
      mode: 'sequence',
      startNodeId: 'intro',
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          sourceNodeType: 'narration',
          text: 'Layer visibility check.',
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/presentation-layers',
      },
      defaultCgId: chapter1CgIds.awakeningFlash,
      defaultOverlayId: chapter1OverlayIds.dreamVeil,
      defaultTransition: {
        type: 'fade',
        durationMs: 240,
      },
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/presentation-layers');
    renderWithStore(rootStore);

    expect(screen.getByLabelText('scene cg layer')).toHaveAttribute('data-asset-id', chapter1CgIds.awakeningFlash);
    expect(screen.getByLabelText('scene overlay layer')).toHaveAttribute('data-asset-id', chapter1OverlayIds.dreamVeil);
    expect(screen.getByTestId('scene-transition-layer')).toHaveAttribute('data-transition-type', 'fade');
  });

  it('renders authored hub scene flows through the shared presentation shell', () => {
    const rootStore = new GameRootStore();

    rootStore.sceneFlowRegistry['tests/scene-flow/hub-shell'] = {
      id: 'tests/scene-flow/hub-shell',
      title: 'Temple Hub',
      mode: 'hub',
      startNodeId: 'square',
      nodes: {
        square: {
          id: 'square',
          kind: 'choice',
          sourceNodeType: 'choice',
          title: 'Temple Hub',
          text: 'Shared hub shell check.',
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/hub-shell',
      },
      defaultCgId: chapter1CgIds.awakeningFlash,
      defaultOverlayId: chapter1OverlayIds.dreamVeil,
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/hub-shell');
    renderWithStore(rootStore);

    expect(screen.getByRole('heading', { name: 'Temple Hub' })).toBeInTheDocument();
    expect(screen.getByLabelText('scene cg layer')).toHaveAttribute('data-asset-id', chapter1CgIds.awakeningFlash);
    expect(screen.getByLabelText('scene overlay layer')).toHaveAttribute('data-asset-id', chapter1OverlayIds.dreamVeil);
  });

  it('renders authored route scene flows through the shared presentation shell', () => {
    const rootStore = new GameRootStore();

    rootStore.sceneFlowRegistry['tests/scene-flow/route-shell'] = {
      id: 'tests/scene-flow/route-shell',
      title: 'Route Shell',
      mode: 'route',
      startNodeId: 'start',
      nodes: {
        start: {
          id: 'start',
          kind: 'route',
          sourceNodeType: 'story',
          title: 'Route Shell',
          text: 'Shared route shell check.',
          route: {
            x: 20,
            y: 50,
          },
          transitions: [
            {
              id: 'route-next',
              nextNodeId: 'next',
            },
          ],
        },
        next: {
          id: 'next',
          kind: 'route',
          sourceNodeType: 'empty',
          title: 'Next Step',
          text: 'The route continues.',
          route: {
            x: 70,
            y: 50,
          },
          transitions: [
            {
              id: 'route-exit',
              nextNodeId: 'exit',
            },
          ],
        },
        exit: {
          id: 'exit',
          kind: 'route',
          sourceNodeType: 'exit',
          title: 'Exit',
          text: 'The route resolves into an exit.',
          route: {
            x: 88,
            y: 50,
          },
          encounter: {
            kind: 'exit',
            completesFlow: true,
          },
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/route-shell',
      },
      defaultCgId: chapter1CgIds.awakeningFlash,
      defaultOverlayId: chapter1OverlayIds.dreamVeil,
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/route-shell');
    renderWithStore(rootStore);

    expect(screen.getAllByRole('heading', { name: 'Route Shell' }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('scene cg layer')).toHaveAttribute('data-asset-id', chapter1CgIds.awakeningFlash);
    expect(screen.getByLabelText('scene overlay layer')).toHaveAttribute('data-asset-id', chapter1OverlayIds.dreamVeil);
  });

  it('returns to the main menu when the opening prologue is closed early', async () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    renderWithStore(rootStore);

    act(() => {
      rootStore.dialogue.endDialogue();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Грати' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Temple Exit Plaza' })).not.toBeInTheDocument();
    });
  });

  it('opens and closes the character menu modal', async () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();
    rootStore.openCharacterMenu();
    renderWithStore(rootStore);

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
