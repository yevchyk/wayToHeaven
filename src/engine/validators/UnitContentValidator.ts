import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';
import {
  EffectReferenceValidator,
  type EffectReferenceValidationIssueCode,
} from '@engine/validators/EffectReferenceValidator';
import type { ContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

export type UnitContentValidationIssueCode =
  | 'missingItemReference'
  | 'missingCharacterTemplateReference'
  | 'missingStatusReference'
  | 'missingLootTableReference'
  | EffectReferenceValidationIssueCode;

export interface UnitContentValidationIssue {
  code: UnitContentValidationIssueCode;
  message: string;
  path?: string;
  targetId?: string;
}

export class UnitContentValidator {
  private readonly lookup: ContentReferenceLookup;
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(
    lookup: ContentReferenceLookup,
    effectReferenceValidator: EffectReferenceValidator,
  ) {
    this.lookup = lookup;
    this.effectReferenceValidator = effectReferenceValidator;
  }

  validateCharacterTemplate(template: CharacterTemplate) {
    const issues: UnitContentValidationIssue[] = [];

    template.itemIds?.forEach((itemId, index) => {
      if (!this.lookup.hasItem(itemId)) {
        issues.push({
          code: 'missingItemReference',
          message: `Character template references missing item "${itemId}".`,
          path: `itemIds[${index}]`,
          targetId: itemId,
        });
      }
    });

    template.startingStatuses?.forEach((statusType, index) => {
      if (!this.lookup.hasStatus(statusType)) {
        issues.push({
          code: 'missingStatusReference',
          message: `Character template references missing status "${statusType}".`,
          path: `startingStatuses[${index}]`,
          targetId: statusType,
        });
      }
    });

    return issues;
  }

  validateCharacterInstance(instance: CharacterInstance) {
    const issues: UnitContentValidationIssue[] = [];

    if (!this.lookup.hasCharacterTemplate(instance.templateId)) {
      issues.push({
        code: 'missingCharacterTemplateReference',
        message: `Character instance references missing template "${instance.templateId}".`,
        path: 'templateId',
        targetId: instance.templateId,
      });
    }

    instance.statusEffects?.forEach((status, index) => {
      if (!this.lookup.hasStatus(status.type)) {
        issues.push({
          code: 'missingStatusReference',
          message: `Character instance references missing status "${status.type}".`,
          path: `statusEffects[${index}]`,
          targetId: status.type,
        });
      }
    });

    return issues;
  }

  validateEnemyTemplate(template: EnemyTemplate) {
    const issues: UnitContentValidationIssue[] = [];

    template.startingStatuses?.forEach((statusType, index) => {
      if (!this.lookup.hasStatus(statusType)) {
        issues.push({
          code: 'missingStatusReference',
          message: `Enemy template references missing status "${statusType}".`,
          path: `startingStatuses[${index}]`,
          targetId: statusType,
        });
      }
    });

    template.rewardItemIds?.forEach((itemId, index) => {
      if (!this.lookup.hasItem(itemId)) {
        issues.push({
          code: 'missingItemReference',
          message: `Enemy template references missing reward item "${itemId}".`,
          path: `rewardItemIds[${index}]`,
          targetId: itemId,
        });
      }
    });

    if (template.rewardTableId && !this.lookup.hasLootTable(template.rewardTableId)) {
      issues.push({
        code: 'missingLootTableReference',
        message: `Enemy template references missing loot table "${template.rewardTableId}".`,
        path: 'rewardTableId',
        targetId: template.rewardTableId,
      });
    }

    issues.push(...this.effectReferenceValidator.validateEffects(template.rewardEffects, 'rewardEffects'));

    return issues;
  }
}
