import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { SceneFlowStore } from '@engine/stores/SceneFlowStore';
import { applyScenePresentationPatch } from '@engine/systems/scenes/applyScenePresentationPatch';
import type {
  SceneFlowData,
  SceneFlowFallbackTarget,
  SceneFlowNode,
  SceneFlowPresentationState,
  SceneFlowRouteRuntime,
  SceneFlowSession,
  SceneFlowTransition,
} from '@engine/types/sceneFlow';
import type { ScreenId } from '@engine/types/ui';

type RandomSource = () => number;

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

function screenIdForMode(mode: SceneFlowData['mode']): ScreenId {
  switch (mode) {
    case 'hub':
      return 'city';
    case 'route':
      return 'travelBoard';
    case 'sequence':
    default:
      return 'dialogue';
  }
}

interface RouteEncounterResolution {
  message: string;
  completed?: boolean;
}

type ResolvedNodeTarget =
  | { kind: 'node'; nodeId: string }
  | { kind: 'sceneFlow'; flowId: string }
  | { kind: 'end' };

export class SceneFlowController {
  readonly rootStore: GameRootStore;

  private readonly random: RandomSource;

  constructor(rootStore: GameRootStore, random: RandomSource = Math.random) {
    this.rootStore = rootStore;
    this.random = random;
  }

  private get store(): SceneFlowStore {
    return this.rootStore.sceneFlow;
  }

  startScene(sceneId: string) {
    const scene = this.rootStore.getSceneById(sceneId);

    if (!scene) {
      throw new Error(`Scene "${sceneId}" was not found.`);
    }

    if (scene.mainSceneFlowId) {
      return this.startSceneFlow(scene.mainSceneFlowId, {
        sceneId,
        replaceTop: true,
      });
    }

    throw new Error(`Scene "${sceneId}" does not define a main scene flow.`);
  }

  startSceneFlow(
    flowId: string,
    options: {
      sceneId?: string;
      replaceTop?: boolean;
      startNodeId?: string;
    } = {},
  ) {
    return this.startFlow(flowId, options);
  }

  startDialogue(
    dialogueId: string,
    options: {
      sceneId?: string;
      replaceTop?: boolean;
    } = {},
  ) {
    const dialogue = this.rootStore.getDialogueById(dialogueId);

    if (!dialogue) {
      throw new Error(`Dialogue "${dialogueId}" was not found.`);
    }

    this.rootStore.dialogueValidator.assertValid(dialogue);

    return this.startFlow(dialogueId, {
      replaceTop: options.replaceTop ?? false,
      sceneId: options.sceneId ?? dialogue.meta?.sceneId ?? null,
    });
  }

  startCityScene(sceneId: string, options: { replaceTop?: boolean } = {}) {
    const scene = this.rootStore.getCitySceneById(sceneId);

    if (!scene) {
      throw new Error(`City scene "${sceneId}" was not found.`);
    }

    this.rootStore.citySceneValidator.assertValid(scene);

    return this.startFlow(sceneId, {
      replaceTop: options.replaceTop ?? true,
    });
  }

  startTravelBoard(boardId: string, startNodeId?: string, options: { replaceTop?: boolean } = {}) {
    const board = this.rootStore.getTravelBoardById(boardId);

    if (!board) {
      throw new Error(`Travel board "${boardId}" was not found.`);
    }

    this.rootStore.travelBoardValidator.assertValid(board);

    return this.startFlow(boardId, {
      replaceTop: options.replaceTop ?? false,
      startNodeId: startNodeId ?? board.startNodeId,
    });
  }

  endActiveFlow() {
    const poppedSession = this.store.popSession();

    if (!poppedSession) {
      return;
    }

    this.rootStore.dialogue.handleFlowExited();

    const poppedScreenId = screenIdForMode(poppedSession.mode);
    const shouldRestoreScreen = this.rootStore.ui.activeScreen === poppedScreenId;

    const parentSession = this.store.activeSession;

    if (parentSession) {
      this.rootStore.audio.syncSceneFlowPresentation();

      if (shouldRestoreScreen) {
        this.rootStore.ui.setScreen(screenIdForMode(parentSession.mode));
      }

      this.refreshVisibleTransitions(parentSession.sessionId);
      this.resumePendingBattleIfNeeded();

      return;
    }

    if (shouldRestoreScreen) {
      this.rootStore.ui.setScreen(
        poppedSession.returnScreenId ?? (this.rootStore.world.hasActiveLocation ? 'world' : 'home'),
      );
    }

    this.rootStore.audio.syncSceneFlowPresentation();
    this.resumePendingBattleIfNeeded();
  }

  moveToNode(
    nodeId: string,
    options: {
      sessionId?: string;
      skipExitEffects?: boolean;
    } = {},
  ) {
    const sessionId = options.sessionId ?? this.store.activeSession?.sessionId ?? null;
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);
    const previousNode = flow.nodes[session.currentNodeId] ?? null;

    let targetNodeId = nodeId;

    if (!options.skipExitEffects && previousNode && previousNode.id !== targetNodeId) {
      this.applyEffects(previousNode.onExitEffects);

      const exitJumpTarget = this.store.consumePendingJumpNodeId(session.sessionId);

      if (exitJumpTarget && exitJumpTarget !== targetNodeId) {
        targetNodeId = exitJumpTarget;
      }
    }

    const resolvedNodeTarget = this.resolveNodeTarget(flow, targetNodeId);

    if (resolvedNodeTarget.kind === 'sceneFlow') {
      this.startSceneFlow(resolvedNodeTarget.flowId, { replaceTop: true });

      return false;
    }

    if (resolvedNodeTarget.kind === 'end') {
      this.endActiveFlow();

      return false;
    }

    targetNodeId = resolvedNodeTarget.nodeId;

    const node = flow.nodes[targetNodeId];

    if (!node) {
      throw new Error(`Scene flow node "${targetNodeId}" does not exist in "${flow.id}".`);
    }

    if (flow.mode === 'route') {
      this.store.moveRouteToNode(targetNodeId, session.sessionId);
    } else {
      this.store.setCurrentNodeId(targetNodeId, session.sessionId);
      this.store.addVisitedNode(targetNodeId, session.sessionId);
    }

    this.syncPresentationFromNode(node, session.sessionId);
    this.applyEffects(node.onEnterEffects);

    const jumpTarget = this.store.consumePendingJumpNodeId(session.sessionId);

    if (jumpTarget && jumpTarget !== targetNodeId) {
      this.moveToNode(jumpTarget, { sessionId: session.sessionId });

      return;
    }

    this.refreshVisibleTransitions(session.sessionId);

    if (flow.mode === 'sequence') {
      this.rootStore.dialogue.handleNodeEntered(session.flowId, targetNodeId);
    }

    return true;
  }

  advanceSequence() {
    const session = this.requireActiveSession();
    const flow = this.requireFlow(session.flowId);
    const node = this.requireCurrentNode(session.sessionId);

    if (flow.mode !== 'sequence') {
      return false;
    }

    if (node.transitions.length > 0 && node.transitions.some((transition) => Boolean(transition.label))) {
      return false;
    }

    const nextTransition = node.transitions[0] ?? null;

    if (nextTransition?.nextNodeId) {
      this.moveToNode(nextTransition.nextNodeId, { sessionId: session.sessionId });

      return true;
    }

    if (nextTransition?.nextSceneId) {
      this.startSceneFlow(nextTransition.nextSceneId, { replaceTop: true });

      return true;
    }

    this.endActiveFlow();

    return false;
  }

  chooseTransition(transitionId: string) {
    const session = this.requireActiveSession();
    const flow = this.requireFlow(session.flowId);
    const transition = this.getVisibleTransitions(session.sessionId).find((entry) => entry.id === transitionId);

    if (!transition) {
      return false;
    }

    this.applyEffects(transition.effects);

    if (flow.mode === 'hub' && transition.once) {
      this.store.markHubTransitionTriggered(flow.id, transition.id);
    }

    const jumpTarget = this.store.consumePendingJumpNodeId(session.sessionId);

    if (jumpTarget) {
      this.moveToNode(jumpTarget, { sessionId: session.sessionId });

      return true;
    }

    if (transition.nextNodeId) {
      this.moveToNode(transition.nextNodeId, { sessionId: session.sessionId });

      return true;
    }

    if (transition.openSceneFlowId) {
      this.openReferencedFlow(transition.openSceneFlowId);

      return true;
    }

    if (transition.nextSceneId) {
      this.startSceneFlow(transition.nextSceneId, { replaceTop: true });

      return true;
    }

    if (flow.mode === 'sequence') {
      this.endActiveFlow();
    } else if (this.rootStore.ui.activeScreen !== screenIdForMode(flow.mode)) {
      this.endActiveFlow();
    } else {
      this.refreshVisibleTransitions(session.sessionId);
    }

    return true;
  }

  getVisibleTransitions(sessionId = this.store.activeSession?.sessionId ?? null) {
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);
    const node = flow.nodes[session.currentNodeId];

    if (!node) {
      return [];
    }

    if (flow.mode === 'route') {
      const availableNodeIds = this.getAvailableDirectionNodeIds(session.sessionId);

      return node.transitions.filter((transition) => transition.nextNodeId && availableNodeIds.includes(transition.nextNodeId));
    }

    return node.transitions.filter((transition) => {
      if (!this.rootStore.dialogueConditionEvaluator.evaluateAll(transition.conditions)) {
        return false;
      }

      if (flow.mode === 'hub' && transition.once && this.store.hasTriggeredHubTransition(flow.id, transition.id)) {
        return false;
      }

      return true;
    });
  }

  rollDice() {
    const session = this.requireActiveRouteSession();
    const routeRuntime = session.routeRuntime;

    if (!routeRuntime || routeRuntime.phase !== 'awaitingRoll') {
      return null;
    }

    const rollRange = this.requireFlow(session.flowId).routeRules?.rollRange ?? { min: 1, max: 6 };
    const roll = rollRange.min + Math.floor(this.random() * (rollRange.max - rollRange.min + 1));

    this.store.setRouteRuntime(
      {
        lastRoll: roll,
        remainingSteps: roll,
        phase: 'moving',
      },
      session.sessionId,
    );
    this.store.pushRouteLog('roll', `Rolled ${roll}.`, undefined, session.sessionId);
    this.advanceRouteMovement(session.sessionId);

    return roll;
  }

  chooseDirection(nodeId: string) {
    const session = this.requireActiveRouteSession();

    if (session.routeRuntime?.phase !== 'awaitingDirection') {
      return false;
    }

    if (!this.getAvailableDirectionNodeIds(session.sessionId).includes(nodeId)) {
      return false;
    }

    this.moveAlongRoute(nodeId, session.sessionId);
    this.advanceRouteMovement(session.sessionId);

    return true;
  }

  useScout(depth = this.store.scoutDepth) {
    const session = this.requireActiveRouteSession();
    const routeRuntime = session.routeRuntime;

    if (!routeRuntime || depth <= 0 || routeRuntime.scoutCharges <= 0) {
      return [];
    }

    this.store.setRouteRuntime(
      {
        scoutCharges: routeRuntime.scoutCharges - 1,
      },
      session.sessionId,
    );

    const nodeIdsToReveal = this.collectNodesAhead(session.sessionId, depth);

    this.store.revealRouteNodes(nodeIdsToReveal, session.sessionId);
    this.store.pushRouteLog(
      'scout',
      nodeIdsToReveal.length > 0
        ? `Scout reveals ${nodeIdsToReveal.length} route markers ahead.`
        : 'Scout finds nothing beyond the next turn.',
      this.store.currentNodeId ?? undefined,
      session.sessionId,
    );

    return nodeIdsToReveal;
  }

  getAvailableRouteNodes(sessionId = this.store.activeSession?.sessionId ?? null) {
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);

    return this.getAvailableDirectionNodeIds(sessionId)
      .map((nodeId) => flow.nodes[nodeId])
      .filter((node): node is SceneFlowNode => node !== undefined);
  }

  setBackground(backgroundId: string | null) {
    this.store.setPresentation({ backgroundId });
  }

  playMusic(musicId: string) {
    this.store.setPresentation({ musicId });
    this.rootStore.audio.playMusic(musicId, {
      action: 'switch',
      loop: true,
    });
  }

  stopMusic() {
    this.store.setPresentation({ musicId: null });
    this.rootStore.audio.stopMusic();
  }

  showCg(cgId: string) {
    this.store.setPresentation({ cgId });
  }

  hideCg() {
    this.store.setPresentation({ cgId: null });
  }

  setOverlay(overlayId: string | null) {
    this.store.setPresentation({ overlayId });
  }

  playSfx(sfxId: string) {
    this.store.setPresentation({ lastSfxId: sfxId });
    this.rootStore.audio.playSfx(sfxId);
  }

  queueJumpToNode(nodeId: string) {
    this.store.setPendingJumpNodeId(nodeId);
  }

  private startFlow(
    flowId: string,
    options: {
      replaceTop?: boolean;
      sceneId?: string | null;
      startNodeId?: string;
    } = {},
  ): SceneFlowSession | null {
    const resolvedFlowStart = this.resolveFlowStart(flowId, options.startNodeId);

    if (resolvedFlowStart.kind === 'end') {
      if (options.replaceTop && this.store.activeSession) {
        this.endActiveFlow();
      }

      return null;
    }

    flowId = resolvedFlowStart.flowId;
    const flow = this.requireFlow(flowId);
    this.rootStore.sceneFlowContentValidator.assertValid(flow);

    const currentScreenId = this.rootStore.ui.activeScreen;
    const previousSession = this.store.activeSession;
    const startNodeId = resolvedFlowStart.nodeId;
    const sessionInput: Omit<SceneFlowSession, 'sessionId'> = {
      flowId: flow.id,
      mode: flow.mode,
      sourceType: flow.source.type,
      sceneId: options.sceneId ?? (flow.source.type === 'sceneGeneration' ? flow.id : null),
      currentNodeId: startNodeId,
      visibleTransitionIds: [],
      visitedNodeIds: [],
      pendingJumpNodeId: null,
      returnScreenId: previousSession ? null : currentScreenId,
      presentation: this.buildPresentationState(flow),
      routeRuntime: flow.mode === 'route' ? this.buildRouteRuntime(flow, startNodeId) : null,
    };

    const nextSession = options.replaceTop && previousSession
      ? this.store.replaceTopSession(sessionInput)
      : this.store.pushSession(sessionInput);

    if (flow.mode === 'hub') {
      this.store.markHubFlowVisited(flow.id);
    }

    this.rootStore.ui.setScreen(screenIdForMode(flow.mode));
    this.rootStore.audio.syncSceneFlowPresentation();
    this.moveToNode(startNodeId, {
      sessionId: nextSession.sessionId,
      skipExitEffects: true,
    });

    if (flow.mode === 'route') {
      this.store.pushRouteLog('system', `Entered ${flow.title}.`, startNodeId, nextSession.sessionId);
      this.store.setRouteRuntime({ phase: 'awaitingRoll' }, nextSession.sessionId);
      this.refreshVisibleTransitions(nextSession.sessionId);
    }

    return nextSession;
  }

  private buildPresentationState(flow: SceneFlowData): SceneFlowPresentationState {
    const defaultMusic = flow.defaultMusic ?? (flow.defaultMusicId
      ? {
          action: 'play' as const,
          musicId: flow.defaultMusicId,
          loop: true,
        }
      : undefined);
    const musicAction = defaultMusic?.action ?? defaultMusic?.mode;

    return {
      backgroundId: flow.defaultBackgroundId ?? null,
      musicId:
        defaultMusic && musicAction !== 'stop'
          ? defaultMusic.musicId ?? flow.defaultMusicId ?? null
          : flow.defaultMusicId ?? null,
      cgId: flow.defaultCgId ?? null,
      overlayId: flow.defaultOverlayId ?? null,
      lastSfxId: null,
      currentStage: flow.defaultStage ?? null,
      backgroundStyle: null,
      activeTransition: flow.defaultTransition ?? null,
    };
  }

  private buildRouteRuntime(flow: SceneFlowData, startNodeId: string): SceneFlowRouteRuntime {
    const revealNonHiddenAtStart = flow.routeRules?.revealNonHiddenAtStart ?? true;
    const visibleNodeIds = revealNonHiddenAtStart
      ? Object.values(flow.nodes)
          .filter((node) => node.route?.hidden !== true)
          .map((node) => node.id)
      : [];

    return {
      phase: 'awaitingRoll',
      revealedNodeIds: uniqueValues([startNodeId, ...visibleNodeIds]),
      visitedNodeIds: [startNodeId],
      resolvedNodeIds: [],
      remainingSteps: 0,
      lastRoll: null,
      scoutCharges: flow.routeRules?.scoutCharges ?? 1,
      scoutDepth: flow.routeRules?.scoutDepth ?? 2,
      eventLog: [],
    };
  }

  private syncPresentationFromNode(node: SceneFlowNode, sessionId: string) {
    if (node.presentationPatch) {
      const session = this.requireSession(sessionId);

      this.store.setPresentation(
        applyScenePresentationPatch(session.presentation, node.presentationPatch),
        sessionId,
      );

      this.rootStore.audio.applyMusicAction(
        node.presentationPatch.music,
        this.requireSession(sessionId).presentation.musicId,
      );

      const patchedSfxEntries = Array.isArray(node.presentationPatch.sfx)
        ? node.presentationPatch.sfx
        : node.presentationPatch.sfx
          ? [node.presentationPatch.sfx]
          : [];

      for (const sfxEntry of patchedSfxEntries) {
        const sfxId = sfxEntry.sfxId ?? sfxEntry.id;

        if (!sfxId) {
          continue;
        }

        this.rootStore.audio.playSfx(sfxId, {
          ...(sfxEntry.delayMs !== undefined ? { delayMs: sfxEntry.delayMs } : {}),
          ...(sfxEntry.volume !== undefined ? { volume: sfxEntry.volume } : {}),
        });
      }
    }

    if (node.stage) {
      this.store.setPresentation({ currentStage: node.stage }, sessionId);
    }

    if (node.backgroundId) {
      this.store.setPresentation({ backgroundId: node.backgroundId }, sessionId);
    }

    if (node.stage?.backgroundId) {
      this.store.setPresentation({ backgroundId: node.stage.backgroundId }, sessionId);
    }

    if (node.cgId) {
      this.store.setPresentation({ cgId: node.cgId }, sessionId);
    }

    if (node.stage?.cgId) {
      this.store.setPresentation({ cgId: node.stage.cgId }, sessionId);
    }

    if (node.overlayId) {
      this.store.setPresentation({ overlayId: node.overlayId }, sessionId);
    }

    if (node.stage?.overlayId) {
      this.store.setPresentation({ overlayId: node.stage.overlayId }, sessionId);
    }

    if (node.music) {
      const musicMode = node.music.mode ?? node.music.action;

      if ((musicMode === 'play' || musicMode === 'switch') && node.music.musicId) {
        this.store.setPresentation({ musicId: node.music.musicId }, sessionId);
      }

      if (musicMode === 'stop') {
        this.store.setPresentation({ musicId: null }, sessionId);
      }

      this.rootStore.audio.applyMusicAction(node.music, this.requireSession(sessionId).presentation.musicId);
    }

    if (node.transition) {
      this.store.setPresentation({ activeTransition: node.transition }, sessionId);
    }

    const sfxEntries = Array.isArray(node.sfx) ? node.sfx : node.sfx ? [node.sfx] : [];
    const lastSfx = [...sfxEntries].reverse().find((entry) => entry.sfxId || entry.id);

    for (const sfxEntry of sfxEntries) {
      const sfxId = sfxEntry.sfxId ?? sfxEntry.id;

      if (!sfxId) {
        continue;
      }

      this.rootStore.audio.playSfx(sfxId, {
        ...(sfxEntry.delayMs !== undefined ? { delayMs: sfxEntry.delayMs } : {}),
        ...(sfxEntry.volume !== undefined ? { volume: sfxEntry.volume } : {}),
      });
    }

    if (lastSfx) {
      this.store.setPresentation({ lastSfxId: lastSfx.sfxId ?? lastSfx.id ?? null }, sessionId);
    }
  }

  private resolveFlowStart(
    flowId: string,
    startNodeId?: string,
    seenFlowIds = new Set<string>(),
  ): { kind: 'node'; flowId: string; nodeId: string } | { kind: 'end' } {
    const flow = this.requireFlow(flowId);

    if (seenFlowIds.has(flow.id)) {
      throw new Error(`Scene flow condition fallback loop detected for "${flow.id}".`);
    }

    seenFlowIds.add(flow.id);

    if (!this.rootStore.dialogueConditionEvaluator.evaluateAll(flow.conditions)) {
      const fallbackTarget = this.resolveFallbackTarget(flow.onConditionFail, flow, seenFlowIds, startNodeId);

      if (fallbackTarget.kind === 'sceneFlow') {
        return this.resolveFlowStart(fallbackTarget.flowId, undefined, seenFlowIds);
      }

      if (fallbackTarget.kind === 'end') {
        return fallbackTarget;
      }

      return this.resolveFlowStart(flow.id, fallbackTarget.nodeId, seenFlowIds);
    }

    const nodeTarget = this.resolveNodeTarget(flow, startNodeId ?? flow.startNodeId);

    if (nodeTarget.kind === 'sceneFlow') {
      return this.resolveFlowStart(nodeTarget.flowId, undefined, seenFlowIds);
    }

    if (nodeTarget.kind === 'end') {
      return nodeTarget;
    }

    return {
      kind: 'node',
      flowId: flow.id,
      nodeId: nodeTarget.nodeId,
    };
  }

  private resolveNodeTarget(
    flow: SceneFlowData,
    nodeId: string,
    seenNodeIds = new Set<string>(),
  ): ResolvedNodeTarget {
    const node = flow.nodes[nodeId];

    if (!node) {
      throw new Error(`Scene flow node "${nodeId}" does not exist in "${flow.id}".`);
    }

    if (seenNodeIds.has(node.id)) {
      throw new Error(`Scene flow node condition fallback loop detected for "${flow.id}:${node.id}".`);
    }

    seenNodeIds.add(node.id);

    if (this.rootStore.dialogueConditionEvaluator.evaluateAll(node.conditions)) {
      return {
        kind: 'node',
        nodeId: node.id,
      };
    }

    const fallbackTarget = this.resolveFallbackTarget(node.onConditionFail, flow, new Set<string>(), nodeId);

    if (fallbackTarget.kind === 'node') {
      return this.resolveNodeTarget(flow, fallbackTarget.nodeId, seenNodeIds);
    }

    return fallbackTarget;
  }

  private resolveFallbackTarget(
    fallback: SceneFlowFallbackTarget | undefined,
    flow: SceneFlowData,
    seenFlowIds: Set<string>,
    currentNodeId?: string,
  ): ResolvedNodeTarget {
    if (!fallback) {
      throw new Error(
        currentNodeId
          ? `Node "${currentNodeId}" in scene flow "${flow.id}" is blocked by conditions and has no fallback.`
          : `Scene flow "${flow.id}" is blocked by conditions and has no fallback.`,
      );
    }

    if (fallback.nextNodeId) {
      return {
        kind: 'node',
        nodeId: fallback.nextNodeId,
      };
    }

    if (fallback.nextSceneId) {
      if (seenFlowIds.has(fallback.nextSceneId)) {
        throw new Error(`Scene flow condition fallback loop detected for "${fallback.nextSceneId}".`);
      }

      return {
        kind: 'sceneFlow',
        flowId: fallback.nextSceneId,
      };
    }

    if (fallback.openSceneFlowId) {
      if (seenFlowIds.has(fallback.openSceneFlowId)) {
        throw new Error(`Scene flow condition fallback loop detected for "${fallback.openSceneFlowId}".`);
      }

      return {
        kind: 'sceneFlow',
        flowId: fallback.openSceneFlowId,
      };
    }

    return {
      kind: 'end',
    };
  }

  private applyEffects(effects: SceneFlowTransition['effects'] | SceneFlowNode['onEnterEffects']) {
    if (effects && effects.length > 0) {
      this.rootStore.executeEffects(effects);
    }
  }

  private openReferencedFlow(flowId: string) {
    if (this.rootStore.getDialogueById(flowId)) {
      this.startDialogue(flowId);

      return;
    }

    if (this.rootStore.getTravelBoardById(flowId)) {
      this.startTravelBoard(flowId);

      return;
    }

    this.startFlow(flowId);
  }

  private refreshVisibleTransitions(sessionId = this.store.activeSession?.sessionId ?? null) {
    this.store.setVisibleTransitionIds(
      this.getVisibleTransitions(sessionId).map((transition) => transition.id),
      sessionId,
    );
  }

  private resumePendingBattleIfNeeded() {
    if (!this.rootStore.battle.hasActiveBattle && this.rootStore.battle.hasPendingBattle) {
      this.rootStore.battle.resumePendingBattle();
    }
  }

  private getAvailableDirectionNodeIds(sessionId = this.store.activeSession?.sessionId ?? null) {
    const session = this.requireSession(sessionId);
    const routeRuntime = session.routeRuntime;
    const node = this.requireCurrentNode(session.sessionId);

    if (!routeRuntime) {
      return [];
    }

    return node.transitions
      .map((transition) => transition.nextNodeId)
      .filter((nextNodeId): nextNodeId is string => Boolean(nextNodeId))
      .filter((nextNodeId) => !routeRuntime.visitedNodeIds.includes(nextNodeId));
  }

  private advanceRouteMovement(sessionId: string) {
    while (true) {
      const session = this.store.getSessionById(sessionId);

      if (!session?.routeRuntime || session.routeRuntime.phase !== 'moving') {
        return;
      }

      if (session.routeRuntime.remainingSteps <= 0) {
        this.resolveCurrentRouteNode(sessionId);

        return;
      }

      const availableDirectionNodeIds = this.getAvailableDirectionNodeIds(sessionId);

      if (availableDirectionNodeIds.length === 0) {
        this.store.pushRouteLog(
          'system',
          'The route ends before the remaining steps can be spent.',
          session.currentNodeId,
          sessionId,
        );
        this.store.setRouteRuntime({ remainingSteps: 0 }, sessionId);
        this.resolveCurrentRouteNode(sessionId);

        return;
      }

      if (availableDirectionNodeIds.length > 1) {
        this.store.setRouteRuntime({ phase: 'awaitingDirection' }, sessionId);
        this.refreshVisibleTransitions(sessionId);

        return;
      }

      const nextNodeId = availableDirectionNodeIds[0];

      if (!nextNodeId) {
        return;
      }

      this.moveAlongRoute(nextNodeId, sessionId);
    }
  }

  private moveAlongRoute(nodeId: string, sessionId: string) {
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);
    const node = flow.nodes[nodeId];

    if (!node) {
      throw new Error(`Scene flow "${flow.id}" does not contain node "${nodeId}".`);
    }

    const remainingSteps = Math.max((session.routeRuntime?.remainingSteps ?? 1) - 1, 0);

    this.store.moveRouteToNode(nodeId, sessionId);
    this.store.setRouteRuntime(
      {
        remainingSteps,
        phase: 'moving',
      },
      sessionId,
    );
    this.store.pushRouteLog('movement', `Moved to ${node.title ?? node.id}.`, nodeId, sessionId);
    this.refreshVisibleTransitions(sessionId);
  }

  private resolveCurrentRouteNode(sessionId: string) {
    const session = this.requireSession(sessionId);
    const node = this.requireCurrentNode(sessionId);
    const routeRuntime = session.routeRuntime;

    if (!routeRuntime) {
      return;
    }

    this.store.setRouteRuntime({ phase: 'resolvingNode' }, sessionId);

    const alreadyResolved = routeRuntime.resolvedNodeIds.includes(node.id);

    if (!(alreadyResolved && node.route?.oneTime)) {
      const resolution = this.resolveRouteEncounter(node);

      this.store.markRouteNodeResolved(node.id, sessionId);
      this.store.pushRouteLog('encounter', resolution.message, node.id, sessionId);

      if (resolution.completed) {
        this.store.setRouteRuntime({ phase: 'completed' }, sessionId);

        if (this.store.activeSession?.sessionId === sessionId) {
          this.endActiveFlow();
        } else {
          const stackIndex = this.store.flowStack.findIndex((entry) => entry.sessionId === sessionId);

          if (stackIndex >= 0) {
            this.store.flowStack = this.store.flowStack.filter((entry) => entry.sessionId !== sessionId);
          }
        }

        return;
      }
    } else {
      this.store.pushRouteLog('system', `${node.title ?? node.id} has already been resolved.`, node.id, sessionId);
    }

    if (this.store.getSessionById(sessionId)) {
      this.store.setRouteRuntime(
        {
          remainingSteps: 0,
          phase: 'awaitingRoll',
        },
        sessionId,
      );
      this.refreshVisibleTransitions(sessionId);
    }
  }

  private resolveRouteEncounter(node: SceneFlowNode): RouteEncounterResolution {
    const encounter = node.encounter;

    if (!encounter || encounter.kind === 'none') {
      return {
        message: `${node.title ?? node.id} passes without incident.`,
      };
    }

    switch (encounter.kind) {
      case 'battle':
        if (encounter.battleTemplateId) {
          this.rootStore.battle.startBattle(encounter.battleTemplateId);
        }

        return {
          message: `${node.title ?? node.id} erupts into battle.`,
        };
      case 'dialogue':
        if (encounter.dialogueId) {
          this.startDialogue(encounter.dialogueId);
        }

        if (encounter.openSceneFlowId) {
          this.openReferencedFlow(encounter.openSceneFlowId);
        }

        if (encounter.effects?.length) {
          this.rootStore.executeEffects(encounter.effects);
        }

        return {
          message: `${node.title ?? node.id} opens a story scene.`,
        };
      case 'loot':
        if (encounter.itemId) {
          this.rootStore.inventory.addItem(encounter.itemId, encounter.itemQuantity ?? 1);
        }

        if (encounter.effects?.length) {
          this.rootStore.executeEffects(encounter.effects);
        }

        return {
          message: `${node.title ?? node.id} yields a cache worth claiming.`,
        };
      case 'script':
        if (encounter.scriptId) {
          this.rootStore.executeEffect({
            type: 'runScript',
            scriptId: encounter.scriptId,
          });
        }

        if (encounter.effects?.length) {
          this.rootStore.executeEffects(encounter.effects);
        }

        return {
          message: `${node.title ?? node.id} reveals an uncertain omen.`,
        };
      case 'effects':
        if (encounter.effects?.length) {
          this.rootStore.executeEffects(encounter.effects);
        }

        return {
          message: `${node.title ?? node.id} changes the state of the route.`,
        };
      case 'exit':
        if (encounter.effects?.length) {
          this.rootStore.executeEffects(encounter.effects);
        }

        return {
          message: `${node.title ?? node.id} leads out of the route.`,
          completed: encounter.completesFlow ?? true,
        };
      default:
        return {
          message: `${node.title ?? node.id} is quiet for now.`,
        };
    }
  }

  private collectNodesAhead(sessionId: string, depth: number) {
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);
    const startNodeId = session.currentNodeId;
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];
    const visited = new Set<string>([startNodeId]);
    const revealed: string[] = [];

    while (queue.length > 0) {
      const next = queue.shift();

      if (!next || next.depth >= depth) {
        continue;
      }

      const node = flow.nodes[next.nodeId];

      if (!node) {
        continue;
      }

      node.transitions.forEach((transition) => {
        const neighborNodeId = transition.nextNodeId;

        if (!neighborNodeId || visited.has(neighborNodeId)) {
          return;
        }

        visited.add(neighborNodeId);
        revealed.push(neighborNodeId);
        queue.push({
          nodeId: neighborNodeId,
          depth: next.depth + 1,
        });
      });
    }

    return uniqueValues(revealed);
  }

  private requireFlow(flowId: string) {
    const flow = this.rootStore.getSceneFlowById(flowId);

    if (!flow) {
      throw new Error(`Scene flow "${flowId}" was not found.`);
    }

    return flow;
  }

  private requireSession(sessionId: string | null) {
    if (!sessionId) {
      throw new Error('No active scene flow session is selected.');
    }

    const session = this.store.getSessionById(sessionId);

    if (!session) {
      throw new Error(`Scene flow session "${sessionId}" was not found.`);
    }

    return session;
  }

  private requireActiveSession() {
    const session = this.store.activeSession;

    if (!session) {
      throw new Error('No active scene flow is currently running.');
    }

    return session;
  }

  private requireActiveRouteSession() {
    const session = this.requireActiveSession();

    if (session.mode !== 'route' || !session.routeRuntime) {
      throw new Error('No route scene flow is currently active.');
    }

    return session;
  }

  private requireCurrentNode(sessionId: string) {
    const session = this.requireSession(sessionId);
    const flow = this.requireFlow(session.flowId);
    const node = flow.nodes[session.currentNodeId];

    if (!node) {
      throw new Error(`Scene flow "${flow.id}" has no current node "${session.currentNodeId}".`);
    }

    return node;
  }
}
