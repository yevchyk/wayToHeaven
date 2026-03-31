import {
  CHARACTER_EMOTIONS,
  type DialogueNodeType,
  type SceneTransition,
  type SpeakerSide,
} from '@engine/types/dialogue';
import type { Condition, NumericComparisonOperator, EqualityComparisonOperator, TagConditionOperator } from '@engine/types/conditions';
import type { GameEffect } from '@engine/types/effects';
import type { NarrativeAssetKind } from '@engine/types/narrative';
import type {
  SceneGenerationDocument,
  SceneGenerationEncounter,
  SceneGenerationFallbackTarget,
  SceneGenerationNode,
  SceneGenerationRouteRules,
  SceneGenerationStageCharacter,
} from '@engine/types/sceneGeneration';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import type { EffectReferenceValidationIssueCode } from '@engine/validators/EffectReferenceValidator';

const DIALOGUE_NODE_TYPES: readonly DialogueNodeType[] = ['dialogue', 'narration', 'choice', 'event'];
const SCENE_MODES = ['sequence', 'hub', 'route'] as const;
const SPEAKER_SIDES: readonly SpeakerSide[] = ['left', 'center', 'right'];
const SCENE_TRANSITIONS = ['cut', 'fade', 'dissolve', 'flash'] as const;
const MUSIC_ACTIONS = ['play', 'stop', 'switch'] as const;
const ROUTE_ENCOUNTER_KINDS = ['battle', 'dialogue', 'loot', 'script', 'effects', 'exit', 'none'] as const;
const NUMERIC_OPERATORS: readonly NumericComparisonOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'];
const EQUALITY_OPERATORS: readonly EqualityComparisonOperator[] = ['eq', 'neq'];
const TAG_OPERATORS: readonly TagConditionOperator[] = ['has', 'missing'];

type SceneMode = (typeof SCENE_MODES)[number];
type SceneTransitionType = (typeof SCENE_TRANSITIONS)[number];
type RouteEncounterKind = (typeof ROUTE_ENCOUNTER_KINDS)[number];

export type SceneGenerationValidationIssueCode =
  | 'invalidDocument'
  | 'missingScenes'
  | 'invalidSceneStructure'
  | 'invalidSceneId'
  | 'duplicateSceneId'
  | 'missingSceneStartNode'
  | 'invalidSceneMode'
  | 'invalidNodeStructure'
  | 'unsupportedNodeType'
  | 'invalidNodeId'
  | 'duplicateNodeId'
  | 'missingNodeReference'
  | 'missingSceneReference'
  | 'invalidNodeFlow'
  | 'missingChoiceOptions'
  | 'invalidChoiceStructure'
  | 'duplicateChoiceId'
  | 'missingNodeText'
  | 'unsupportedSpeakerSide'
  | 'missingSpeakerReference'
  | 'unsupportedEmotion'
  | 'invalidStageCharacter'
  | 'invalidTagsStructure'
  | 'invalidMusicStructure'
  | 'invalidSfxStructure'
  | 'invalidSceneChangeStructure'
  | 'invalidConditionsStructure'
  | 'invalidEffectsStructure'
  | 'invalidConditionFallback'
  | 'missingBackgroundReference'
  | 'missingPortraitReference'
  | 'missingMusicReference'
  | 'missingSfxReference'
  | 'missingCgReference'
  | 'missingOverlayReference'
  | 'missingJumpNodeReference'
  | 'unsupportedTransition'
  | EffectReferenceValidationIssueCode;

export interface SceneGenerationValidationIssue {
  code: SceneGenerationValidationIssueCode;
  message: string;
  path?: string;
  sceneId?: string;
  nodeId?: string;
  choiceId?: string;
  targetId?: string;
}

interface SceneGenerationValidatorOptions {
  hasSpeakerId?: (speakerId: string) => boolean;
  hasAssetOfKind?: (assetId: string, kind: NarrativeAssetKind) => boolean;
  hasSceneFlowId?: (sceneFlowId: string) => boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isDialogueNodeType(value: unknown): value is DialogueNodeType {
  return typeof value === 'string' && DIALOGUE_NODE_TYPES.includes(value as DialogueNodeType);
}

function isSceneMode(value: unknown): value is SceneMode {
  return typeof value === 'string' && SCENE_MODES.includes(value as SceneMode);
}

function isSpeakerSide(value: unknown): value is SpeakerSide {
  return typeof value === 'string' && SPEAKER_SIDES.includes(value as SpeakerSide);
}

function isSceneTransitionType(value: unknown): value is SceneTransitionType {
  return typeof value === 'string' && SCENE_TRANSITIONS.includes(value as SceneTransitionType);
}

function isRouteEncounterKind(value: unknown): value is RouteEncounterKind {
  return typeof value === 'string' && ROUTE_ENCOUNTER_KINDS.includes(value as RouteEncounterKind);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasJumpToNodeEffect(effects: unknown) {
  return Array.isArray(effects) && effects.some((effect) => isRecord(effect) && effect.type === 'jumpToNode');
}

export class SceneGenerationValidator {
  private readonly effectReferenceValidator: EffectReferenceValidator;
  private readonly hasSpeakerId: SceneGenerationValidatorOptions['hasSpeakerId'];
  private readonly hasAssetOfKind: SceneGenerationValidatorOptions['hasAssetOfKind'];
  private readonly hasSceneFlowId: SceneGenerationValidatorOptions['hasSceneFlowId'];

  constructor(
    effectReferenceValidator: EffectReferenceValidator = new EffectReferenceValidator(),
    options: SceneGenerationValidatorOptions = {},
  ) {
    this.effectReferenceValidator = effectReferenceValidator;
    this.hasSpeakerId = options.hasSpeakerId;
    this.hasAssetOfKind = options.hasAssetOfKind;
    this.hasSceneFlowId = options.hasSceneFlowId;
  }

  validate(document: unknown) {
    const issues: SceneGenerationValidationIssue[] = [];

    if (!isRecord(document)) {
      issues.push({
        code: 'invalidDocument',
        message: 'Scene generation document must be an object.',
        path: '$',
      });

      return issues;
    }

    this.validateDocumentMeta(document, issues);

    const scenesValue = document.scenes;

    if (!isRecord(scenesValue) || Object.keys(scenesValue).length === 0) {
      issues.push({
        code: 'missingScenes',
        message: 'Scene generation document must provide at least one scene.',
        path: 'scenes',
      });

      return issues;
    }

    const knownSceneIds = new Set<string>();

    Object.entries(scenesValue).forEach(([sceneKey, sceneValue]) => {
      if (!isRecord(sceneValue)) {
        knownSceneIds.add(sceneKey);

        return;
      }

      knownSceneIds.add(isNonEmptyString(sceneValue.id) ? sceneValue.id : sceneKey);
    });

    const seenSceneIds = new Set<string>();

    Object.entries(scenesValue).forEach(([sceneKey, sceneValue]) => {
      this.validateScene(sceneKey, sceneValue, issues, knownSceneIds, seenSceneIds);
    });

    return issues;
  }

  assertValid(document: unknown): asserts document is SceneGenerationDocument {
    const issues = this.validate(document);

    if (issues.length > 0) {
      const summary = issues.map((issue) => issue.message).join(' ');

      throw new Error(`Invalid scene generation document. ${summary}`);
    }
  }

  private validateDocumentMeta(document: Record<string, unknown>, issues: SceneGenerationValidationIssue[]) {
    if (!isNonEmptyString(document.id)) {
      issues.push({
        code: 'invalidDocument',
        message: 'Scene generation document must provide a non-empty id.',
        path: 'id',
      });
    }

    if (!isNonEmptyString(document.title)) {
      issues.push({
        code: 'invalidDocument',
        message: 'Scene generation document must provide a non-empty title.',
        path: 'title',
      });
    }

    if (document.schemaVersion !== 1) {
      issues.push({
        code: 'invalidDocument',
        message: 'Scene generation document currently supports only schemaVersion 1.',
        path: 'schemaVersion',
      });
    }

    if (!isRecord(document.meta) || !isNonEmptyString(document.meta.chapterId)) {
      issues.push({
        code: 'invalidDocument',
        message: 'Scene generation document must provide meta.chapterId.',
        path: 'meta.chapterId',
      });
    }

    if (!isRecord(document.meta)) {
      return;
    }

    this.validateAssetRef(
      document.meta.defaultBackgroundId,
      'background',
      'missingBackgroundReference',
      'meta.defaultBackgroundId',
      issues,
    );
    this.validateAssetRef(
      document.meta.defaultMusicId,
      'music',
      'missingMusicReference',
      'meta.defaultMusicId',
      issues,
    );
    this.validateAssetRef(
      document.meta.defaultCgId,
      'cg',
      'missingCgReference',
      'meta.defaultCgId',
      issues,
    );
    this.validateAssetRef(
      document.meta.defaultOverlayId,
      'overlay',
      'missingOverlayReference',
      'meta.defaultOverlayId',
      issues,
    );
    this.validateStage(document.meta.defaultStage, 'meta.defaultStage', issues, {});
  }

  private validateScene(
    sceneKey: string,
    sceneValue: unknown,
    issues: SceneGenerationValidationIssue[],
    knownSceneIds: ReadonlySet<string>,
    seenSceneIds: Set<string>,
  ) {
    const scenePath = `scenes.${sceneKey}`;

    if (!isRecord(sceneValue)) {
      issues.push({
        code: 'invalidSceneStructure',
        message: `Scene "${sceneKey}" must be an object.`,
        path: scenePath,
        sceneId: sceneKey,
      });

      return;
    }

    const sceneId = isNonEmptyString(sceneValue.id) ? sceneValue.id : sceneKey;

    if (!isNonEmptyString(sceneValue.id) || sceneValue.id !== sceneKey) {
      issues.push({
        code: 'invalidSceneId',
        message: `Scene key "${sceneKey}" must match scene.id.`,
        path: `${scenePath}.id`,
        sceneId,
        ...(isNonEmptyString(sceneValue.id) ? { targetId: sceneValue.id } : {}),
      });
    }

    if (seenSceneIds.has(sceneId)) {
      issues.push({
        code: 'duplicateSceneId',
        message: `Scene id "${sceneId}" is duplicated.`,
        path: `${scenePath}.id`,
        sceneId,
        targetId: sceneId,
      });
    }

    seenSceneIds.add(sceneId);

    if (sceneValue.mode !== undefined && !isSceneMode(sceneValue.mode)) {
      issues.push({
        code: 'invalidSceneMode',
        message: `Scene "${sceneId}" uses unsupported mode "${String(sceneValue.mode)}".`,
        path: `${scenePath}.mode`,
        sceneId,
        ...(typeof sceneValue.mode === 'string' ? { targetId: sceneValue.mode } : {}),
      });
    }

    this.validateTags(sceneValue.tags, `${scenePath}.tags`, issues, { sceneId });
    this.validateConditions(sceneValue.conditions, `${scenePath}.conditions`, issues, { sceneId });
    this.validateFallback(
      sceneValue.onConditionFail,
      `${scenePath}.onConditionFail`,
      issues,
      knownSceneIds,
      undefined,
      { sceneId },
    );
    this.validateAssetRef(
      sceneValue.backgroundId,
      'background',
      'missingBackgroundReference',
      `${scenePath}.backgroundId`,
      issues,
      { sceneId },
    );
    this.validateAssetRef(sceneValue.cgId, 'cg', 'missingCgReference', `${scenePath}.cgId`, issues, {
      sceneId,
    });
    this.validateAssetRef(
      sceneValue.overlayId,
      'overlay',
      'missingOverlayReference',
      `${scenePath}.overlayId`,
      issues,
      { sceneId },
    );
    this.validateMusic(sceneValue.music, `${scenePath}.music`, issues, { sceneId });
    this.validateStage(sceneValue.stage, `${scenePath}.stage`, issues, { sceneId });
    this.validateTransition(sceneValue.transition, `${scenePath}.transition`, issues, { sceneId });
    this.validateRouteRules(sceneValue.routeRules, `${scenePath}.routeRules`, issues, { sceneId });

    const sceneMode: SceneMode = isSceneMode(sceneValue.mode) ? sceneValue.mode : 'sequence';

    const nodesValue = sceneValue.nodes;

    if (!isRecord(nodesValue) || Object.keys(nodesValue).length === 0) {
      issues.push({
        code: 'invalidSceneStructure',
        message: `Scene "${sceneId}" must provide a non-empty nodes object.`,
        path: `${scenePath}.nodes`,
        sceneId,
      });

      return;
    }

    if (!isNonEmptyString(sceneValue.startNodeId) || !(sceneValue.startNodeId in nodesValue)) {
      issues.push({
        code: 'missingSceneStartNode',
        message: `Scene "${sceneId}" must provide a valid startNodeId.`,
        path: `${scenePath}.startNodeId`,
        sceneId,
        ...(isNonEmptyString(sceneValue.startNodeId) ? { targetId: sceneValue.startNodeId } : {}),
      });
    }

    const seenNodeIds = new Set<string>();

    Object.entries(nodesValue).forEach(([nodeKey, nodeValue]) => {
      this.validateNode(
        sceneId,
        sceneMode,
        scenePath,
        nodeKey,
        nodeValue,
        issues,
        nodesValue,
        knownSceneIds,
        seenNodeIds,
      );
    });
  }

  private validateNode(
    sceneId: string,
    sceneMode: SceneMode,
    scenePath: string,
    nodeKey: string,
    nodeValue: unknown,
    issues: SceneGenerationValidationIssue[],
    nodes: Record<string, unknown>,
    knownSceneIds: ReadonlySet<string>,
    seenNodeIds: Set<string>,
  ) {
    const nodePath = `${scenePath}.nodes.${nodeKey}`;

    if (!isRecord(nodeValue)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Node "${nodeKey}" in scene "${sceneId}" must be an object.`,
        path: nodePath,
        sceneId,
        nodeId: nodeKey,
      });

      return;
    }

    const nodeId = isNonEmptyString(nodeValue.id) ? nodeValue.id : nodeKey;

    if (!isNonEmptyString(nodeValue.id) || nodeValue.id !== nodeKey) {
      issues.push({
        code: 'invalidNodeId',
        message: `Node key "${nodeKey}" in scene "${sceneId}" must match node.id.`,
        path: `${nodePath}.id`,
        sceneId,
        nodeId,
        ...(isNonEmptyString(nodeValue.id) ? { targetId: nodeValue.id } : {}),
      });
    }

    if (seenNodeIds.has(nodeId)) {
      issues.push({
        code: 'duplicateNodeId',
        message: `Node id "${nodeId}" is duplicated in scene "${sceneId}".`,
        path: `${nodePath}.id`,
        sceneId,
        nodeId,
        targetId: nodeId,
      });
    }

    seenNodeIds.add(nodeId);

    if (!isDialogueNodeType(nodeValue.type)) {
      issues.push({
        code: 'unsupportedNodeType',
        message: `Node "${nodeId}" in scene "${sceneId}" uses unsupported type "${String(nodeValue.type)}".`,
        path: `${nodePath}.type`,
        sceneId,
        nodeId,
        ...(typeof nodeValue.type === 'string' ? { targetId: nodeValue.type } : {}),
      });
    }

    if ((nodeValue.type === 'dialogue' || nodeValue.type === 'narration' || nodeValue.type === 'choice') && !isNonEmptyString(nodeValue.text)) {
      issues.push({
        code: 'missingNodeText',
        message: `Node "${nodeId}" in scene "${sceneId}" must provide text.`,
        path: `${nodePath}.text`,
        sceneId,
        nodeId,
      });
    }

    if (nodeValue.speakerSide !== undefined && !isSpeakerSide(nodeValue.speakerSide)) {
      issues.push({
        code: 'unsupportedSpeakerSide',
        message: `Node "${nodeId}" in scene "${sceneId}" uses unsupported speakerSide "${String(nodeValue.speakerSide)}".`,
        path: `${nodePath}.speakerSide`,
        sceneId,
        nodeId,
        ...(typeof nodeValue.speakerSide === 'string' ? { targetId: nodeValue.speakerSide } : {}),
      });
    }

    this.validateTags(nodeValue.tags, `${nodePath}.tags`, issues, { sceneId, nodeId });
    this.validateConditions(nodeValue.conditions, `${nodePath}.conditions`, issues, { sceneId, nodeId });
    this.validateFallback(nodeValue.onConditionFail, `${nodePath}.onConditionFail`, issues, knownSceneIds, nodes, {
      sceneId,
      nodeId,
    });
    this.validateSpeaker(nodeValue.speakerId, `${nodePath}.speakerId`, issues, { sceneId, nodeId });
    this.validateEmotion(nodeValue.emotion, `${nodePath}.emotion`, issues, { sceneId, nodeId });
    this.validateAssetRef(
      nodeValue.portraitId,
      'portrait',
      'missingPortraitReference',
      `${nodePath}.portraitId`,
      issues,
      { sceneId, nodeId },
    );
    this.validateAssetRef(
      nodeValue.backgroundId,
      'background',
      'missingBackgroundReference',
      `${nodePath}.backgroundId`,
      issues,
      { sceneId, nodeId },
    );
    this.validateAssetRef(nodeValue.cgId, 'cg', 'missingCgReference', `${nodePath}.cgId`, issues, {
      sceneId,
      nodeId,
    });
    this.validateAssetRef(
      nodeValue.overlayId,
      'overlay',
      'missingOverlayReference',
      `${nodePath}.overlayId`,
      issues,
      { sceneId, nodeId },
    );
    this.validateMusic(nodeValue.music, `${nodePath}.music`, issues, { sceneId, nodeId });
    this.validateSfx(nodeValue.sfx, `${nodePath}.sfx`, issues, { sceneId, nodeId });
    this.validateStage(nodeValue.stage, `${nodePath}.stage`, issues, { sceneId, nodeId });
    this.validateTransition(nodeValue.transition, `${nodePath}.transition`, issues, { sceneId, nodeId });
    this.validateEncounter(
      nodeValue.encounter,
      `${nodePath}.encounter`,
      issues,
      knownSceneIds,
      { sceneId, nodeId },
    );
    this.validateRouteLayout(nodeValue.route, `${nodePath}.route`, issues, { sceneId, nodeId });
    this.validateEffects(nodeValue.onEnterEffects, `${nodePath}.onEnterEffects`, issues, { sceneId, nodeId });
    this.validateEffects(nodeValue.onExitEffects, `${nodePath}.onExitEffects`, issues, { sceneId, nodeId });
    this.validateJumpEffects(nodeValue.onEnterEffects, `${nodePath}.onEnterEffects`, issues, nodes, {
      sceneId,
      nodeId,
    });
    this.validateJumpEffects(nodeValue.onExitEffects, `${nodePath}.onExitEffects`, issues, nodes, {
      sceneId,
      nodeId,
    });

    if (nodeValue.sceneChange !== undefined && !isRecord(nodeValue.sceneChange)) {
      issues.push({
        code: 'invalidSceneChangeStructure',
        message: `sceneChange on node "${nodeId}" in scene "${sceneId}" must be an object.`,
        path: `${nodePath}.sceneChange`,
        sceneId,
        nodeId,
      });
    }

    if (isRecord(nodeValue.sceneChange)) {
      this.validateStage(nodeValue.sceneChange.stage, `${nodePath}.sceneChange.stage`, issues, {
        sceneId,
        nodeId,
      });
      this.validateBackgroundPatch(
        nodeValue.sceneChange.background,
        `${nodePath}.sceneChange.background`,
        issues,
        { sceneId, nodeId },
      );
      this.validateMusic(nodeValue.sceneChange.music, `${nodePath}.sceneChange.music`, issues, {
        sceneId,
        nodeId,
      });
      this.validateAssetRef(
        nodeValue.sceneChange.cgId,
        'cg',
        'missingCgReference',
        `${nodePath}.sceneChange.cgId`,
        issues,
        { sceneId, nodeId },
      );
      this.validateAssetRef(
        nodeValue.sceneChange.overlayId,
        'overlay',
        'missingOverlayReference',
        `${nodePath}.sceneChange.overlayId`,
        issues,
        { sceneId, nodeId },
      );
      this.validateSfx(nodeValue.sceneChange.sfx, `${nodePath}.sceneChange.sfx`, issues, {
        sceneId,
        nodeId,
      });
      this.validateTransition(nodeValue.sceneChange.transition, `${nodePath}.sceneChange.transition`, issues, {
        sceneId,
        nodeId,
      });
    }

    const choicesValue = nodeValue.choices;
    const choices = Array.isArray(choicesValue) ? choicesValue : undefined;
    const hasChoices = (choices?.length ?? 0) > 0;
    const hasNextNode = isNonEmptyString(nodeValue.nextNodeId);
    const hasNextScene = isNonEmptyString(nodeValue.nextSceneId);
    const hasOpenSceneFlow = isNonEmptyString(nodeValue.openSceneFlowId);
    const targetCount = [hasNextNode, hasNextScene, hasOpenSceneFlow].filter(Boolean).length;
    const isEnd = nodeValue.isEnd === true;
    const hasJumpEffect =
      hasJumpToNodeEffect(nodeValue.onEnterEffects) || hasJumpToNodeEffect(nodeValue.onExitEffects);

    if (sceneMode === 'route' && !isRecord(nodeValue.route)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Route node "${nodeId}" in scene "${sceneId}" must provide route layout.`,
        path: `${nodePath}.route`,
        sceneId,
        nodeId,
      });
    }

    if (choicesValue !== undefined && !Array.isArray(choicesValue)) {
      issues.push({
        code: 'invalidChoiceStructure',
        message: `choices on node "${nodeId}" in scene "${sceneId}" must be an array.`,
        path: `${nodePath}.choices`,
        sceneId,
        nodeId,
      });
    }

    if (nodeValue.type === 'choice' && !hasChoices) {
      issues.push({
        code: 'missingChoiceOptions',
        message: `Choice node "${nodeId}" in scene "${sceneId}" must provide at least one choice.`,
        path: `${nodePath}.choices`,
        sceneId,
        nodeId,
      });
    }

    if (nodeValue.type !== 'choice' && hasChoices) {
      issues.push({
        code: 'invalidNodeFlow',
        message: `Node "${nodeId}" in scene "${sceneId}" cannot define choices unless type is "choice".`,
        path: nodePath,
        sceneId,
        nodeId,
      });
    }

    if (hasChoices && targetCount > 0) {
      issues.push({
        code: 'invalidNodeFlow',
        message: `Node "${nodeId}" in scene "${sceneId}" cannot define both choices and direct scene flow.`,
        path: nodePath,
        sceneId,
        nodeId,
      });
    }

    if (!hasChoices && targetCount > 1) {
      issues.push({
        code: 'invalidNodeFlow',
        message: `Node "${nodeId}" in scene "${sceneId}" cannot define multiple direct flow targets.`,
        path: nodePath,
        sceneId,
        nodeId,
      });
    }

    if (!hasChoices && targetCount === 0 && !isEnd && !hasJumpEffect) {
      issues.push({
        code: 'invalidNodeFlow',
        message: `Node "${nodeId}" in scene "${sceneId}" must end, move to another node, move to another scene, open another flow, or jump via effect.`,
        path: nodePath,
        sceneId,
        nodeId,
      });
    }

    if (Array.isArray(nodeValue.conditions) && nodeValue.conditions.length > 0 && nodeValue.onConditionFail === undefined) {
      issues.push({
        code: 'invalidConditionFallback',
        message: `Node "${nodeId}" in scene "${sceneId}" uses conditions but does not define onConditionFail.`,
        path: `${nodePath}.onConditionFail`,
        sceneId,
        nodeId,
      });
    }

    if (hasNextNode && !(String(nodeValue.nextNodeId) in nodes)) {
      issues.push({
        code: 'missingNodeReference',
        message: `Node "${nodeId}" in scene "${sceneId}" references missing nextNodeId "${nodeValue.nextNodeId}".`,
        path: `${nodePath}.nextNodeId`,
        sceneId,
        nodeId,
        targetId: String(nodeValue.nextNodeId),
      });
    }

    if (hasNextScene) {
      this.validateSceneFlowReference(
        String(nodeValue.nextSceneId),
        `${nodePath}.nextSceneId`,
        issues,
        knownSceneIds,
        { sceneId, nodeId },
      );
    }

    if (hasOpenSceneFlow) {
      this.validateSceneFlowReference(
        String(nodeValue.openSceneFlowId),
        `${nodePath}.openSceneFlowId`,
        issues,
        knownSceneIds,
        { sceneId, nodeId },
      );
    }

    if (!choices) {
      return;
    }

    const seenChoiceIds = new Set<string>();

    choices.forEach((choice, index) => {
      this.validateChoice(sceneId, nodeId, `${nodePath}.choices[${index}]`, choice, issues, nodes, knownSceneIds, seenChoiceIds);
    });
  }

  private validateChoice(
    sceneId: string,
    nodeId: string,
    choicePath: string,
    choiceValue: unknown,
    issues: SceneGenerationValidationIssue[],
    nodes: Record<string, unknown>,
    knownSceneIds: ReadonlySet<string>,
    seenChoiceIds: Set<string>,
  ) {
    if (!isRecord(choiceValue)) {
      issues.push({
        code: 'invalidChoiceStructure',
        message: `Choice in node "${nodeId}" must be an object.`,
        path: choicePath,
        sceneId,
        nodeId,
      });

      return;
    }

    const choiceId = isNonEmptyString(choiceValue.id) ? choiceValue.id : `choice@${choicePath}`;

    if (!isNonEmptyString(choiceValue.id)) {
      issues.push({
        code: 'invalidChoiceStructure',
        message: `Choice in node "${nodeId}" must provide a non-empty id.`,
        path: `${choicePath}.id`,
        sceneId,
        nodeId,
      });
    }

    if (seenChoiceIds.has(choiceId)) {
      issues.push({
        code: 'duplicateChoiceId',
        message: `Choice id "${choiceId}" is duplicated in node "${nodeId}".`,
        path: `${choicePath}.id`,
        sceneId,
        nodeId,
        choiceId,
        targetId: choiceId,
      });
    }

    seenChoiceIds.add(choiceId);

    if (!isNonEmptyString(choiceValue.text)) {
      issues.push({
        code: 'invalidChoiceStructure',
        message: `Choice "${choiceId}" in node "${nodeId}" must provide text.`,
        path: `${choicePath}.text`,
        sceneId,
        nodeId,
        choiceId,
      });
    }

    this.validateTags(choiceValue.tags, `${choicePath}.tags`, issues, { sceneId, nodeId, choiceId });
    this.validateConditions(choiceValue.conditions, `${choicePath}.conditions`, issues, {
      sceneId,
      nodeId,
      choiceId,
    });
    this.validateEffects(choiceValue.effects, `${choicePath}.effects`, issues, { sceneId, nodeId, choiceId });
    this.validateJumpEffects(choiceValue.effects, `${choicePath}.effects`, issues, nodes, {
      sceneId,
      nodeId,
      choiceId,
    });

    const nextNodeId = isNonEmptyString(choiceValue.nextNodeId) ? choiceValue.nextNodeId : undefined;
    const nextSceneId = isNonEmptyString(choiceValue.nextSceneId) ? choiceValue.nextSceneId : undefined;
    const openSceneFlowId = isNonEmptyString(choiceValue.openSceneFlowId) ? choiceValue.openSceneFlowId : undefined;
    const targetCount = [nextNodeId, nextSceneId, openSceneFlowId].filter((value): value is string => Boolean(value)).length;

    if (targetCount > 1) {
      issues.push({
        code: 'invalidNodeFlow',
        message: `Choice "${choiceId}" in node "${nodeId}" cannot define multiple direct flow targets.`,
        path: choicePath,
        sceneId,
        nodeId,
        choiceId,
      });
    }

    if (targetCount === 0 && !Array.isArray(choiceValue.effects)) {
      issues.push({
        code: 'invalidChoiceStructure',
        message: `Choice "${choiceId}" in node "${nodeId}" must route somewhere or provide effects.`,
        path: choicePath,
        sceneId,
        nodeId,
        choiceId,
      });
    }

    if (nextNodeId && !(nextNodeId in nodes)) {
      issues.push({
        code: 'missingNodeReference',
        message: `Choice "${choiceId}" in node "${nodeId}" references missing nextNodeId "${nextNodeId}".`,
        path: `${choicePath}.nextNodeId`,
        sceneId,
        nodeId,
        choiceId,
        targetId: nextNodeId,
      });
    }

    if (nextSceneId) {
      this.validateSceneFlowReference(
        nextSceneId,
        `${choicePath}.nextSceneId`,
        issues,
        knownSceneIds,
        { sceneId, nodeId, choiceId },
      );
    }

    if (openSceneFlowId) {
      this.validateSceneFlowReference(
        openSceneFlowId,
        `${choicePath}.openSceneFlowId`,
        issues,
        knownSceneIds,
        { sceneId, nodeId, choiceId },
      );
    }
  }

  private validateStage(
    stageValue: unknown,
    stagePath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (stageValue === undefined) {
      return;
    }

    if (stageValue === null) {
      return;
    }

    if (!isRecord(stageValue)) {
      issues.push({
        code: 'invalidStageCharacter',
        message: `Stage at "${stagePath}" must be an object.`,
        path: stagePath,
        ...context,
      });

      return;
    }

    ['left', 'center', 'right', 'extra'].forEach((legacyKey) => {
      if (legacyKey in stageValue) {
        issues.push({
          code: 'invalidStageCharacter',
          message: `Stage at "${stagePath}" uses legacy "${legacyKey}" layout; use characters[] instead.`,
          path: `${stagePath}.${legacyKey}`,
          ...context,
        });
      }
    });

    if (stageValue.characters !== undefined && !Array.isArray(stageValue.characters)) {
      issues.push({
        code: 'invalidStageCharacter',
        message: `Stage characters at "${stagePath}" must be an array.`,
        path: `${stagePath}.characters`,
        ...context,
      });
    }

    if (Array.isArray(stageValue.characters)) {
      stageValue.characters.forEach((entry, index) => {
        this.validateStageCharacter(entry, `${stagePath}.characters[${index}]`, issues, context);
      });
    }

    if (stageValue.focusCharacterId !== undefined && !isNonEmptyString(stageValue.focusCharacterId)) {
      issues.push({
        code: 'invalidStageCharacter',
        message: `Stage focusCharacterId at "${stagePath}" must be a non-empty string.`,
        path: `${stagePath}.focusCharacterId`,
        ...context,
      });
    }
  }

  private validateStageCharacter(
    value: unknown,
    path: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (!isRecord(value) || !isNonEmptyString(value.speakerId)) {
      issues.push({
        code: 'invalidStageCharacter',
        message: `Stage entry "${path}" must provide speakerId.`,
        path,
        ...context,
      });

      return;
    }

    this.validateSpeaker(value.speakerId, `${path}.speakerId`, issues, context);
    this.validateEmotion(value.emotion, `${path}.emotion`, issues, context);
    this.validateAssetRef(
      value.portraitId,
      'portrait',
      'missingPortraitReference',
      `${path}.portraitId`,
      issues,
      context,
    );
  }

  private validateBackgroundPatch(
    backgroundValue: unknown,
    backgroundPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (backgroundValue === undefined) {
      return;
    }

    if (!isRecord(backgroundValue)) {
      issues.push({
        code: 'invalidSceneChangeStructure',
        message: `Background patch at "${backgroundPath}" must be an object.`,
        path: backgroundPath,
        ...context,
      });

      return;
    }

    if (!isNonEmptyString(backgroundValue.image)) {
      issues.push({
        code: 'missingBackgroundReference',
        message: `Background patch at "${backgroundPath}" must provide image.`,
        path: `${backgroundPath}.image`,
        ...context,
      });

      return;
    }

    this.validateAssetRef(
      backgroundValue.image,
      'background',
      'missingBackgroundReference',
      `${backgroundPath}.image`,
      issues,
      context,
    );

    if (backgroundValue.transition !== undefined && !isSceneTransitionType(backgroundValue.transition)) {
      issues.push({
        code: 'unsupportedTransition',
        message: `Background patch at "${backgroundPath}" uses unsupported transition "${String(backgroundValue.transition)}".`,
        path: `${backgroundPath}.transition`,
        ...context,
        ...(typeof backgroundValue.transition === 'string' ? { targetId: backgroundValue.transition } : {}),
      });
    }

    if (backgroundValue.style !== undefined && !isNonEmptyString(backgroundValue.style)) {
      issues.push({
        code: 'invalidSceneChangeStructure',
        message: `Background patch style at "${backgroundPath}" must be a non-empty string.`,
        path: `${backgroundPath}.style`,
        ...context,
      });
    }
  }

  private validateRouteRules(
    routeRulesValue: unknown,
    routeRulesPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string },
  ) {
    if (routeRulesValue === undefined) {
      return;
    }

    if (!isRecord(routeRulesValue)) {
      issues.push({
        code: 'invalidSceneStructure',
        message: `Route rules at "${routeRulesPath}" must be an object.`,
        path: routeRulesPath,
        ...context,
      });

      return;
    }

    if (routeRulesValue.rollRange !== undefined) {
      if (!isRecord(routeRulesValue.rollRange)) {
        issues.push({
          code: 'invalidSceneStructure',
          message: `Route rollRange at "${routeRulesPath}" must be an object.`,
          path: `${routeRulesPath}.rollRange`,
          ...context,
        });
      } else {
        const min = routeRulesValue.rollRange.min;
        const max = routeRulesValue.rollRange.max;

        if (!isFiniteNumber(min) || !isFiniteNumber(max) || min > max) {
          issues.push({
            code: 'invalidSceneStructure',
            message: `Route rollRange at "${routeRulesPath}" must provide numeric min/max with min <= max.`,
            path: `${routeRulesPath}.rollRange`,
            ...context,
          });
        }
      }
    }

    ['scoutCharges', 'scoutDepth'].forEach((key) => {
      if (
        routeRulesValue[key] !== undefined &&
        (!isFiniteNumber(routeRulesValue[key]) || Number(routeRulesValue[key]) < 0)
      ) {
        issues.push({
          code: 'invalidSceneStructure',
          message: `Route rules field "${key}" at "${routeRulesPath}" must be a non-negative number.`,
          path: `${routeRulesPath}.${key}`,
          ...context,
        });
      }
    });

    if (
      routeRulesValue.revealNonHiddenAtStart !== undefined &&
      typeof routeRulesValue.revealNonHiddenAtStart !== 'boolean'
    ) {
      issues.push({
        code: 'invalidSceneStructure',
        message: `Route rules revealNonHiddenAtStart at "${routeRulesPath}" must be a boolean.`,
        path: `${routeRulesPath}.revealNonHiddenAtStart`,
        ...context,
      });
    }
  }

  private validateRouteLayout(
    routeValue: unknown,
    routePath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (routeValue === undefined) {
      return;
    }

    if (!isRecord(routeValue) || !isFiniteNumber(routeValue.x) || !isFiniteNumber(routeValue.y)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Route layout at "${routePath}" must provide numeric x/y coordinates.`,
        path: routePath,
        ...context,
      });

      return;
    }

    if (routeValue.hidden !== undefined && typeof routeValue.hidden !== 'boolean') {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Route layout hidden at "${routePath}" must be a boolean.`,
        path: `${routePath}.hidden`,
        ...context,
      });
    }

    if (routeValue.oneTime !== undefined && typeof routeValue.oneTime !== 'boolean') {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Route layout oneTime at "${routePath}" must be a boolean.`,
        path: `${routePath}.oneTime`,
        ...context,
      });
    }

    this.validateTags(routeValue.tags, `${routePath}.tags`, issues, context);
  }

  private validateEncounter(
    encounterValue: unknown,
    encounterPath: string,
    issues: SceneGenerationValidationIssue[],
    knownSceneIds: ReadonlySet<string>,
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (encounterValue === undefined) {
      return;
    }

    if (!isRecord(encounterValue) || !isRouteEncounterKind(encounterValue.kind)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Encounter at "${encounterPath}" must be an object with a supported kind.`,
        path: encounterPath,
        ...context,
      });

      return;
    }

    const encounter = encounterValue as unknown as SceneGenerationEncounter;

    if (encounter.kind === 'battle' && !isNonEmptyString(encounter.battleTemplateId)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Battle encounter at "${encounterPath}" must provide battleTemplateId.`,
        path: `${encounterPath}.battleTemplateId`,
        ...context,
      });
    }

    if (
      encounter.kind === 'dialogue' &&
      !isNonEmptyString(encounter.dialogueId) &&
      !isNonEmptyString(encounter.openSceneFlowId)
    ) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Dialogue encounter at "${encounterPath}" must provide dialogueId or openSceneFlowId.`,
        path: encounterPath,
        ...context,
      });
    }

    if (encounter.kind === 'loot' && !isNonEmptyString(encounter.itemId)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Loot encounter at "${encounterPath}" must provide itemId.`,
        path: `${encounterPath}.itemId`,
        ...context,
      });
    }

    if (encounter.kind === 'script' && !isNonEmptyString(encounter.scriptId)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Script encounter at "${encounterPath}" must provide scriptId.`,
        path: `${encounterPath}.scriptId`,
        ...context,
      });
    }

    if (encounter.itemQuantity !== undefined && (!isFiniteNumber(encounter.itemQuantity) || encounter.itemQuantity <= 0)) {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Encounter itemQuantity at "${encounterPath}" must be a positive number.`,
        path: `${encounterPath}.itemQuantity`,
        ...context,
      });
    }

    if (encounter.effects !== undefined) {
      this.validateEffects(encounter.effects, `${encounterPath}.effects`, issues, context);
    }

    if (encounter.openSceneFlowId) {
      this.validateSceneFlowReference(
        encounter.openSceneFlowId,
        `${encounterPath}.openSceneFlowId`,
        issues,
        knownSceneIds,
        context,
      );
    }

    if (encounter.completesFlow !== undefined && typeof encounter.completesFlow !== 'boolean') {
      issues.push({
        code: 'invalidNodeStructure',
        message: `Encounter completesFlow at "${encounterPath}" must be a boolean.`,
        path: `${encounterPath}.completesFlow`,
        ...context,
      });
    }
  }

  private validateMusic(
    musicValue: unknown,
    musicPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (musicValue === undefined) {
      return;
    }

    if (!isRecord(musicValue)) {
      issues.push({
        code: 'invalidMusicStructure',
        message: `Music at "${musicPath}" must be an object.`,
        path: musicPath,
        ...context,
      });

      return;
    }

    const musicAction = musicValue.action ?? musicValue.mode;

    if (musicAction !== undefined && !MUSIC_ACTIONS.includes(musicAction as (typeof MUSIC_ACTIONS)[number])) {
      issues.push({
        code: 'invalidMusicStructure',
        message: `Music at "${musicPath}" uses unsupported action "${String(musicAction)}".`,
        path: `${musicPath}.action`,
        ...context,
        ...(typeof musicAction === 'string' ? { targetId: musicAction } : {}),
      });
    }

    if ((musicAction === 'play' || musicAction === 'switch') && !isNonEmptyString(musicValue.musicId)) {
      issues.push({
        code: 'missingMusicReference',
        message: `Music action at "${musicPath}" must provide musicId.`,
        path: `${musicPath}.musicId`,
        ...context,
      });
    }

    if (musicValue.musicId !== undefined && !isNonEmptyString(musicValue.musicId)) {
      issues.push({
        code: 'invalidMusicStructure',
        message: `Music at "${musicPath}" must use a non-empty musicId.`,
        path: `${musicPath}.musicId`,
        ...context,
      });
    }

    if (isNonEmptyString(musicValue.musicId)) {
      this.validateAssetRef(
        musicValue.musicId,
        'music',
        'missingMusicReference',
        `${musicPath}.musicId`,
        issues,
        context,
      );
    }
  }

  private validateSfx(
    sfxValue: unknown,
    sfxPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (sfxValue === undefined) {
      return;
    }

    const entries = Array.isArray(sfxValue) ? sfxValue : [sfxValue];

    if (!Array.isArray(sfxValue) && !isRecord(sfxValue)) {
      issues.push({
        code: 'invalidSfxStructure',
        message: `SFX at "${sfxPath}" must be an object or an array of objects.`,
        path: sfxPath,
        ...context,
      });

      return;
    }

    entries.forEach((entry, index) => {
      if (!isRecord(entry)) {
        issues.push({
          code: 'invalidSfxStructure',
          message: `SFX entry at "${sfxPath}[${index}]" must be an object.`,
          path: Array.isArray(sfxValue) ? `${sfxPath}[${index}]` : sfxPath,
          ...context,
        });

        return;
      }

      const sfxId = isNonEmptyString(entry.sfxId)
        ? entry.sfxId
        : isNonEmptyString(entry.id)
          ? entry.id
          : undefined;

      if (!sfxId) {
        issues.push({
          code: 'invalidSfxStructure',
          message: `SFX entry at "${Array.isArray(sfxValue) ? `${sfxPath}[${index}]` : sfxPath}" must provide sfxId or id.`,
          path: Array.isArray(sfxValue) ? `${sfxPath}[${index}]` : sfxPath,
          ...context,
        });

        return;
      }

      this.validateAssetRef(
        sfxId,
        'sfx',
        'missingSfxReference',
        Array.isArray(sfxValue) ? `${sfxPath}[${index}]` : `${sfxPath}.sfxId`,
        issues,
        context,
      );
    });
  }

  private validateTransition(
    transitionValue: unknown,
    transitionPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (transitionValue === undefined) {
      return;
    }

    if (!isRecord(transitionValue) || !isSceneTransitionType(transitionValue.type)) {
      issues.push({
        code: 'unsupportedTransition',
        message: `Transition at "${transitionPath}" uses unsupported type "${String(
          isRecord(transitionValue) ? transitionValue.type : transitionValue,
        )}".`,
        path: `${transitionPath}.type`,
        ...context,
        ...(isRecord(transitionValue) && typeof transitionValue.type === 'string'
          ? { targetId: transitionValue.type }
          : {}),
      });
    }
  }

  private validateConditions(
    conditionsValue: unknown,
    conditionsPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (conditionsValue === undefined) {
      return;
    }

    if (!Array.isArray(conditionsValue)) {
      issues.push({
        code: 'invalidConditionsStructure',
        message: `Conditions at "${conditionsPath}" must be an array.`,
        path: conditionsPath,
        ...context,
      });

      return;
    }

    conditionsValue.forEach((condition, index) => {
      this.validateCondition(condition, `${conditionsPath}[${index}]`, issues, context);
    });
  }

  private validateCondition(
    conditionValue: unknown,
    conditionPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (!isRecord(conditionValue) || !isNonEmptyString(conditionValue.type)) {
      issues.push({
        code: 'invalidConditionsStructure',
        message: `Condition at "${conditionPath}" must be an object with a type.`,
        path: conditionPath,
        ...context,
      });

      return;
    }

    switch (conditionValue.type as Condition['type']) {
      case 'flag':
        if (!isNonEmptyString(conditionValue.flagId) || !NUMERIC_OPERATORS.includes(conditionValue.operator as NumericComparisonOperator) || conditionValue.value === undefined) {
          issues.push({
            code: 'invalidConditionsStructure',
            message: `Flag condition at "${conditionPath}" is missing required fields.`,
            path: conditionPath,
            ...context,
          });
        }

        return;
      case 'flagEquals':
        if (!isNonEmptyString(conditionValue.flagId) || conditionValue.value === undefined) {
          issues.push({
            code: 'invalidConditionsStructure',
            message: `flagEquals condition at "${conditionPath}" is missing required fields.`,
            path: conditionPath,
            ...context,
          });
        }

        return;
      case 'meta':
        if (!isNonEmptyString(conditionValue.key) || !NUMERIC_OPERATORS.includes(conditionValue.operator as NumericComparisonOperator) || typeof conditionValue.value !== 'number') {
          issues.push({
            code: 'invalidConditionsStructure',
            message: `Meta condition at "${conditionPath}" is missing required fields.`,
            path: conditionPath,
            ...context,
          });
        }

        return;
      case 'metaGte':
      case 'metaLte':
      case 'statGte':
      case 'statLte':
        if (!isNonEmptyString(conditionValue.key) || typeof conditionValue.value !== 'number') {
          issues.push({
            code: 'invalidConditionsStructure',
            message: `Threshold condition at "${conditionPath}" is missing required fields.`,
            path: conditionPath,
            ...context,
          });
        }

        return;
      case 'tag':
        if (!isNonEmptyString(conditionValue.tag) || !TAG_OPERATORS.includes(conditionValue.operator as TagConditionOperator) || !isNonEmptyString(conditionValue.targetScope)) {
          issues.push({
            code: 'invalidConditionsStructure',
            message: `Tag condition at "${conditionPath}" is missing required fields.`,
            path: conditionPath,
            ...context,
          });
        }

        return;
      default:
        issues.push({
          code: 'invalidConditionsStructure',
          message: `Condition at "${conditionPath}" uses unsupported type "${conditionValue.type}".`,
          path: `${conditionPath}.type`,
          ...context,
          targetId: conditionValue.type,
        });
    }
  }

  private validateEffects(
    effects: unknown,
    effectsPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (effects === undefined) {
      return;
    }

    if (!Array.isArray(effects)) {
      issues.push({
        code: 'invalidEffectsStructure',
        message: `Effects at "${effectsPath}" must be an array.`,
        path: effectsPath,
        ...context,
      });

      return;
    }

    issues.push(
      ...this.effectReferenceValidator.validateEffects(effects as GameEffect[], effectsPath).map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path,
        ...(issue.targetId ? { targetId: issue.targetId } : {}),
        ...context,
      })),
    );
  }

  private validateJumpEffects(
    effects: unknown,
    effectsPath: string,
    issues: SceneGenerationValidationIssue[],
    nodes: Record<string, unknown>,
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (!Array.isArray(effects)) {
      return;
    }

    effects.forEach((effect, index) => {
      if (!isRecord(effect) || effect.type !== 'jumpToNode') {
        return;
      }

      if (!isNonEmptyString(effect.nodeId) || !(effect.nodeId in nodes)) {
        issues.push({
          code: 'missingJumpNodeReference',
          message: `jumpToNode effect references missing node "${String(effect.nodeId)}".`,
          path: `${effectsPath}[${index}].nodeId`,
          ...(isNonEmptyString(effect.nodeId) ? { targetId: effect.nodeId } : {}),
          ...context,
        });
      }
    });
  }

  private validateFallback(
    fallbackValue: unknown,
    fallbackPath: string,
    issues: SceneGenerationValidationIssue[],
    knownSceneIds: ReadonlySet<string>,
    nodes: Record<string, unknown> | undefined,
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (fallbackValue === undefined) {
      return;
    }

    if (!isRecord(fallbackValue)) {
      issues.push({
        code: 'invalidConditionFallback',
        message: `Condition fallback at "${fallbackPath}" must be an object.`,
        path: fallbackPath,
        ...context,
      });

      return;
    }

    const fallback = fallbackValue as SceneGenerationFallbackTarget;
    const targetIds = [fallback.nextNodeId, fallback.nextSceneId, fallback.openSceneFlowId]
      .filter((value): value is string => isNonEmptyString(value));
    const hasEnd = fallback.end === true;

    if ((targetIds.length === 0 && !hasEnd) || targetIds.length > 1 || (targetIds.length > 0 && hasEnd)) {
      issues.push({
        code: 'invalidConditionFallback',
        message: `Condition fallback at "${fallbackPath}" must choose exactly one target or end.`,
        path: fallbackPath,
        ...context,
      });
    }

    if (fallback.nextNodeId) {
      if (!nodes || !(fallback.nextNodeId in nodes)) {
        issues.push({
          code: 'missingNodeReference',
          message: `Condition fallback at "${fallbackPath}" references missing node "${fallback.nextNodeId}".`,
          path: `${fallbackPath}.nextNodeId`,
          targetId: fallback.nextNodeId,
          ...context,
        });
      }
    }

    if (fallback.nextSceneId) {
      this.validateSceneFlowReference(
        fallback.nextSceneId,
        `${fallbackPath}.nextSceneId`,
        issues,
        knownSceneIds,
        context,
      );
    }

    if (fallback.openSceneFlowId) {
      this.validateSceneFlowReference(
        fallback.openSceneFlowId,
        `${fallbackPath}.openSceneFlowId`,
        issues,
        knownSceneIds,
        context,
      );
    }
  }

  private validateTags(
    tagsValue: unknown,
    tagsPath: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (tagsValue === undefined) {
      return;
    }

    if (!Array.isArray(tagsValue) || tagsValue.some((tag) => !isNonEmptyString(tag))) {
      issues.push({
        code: 'invalidTagsStructure',
        message: `Tags at "${tagsPath}" must be an array of non-empty strings.`,
        path: tagsPath,
        ...context,
      });
    }
  }

  private validateSpeaker(
    speakerId: unknown,
    path: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (!isNonEmptyString(speakerId) || !this.hasSpeakerId || this.hasSpeakerId(speakerId)) {
      return;
    }

    issues.push({
      code: 'missingSpeakerReference',
      message: `Speaker "${speakerId}" is not present in the narrative character registry.`,
      path,
      targetId: speakerId,
      ...context,
    });
  }

  private validateEmotion(
    emotion: unknown,
    path: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string },
  ) {
    if (emotion === undefined) {
      return;
    }

    if (typeof emotion === 'string' && CHARACTER_EMOTIONS.includes(emotion as (typeof CHARACTER_EMOTIONS)[number])) {
      return;
    }

    issues.push({
      code: 'unsupportedEmotion',
      message: `Emotion "${String(emotion)}" is not part of the allowed character emotion list.`,
      path,
      ...context,
      ...(typeof emotion === 'string' ? { targetId: emotion } : {}),
    });
  }

  private validateAssetRef(
    assetId: unknown,
    kind: NarrativeAssetKind,
    code: Extract<
      SceneGenerationValidationIssueCode,
      | 'missingBackgroundReference'
      | 'missingPortraitReference'
      | 'missingMusicReference'
      | 'missingSfxReference'
      | 'missingCgReference'
      | 'missingOverlayReference'
    >,
    path: string,
    issues: SceneGenerationValidationIssue[],
    context: { sceneId?: string; nodeId?: string } = {},
  ) {
    if (assetId === null || assetId === undefined) {
      return;
    }

    if (!isNonEmptyString(assetId)) {
      issues.push({
        code,
        message: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} asset id at "${path}" must be a non-empty string.`,
        path,
        ...context,
      });

      return;
    }

    if (!this.hasAssetOfKind || this.hasAssetOfKind(assetId, kind)) {
      return;
    }

    issues.push({
      code,
      message: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} asset "${assetId}" is missing.`,
      path,
      targetId: assetId,
      ...context,
    });
  }

  private validateSceneFlowReference(
    sceneFlowId: string,
    path: string,
    issues: SceneGenerationValidationIssue[],
    knownSceneIds: ReadonlySet<string>,
    context: { sceneId?: string; nodeId?: string; choiceId?: string },
  ) {
    if (knownSceneIds.has(sceneFlowId) || this.hasSceneFlowId?.(sceneFlowId)) {
      return;
    }

    issues.push({
      code: 'missingSceneReference',
      message: `Scene generation references missing scene flow "${sceneFlowId}".`,
      path,
      targetId: sceneFlowId,
      ...context,
    });
  }
}
