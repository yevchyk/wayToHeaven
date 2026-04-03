import { fireEvent, screen } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('LibraryModal', () => {
  it('stays empty until content is actually discovered in runtime', () => {
    const rootStore = new GameRootStore();

    rootStore.openLibrary('characters');
    renderWithStore(rootStore);

    expect(screen.getByRole('dialog', { name: 'Бібліотека світу' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Персонажі/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/бібліотеці поки немає відкритих персонажів/i)).toBeInTheDocument();
  });

  it('renders only discovered character and location entries in runtime mode', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.revealCurrentLine();
    rootStore.dialogue.next();
    rootStore.openLibrary('characters', 'mirella');
    renderWithStore(rootStore);

    expect(screen.getByRole('button', { name: /Мірелла/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Служниця/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gate Guard/ })).not.toBeInTheDocument();
    expect(screen.getByText('героїня')).toBeInTheDocument();
    expect(screen.getByTestId('library-description-panel')).toHaveTextContent(
      'Мірелла поки що не має окремого бібліотечного опису.',
    );

    fireEvent.click(screen.getByRole('tab', { name: /Локації/ }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Пролог — Мікроглава I: Повернення з гірських шахт/,
      }),
    );

    expect(screen.getByText('сюжетна сцена')).toBeInTheDocument();
    expect(screen.getByTestId('library-description-panel')).toHaveTextContent(
      'Morning form, a family inspection in the mountain mines',
    );
    expect(screen.queryByRole('button', { name: /Pilgrim Road/ })).not.toBeInTheDocument();
  });
});
