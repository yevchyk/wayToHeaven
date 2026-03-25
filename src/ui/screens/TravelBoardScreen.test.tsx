import { fireEvent, screen } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('TravelBoardScreen', () => {
  it('opens the travel board demo and exposes branch selection after a roll', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.4,
    });

    rootStore.startTravelBoardDemo();
    renderWithStore(rootStore);

    expect(screen.getByRole('heading', { name: 'Underground Route' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Roll' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Scout' }));

    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByText('Choose a direction')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Shackled Guard/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Buried Cache/ }).length).toBeGreaterThan(0);
  });
});
