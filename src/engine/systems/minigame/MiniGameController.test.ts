import { GameRootStore } from '@engine/stores/GameRootStore';

describe('MiniGameController', () => {
  it('starts the fishing mini-game, resolves success, and levels fishing skill', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.miniGameController.startMinigame('chapter-1/minigame/fishing/reed-bank');

    expect(rootStore.activeRuntimeLayer).toBe('minigame');
    expect(rootStore.ui.activeScreen).toBe('minigame');
    expect(rootStore.miniGame.fishingSession).not.toBeNull();

    const session = rootStore.miniGame.fishingSession;

    if (!session) {
      throw new Error('Expected active fishing session.');
    }

    rootStore.miniGame.updateSession({
      ...session,
      catchProgress: 99,
      remainingMs: 5000,
      isHolding: true,
    });
    rootStore.miniGameController.tick(100);

    expect(rootStore.miniGame.activeSession?.result?.outcome).toBe('success');
    expect(rootStore.miniGame.getSkillLevel('fishing')).toBe(1);

    rootStore.miniGameController.finishSession();

    expect(rootStore.miniGame.hasActiveSession).toBe(false);
    expect(rootStore.ui.activeScreen).toBe('world');
  });

  it('resolves the dance mini-game through arrow input and levels dance skill', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('home');
    rootStore.miniGameController.startMinigame('chapter-1/minigame/dance/lantern-step');

    const session = rootStore.miniGame.activeSession;

    if (!session || session.kind !== 'dance') {
      throw new Error('Expected active dance session.');
    }

    for (const prompt of session.prompts) {
      const currentSession = rootStore.miniGame.activeSession;

      if (!currentSession || currentSession.kind !== 'dance') {
        throw new Error('Expected dance session while iterating prompts.');
      }

      rootStore.miniGame.updateSession({
        ...currentSession,
        elapsedMs: prompt.scheduledTimeMs,
      });
      rootStore.miniGameController.pressDanceDirection(prompt.direction);
    }

    expect(rootStore.miniGame.activeSession?.result?.outcome).toBe('success');
    expect(rootStore.miniGame.getSkillLevel('dance')).toBe(1);
  });
});
