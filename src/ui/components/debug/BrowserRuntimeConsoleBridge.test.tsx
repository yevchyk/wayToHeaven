import { act, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { AppProviders } from '@app/bootstrap/AppProviders';
import { GameRootStore } from '@engine/stores/GameRootStore';

import {
  BrowserRuntimeConsoleBridge,
  getBrowserRuntimeRef,
  type BrowserRuntimeDebugApi,
} from './BrowserRuntimeConsoleBridge';

function getRuntimeApi() {
  return (window as Window & { wthRuntime?: BrowserRuntimeDebugApi }).wthRuntime ?? null;
}

describe('BrowserRuntimeConsoleBridge', () => {
  it('publishes the active runtime state to the browser console bridge', async () => {
    const rootStore = new GameRootStore();
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { unmount } = render(
      <AppProviders rootStore={rootStore}>
        <BrowserRuntimeConsoleBridge />
      </AppProviders>,
    );

    await waitFor(() => {
      expect(getRuntimeApi()).not.toBeNull();
    });

    const runtimeApi = getRuntimeApi();

    if (!runtimeApi) {
      throw new Error('Expected browser runtime api to be registered.');
    }

    expect(runtimeApi.help).toContain('window.wthRuntime.currentRef()');
    expect(runtimeApi.current().activeRuntimeLayer).toBe('home');
    expect(runtimeApi.current().sceneFlow.sceneId).toBeNull();
    expect(runtimeApi.currentRef()).toBeNull();

    act(() => {
      rootStore.dialogue.startScene('chapter-1/scene/awakening');
      rootStore.dialogue.next();
    });

    await waitFor(() => {
      expect(runtimeApi.last.sceneFlow.sceneId).toBe('chapter-1/scene/awakening');
    });

    expect(runtimeApi.last.activeRuntimeLayer).toBe('dialogue');
    expect(runtimeApi.last.sceneFlow.mode).toBe('sequence');
    expect(runtimeApi.last.dialogue.flowId).toBe('chapter-1/scene/awakening');
    expect(runtimeApi.last.dialogue.nodeId).toBe('awakening-2');
    expect(runtimeApi.last.dialogue.speakerId).toBe('ner-azet');
    expect(runtimeApi.currentRef()).toBe('chapter-1/scene/awakening');
    expect(getBrowserRuntimeRef(runtimeApi.last)).toBe('chapter-1/scene/awakening');

    const printedSnapshot = runtimeApi.print();

    expect(printedSnapshot.sceneFlow.sceneId).toBe('chapter-1/scene/awakening');
    expect(consoleInfoSpy).toHaveBeenLastCalledWith('chapter-1/scene/awakening');

    unmount();

    await waitFor(() => {
      expect(getRuntimeApi()).toBeNull();
    });

    consoleInfoSpy.mockRestore();
  });
});
