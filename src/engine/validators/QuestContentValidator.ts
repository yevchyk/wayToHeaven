import { getQuestStartStageId, type QuestDefinition } from '@engine/types/quest';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';

export type QuestValidationIssueCode =
  | 'missingQuestStageStart'
  | 'missingQuestStageReference'
  | 'duplicateQuestStageId'
  | 'duplicateQuestObjectiveId'
  | string;

export interface QuestValidationIssue {
  code: QuestValidationIssueCode;
  message: string;
  path?: string;
  targetId?: string;
}

export class QuestContentValidator {
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(effectReferenceValidator: EffectReferenceValidator) {
    this.effectReferenceValidator = effectReferenceValidator;
  }

  validate(quest: QuestDefinition) {
    const issues: QuestValidationIssue[] = [];

    issues.push(
      ...this.effectReferenceValidator
        .validateEffects(quest.completionEffects, 'completionEffects')
        .map((issue) => ({
          code: issue.code as QuestValidationIssueCode,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
    );

    if (!quest.stages || quest.stages.length === 0) {
      return issues;
    }

    const stageIds = new Set<string>();

    quest.stages.forEach((stage, stageIndex) => {
      if (stageIds.has(stage.id)) {
        issues.push({
          code: 'duplicateQuestStageId',
          message: `Quest "${quest.id}" declares duplicate stage "${stage.id}".`,
          path: `stages[${stageIndex}]`,
          targetId: stage.id,
        });
      }

      stageIds.add(stage.id);

      issues.push(
        ...this.effectReferenceValidator
          .validateEffects(stage.onEnterEffects, `stages[${stageIndex}].onEnterEffects`)
          .map((issue) => ({
            code: issue.code as QuestValidationIssueCode,
            message: issue.message,
            ...(issue.path ? { path: issue.path } : {}),
            ...(issue.targetId ? { targetId: issue.targetId } : {}),
          })),
      );
      issues.push(
        ...this.effectReferenceValidator
          .validateEffects(stage.onCompleteEffects, `stages[${stageIndex}].onCompleteEffects`)
          .map((issue) => ({
            code: issue.code as QuestValidationIssueCode,
            message: issue.message,
            ...(issue.path ? { path: issue.path } : {}),
            ...(issue.targetId ? { targetId: issue.targetId } : {}),
          })),
      );

      const objectiveIds = new Set<string>();

      stage.objectives.forEach((objective, objectiveIndex) => {
        if (objectiveIds.has(objective.id)) {
          issues.push({
            code: 'duplicateQuestObjectiveId',
            message: `Quest stage "${stage.id}" declares duplicate objective "${objective.id}".`,
            path: `stages[${stageIndex}].objectives[${objectiveIndex}]`,
            targetId: objective.id,
          });
        }

        objectiveIds.add(objective.id);
      });
    });

    const startStageId = getQuestStartStageId(quest);

    if (!startStageId) {
      issues.push({
        code: 'missingQuestStageStart',
        message: `Quest "${quest.id}" declares stages but has no valid start stage.`,
        path: 'startStageId',
      });
    } else if (!stageIds.has(startStageId)) {
      issues.push({
        code: 'missingQuestStageReference',
        message: `Quest "${quest.id}" references missing start stage "${startStageId}".`,
        path: 'startStageId',
        targetId: startStageId,
      });
    }

    quest.stages.forEach((stage, stageIndex) => {
      if (stage.nextStageId && !stageIds.has(stage.nextStageId)) {
        issues.push({
          code: 'missingQuestStageReference',
          message: `Quest stage "${stage.id}" references missing next stage "${stage.nextStageId}".`,
          path: `stages[${stageIndex}].nextStageId`,
          targetId: stage.nextStageId,
        });
      }
    });

    return issues;
  }
}
