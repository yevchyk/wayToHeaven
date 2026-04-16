import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { GameSaveRuntimeSnapshot, SceneFlowSnapshot } from '@engine/types/save';
import type {
  SceneFlowPresentationState,
  SceneFlowRouteRuntime,
  SceneFlowSession,
} from '@engine/types/sceneFlow';
import type { TravelLogEntryType } from '@engine/types/travel';

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

function cloneStageState(stage: NonNullable<SceneFlowPresentationState['currentStage']>) {
  const clonePlacedCharacter = <T extends { placement?: object }>(character: T) => ({
    ...character,
    ...(character.placement ? { placement: { ...character.placement } } : {}),
  });

  return {
    ...(stage.characters
      ? {
          characters: stage.characters.map((character) => clonePlacedCharacter(character)),
        }
      : {}),
    ...(stage.extra
      ? {
          extra: stage.extra.map((character) => clonePlacedCharacter(character)),
        }
      : {}),
    ...(stage.left !== undefined ? { left: stage.left ? clonePlacedCharacter(stage.left) : null } : {}),
    ...(stage.center !== undefined ? { center: stage.center ? clonePlacedCharacter(stage.center) : null } : {}),
    ...(stage.right !== undefined ? { right: stage.right ? clonePlacedCharacter(stage.right) : null } : {}),
    ...(stage.focusCharacterId ? { focusCharacterId: stage.focusCharacterId } : {}),
    ...(stage.backgroundId ? { backgroundId: stage.backgroundId } : {}),
    ...(stage.cgId ? { cgId: stage.cgId } : {}),
    ...(stage.overlayId ? { overlayId: stage.overlayId } : {}),
  };
}

function clonePresentationState(
  presentation: SceneFlowPresentationState,
): SceneFlowPresentationState {
  return {
    backgroundId: presentation.backgroundId,
    musicId: presentation.musicId,
    cgId: presentation.cgId,
    overlayId: presentation.overlayId,
    lastSfxId: presentation.lastSfxId,
    currentStage: presentation.currentStage ? cloneStageState(presentation.currentStage) : null,
    backgroundStyle: presentation.backgroundStyle,
    activeTransition: presentation.activeTransition ? { ...presentation.activeTransition } : null,
  };
}

function cloneRouteRuntime(routeRuntime: SceneFlowRouteRuntime | null) {
  if (!routeRuntime) {
    return null;
  }

  return {
    ...routeRuntime,
    revealedNodeIds: [...routeRuntime.revealedNodeIds],
    visitedNodeIds: [...routeRuntime.visitedNodeIds],
    resolvedNodeIds: [...routeRuntime.resolvedNodeIds],
    eventLog: [...routeRuntime.eventLog],
  };
}

function buildTransitionKey(flowId: string, transitionId: string) {
  return `${flowId}:${transitionId}`;
}

function parseTrailingSequence(value: string, prefix: string) {
  if (!value.startsWith(prefix)) {
    return 0;
  }

  const parsed = Number(value.slice(prefix.length));

  return Number.isFinite(parsed) ? parsed : 0;
}

function cloneSession(session: SceneFlowSession): SceneFlowSession {
  return {
    ...session,
    playbackMode: session.playbackMode ?? 'live',
    visibleTransitionIds: [...session.visibleTransitionIds],
    visitedNodeIds: [...session.visitedNodeIds],
    presentation: clonePresentationState(session.presentation),
    routeRuntime: cloneRouteRuntime(session.routeRuntime),
  };
}

export class SceneFlowStore {
  readonly rootStore: GameRootStore;

  flowStack: SceneFlowSession[] = [];
  visitedHubFlowIds: string[] = [];
  triggeredHubTransitionKeys: string[] = [];
  previewRuntimeSnapshot: GameSaveRuntimeSnapshot | null = null;
  previewSceneId: string | null = null;
  ambientPresentation: SceneFlowPresentationState = {
    backgroundId: null,
    musicId: null,
    cgId: null,
    overlayId: null,
    lastSfxId: null,
    currentStage: null,
    backgroundStyle: null,
    activeTransition: null,
  };

  private sessionSequence = 0;
  private routeLogSequence = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(
      this,
      {
        rootStore: false,
        previewRuntimeSnapshot: false,
      },
      { autoBind: true },
    );
  }

  get isActive() {
    return this.flowStack.length > 0;
  }

  get activeSession() {
    return this.flowStack.at(-1) ?? null;
  }

  get parentSession() {
    return this.flowStack.length > 1 ? this.flowStack[this.flowStack.length - 2] ?? null : null;
  }

  get isPreviewActive() {
    return this.previewRuntimeSnapshot !== null;
  }

  get activeFlowId() {
    return this.activeSession?.flowId ?? null;
  }

  get activeMode() {
    return this.activeSession?.mode ?? null;
  }

  get activeSourceType() {
    return this.activeSession?.sourceType ?? null;
  }

  get activeSceneId() {
    return this.activeSession?.sceneId ?? null;
  }

  get currentFlow() {
    return this.activeFlowId ? this.rootStore.getSceneFlowById(this.activeFlowId) ?? null : null;
  }

  get currentNodeId() {
    return this.activeSession?.currentNodeId ?? null;
  }

  get currentNode() {
    const currentFlow = this.currentFlow;
    const currentNodeId = this.currentNodeId;

    if (!currentFlow || !currentNodeId) {
      return null;
    }

    return currentFlow.nodes[currentNodeId] ?? null;
  }

  get visibleTransitionIds() {
    return this.activeSession?.visibleTransitionIds ?? [];
  }

  get visitedNodeIds() {
    return this.activeSession?.visitedNodeIds ?? [];
  }

  get pendingJumpNodeId() {
    return this.activeSession?.pendingJumpNodeId ?? null;
  }

  get currentBackgroundId() {
    return this.activeSession?.presentation.backgroundId ?? this.ambientPresentation.backgroundId;
  }

  get currentBackgroundStyle() {
    return this.activeSession?.presentation.backgroundStyle ?? this.ambientPresentation.backgroundStyle;
  }

  get currentMusicId() {
    return this.activeSession?.presentation.musicId ?? this.ambientPresentation.musicId;
  }

  get currentCgId() {
    return this.activeSession?.presentation.cgId ?? this.ambientPresentation.cgId;
  }

  get currentOverlayId() {
    return this.activeSession?.presentation.overlayId ?? this.ambientPresentation.overlayId;
  }

  get currentStage() {
    return this.activeSession?.presentation.currentStage ?? this.ambientPresentation.currentStage;
  }

  get lastSfxId() {
    return this.activeSession?.presentation.lastSfxId ?? this.ambientPresentation.lastSfxId;
  }

  get routeRuntime() {
    return this.activeSession?.routeRuntime ?? null;
  }

  get hasActiveRoute() {
    return this.activeMode === 'route' && this.routeRuntime !== null;
  }

  get routePhase() {
    return this.routeRuntime?.phase ?? 'idle';
  }

  get remainingSteps() {
    return this.routeRuntime?.remainingSteps ?? 0;
  }

  get lastRoll() {
    return this.routeRuntime?.lastRoll ?? null;
  }

  get scoutCharges() {
    return this.routeRuntime?.scoutCharges ?? 0;
  }

  get scoutDepth() {
    return this.routeRuntime?.scoutDepth ?? 0;
  }

  get routeEventLog() {
    return this.routeRuntime?.eventLog ?? [];
  }

  get revealedNodeIds() {
    return this.routeRuntime?.revealedNodeIds ?? [];
  }

  get routeVisitedNodeIds() {
    return this.routeRuntime?.visitedNodeIds ?? [];
  }

  get resolvedNodeIds() {
    return this.routeRuntime?.resolvedNodeIds ?? [];
  }

  get isAwaitingRoll() {
    return this.routePhase === 'awaitingRoll';
  }

  get isAwaitingDirection() {
    return this.routePhase === 'awaitingDirection';
  }

  get snapshot(): SceneFlowSnapshot {
    return {
      flowStack: this.flowStack.map((session) => cloneSession(session)),
      visitedHubFlowIds: [...this.visitedHubFlowIds],
      triggeredHubTransitionKeys: [...this.triggeredHubTransitionKeys],
      ambientPresentation: clonePresentationState(this.ambientPresentation),
    };
  }

  createSession(
    input: Omit<SceneFlowSession, 'sessionId'>,
  ): SceneFlowSession {
    this.sessionSequence += 1;

    return {
      ...input,
      sessionId: `scene-flow-session-${this.sessionSequence}`,
      visibleTransitionIds: [...input.visibleTransitionIds],
      visitedNodeIds: [...input.visitedNodeIds],
      presentation: clonePresentationState(input.presentation),
      routeRuntime: cloneRouteRuntime(input.routeRuntime),
    };
  }

  pushSession(input: Omit<SceneFlowSession, 'sessionId'>) {
    const session = this.createSession(input);

    this.flowStack = [...this.flowStack, session];

    return session;
  }

  replaceTopSession(input: Omit<SceneFlowSession, 'sessionId'>) {
    const nextSession = this.createSession(input);
    const prefix = this.flowStack.slice(0, -1);

    this.flowStack = [...prefix, nextSession];

    return nextSession;
  }

  popSession() {
    const activeSession = this.activeSession;

    if (!activeSession) {
      return null;
    }

    this.flowStack = this.flowStack.slice(0, -1);

    return activeSession;
  }

  reset() {
    this.flowStack = [];
    this.visitedHubFlowIds = [];
    this.triggeredHubTransitionKeys = [];
    this.previewRuntimeSnapshot = null;
    this.previewSceneId = null;
    this.ambientPresentation = {
      backgroundId: null,
      musicId: null,
      cgId: null,
      overlayId: null,
      lastSfxId: null,
      currentStage: null,
      backgroundStyle: null,
      activeTransition: null,
    };
    this.sessionSequence = 0;
    this.routeLogSequence = 0;
  }

  restore(snapshot: SceneFlowSnapshot) {
    this.flowStack = snapshot.flowStack.map((session) => cloneSession(session));
    this.visitedHubFlowIds = [...snapshot.visitedHubFlowIds];
    this.triggeredHubTransitionKeys = [...snapshot.triggeredHubTransitionKeys];
    this.previewRuntimeSnapshot = null;
    this.previewSceneId = null;
    this.ambientPresentation = clonePresentationState(snapshot.ambientPresentation);
    this.sessionSequence = this.flowStack.reduce(
      (highestSequence, session) =>
        Math.max(highestSequence, parseTrailingSequence(session.sessionId, 'scene-flow-session-')),
      0,
    );
    this.routeLogSequence = this.flowStack.reduce((highestSequence, session) => {
      const nextHighestSequence = session.routeRuntime?.eventLog.reduce(
        (highestEventSequence, entry) =>
          Math.max(highestEventSequence, parseTrailingSequence(entry.id, 'travel-log-')),
        0,
      ) ?? 0;

      return Math.max(highestSequence, nextHighestSequence);
    }, 0);
  }

  markHubFlowVisited(flowId: string) {
    if (!this.visitedHubFlowIds.includes(flowId)) {
      this.visitedHubFlowIds.push(flowId);
    }
  }

  beginPreview(runtimeSnapshot: GameSaveRuntimeSnapshot, sceneId: string) {
    this.previewRuntimeSnapshot = runtimeSnapshot;
    this.previewSceneId = sceneId;
  }

  consumePreviewRuntimeSnapshot() {
    const snapshot = this.previewRuntimeSnapshot;

    this.previewRuntimeSnapshot = null;
    this.previewSceneId = null;

    return snapshot;
  }

  markHubTransitionTriggered(flowId: string, transitionId: string) {
    const transitionKey = buildTransitionKey(flowId, transitionId);

    if (!this.triggeredHubTransitionKeys.includes(transitionKey)) {
      this.triggeredHubTransitionKeys.push(transitionKey);
    }
  }

  hasTriggeredHubTransition(flowId: string, transitionId: string) {
    return this.triggeredHubTransitionKeys.includes(buildTransitionKey(flowId, transitionId));
  }

  setCurrentNodeId(nodeId: string, sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      currentNodeId: nodeId,
    }));
  }

  addVisitedNode(nodeId: string, sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      visitedNodeIds: session.visitedNodeIds.includes(nodeId)
        ? session.visitedNodeIds
        : [...session.visitedNodeIds, nodeId],
    }));
  }

  setVisibleTransitionIds(transitionIds: readonly string[], sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      visibleTransitionIds: [...transitionIds],
    }));
  }

  setPendingJumpNodeId(nodeId: string | null, sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      pendingJumpNodeId: nodeId,
    }));
  }

  consumePendingJumpNodeId(sessionId = this.activeSession?.sessionId ?? null) {
    const session = sessionId ? this.getSessionById(sessionId) : null;
    const nodeId = session?.pendingJumpNodeId ?? null;

    if (sessionId) {
      this.setPendingJumpNodeId(null, sessionId);
    }

    return nodeId;
  }

  setPresentation(
    patch: Partial<SceneFlowPresentationState>,
    sessionId = this.activeSession?.sessionId ?? null,
  ) {
    if (!sessionId) {
      this.ambientPresentation = {
        ...this.ambientPresentation,
        ...patch,
      };

      return;
    }

    this.updateSession(sessionId, (session) => ({
      ...session,
      presentation: {
        ...session.presentation,
        ...patch,
      },
    }));
  }

  setRouteRuntime(
    patch: Partial<SceneFlowRouteRuntime>,
    sessionId = this.activeSession?.sessionId ?? null,
  ) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      routeRuntime: session.routeRuntime
        ? {
            ...session.routeRuntime,
            ...patch,
          }
        : null,
    }));
  }

  moveRouteToNode(nodeId: string, sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      currentNodeId: nodeId,
      visitedNodeIds: session.visitedNodeIds.includes(nodeId)
        ? session.visitedNodeIds
        : [...session.visitedNodeIds, nodeId],
      routeRuntime: session.routeRuntime
        ? {
            ...session.routeRuntime,
            visitedNodeIds: session.routeRuntime.visitedNodeIds.includes(nodeId)
              ? session.routeRuntime.visitedNodeIds
              : [...session.routeRuntime.visitedNodeIds, nodeId],
            revealedNodeIds: uniqueValues([...session.routeRuntime.revealedNodeIds, nodeId]),
          }
        : null,
    }));
  }

  revealRouteNodes(nodeIds: readonly string[], sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      routeRuntime: session.routeRuntime
        ? {
            ...session.routeRuntime,
            revealedNodeIds: uniqueValues([...session.routeRuntime.revealedNodeIds, ...nodeIds]),
          }
        : null,
    }));
  }

  markRouteNodeResolved(nodeId: string, sessionId = this.activeSession?.sessionId ?? null) {
    this.updateSession(sessionId, (session) => ({
      ...session,
      routeRuntime: session.routeRuntime
        ? {
            ...session.routeRuntime,
            resolvedNodeIds: session.routeRuntime.resolvedNodeIds.includes(nodeId)
              ? session.routeRuntime.resolvedNodeIds
              : [...session.routeRuntime.resolvedNodeIds, nodeId],
          }
        : null,
    }));
  }

  pushRouteLog(
    type: TravelLogEntryType,
    message: string,
    nodeId?: string,
    sessionId = this.activeSession?.sessionId ?? null,
  ) {
    const session = sessionId ? this.getSessionById(sessionId) : null;

    if (!session?.routeRuntime) {
      return null;
    }

    this.routeLogSequence += 1;
    const entry = {
      id: `travel-log-${this.routeLogSequence}`,
      type,
      message,
      ...(nodeId ? { nodeId } : {}),
    };

    this.updateSession(sessionId, (currentSession) => ({
      ...currentSession,
      routeRuntime: currentSession.routeRuntime
        ? {
            ...currentSession.routeRuntime,
            eventLog: [...currentSession.routeRuntime.eventLog, entry],
          }
        : null,
    }));

    return entry;
  }

  getSessionById(sessionId: string) {
    return this.flowStack.find((session) => session.sessionId === sessionId) ?? null;
  }

  private updateSession(
    sessionId: string | null,
    updater: (session: SceneFlowSession) => SceneFlowSession,
  ) {
    if (!sessionId) {
      return;
    }

    this.flowStack = this.flowStack.map((session) =>
      session.sessionId === sessionId ? updater(session) : session,
    );
  }
}
