import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { applyEffects } from '@engine/systems/dialogue/applyEffects';
import type {
  DialogueChoice,
  DialogueData,
  DialogueEffect,
  DialogueNode,
  StageState,
} from '@engine/types/dialogue';
import type { ScreenId } from '@engine/types/ui';

export class DialogueStore {
  readonly rootStore: GameRootStore;

  activeDialogueId: string | null = null;
  activeSceneId: string | null = null;
  currentNodeId: string | null = null;
  visibleChoiceIds: string[] = [];
  visitedNodeIds: string[] = [];
  returnScreenId: ScreenId | null = null;
  backgroundId: string | null = null;
  musicId: string | null = null;
  cgId: string | null = null;
  overlayId: string | null = null;
  lastSfxId: string | null = null;
  currentStage: StageState | null = null;
  pendingJumpNodeId: string | null = null;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get isActive() {
    return this.activeDialogueId !== null && this.currentNodeId !== null;
  }

  get activeNodeId() {
    return this.currentNodeId;
  }

  get activeDialogue(): DialogueData | null {
    if (!this.activeDialogueId) {
      return null;
    }

    return this.rootStore.getDialogueById(this.activeDialogueId) ?? null;
  }

  get currentNode(): DialogueNode | null {
    if (!this.activeDialogue || !this.currentNodeId) {
      return null;
    }

    return this.activeDialogue.nodes[this.currentNodeId] ?? null;
  }

  get currentSpeakerId() {
    return this.currentNode?.speakerId ?? null;
  }

  get currentSpeakerName() {
    const speakerId = this.currentSpeakerId;

    if (!speakerId) {
      return null;
    }

    return this.rootStore.getNarrativeCharacterById(speakerId)?.displayName ?? null;
  }

  get currentText() {
    return this.currentNode?.text ?? null;
  }

  get currentEmotion() {
    return this.currentNode?.emotion ?? null;
  }

  get currentPortraitId() {
    return this.currentNode?.portraitId ?? null;
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
    return this.currentNode?.speakerSide ?? null;
  }

  get currentAdultMarker() {
    return this.currentNode?.adultMarker ?? null;
  }

  get currentSceneTitle() {
    return this.activeDialogue?.meta?.sceneTitle ?? null;
  }

  get currentNodeType() {
    return this.currentNode?.type ?? null;
  }

  get isOpen() {
    return this.isActive;
  }

  get hasChoices() {
    return this.getVisibleChoices().length > 0;
  }

  startScene(sceneId: string) {
    const scene = this.rootStore.getSceneById(sceneId);

    if (!scene) {
      throw new Error(`Scene "${sceneId}" was not found.`);
    }

    this.startDialogue(scene.mainDialogueId, { sceneId });
  }

  startDialogue(dialogueId: string, options: { sceneId?: string } = {}) {
    const dialogue = this.rootStore.getDialogueById(dialogueId);

    if (!dialogue) {
      throw new Error(`Dialogue "${dialogueId}" was not found.`);
    }

    this.rootStore.dialogueValidator.assertValid(dialogue);

    this.activeDialogueId = dialogueId;
    this.activeSceneId = options.sceneId ?? dialogue.meta?.sceneId ?? null;
    this.currentNodeId = null;
    this.visibleChoiceIds = [];
    this.visitedNodeIds = [];
    this.pendingJumpNodeId = null;
    this.returnScreenId =
      this.rootStore.ui.activeScreen === 'dialogue' ? null : this.rootStore.ui.activeScreen;
    this.backgroundId = dialogue.meta?.defaultBackgroundId ?? null;
    this.musicId = dialogue.meta?.defaultMusicId ?? null;
    this.cgId = dialogue.meta?.defaultCgId ?? null;
    this.overlayId = dialogue.meta?.defaultOverlayId ?? null;
    this.lastSfxId = null;
    this.currentStage = null;

    this.rootStore.ui.setScreen('dialogue');
    this.moveToNode(dialogue.startNodeId);
  }

  moveToNode(nodeId: string) {
    const previousNode = this.currentNode;

    if (previousNode && previousNode.id !== nodeId) {
      this.applyDialogueEffects(previousNode.onExitEffects);

      const exitJumpTarget = this.consumePendingJumpNodeId();

      if (exitJumpTarget && exitJumpTarget !== nodeId) {
        nodeId = exitJumpTarget;
      }
    }

    const dialogue = this.requireActiveDialogue();
    const node = dialogue.nodes[nodeId];

    if (!node) {
      throw new Error(`Dialogue node "${nodeId}" does not exist in "${dialogue.id}".`);
    }

    this.currentNodeId = nodeId;

    if (!this.visitedNodeIds.includes(nodeId)) {
      this.visitedNodeIds.push(nodeId);
    }

    this.syncPresentationFromNode(node);
    this.applyDialogueEffects(node.onEnterEffects);

    const jumpTarget = this.consumePendingJumpNodeId();

    if (jumpTarget && jumpTarget !== nodeId) {
      this.moveToNode(jumpTarget);

      return;
    }

    this.refreshVisibleChoices();
  }

  getVisibleChoices() {
    return this.rootStore.dialogueConditionEvaluator.getVisibleChoices(this.currentNode?.choices);
  }

  chooseChoice(choiceId: string) {
    const choice = this.getVisibleChoices().find((entry) => entry.id === choiceId);

    if (!choice) {
      throw new Error(`Choice "${choiceId}" is not available in the current dialogue state.`);
    }

    this.applyDialogueEffects(choice.effects);

    const jumpTarget = this.consumePendingJumpNodeId();

    if (jumpTarget) {
      this.moveToNode(jumpTarget);

      return true;
    }

    if (choice.nextNodeId) {
      this.moveToNode(choice.nextNodeId);

      return true;
    }

    this.endDialogue();

    return false;
  }

  next() {
    const node = this.requireCurrentNode();

    if ((node.choices?.length ?? 0) > 0) {
      return false;
    }

    if (node.nextNodeId) {
      this.moveToNode(node.nextNodeId);

      return true;
    }

    this.endDialogue();

    return false;
  }

  endDialogue() {
    if (this.currentNode?.onExitEffects?.length) {
      this.applyDialogueEffects(this.currentNode.onExitEffects);

      const jumpTarget = this.consumePendingJumpNodeId();

      if (jumpTarget) {
        this.moveToNode(jumpTarget);

        return;
      }
    }

    const shouldRestoreScreen = this.rootStore.ui.activeScreen === 'dialogue';
    const returnScreenId = this.returnScreenId;

    this.activeDialogueId = null;
    this.activeSceneId = null;
    this.currentNodeId = null;
    this.visibleChoiceIds = [];
    this.visitedNodeIds = [];
    this.returnScreenId = null;
    this.pendingJumpNodeId = null;
    this.backgroundId = null;
    this.musicId = null;
    this.cgId = null;
    this.overlayId = null;
    this.lastSfxId = null;
    this.currentStage = null;

    if (shouldRestoreScreen) {
      this.rootStore.ui.setScreen(returnScreenId ?? 'world');
    }
  }

  setBackground(backgroundId: string | null) {
    this.backgroundId = backgroundId;
  }

  playMusic(musicId: string) {
    this.musicId = musicId;
  }

  stopMusic() {
    this.musicId = null;
  }

  showCg(cgId: string) {
    this.cgId = cgId;
  }

  hideCg() {
    this.cgId = null;
  }

  setOverlay(overlayId: string | null) {
    this.overlayId = overlayId;
  }

  playSfx(sfxId: string) {
    this.lastSfxId = sfxId;
  }

  queueJumpToNode(nodeId: string) {
    this.pendingJumpNodeId = nodeId;
  }

  private requireActiveDialogue() {
    if (!this.activeDialogue) {
      throw new Error('No active dialogue is currently running.');
    }

    return this.activeDialogue;
  }

  private requireCurrentNode() {
    if (!this.currentNode) {
      throw new Error('Dialogue has no active node.');
    }

    return this.currentNode;
  }

  private refreshVisibleChoices() {
    this.visibleChoiceIds = this.getVisibleChoices().map((choice: DialogueChoice) => choice.id);
  }

  private applyDialogueEffects(effects: readonly DialogueEffect[] | undefined) {
    return applyEffects(effects, {
      executeEffect: (effect) => this.rootStore.executeEffect(effect),
    });
  }

  private syncPresentationFromNode(node: DialogueNode) {
    if (node.stage) {
      this.currentStage = node.stage;
    }

    if (node.backgroundId) {
      this.backgroundId = node.backgroundId;
    }

    if (node.stage?.backgroundId) {
      this.backgroundId = node.stage.backgroundId;
    }

    if (node.cgId) {
      this.cgId = node.cgId;
    }

    if (node.stage?.cgId) {
      this.cgId = node.stage.cgId;
    }

    if (node.overlayId) {
      this.overlayId = node.overlayId;
    }

    if (node.stage?.overlayId) {
      this.overlayId = node.stage.overlayId;
    }

    if (node.music) {
      const musicMode = node.music.mode ?? node.music.action;

      if ((musicMode === 'play' || musicMode === 'switch') && node.music.musicId) {
        this.musicId = node.music.musicId;
      }

      if (musicMode === 'stop') {
        this.musicId = null;
      }
    }

    const sfxEntries = Array.isArray(node.sfx) ? node.sfx : node.sfx ? [node.sfx] : [];
    const lastSfx = [...sfxEntries]
      .reverse()
      .find((entry) => entry.sfxId || entry.id);

    if (lastSfx) {
      this.lastSfxId = lastSfx.sfxId ?? lastSfx.id ?? null;
    }
  }

  private consumePendingJumpNodeId() {
    const nodeId = this.pendingJumpNodeId;

    this.pendingJumpNodeId = null;

    return nodeId;
  }
}
