import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  DialogueChoice,
  DialogueData,
  DialogueNode,
  StageState,
} from '@engine/types/dialogue';
import type { DialogueRuntimeSnapshot } from '@engine/types/save';
import type { BacklogEntry, DialogueSkipMode } from '@engine/types/playerShell';
import type { SceneFlowNode } from '@engine/types/sceneFlow';
import type { ScreenId } from '@engine/types/ui';
import {
  getDialogueRevealDelayMs,
  getNextDialogueRevealCharacterCount,
} from '@engine/systems/dialogue/dialogueReveal';
import {
  countNarrativeVisibleCharacters,
  getNarrativePlainText,
  prepareDialogueNarrativeHtml,
  sliceNarrativeHtml,
} from '@engine/utils/narrativeHtml';

function isSequenceSourceType(sourceType: string | null) {
  return sourceType === 'dialogue' || sourceType === 'sceneGeneration';
}

export class DialogueStore {
  readonly rootStore: GameRootStore;

  revealedCharacterCount = 0;
  activeTextPageIndex = 0;
  autoModeEnabled = false;
  skipMode: DialogueSkipMode = 'off';
  currentNodeWasSeenOnEnter = false;
  textPageBreakCharacterCounts: number[] = [];

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

  get currentPreparedTextHtml() {
    return prepareDialogueNarrativeHtml(this.currentText ?? '');
  }

  get textPageCharacterBreaks() {
    const visibleCharacterCount = countNarrativeVisibleCharacters(this.currentPreparedTextHtml);

    return this.textPageBreakCharacterCounts
      .map((breakpoint) => Math.max(0, Math.min(visibleCharacterCount, Math.floor(breakpoint))))
      .filter((breakpoint, index, list) =>
        breakpoint > 0 &&
        breakpoint < visibleCharacterCount &&
        (index === 0 || breakpoint !== list[index - 1]),
      );
  }

  get textPageStarts() {
    return [0, ...this.textPageCharacterBreaks];
  }

  get textPageEnds() {
    return [...this.textPageCharacterBreaks, this.currentVisibleCharacterCount];
  }

  get textPageCount() {
    return this.textPageEnds.length;
  }

  get currentVisibleCharacterCount() {
    return countNarrativeVisibleCharacters(this.currentPreparedTextHtml);
  }

  get currentTextPageStart() {
    if (this.textPageCount === 0) {
      return 0;
    }

    const safePageIndex = Math.max(0, Math.min(this.activeTextPageIndex, this.textPageCount - 1));

    return this.textPageStarts[safePageIndex] ?? 0;
  }

  get currentTextPageEnd() {
    if (this.textPageCount === 0) {
      return 0;
    }

    const safePageIndex = Math.max(0, Math.min(this.activeTextPageIndex, this.textPageCount - 1));

    return this.textPageEnds[safePageIndex] ?? this.currentVisibleCharacterCount;
  }

  get currentTextPageVisibleCharacterCount() {
    return Math.max(0, this.currentTextPageEnd - this.currentTextPageStart);
  }

  get hasAdditionalTextPages() {
    return this.activeTextPageIndex < this.textPageCount - 1;
  }

  get currentPageReserveText() {
    return getNarrativePlainText(
      sliceNarrativeHtml(
        this.currentPreparedTextHtml,
        this.currentTextPageStart,
        this.currentTextPageEnd,
      ),
    );
  }

  get displayedText() {
    return getNarrativePlainText(
      sliceNarrativeHtml(this.currentPreparedTextHtml, 0, this.revealedCharacterCount),
    );
  }

  get displayedTextHtml() {
    return sliceNarrativeHtml(this.currentPreparedTextHtml, 0, this.revealedCharacterCount);
  }

  get displayedPageText() {
    return getNarrativePlainText(this.displayedPageTextHtml);
  }

  get displayedPageTextHtml() {
    return sliceNarrativeHtml(
      this.currentPreparedTextHtml,
      this.currentTextPageStart,
      Math.min(this.revealedCharacterCount, this.currentTextPageEnd),
    );
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

  get shouldRenderChoiceList() {
    return this.hasChoices && !this.hasAdditionalTextPages && this.isTextFullyRevealed;
  }

  get choiceContextEntry(): BacklogEntry | null {
    if (!this.hasChoices) {
      return null;
    }

    for (let index = this.rootStore.backlog.entries.length - 1; index >= 0; index -= 1) {
      const entry = this.rootStore.backlog.entries[index];

      if (!entry || entry.kind !== 'line') {
        continue;
      }

      if (entry.flowId !== this.activeFlowId) {
        continue;
      }

      if (entry.nodeId === this.currentNodeId) {
        continue;
      }

      return entry;
    }

    return null;
  }

  get hasNextSequenceStep() {
    if (this.currentNode?.nextNodeId || this.currentNode?.nextSceneId) {
      return true;
    }

    return (this.currentSceneFlowNode?.transitions ?? []).some((transition) =>
      Boolean(transition.nextNodeId || transition.nextSceneId || transition.openSceneFlowId),
    );
  }

  get isTextFullyRevealed() {
    return this.currentTextPageVisibleCharacterCount === 0 || this.revealedCharacterCount >= this.currentTextPageEnd;
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

  get advanceActionLabel() {
    return 'Далі';
  }

  get snapshot(): DialogueRuntimeSnapshot {
    return {
      revealedCharacterCount: this.revealedCharacterCount,
      activeTextPageIndex: this.activeTextPageIndex,
      autoModeEnabled: this.autoModeEnabled,
      skipMode: this.skipMode,
      currentNodeWasSeenOnEnter: this.currentNodeWasSeenOnEnter,
    };
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

  setTextPageBreakCharacterCounts(breakpoints: number[]) {
    const nextBreakpoints = breakpoints
      .map((breakpoint) => Math.max(0, Math.floor(breakpoint)))
      .sort((left, right) => left - right);

    if (
      nextBreakpoints.length === this.textPageBreakCharacterCounts.length &&
      nextBreakpoints.every((breakpoint, index) => breakpoint === this.textPageBreakCharacterCounts[index])
    ) {
      return;
    }

    this.textPageBreakCharacterCounts = nextBreakpoints;
    this.activeTextPageIndex = this.resolveTextPageIndex(this.activeTextPageIndex);

    if (!this.isActive) {
      return;
    }

    this.clearRevealTimer();
    this.clearAdvanceTimer();

    this.handlePlaybackPreferenceChanged();
  }

  advanceOrReveal() {
    if (this.isUiHidden) {
      this.rootStore.preferences.setHideUi(false);

      return true;
    }

    if (!this.isTextFullyRevealed) {
      this.revealCurrentPage();

      return true;
    }

    if (this.hasAdditionalTextPages) {
      this.advanceTextPage();

      return true;
    }

    if (this.hasChoices) {
      return false;
    }

    return this.next();
  }

  revealCurrentLine() {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.activeTextPageIndex = Math.max(0, this.textPageCount - 1);
    this.revealedCharacterCount = this.currentVisibleCharacterCount;
    this.scheduleAdvanceIfNeeded();
  }

  revealCurrentPage() {
    this.clearRevealTimer();
    this.revealedCharacterCount = this.currentTextPageEnd;
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
    this.activeTextPageIndex = 0;

    this.currentNodeWasSeenOnEnter = this.rootStore.seenContent.hasSeenNode(flowId, nodeId);
    this.rootStore.seenContent.markFlowSeen(flowId);
    this.rootStore.seenContent.markNodeSeen(flowId, nodeId);

    this.appendCurrentNodeToBacklog();

    this.revealedCharacterCount = this.shouldSkipCurrentNodeInstantly() ? this.currentTextPageEnd : 0;

    if (!this.shouldSkipCurrentNodeInstantly()) {
      this.scheduleRevealTick();
    }

    this.scheduleAdvanceIfNeeded();
  }

  handleFlowExited() {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.revealedCharacterCount = 0;
    this.activeTextPageIndex = 0;
    this.textPageBreakCharacterCounts = [];
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
      this.revealCurrentPage();

      return;
    }

    this.scheduleAdvanceIfNeeded();
  }

  reset() {
    this.resetPlaybackState();
  }

  restore(snapshot: DialogueRuntimeSnapshot) {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.revealedCharacterCount = snapshot.revealedCharacterCount;
    this.activeTextPageIndex = typeof snapshot.activeTextPageIndex === 'number'
      ? snapshot.activeTextPageIndex
      : 0;
    this.autoModeEnabled = snapshot.autoModeEnabled;
    this.skipMode = snapshot.skipMode;
    this.currentNodeWasSeenOnEnter = snapshot.currentNodeWasSeenOnEnter;
    this.activeTextPageIndex = this.resolveTextPageIndex(this.activeTextPageIndex);

    if (this.isActive) {
      this.handlePlaybackPreferenceChanged();
    }
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

  private advanceTextPage() {
    if (!this.hasAdditionalTextPages) {
      return;
    }

    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.activeTextPageIndex = Math.min(this.activeTextPageIndex + 1, this.textPageCount - 1);
    this.revealedCharacterCount = Math.max(this.revealedCharacterCount, this.currentTextPageStart);

    if (this.shouldSkipCurrentNodeInstantly()) {
      this.revealCurrentPage();

      return;
    }

    if (!this.isTextFullyRevealed) {
      this.scheduleRevealTick();

      return;
    }

    this.scheduleAdvanceIfNeeded();
  }

  private scheduleRevealTick() {
    if (this.currentTextPageVisibleCharacterCount === 0 || this.isTextFullyRevealed) {
      return;
    }

    const nextRevealCharacterCount = getNextDialogueRevealCharacterCount(
      getNarrativePlainText(this.currentPreparedTextHtml),
      this.revealedCharacterCount,
      this.currentTextPageEnd,
    );
    const revealedCharacterDelta = Math.max(1, nextRevealCharacterCount - this.revealedCharacterCount);
    const stepDelayMs = getDialogueRevealDelayMs(
      this.rootStore.preferences.textSpeed,
      revealedCharacterDelta,
    );

    this.revealTimerId = globalThis.setTimeout(() => {
      this.revealedCharacterCount = nextRevealCharacterCount;

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

    if (!this.isActive || !this.isTextFullyRevealed || (this.hasChoices && !this.hasAdditionalTextPages)) {
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
      if (!this.isActive || !this.isTextFullyRevealed) {
        return;
      }

      if (this.hasAdditionalTextPages) {
        this.advanceTextPage();

        return;
      }

      if (this.hasChoices) {
        return;
      }

      this.next();
    }, delayMs);
  }

  private resetPlaybackState() {
    this.clearRevealTimer();
    this.clearAdvanceTimer();
    this.revealedCharacterCount = 0;
    this.activeTextPageIndex = 0;
    this.autoModeEnabled = false;
    this.skipMode = 'off';
    this.textPageBreakCharacterCounts = [];
    this.currentNodeWasSeenOnEnter = false;
  }

  private resolveTextPageIndex(candidateIndex: number) {
    if (this.textPageCount <= 1) {
      return 0;
    }

    const clampedIndex = Math.max(0, Math.min(candidateIndex, this.textPageCount - 1));
    const currentPageStart = this.getTextPageStart(clampedIndex);
    const currentPageEnd = this.getTextPageEnd(clampedIndex);

    if (
      this.revealedCharacterCount >= currentPageStart &&
      this.revealedCharacterCount <= currentPageEnd
    ) {
      return clampedIndex;
    }

    for (let index = 0; index < this.textPageCount; index += 1) {
      const pageStart = this.getTextPageStart(index);
      const pageEnd = this.getTextPageEnd(index);

      if (this.revealedCharacterCount >= pageStart && this.revealedCharacterCount <= pageEnd) {
        return index;
      }
    }

    return clampedIndex;
  }

  private getTextPageStart(pageIndex: number) {
    return this.textPageStarts[pageIndex] ?? 0;
  }

  private getTextPageEnd(pageIndex: number) {
    return this.textPageEnds[pageIndex] ?? this.currentVisibleCharacterCount;
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
