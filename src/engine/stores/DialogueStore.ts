import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  DialogueChoice,
  DialogueData,
  DialogueNode,
  StageState,
} from '@engine/types/dialogue';
import type { DialogueSkipMode } from '@engine/types/playerShell';
import type { SceneFlowNode } from '@engine/types/sceneFlow';
import type { ScreenId } from '@engine/types/ui';

function isSequenceSourceType(sourceType: string | null) {
  return sourceType === 'dialogue' || sourceType === 'sceneGeneration';
}

export class DialogueStore {
  readonly rootStore: GameRootStore;

  revealedCharacterCount = 0;
  autoModeEnabled = false;
  skipMode: DialogueSkipMode = 'off';
  currentNodeWasSeenOnEnter = false;

  private revealTimerId: ReturnType<typeof setTimeout> | null = null;
  private advanceTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get isActive() {
    return this.rootStore.sceneFlow.activeMode === 'sequence' && this.currentNodeId !== null;
  }

  get activeDialogueId() {
    return this.rootStore.sceneFlow.activeMode === 'sequence' &&
      isSequenceSourceType(this.rootStore.sceneFlow.activeSourceType)
      ? this.rootStore.sceneFlow.activeFlowId
      : null;
  }

  get activeSceneId() {
    return this.rootStore.sceneFlow.activeMode === 'sequence' &&
      isSequenceSourceType(this.rootStore.sceneFlow.activeSourceType)
      ? this.rootStore.sceneFlow.activeSceneId
      : null;
  }

  get currentNodeId() {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.currentNodeId
      : null;
  }

  get visibleChoiceIds() {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.visibleTransitionIds
      : [];
  }

  get visitedNodeIds() {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.visitedNodeIds
      : [];
  }

  get returnScreenId(): ScreenId | null {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.activeSession?.returnScreenId ?? null
      : null;
  }

  get backgroundId() {
    return this.rootStore.sceneFlow.currentBackgroundId;
  }

  get musicId() {
    return this.rootStore.sceneFlow.currentMusicId;
  }

  get cgId() {
    return this.rootStore.sceneFlow.currentCgId;
  }

  get overlayId() {
    return this.rootStore.sceneFlow.currentOverlayId;
  }

  get lastSfxId() {
    return this.rootStore.sceneFlow.lastSfxId;
  }

  get currentStage(): StageState | null {
    return this.rootStore.sceneFlow.currentStage;
  }

  get pendingJumpNodeId() {
    return this.rootStore.sceneFlow.pendingJumpNodeId;
  }

  get activeNodeId() {
    return this.currentNodeId;
  }

  get activeDialogue(): DialogueData | null {
    return this.activeDialogueId ? this.rootStore.getDialogueById(this.activeDialogueId) ?? null : null;
  }

  get activeSequenceFlow() {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.currentFlow
      : null;
  }

  get currentSceneFlowNode(): SceneFlowNode | null {
    return this.rootStore.sceneFlow.activeMode === 'sequence'
      ? this.rootStore.sceneFlow.currentNode
      : null;
  }

  get currentNode(): DialogueNode | null {
    const dialogue = this.activeDialogue;
    const nodeId = this.currentNodeId;

    if (!dialogue || !nodeId) {
      return null;
    }

    return dialogue.nodes[nodeId] ?? null;
  }

  get currentSpeakerId() {
    return this.currentNode?.speakerId ?? this.currentSceneFlowNode?.speakerId ?? null;
  }

  get currentSpeakerName() {
    const speakerId = this.currentSpeakerId;

    return speakerId ? this.rootStore.getNarrativeCharacterById(speakerId)?.displayName ?? null : null;
  }

  get currentText() {
    return this.currentNode?.text ?? this.currentSceneFlowNode?.text ?? null;
  }

  get displayedText() {
    const text = this.currentText ?? '';

    return text.slice(0, this.revealedCharacterCount);
  }

  get currentEmotion() {
    return this.currentNode?.emotion ?? this.currentSceneFlowNode?.emotion ?? null;
  }

  get currentPortraitId() {
    return this.currentNode?.portraitId ?? this.currentSceneFlowNode?.portraitId ?? null;
  }

  get currentBackgroundId() {
    return this.backgroundId;
  }

  get currentMusicId() {
    return this.musicId;
  }

  get currentCgId() {
    return this.cgId;
  }

  get currentOverlayId() {
    return this.overlayId;
  }

  get currentSpeakerSide() {
    return this.currentNode?.speakerSide ?? this.currentSceneFlowNode?.speakerSide ?? null;
  }

  get currentAdultMarker() {
    return this.currentNode?.adultMarker ?? null;
  }

  get currentSceneTitle() {
    return this.activeDialogue?.meta?.sceneTitle ?? this.activeSequenceFlow?.title ?? null;
  }

  get currentNodeType() {
    return this.currentNode?.type ?? this.currentSceneFlowNode?.sourceNodeType ?? null;
  }

  get isOpen() {
    return this.isActive;
  }

  get hasChoices() {
    return this.getVisibleChoices().length > 0;
  }

  get isTextFullyRevealed() {
    const text = this.currentText ?? '';

    return text.length === 0 || this.revealedCharacterCount >= text.length;
  }

  get isCurrentNodeSeen() {
    return this.currentNodeWasSeenOnEnter;
  }

  get activeFlowId() {
    return this.activeSequenceFlow?.id ?? null;
  }

  get canSkipCurrentNode() {
    if (!this.isActive || this.hasChoices) {
      return false;
    }

    return this.rootStore.preferences.skipUnread || this.currentNodeWasSeenOnEnter;
  }

  get isUiHidden() {
    return this.rootStore.preferences.hideUi;
  }

  get currentFontScale() {
    return this.rootStore.preferences.fontScale;
  }

  startScene(sceneId: string) {
    this.resetPlaybackState();

    return this.rootStore.sceneFlowController.startScene(sceneId);
  }

  startDialogue(dialogueId: string, options: { sceneId?: string } = {}) {
    this.resetPlaybackState();

    return this.rootStore.sceneFlowController.startDialogue(dialogueId, options);
  }

  moveToNode(nodeId: string) {
    return this.rootStore.sceneFlowController.moveToNode(nodeId);
  }

  getVisibleChoices() {
    if (this.currentNode?.choices) {
      return (this.currentNode.choices ?? []).filter((choice) =>
        this.visibleChoiceIds.includes(choice.id),
      ) as DialogueChoice[];
    }

    if (!this.currentSceneFlowNode || this.currentSceneFlowNode.kind !== 'choice') {
      return [];
    }

    return this.currentSceneFlowNode.transitions
      .filter((transition) => this.visibleChoiceIds.includes(transition.id))
      .map(
        (transition): DialogueChoice => ({
          id: transition.id,
          text: transition.label ?? transition.description ?? transition.id,
          ...(transition.tone ? { tone: transition.tone } : {}),
          ...(transition.conditions ? { conditions: [...transition.conditions] } : {}),
          ...(transition.effects ? { effects: [...transition.effects] } : {}),
          ...(transition.nextNodeId ? { nextNodeId: transition.nextNodeId } : {}),
          ...(transition.nextSceneId ? { nextSceneId: transition.nextSceneId } : {}),
        }),
      );
  }

  chooseChoice(choiceId: string) {
    const selectedChoice = this.getVisibleChoices().find((choice) => choice.id === choiceId) ?? null;

    if (selectedChoice) {
      this.rootStore.backlog.appendEntry({
        kind: 'choice',
        flowId: this.activeFlowId,
        nodeId: this.currentNodeId,
        speakerId: null,
        speakerName: null,
        text: selectedChoice.text,
      });
    }

    this.clearAdvanceTimer();

    return this.rootStore.sceneFlowController.chooseTransition(choiceId);
  }

  next() {
    this.clearAdvanceTimer();

    return this.rootStore.sceneFlowController.advanceSequence();
  }

  advanceOrReveal() {
    if (this.isUiHidden) {
      this.rootStore.preferences.setHideUi(false);

      return true;
    }

    if (!this.isTextFullyRevealed) {
      this.revealCurrentLine();

      return true;
    }

    if (this.hasChoices) {
      return false;
    }

    return this.next();
  }

  revealCurrentLine() {
    const text = this.currentText ?? '';

    this.clearRevealTimer();
    this.revealedCharacterCount = text.length;
    this.scheduleAdvanceIfNeeded();
  }

  setAutoMode(enabled: boolean) {
    this.autoModeEnabled = enabled;

    if (enabled) {
      this.skipMode = 'off';
    }

    this.handlePlaybackPreferenceChanged();
  }

  toggleAutoMode() {
    this.setAutoMode(!this.autoModeEnabled);
  }

  setSkipMode(mode: DialogueSkipMode) {
    this.skipMode = mode;

    if (mode !== 'off') {
      this.autoModeEnabled = false;
    }

    this.handlePlaybackPreferenceChanged();
  }

  toggleSkipMode() {
    this.setSkipMode(this.skipMode === 'off' ? 'skip' : 'off');
  }

  endDialogue() {
    this.resetPlaybackState();

    if (this.isActive) {
      this.rootStore.sceneFlowController.endActiveFlow();
    }
  }

  setBackground(backgroundId: string | null) {
    this.rootStore.sceneFlowController.setBackground(backgroundId);
  }

  playMusic(musicId: string) {
    this.rootStore.sceneFlowController.playMusic(musicId);
  }

  stopMusic() {
    this.rootStore.sceneFlowController.stopMusic();
  }

  showCg(cgId: string) {
    this.rootStore.sceneFlowController.showCg(cgId);
  }

  hideCg() {
    this.rootStore.sceneFlowController.hideCg();
  }

  setOverlay(overlayId: string | null) {
    this.rootStore.sceneFlowController.setOverlay(overlayId);
  }

  playSfx(sfxId: string) {
    this.rootStore.sceneFlowController.playSfx(sfxId);
  }

  queueJumpToNode(nodeId: string) {
    this.rootStore.sceneFlowController.queueJumpToNode(nodeId);
  }

  handleNodeEntered(flowId: string, nodeId: string) {
    this.clearRevealTimer();
    this.clearAdvanceTimer();

    this.currentNodeWasSeenOnEnter = this.rootStore.seenContent.hasSeenNode(flowId, nodeId);
    this.rootStore.seenContent.markFlowSeen(flowId);
    this.rootStore.seenContent.markNodeSeen(flowId, nodeId);

    this.appendCurrentNodeToBacklog();

    const text = this.currentText ?? '';
    this.revealedCharacterCount = this.shouldSkipCurrentNodeInstantly() ? text.length : 0;

    if (!this.shouldSkipCurrentNodeInstantly()) {
      this.scheduleRevealTick();
    }

    this.scheduleAdvanceIfNeeded();
  }

  handleFlowExited() {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.revealedCharacterCount = 0;
    this.currentNodeWasSeenOnEnter = false;
  }

  handlePlaybackPreferenceChanged() {
    if (!this.isActive) {
      return;
    }

    this.clearRevealTimer();
    this.clearAdvanceTimer();

    if (!this.isTextFullyRevealed && !this.shouldSkipCurrentNodeInstantly()) {
      this.scheduleRevealTick();
    }

    if (this.shouldSkipCurrentNodeInstantly()) {
      this.revealCurrentLine();

      return;
    }

    this.scheduleAdvanceIfNeeded();
  }

  reset() {
    this.resetPlaybackState();
  }

  private shouldSkipCurrentNodeInstantly() {
    return this.skipMode === 'skip' && this.canSkipCurrentNode;
  }

  private appendCurrentNodeToBacklog() {
    const text = this.currentText ?? '';

    if (!text) {
      return;
    }

    this.rootStore.backlog.appendEntry({
      kind: 'line',
      flowId: this.activeFlowId,
      nodeId: this.currentNodeId,
      speakerId: this.currentSpeakerId,
      speakerName: this.currentSpeakerName,
      text,
    });
  }

  private scheduleRevealTick() {
    const text = this.currentText ?? '';

    if (!text || this.isTextFullyRevealed || this.hasChoices) {
      return;
    }

    const stepDelayMs = Math.max(10, Math.floor(1000 / this.rootStore.preferences.textSpeed));

    this.revealTimerId = globalThis.setTimeout(() => {
      this.revealedCharacterCount = Math.min(text.length, this.revealedCharacterCount + 1);

      if (this.isTextFullyRevealed) {
        this.clearRevealTimer();
        this.scheduleAdvanceIfNeeded();

        return;
      }

      this.scheduleRevealTick();
    }, stepDelayMs);
  }

  private scheduleAdvanceIfNeeded() {
    this.clearAdvanceTimer();

    if (!this.isActive || this.hasChoices || !this.isTextFullyRevealed) {
      return;
    }

    const delayMs = this.shouldSkipCurrentNodeInstantly()
      ? 35
      : this.autoModeEnabled
        ? this.rootStore.preferences.autoDelayMs
        : null;

    if (!delayMs) {
      return;
    }

    this.advanceTimerId = globalThis.setTimeout(() => {
      if (!this.isActive || this.hasChoices) {
        return;
      }

      this.next();
    }, delayMs);
  }

  private resetPlaybackState() {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.revealedCharacterCount = 0;
    this.autoModeEnabled = false;
    this.skipMode = 'off';
    this.currentNodeWasSeenOnEnter = false;
  }

  private clearRevealTimer() {
    if (!this.revealTimerId) {
      return;
    }

    clearTimeout(this.revealTimerId);
    this.revealTimerId = null;
  }

  private clearAdvanceTimer() {
    if (!this.advanceTimerId) {
      return;
    }

    clearTimeout(this.advanceTimerId);
    this.advanceTimerId = null;
  }
}
