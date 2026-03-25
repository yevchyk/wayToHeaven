import type { BattleTemplate } from '@engine/types/battle';
import {
  EffectReferenceValidator,
  type EffectReferenceValidationIssueCode,
} from '@engine/validators/EffectReferenceValidator';
import type {
  ContentReferenceLookup,
} from '@engine/validators/contentReferenceLookup';

export type BattleTemplateValidationIssueCode =
  | 'missingEnemyTemplateReference'
  | 'missingCharacterInstanceReference'
  | 'missingDialogueReference'
  | EffectReferenceValidationIssueCode;

export interface BattleTemplateValidationIssue {
  code: BattleTemplateValidationIssueCode;
  message: string;
  path?: string;
  targetId?: string;
}

export class BattleTemplateValidator {
  private readonly lookup: ContentReferenceLookup;
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(
    lookup: ContentReferenceLookup,
    effectReferenceValidator: EffectReferenceValidator,
  ) {
    this.lookup = lookup;
    this.effectReferenceValidator = effectReferenceValidator;
  }

  validate(template: BattleTemplate) {
    const issues: BattleTemplateValidationIssue[] = [];

    template.allyUnitIds?.forEach((instanceId, index) => {
      if (!this.lookup.hasCharacterInstance(instanceId)) {
        issues.push({
          code: 'missingCharacterInstanceReference',
          message: `Battle template references missing ally instance "${instanceId}".`,
          path: `allyUnitIds[${index}]`,
          targetId: instanceId,
        });
      }
    });

    template.enemyUnitIds.forEach((enemyTemplateId, index) => {
      if (!this.lookup.hasEnemyTemplate(enemyTemplateId)) {
        issues.push({
          code: 'missingEnemyTemplateReference',
          message: `Battle template references missing enemy template "${enemyTemplateId}".`,
          path: `enemyUnitIds[${index}]`,
          targetId: enemyTemplateId,
        });
      }
    });

    if (template.introDialogueId && !this.lookup.hasDialogue(template.introDialogueId)) {
      issues.push({
        code: 'missingDialogueReference',
        message: `Battle template references missing intro dialogue "${template.introDialogueId}".`,
        path: 'introDialogueId',
        targetId: template.introDialogueId,
      });
    }

    issues.push(
      ...this.effectReferenceValidator.validateEffects(template.victoryEffects, 'victoryEffects'),
      ...this.effectReferenceValidator.validateEffects(template.defeatEffects, 'defeatEffects'),
    );

    return issues;
  }

  assertValid(template: BattleTemplate) {
    const issues = this.validate(template);

    if (issues.length > 0) {
      throw new Error(
        `Invalid battle template "${template.id}". ${issues.map((issue) => issue.message).join(' ')}`,
      );
    }
  }
}
