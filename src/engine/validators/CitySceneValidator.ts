import type { CitySceneData } from '@engine/types/city';
import type { NarrativeAssetKind } from '@engine/types/narrative';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import type { EffectReferenceValidationIssueCode } from '@engine/validators/EffectReferenceValidator';

export type CitySceneValidationErrorCode =
  | 'missingActionOptions'
  | 'duplicateActionId'
  | 'missingSceneReference'
  | 'missingDialogueReference'
  | 'missingBattleReference'
  | 'missingTravelBoardReference'
  | 'missingBackgroundReference'
  | 'ambiguousActionTarget'
  | 'invalidActionFlow'
  | 'missingScriptReference'
  | 'missingItemReference'
  | 'missingLocationReference'
  | 'missingLocationNodeReference'
  | EffectReferenceValidationIssueCode;

export interface CitySceneValidationError {
  code: CitySceneValidationErrorCode;
  message: string;
  actionId?: string;
  targetId?: string;
  path?: string;
}

interface CitySceneValidatorOptions {
  hasSceneId?: (sceneId: string) => boolean;
  hasDialogueId?: (dialogueId: string) => boolean;
  hasBattleId?: (battleTemplateId: string) => boolean;
  hasTravelBoardId?: (boardId: string) => boolean;
  hasAssetOfKind?: (assetId: string, kind: NarrativeAssetKind) => boolean;
}

export class CitySceneValidator {
  private readonly effectReferenceValidator: EffectReferenceValidator;
  private readonly hasSceneId: CitySceneValidatorOptions['hasSceneId'];
  private readonly hasDialogueId: CitySceneValidatorOptions['hasDialogueId'];
  private readonly hasBattleId: CitySceneValidatorOptions['hasBattleId'];
  private readonly hasTravelBoardId: CitySceneValidatorOptions['hasTravelBoardId'];
  private readonly hasAssetOfKind: CitySceneValidatorOptions['hasAssetOfKind'];

  constructor(
    effectReferenceValidator: EffectReferenceValidator = new EffectReferenceValidator(),
    options: CitySceneValidatorOptions = {},
  ) {
    this.effectReferenceValidator = effectReferenceValidator;
    this.hasSceneId = options.hasSceneId;
    this.hasDialogueId = options.hasDialogueId;
    this.hasBattleId = options.hasBattleId;
    this.hasTravelBoardId = options.hasTravelBoardId;
    this.hasAssetOfKind = options.hasAssetOfKind;
  }

  validate(scene: CitySceneData) {
    const issues: CitySceneValidationError[] = [];
    const actionIds = new Set<string>();

    if ((scene.actions?.length ?? 0) === 0) {
      issues.push({
        code: 'missingActionOptions',
        message: `City scene "${scene.id}" must provide at least one action.`,
        path: 'actions',
      });
    }

    if (scene.backgroundId && this.hasAssetOfKind && !this.hasAssetOfKind(scene.backgroundId, 'background')) {
      issues.push({
        code: 'missingBackgroundReference',
        message: `City scene "${scene.id}" references missing background "${scene.backgroundId}".`,
        targetId: scene.backgroundId,
        path: 'backgroundId',
      });
    }

    issues.push(
      ...this.effectReferenceValidator.validateEffects(scene.onEnterEffects, 'onEnterEffects').map((issue) => ({
        code: issue.code,
        message: issue.message,
        ...(issue.targetId ? { targetId: issue.targetId } : {}),
        ...(issue.path ? { path: issue.path } : {}),
      })),
    );

    scene.actions.forEach((action, index) => {
      if (actionIds.has(action.id)) {
        issues.push({
          code: 'duplicateActionId',
          message: `City scene action "${action.id}" is duplicated.`,
          actionId: action.id,
          targetId: action.id,
          path: `actions[${index}].id`,
        });
      }

      actionIds.add(action.id);

      const directTargetCount = [
        action.nextSceneId,
        action.dialogueId,
        action.battleTemplateId,
        action.travelBoardId,
      ].filter(Boolean).length;

      if (directTargetCount > 1) {
        issues.push({
          code: 'ambiguousActionTarget',
          message: `City scene action "${action.id}" defines multiple direct targets.`,
          actionId: action.id,
          path: `actions[${index}]`,
        });
      }

      if (
        !action.nextSceneId &&
        !action.dialogueId &&
        !action.battleTemplateId &&
        !action.travelBoardId &&
        (action.effects?.length ?? 0) === 0
      ) {
        issues.push({
          code: 'invalidActionFlow',
          message: `City scene action "${action.id}" must transition, trigger an event, or apply effects.`,
          actionId: action.id,
          path: `actions[${index}]`,
        });
      }

      if (action.nextSceneId && this.hasSceneId && !this.hasSceneId(action.nextSceneId)) {
        issues.push({
          code: 'missingSceneReference',
          message: `City scene action "${action.id}" references missing scene "${action.nextSceneId}".`,
          actionId: action.id,
          targetId: action.nextSceneId,
          path: `actions[${index}].nextSceneId`,
        });
      }

      if (action.dialogueId && this.hasDialogueId && !this.hasDialogueId(action.dialogueId)) {
        issues.push({
          code: 'missingDialogueReference',
          message: `City scene action "${action.id}" references missing dialogue "${action.dialogueId}".`,
          actionId: action.id,
          targetId: action.dialogueId,
          path: `actions[${index}].dialogueId`,
        });
      }

      if (action.battleTemplateId && this.hasBattleId && !this.hasBattleId(action.battleTemplateId)) {
        issues.push({
          code: 'missingBattleReference',
          message: `City scene action "${action.id}" references missing battle "${action.battleTemplateId}".`,
          actionId: action.id,
          targetId: action.battleTemplateId,
          path: `actions[${index}].battleTemplateId`,
        });
      }

      if (action.travelBoardId && this.hasTravelBoardId && !this.hasTravelBoardId(action.travelBoardId)) {
        issues.push({
          code: 'missingTravelBoardReference',
          message: `City scene action "${action.id}" references missing travel board "${action.travelBoardId}".`,
          actionId: action.id,
          targetId: action.travelBoardId,
          path: `actions[${index}].travelBoardId`,
        });
      }

      issues.push(
        ...this.effectReferenceValidator.validateEffects(
          action.effects,
          `actions[${index}].effects`,
        ).map((issue) => ({
          code: issue.code,
          message: issue.message,
          actionId: action.id,
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
          ...(issue.path ? { path: issue.path } : {}),
        })),
      );
    });

    return issues;
  }

  assertValid(scene: CitySceneData) {
    const issues = this.validate(scene);

    if (issues.length > 0) {
      const summary = issues.map((issue) => issue.message).join(' ');

      throw new Error(`Invalid city scene "${scene.id}". ${summary}`);
    }
  }
}
