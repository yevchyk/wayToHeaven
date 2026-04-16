import { runInAction } from 'mobx';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

function revealActiveDialogueLine(rootStore: GameRootStore) {
  act(() => {
    rootStore.dialogue.revealCurrentLine();
  });
}

describe('First vertical slice', () => {
  it(
    'starts in the chapter 1 prologue and still supports the first world-battle loop',
    async () => {
      const rootStore = new GameRootStore({
        battleRandom: () => 0,
      });

      renderWithStore(rootStore);

      fireEvent.click(screen.getByRole('button', { name: 'Грати' }));
      revealActiveDialogueLine(rootStore);

      expect(screen.getByRole('heading', { name: 'Повернення з гірських шахт' })).toBeInTheDocument();
      expect(screen.getByText(/Ранок у домі Торнів починався не зі світла\./i)).toBeInTheDocument();
      expect(rootStore.flags.getBooleanFlag('chapter1.prologue.seen')).toBe(true);

      fireEvent.click(screen.getByRole('button', { name: 'Кодекс' }));
      expect(screen.getByRole('dialog', { name: 'Бібліотека світу' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      act(() => {
        rootStore.dialogue.endDialogue();
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Грати' })).toBeInTheDocument();
      });

      act(() => {
        rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
      });

      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Temple Exit Plaza' }).length).toBeGreaterThan(0);
        expect(screen.getByText(/Ashen Reach/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Покинути місто через північну браму' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Pilgrim Road' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'City Gate' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Trigger dialogue' }));
      revealActiveDialogueLine(rootStore);

      expect(screen.getByRole('heading', { name: 'Оповідь' })).toBeInTheDocument();
      expect(screen.getByText('The wardens at the gate read faces before they read papers.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Далі|Завершити сцену/ }));
      revealActiveDialogueLine(rootStore);

      expect(screen.getByRole('heading', { name: 'Gate Guard' })).toBeInTheDocument();
      expect(screen.getByText('Halt. State your business before the city gate.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Show the pilgrim seal.' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Offer a respectful greeting.' }));
      revealActiveDialogueLine(rootStore);
      expect(screen.getByText('Manners still matter on this road. I can let you through.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Далі|Завершити сцену/ }));
      revealActiveDialogueLine(rootStore);
      expect(screen.getByText('Do not cause trouble inside the walls.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Далі|Завершити сцену/ }));

      fireEvent.click(screen.getByRole('button', { name: 'Move to Dusty Clearing' }));

      expect(screen.getByRole('heading', { name: 'Dusty Clearing' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Move to Ambush Site' }));

      expect(screen.getByRole('heading', { name: 'Ambush Site' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Trigger battle' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'guard-battle' })).toBeInTheDocument();
      });

      act(() => {
        runInAction(() => {
          const runtime = rootStore.battle.battleRuntime;
          const enemy = rootStore.battle.enemies[0];

          if (!runtime || !enemy) {
            throw new Error('Expected a battle runtime with one enemy.');
          }

          rootStore.battle.battleRuntime = {
            ...runtime,
            enemies: [{ ...enemy, currentHp: 1 }],
          };
        });
      });

      act(() => {
        rootStore.battle.performPlayerAction('attack', {
          targetId: 'guard-enemy',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('The encounter is over. Claim the road and continue.')).toBeInTheDocument();
      });

      expect(rootStore.flags.getBooleanFlag('guardTrust')).toBe(true);
      expect(rootStore.flags.getBooleanFlag('guardBattleWon')).toBe(true);
      expect(rootStore.flags.getBooleanFlag('pilgrimRoadCleared')).toBe(true);
      expect(rootStore.inventory.hasItem('pilgrim-seal')).toBe(true);
      expect(rootStore.meta.morale).toBe(2);
      expect(rootStore.meta.reputation).toBe(2);

      fireEvent.click(screen.getByRole('button', { name: 'Leave Battlefield' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Pilgrim Road' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Ambush Site' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Open Character Menu' }));

      expect(screen.getByRole('dialog', { name: 'Character Menu' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: 'Inventory' }));
      expect(screen.getByText('Pilgrim Seal')).toBeInTheDocument();
    },
    40_000,
  );
});
