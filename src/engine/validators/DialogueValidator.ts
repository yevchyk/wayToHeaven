import {
  CHARACTER_EMOTIONS,
  type DialogueData,
  type DialogueNode,
  type DialogueNodeBase,
} from '@engine/types/dialogue';
import type { NarrativeAssetKind } from '@engine/types/narrative';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';

export type DialogueValidationErrorCode =
  | 'missingStartNode'
  | 'unknownSpeaker'
  | 'missingSpeakerReference'
  | 'invalidNodeFlow'
  | 'invalidNodeId'
  | 'duplicateNodeId'
  | 'missingNodeReference'
  | 'missingChoiceOptions'
  | 'duplicateChoiceId'
  | 'unsupportedEmotion'
  | 'missingBackgroundReference'
  | 'missingPortraitReference'
  | 'missingMusicReference'
  | 'missingSfxReference'
  | 'missingCgReference'
  | 'missingOverlayReference'
  | 'missingJumpNodeReference'
  | 'missingSceneReference'
  | 'missingSceneFlowReference'
  | 'missingBattleReference'
  | 'missingItemReference'
  | 'missingTravelBoardReference'
  | 'missingLocationReference'
  | 'missingLocationNodeReference'
  | 'missingQuestReference'
  | 'missingScriptReference';

export interface DialogueValidationError {
  code: DialogueValidationErrorCode;
  message: string;
  nodeId?: string;
  choiceId?: string;
  targetId?: string;
  path?: string;
}

export type DialogueValidationIssueCode = DialogueValidationErrorCode;
export type DialogueValidationIssue = DialogueValidationError;

interface DialogueValidatorOptions {
  hasSpeakerId?: (speakerId: string) => boolean;
  hasAssetOfKind?: (assetId: string, kind: NarrativeAssetKind) => boolean;
  hasSceneFlowId?: (sceneFlowId: string) => boolean;
}

function hasChoices(node: DialogueNode) {
  return (node.choices?.length ?? 0) > 0;
}

function hasJumpToNodeEffect(node: DialogueNodeBase) {
  return (
    node.onEnterEffects?.some((effect) => effect.type === 'jumpToNode') ||
    node.onExitEffects?.some((effect) => effect.type === 'jumpToNode')
  );
}

export class DialogueValidator {
  private readonly effectReferenceValidator: EffectReferenceValidator;
  private readonly hasSpeakerId: DialogueValidatorOptions['hasSpeakerId'];
  private readonly hasAssetOfKind: DialogueValidatorOptions['hasAssetOfKind'];
  private readonly hasSceneFlowId: DialogueValidatorOptions['hasSceneFlowId'];

  constructor(
    effectReferenceValidator: EffectReferenceValidator = new EffectReferenceValidator(),
    options: DialogueValidatorOptions = {},
    ) {
    this.effectReferenceValidator = effectReferenceValidator;
    this.hasSpeakerId = options.hasSpeakerId;
    this.hasAssetOfKind = options.hasAssetOfKind;
    this.hasSceneFlowId = options.hasSceneFlowId;
  }

  validate(dialogue: DialogueData) {
    const issues: DialogueValidationError[] = [];
    const nodeEntries = Object.entries(dialogue.nodes);
    const seenNodeIds = new Set<string>();

    if (!dialogue.nodes[dialogue.startNodeId]) {
      issues.push({
        code: 'missingStartNode',
        message: `Start node "${dialogue.startNodeId}" does not exist.`,
        targetId: dialogue.startNodeId,
      });
    }

    nodeEntries.forEach(([nodeId, node]) => {
      if (node.id !== nodeId) {
        issues.push({
          code: 'invalidNodeId',
          message: `Dialogue node key "${nodeId}" does not match node.id "${node.id}".`,
          nodeId,
          targetId: node.id,
          path: `nodes.${nodeId}.id`,
        });
      }

      if (seenNodeIds.has(node.id)) {
        issues.push({
          code: 'duplicateNodeId',
          message: `Dialogue node id "${node.id}" is duplicated.`,
          nodeId,
          targetId: node.id,
          path: `nodes.${nodeId}.id`,
        });
      }

      seenNodeIds.add(node.id);

      if (node.speakerId && dialogue.speakerIds && !dialogue.speakerIds.includes(node.speakerId)) {
        issues.push({
          code: 'unknownSpeaker',
          message: `Speaker "${node.speakerId}" is not declared in dialogue speakerIds.`,
          nodeId,
          targetId: node.speakerId,
          path: `nodes.${nodeId}.speakerId`,
        });
      }

      if (node.speakerId && this.hasSpeakerId && !this.hasSpeakerId(node.speakerId)) {
        issues.push({
          code: 'missingSpeakerReference',
          message: `Speaker "${node.speakerId}" is not present in the narrative character registry.`,
          nodeId,
          targetId: node.speakerId,
          path: `nodes.${nodeId}.speakerId`,
        });
      }

      if (node.emotion && !CHARACTER_EMOTIONS.includes(node.emotion)) {
        issues.push({
          code: 'unsupportedEmotion',
          message: `Emotion "${node.emotion}" is not part of the allowed character emotion list.`,
          nodeId,
          targetId: node.emotion,
          path: `nodes.${nodeId}.emotion`,
        });
      }

      const nodeHasChoices = hasChoices(node);
      const nodeTransitionTargetCount =
        (node.nextNodeId ? 1 : 0) +
        (node.nextSceneId ? 1 : 0);
      const nodeHasDirectTransition = nodeTransitionTargetCount > 0;

      if (nodeHasChoices && nodeHasDirectTransition) {
        issues.push({
          code: 'invalidNodeFlow',
          message: 'Dialogue node cannot define both choices and a direct transition target.',
          nodeId,
          path: `nodes.${nodeId}`,
        });
      }

      if (nodeTransitionTargetCount > 1) {
        issues.push({
          code: 'invalidNodeFlow',
          message: 'Dialogue node cannot define multiple direct transition targets.',
          nodeId,
          path: `nodes.${nodeId}`,
        });
      }

      if (node.type === 'choice' && !nodeHasChoices) {
        issues.push({
          code: 'missingChoiceOptions',
          message: 'Choice nodes must provide at least one choice.',
          nodeId,
          path: `nodes.${nodeId}.choices`,
        });
      }

      if (!nodeHasChoices && !nodeHasDirectTransition && !node.isEnd && !hasJumpToNodeEffect(node)) {
        issues.push({
          code: 'invalidNodeFlow',
          message: 'Dialogue node must define choices, a direct transition target, jumpToNode effect, or isEnd.',
          nodeId,
          path: `nodes.${nodeId}`,
        });
      }

      if (node.nextNodeId && !dialogue.nodes[node.nextNodeId]) {
        issues.push({
          code: 'missingNodeReference',
          message: `Dialogue node references missing nextNodeId "${node.nextNodeId}".`,
          nodeId,
          targetId: node.nextNodeId,
          path: `nodes.${nodeId}.nextNodeId`,
        });
      }

      if (node.nextSceneId && this.hasSceneFlowId && !this.hasSceneFlowId(node.nextSceneId)) {
        issues.push({
          code: 'missingSceneFlowReference',
          message: `Dialogue node references missing nextSceneId "${node.nextSceneId}".`,
          nodeId,
          targetId: node.nextSceneId,
          path: `nodes.${nodeId}.nextSceneId`,
        });
      }

      issues.push(...this.validateNodeAssets(node, nodeId));
      issues.push(...this.validateStageSpeakers(node, nodeId));

      issues.push(
        ...this.effectReferenceValidator.validateEffects(
          node.onEnterEffects,
          `nodes.${nodeId}.onEnterEffects`,
        ).map((issue) => ({
          code: issue.code,
          message: issue.message,
          nodeId,
          path: issue.path,
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );

      issues.push(
        ...this.effectReferenceValidator.validateEffects(
          node.onExitEffects,
          `nodes.${nodeId}.onExitEffects`,
        ).map((issue) => ({
          code: issue.code,
          message: issue.message,
          nodeId,
          path: issue.path,
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );

      issues.push(...this.validateJumpEffects(nodeId, node.onEnterEffects, dialogue, 'onEnterEffects'));
      issues.push(...this.validateJumpEffects(nodeId, node.onExitEffects, dialogue, 'onExitEffects'));

      if (!node.choices) {
        return;
      }

      const choiceIds = new Set<string>();

      node.choices.forEach((choice) => {
        if (choiceIds.has(choice.id)) {
          issues.push({
            code: 'duplicateChoiceId',
            message: `Choice "${choice.id}" is duplicated within node "${nodeId}".`,
            nodeId,
            choiceId: choice.id,
            path: `nodes.${nodeId}.choices.${choice.id}`,
          });
        }

        choiceIds.add(choice.id);

        const choiceTransitionTargetCount =
          (choice.nextNodeId ? 1 : 0) +
          (choice.nextSceneId ? 1 : 0);

        if (choiceTransitionTargetCount > 1) {
          issues.push({
            code: 'invalidNodeFlow',
            message: `Choice "${choice.id}" cannot define multiple direct transition targets.`,
            nodeId,
            choiceId: choice.id,
            path: `nodes.${nodeId}.choices.${choice.id}`,
          });
        }

        if (choice.nextNodeId && !dialogue.nodes[choice.nextNodeId]) {
          issues.push({
            code: 'missingNodeReference',
            message: `Choice "${choice.id}" references missing nextNodeId "${choice.nextNodeId}".`,
            nodeId,
            choiceId: choice.id,
            targetId: choice.nextNodeId,
            path: `nodes.${nodeId}.choices.${choice.id}.nextNodeId`,
          });
        }

        if (choice.nextSceneId && this.hasSceneFlowId && !this.hasSceneFlowId(choice.nextSceneId)) {
          issues.push({
            code: 'missingSceneFlowReference',
            message: `Choice "${choice.id}" references missing nextSceneId "${choice.nextSceneId}".`,
            nodeId,
            choiceId: choice.id,
            targetId: choice.nextSceneId,
            path: `nodes.${nodeId}.choices.${choice.id}.nextSceneId`,
          });
        }

        issues.push(
          ...this.effectReferenceValidator.validateEffects(
            choice.effects,
            `nodes.${nodeId}.choices.${choice.id}.effects`,
          ).map((issue) => ({
            code: issue.code,
            message: issue.message,
            nodeId,
            choiceId: choice.id,
            path: issue.path,
            ...(issue.targetId ? { targetId: issue.targetId } : {}),
          })),
        );

        issues.push(
          ...this.validateJumpEffects(
            nodeId,
            choice.effects,
            dialogue,
            `choices.${choice.id}.effects`,
            choice.id,
          ),
        );
      });
    });

    return issues;
  }

  assertValid(dialogue: DialogueData) {
    const issues = this.validate(dialogue);

    if (issues.length > 0) {
      const summary = issues.map((issue) => issue.message).join(' ');

      throw new Error(`Invalid dialogue "${dialogue.id}". ${summary}`);
    }
  }

  private validateNodeAssets(node: DialogueNode, nodeId: string) {
    const issues: DialogueValidationError[] = [];

    issues.push(...this.validateAssetRef(node.backgroundId, 'background', 'missingBackgroundReference', nodeId, 'backgroundId'));
    issues.push(...this.validateAssetRef(node.portraitId, 'portrait', 'missingPortraitReference', nodeId, 'portraitId'));
    issues.push(...this.validateAssetRef(node.cgId, 'cg', 'missingCgReference', nodeId, 'cgId'));
    issues.push(...this.validateAssetRef(node.overlayId, 'overlay', 'missingOverlayReference', nodeId, 'overlayId'));

    const musicMode = node.music?.mode ?? node.music?.action;

    if ((musicMode === 'play' || musicMode === 'switch') && node.music?.musicId) {
      issues.push(...this.validateAssetRef(node.music.musicId, 'music', 'missingMusicReference', nodeId, 'music.musicId'));
    }

    const sfxEntries = Array.isArray(node.sfx) ? node.sfx : node.sfx ? [node.sfx] : [];

    sfxEntries.forEach((entry, index) => {
      const sfxId = entry.sfxId ?? entry.id;

      if (sfxId) {
        issues.push(
          ...this.validateAssetRef(
            sfxId,
            'sfx',
            'missingSfxReference',
            nodeId,
            Array.isArray(node.sfx) ? `sfx[${index}]` : 'sfx.sfxId',
          ),
        );
      }
    });

    if (node.stage?.backgroundId) {
      issues.push(...this.validateAssetRef(node.stage.backgroundId, 'background', 'missingBackgroundReference', nodeId, 'stage.backgroundId'));
    }

    if (node.stage?.cgId) {
      issues.push(...this.validateAssetRef(node.stage.cgId, 'cg', 'missingCgReference', nodeId, 'stage.cgId'));
    }

    if (node.stage?.overlayId) {
      issues.push(...this.validateAssetRef(node.stage.overlayId, 'overlay', 'missingOverlayReference', nodeId, 'stage.overlayId'));
    }

    node.stage?.characters?.forEach((character, index) => {
      if (character.emotion && !CHARACTER_EMOTIONS.includes(character.emotion)) {
        issues.push({
          code: 'unsupportedEmotion',
          message: `Stage character emotion "${character.emotion}" is not part of the allowed character emotion list.`,
          nodeId,
          targetId: character.emotion,
          path: `nodes.${nodeId}.stage.characters.${index}.emotion`,
        });
      }

      issues.push(
        ...this.validateAssetRef(
          character.portraitId,
          'portrait',
          'missingPortraitReference',
          nodeId,
          `stage.characters.${index}.portraitId`,
        ),
      );
    });

    this.getStageSlotEntries(node).forEach(([slotName, character]) => {
      if (character?.emotion && !CHARACTER_EMOTIONS.includes(character.emotion)) {
        issues.push({
          code: 'unsupportedEmotion',
          message: `Stage slot emotion "${character.emotion}" is not part of the allowed character emotion list.`,
          nodeId,
          targetId: character.emotion,
          path: `nodes.${nodeId}.stage.${slotName}.emotion`,
        });
      }

      issues.push(
        ...this.validateAssetRef(
          character?.portraitId,
          'portrait',
          'missingPortraitReference',
          nodeId,
          `stage.${slotName}.portraitId`,
        ),
      );
    });

    return issues;
  }

  private validateStageSpeakers(node: DialogueNode, nodeId: string) {
    const issues: DialogueValidationError[] = [];

    if (!this.hasSpeakerId || !node.stage) {
      return issues;
    }

    this.getStageSlotEntries(node).forEach(([slotName, character]) => {
      if (character?.speakerId && !this.hasSpeakerId?.(character.speakerId)) {
        issues.push({
          code: 'missingSpeakerReference',
          message: `Stage slot speaker "${character.speakerId}" is not present in the narrative character registry.`,
          nodeId,
          targetId: character.speakerId,
          path: `nodes.${nodeId}.stage.${slotName}.speakerId`,
        });
      }
    });

    node.stage.characters?.forEach((character, index) => {
      if (!this.hasSpeakerId?.(character.speakerId)) {
        issues.push({
          code: 'missingSpeakerReference',
          message: `Stage character speaker "${character.speakerId}" is not present in the narrative character registry.`,
          nodeId,
          targetId: character.speakerId,
          path: `nodes.${nodeId}.stage.characters.${index}.speakerId`,
        });
      }
    });

    return issues;
  }

  private getStageSlotEntries(node: DialogueNode) {
    if (!node.stage) {
      return [] as Array<[string, NonNullable<DialogueNode['stage']>['left']]>;
    }

    const entries: Array<[string, NonNullable<DialogueNode['stage']>['left']]> = [];

    if (node.stage.left !== undefined) {
      entries.push(['left', node.stage.left]);
    }

    if (node.stage.center !== undefined) {
      entries.push(['center', node.stage.center]);
    }

    if (node.stage.right !== undefined) {
      entries.push(['right', node.stage.right]);
    }

    node.stage.extra?.forEach((character, index) => {
      entries.push([`extra.${index}`, character]);
    });

    return entries;
  }

  private validateAssetRef(
    assetId: string | undefined,
    kind: NarrativeAssetKind,
    code: Extract<
      DialogueValidationErrorCode,
      | 'missingBackgroundReference'
      | 'missingPortraitReference'
      | 'missingMusicReference'
      | 'missingSfxReference'
      | 'missingCgReference'
      | 'missingOverlayReference'
    >,
    nodeId: string,
    fieldPath: string,
  ) {
    if (!assetId || !this.hasAssetOfKind) {
      return [];
    }

    return this.hasAssetOfKind(assetId, kind)
      ? []
      : [
          {
            code,
            message: `Dialogue node references missing ${kind} asset "${assetId}".`,
            nodeId,
            targetId: assetId,
            path: `nodes.${nodeId}.${fieldPath}`,
          },
        ];
  }

  private validateJumpEffects(
    nodeId: string,
    effects: readonly NonNullable<DialogueNode['onEnterEffects']>[number][] | undefined,
    dialogue: DialogueData,
    fieldPath: string,
    choiceId?: string,
  ) {
    const issues: DialogueValidationError[] = [];

    effects?.forEach((effect, index) => {
      if (effect.type === 'jumpToNode' && !dialogue.nodes[effect.nodeId]) {
        const issue: DialogueValidationError = {
          code: 'missingJumpNodeReference',
          message: `jumpToNode references missing node "${effect.nodeId}".`,
          nodeId,
          targetId: effect.nodeId,
          path: `nodes.${nodeId}.${fieldPath}[${index}]`,
        };

        if (choiceId) {
          issue.choiceId = choiceId;
        }

        issues.push(issue);
      }
    });

    return issues;
  }
}
