import { fireEvent, screen } from '@testing-library/react';

import {
  buildCharacterLibraryEntries,
  buildLocationLibraryEntries,
  buildSceneLibraryEntries,
} from '@engine/systems/library/buildLibraryEntries';
import {
  buildSceneLocationLibraryEntryId,
  buildSceneReplayLibraryEntryId,
} from '@engine/systems/library/libraryDiscovery';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { renderWithStore } from '@test/renderWithStore';

describe('LibraryModal', () => {
  it('stays empty until content is actually discovered in runtime', () => {
    const rootStore = new GameRootStore();

    rootStore.openLibrary('characters');
    const { container } = renderWithStore(rootStore);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelector('[data-library-entry-id]')).toBeNull();
    expect(screen.queryByTestId('library-description-panel')).not.toBeInTheDocument();
  }, 15_000);

  it('renders only discovered character and location entries in runtime mode', () => {
    const rootStore = new GameRootStore();
    const characterEntries = buildCharacterLibraryEntries(rootStore);
    const locationEntries = buildLocationLibraryEntries(rootStore);
    const mirellaEntry = characterEntries.find((entry) => entry.id === 'mirella');
    const introSceneLocationEntryId = buildSceneLocationLibraryEntryId('chapter-1/scene/intro');
    const introSceneLocationEntry = locationEntries.find((entry) => entry.id === introSceneLocationEntryId);

    expect(mirellaEntry).toBeTruthy();
    expect(introSceneLocationEntry).toBeTruthy();

    rootStore.seenContent.markCharacterDiscovered('mirella');
    rootStore.seenContent.markLocationEntryDiscovered(introSceneLocationEntryId);
    rootStore.openLibrary('characters', 'mirella');
    renderWithStore(rootStore);

    const mirellaButton = document.body.querySelector<HTMLButtonElement>('[data-library-entry-id="mirella"]');

    expect(mirellaButton).not.toBeNull();

    if (!mirellaButton || !mirellaEntry || !introSceneLocationEntry) {
      throw new Error('Expected library entries were not resolved for test setup.');
    }

    expect(mirellaButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Gate Guard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: mirellaEntry.title })).toBeInTheDocument();
    expect(screen.getByTestId('library-description-panel')).toHaveTextContent(mirellaEntry.description);

    const tabs = screen.getAllByRole('tab');
    const locationTab = tabs[1];

    expect(locationTab).toBeTruthy();

    if (!locationTab) {
      throw new Error('Expected a locations tab in the library modal.');
    }

    fireEvent.click(locationTab);

    const introSceneLocationButton = document.body.querySelector<HTMLButtonElement>(
      `[data-library-entry-id="${introSceneLocationEntryId}"]`,
    );

    expect(introSceneLocationButton).not.toBeNull();

    if (!introSceneLocationButton) {
      throw new Error('Expected discovered scene location entry was not rendered.');
    }

    fireEvent.click(introSceneLocationButton);

    expect(screen.getByRole('heading', { name: introSceneLocationEntry.title })).toBeInTheDocument();
    expect(screen.getByTestId('library-description-panel')).toHaveTextContent(introSceneLocationEntry.description);
    expect(screen.queryByRole('button', { name: /Pilgrim Road/i })).not.toBeInTheDocument();
  }, 15_000);

  it('shows unlocked replay scenes and starts preview mode from the library', () => {
    const rootStore = new GameRootStore();
    const sceneEntries = buildSceneLibraryEntries(rootStore);
    const introReplayEntryId = buildSceneReplayLibraryEntryId('chapter-1/scene/intro');
    const introReplayEntry = sceneEntries.find((entry) => entry.id === introReplayEntryId);

    expect(introReplayEntry).toBeTruthy();

    rootStore.seenContent.markSceneEntryDiscovered(introReplayEntryId);
    rootStore.openLibrary('scenes');

    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('tab', { name: /Scene Replay/i }));

    const introReplayButton = document.body.querySelector<HTMLButtonElement>(
      `[data-library-entry-id="${introReplayEntryId}"]`,
    );

    expect(introReplayButton).not.toBeNull();

    if (!introReplayButton || !introReplayEntry) {
      throw new Error('Expected replay library entry was not rendered.');
    }

    fireEvent.click(introReplayButton);

    expect(screen.getByRole('button', { name: /Preview scene/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: introReplayEntry.title })).toBeInTheDocument();
    expect(screen.getByTestId('library-description-panel')).toHaveTextContent(
      /Replay-mode opens this scene in an isolated preview sandbox/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /Preview scene/i }));

    expect(rootStore.sceneFlow.isPreviewActive).toBe(true);
    expect(rootStore.ui.activeScreen).toBe('dialogue');
  }, 15_000);
});
