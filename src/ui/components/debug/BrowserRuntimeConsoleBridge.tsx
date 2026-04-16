import { useEffect } from 'react';

import { comparer, reaction } from 'mobx';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { GameRootStore } from '@engine/stores/GameRootStore';

export interface BrowserRuntimeSnapshot {
  activeRuntimeLayer: GameRootStore['activeRuntimeLayer'];
  activeScreen: string;
  activeModalId: string | null;
  sceneFlow: {
    isActive: boolean;
    mode: string | null;
    sourceType: string | null;
    flowId: string | null;
    sceneId: string | null;
    nodeId: string | null;
    title: string | null;
  };
  dialogue: {
    isActive: boolean;
    flowId: string | null;
    dialogueId: string | null;
    sceneId: string | null;
    sceneTitle: string | null;
    nodeId: string | null;
    nodeType: string | null;
    speakerId: string | null;
    speakerName: string | null;
  };
  world: {
    locationId: string | null;
    nodeId: string | null;
  };
  city: {
    sceneId: string | null;
    title: string | null;
  };
  travelBoard: {
    boardId: string | null;
    nodeId: string | null;
    phase: string;
  };
  battle: {
    battleId: string | null;
    phase: string;
    currentUnitId: string | null;
  };
}

export interface BrowserRuntimeDebugApi {
  readonly help: string;
  readonly last: BrowserRuntimeSnapshot;
  current(): BrowserRuntimeSnapshot;
  currentRef(): string | null;
  print(): BrowserRuntimeSnapshot;
}

declare global {
  interface Window {
    wthRuntime?: BrowserRuntimeDebugApi;
  }
}

export function buildBrowserRuntimeSnapshot(rootStore: GameRootStore): BrowserRuntimeSnapshot {
  return {
    activeRuntimeLayer: rootStore.activeRuntimeLayer,
    activeScreen: rootStore.ui.activeScreen,
    activeModalId: rootStore.ui.activeModal?.id ?? null,
    sceneFlow: {
      isActive: rootStore.sceneFlow.isActive,
      mode: rootStore.sceneFlow.activeMode,
      sourceType: rootStore.sceneFlow.activeSourceType,
      flowId: rootStore.sceneFlow.activeFlowId,
      sceneId: rootStore.sceneFlow.activeSceneId,
      nodeId: rootStore.sceneFlow.currentNodeId,
      title: rootStore.sceneFlow.currentFlow?.title ?? null,
    },
    dialogue: {
      isActive: rootStore.dialogue.isActive,
      flowId: rootStore.dialogue.activeFlowId,
      dialogueId: rootStore.dialogue.activeDialogueId,
      sceneId: rootStore.dialogue.activeSceneId,
      sceneTitle: rootStore.dialogue.currentSceneTitle,
      nodeId: rootStore.dialogue.currentNodeId,
      nodeType: rootStore.dialogue.currentNodeType,
      speakerId: rootStore.dialogue.currentSpeakerId,
      speakerName: rootStore.dialogue.currentSpeakerName,
    },
    world: {
      locationId: rootStore.world.currentLocationId,
      nodeId: rootStore.world.currentNodeId,
    },
    city: {
      sceneId: rootStore.city.activeSceneId,
      title: rootStore.city.currentScene?.locationName ?? null,
    },
    travelBoard: {
      boardId: rootStore.travelBoard.activeBoardId,
      nodeId: rootStore.travelBoard.currentNodeId,
      phase: rootStore.travelBoard.phase,
    },
    battle: {
      battleId: rootStore.battle.activeBattleId,
      phase: rootStore.battle.phase,
      currentUnitId: rootStore.battle.currentUnit?.unitId ?? null,
    },
  };
}

export function formatBrowserRuntimeSummary(snapshot: BrowserRuntimeSnapshot) {
  return [
    `layer=${snapshot.activeRuntimeLayer}`,
    `screen=${snapshot.activeScreen}`,
    `scene=${snapshot.sceneFlow.sceneId ?? 'n/a'}`,
    `flow=${snapshot.sceneFlow.flowId ?? 'n/a'}`,
    `node=${snapshot.sceneFlow.nodeId ?? 'n/a'}`,
    `speaker=${snapshot.dialogue.speakerName ?? snapshot.dialogue.speakerId ?? 'n/a'}`,
  ].join(' | ');
}

export function getBrowserRuntimeRef(snapshot: BrowserRuntimeSnapshot) {
  return (
    snapshot.sceneFlow.sceneId ??
    snapshot.sceneFlow.flowId ??
    snapshot.dialogue.dialogueId ??
    snapshot.city.sceneId ??
    snapshot.travelBoard.boardId ??
    snapshot.world.locationId ??
    snapshot.battle.battleId
  );
}

function logRuntimeSnapshot(snapshot: BrowserRuntimeSnapshot) {
  const runtimeRef = getBrowserRuntimeRef(snapshot);

  if (!runtimeRef) {
    return;
  }

  console.info(runtimeRef);
}

function createRuntimeApi(rootStore: GameRootStore) {
  let lastSnapshot = buildBrowserRuntimeSnapshot(rootStore);

  const api: BrowserRuntimeDebugApi = {
    help: 'Use window.wthRuntime.currentRef() for a short runtime id or current() for the full snapshot.',
    get last() {
      return lastSnapshot;
    },
    current() {
      return buildBrowserRuntimeSnapshot(rootStore);
    },
    currentRef() {
      return getBrowserRuntimeRef(buildBrowserRuntimeSnapshot(rootStore));
    },
    print() {
      const snapshot = buildBrowserRuntimeSnapshot(rootStore);

      lastSnapshot = snapshot;
      logRuntimeSnapshot(snapshot);

      return snapshot;
    },
  };

  return {
    api,
    update(snapshot: BrowserRuntimeSnapshot) {
      lastSnapshot = snapshot;
    },
  };
}

export function BrowserRuntimeConsoleBridge() {
  const rootStore = useGameRootStore();

  useEffect(() => {
    const runtimeApi = createRuntimeApi(rootStore);

    window.wthRuntime = runtimeApi.api;

    const dispose = reaction(
      () => buildBrowserRuntimeSnapshot(rootStore),
      (snapshot) => {
        runtimeApi.update(snapshot);
        logRuntimeSnapshot(snapshot);
      },
      {
        equals: comparer.structural,
        fireImmediately: true,
      },
    );

    return () => {
      dispose();

      if (window.wthRuntime === runtimeApi.api) {
        delete window.wthRuntime;
      }
    };
  }, [rootStore]);

  return null;
}
