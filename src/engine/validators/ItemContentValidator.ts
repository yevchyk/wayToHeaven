import type { ItemData } from '@engine/types/item';
import {
  EffectReferenceValidator,
  type EffectReferenceValidationIssueCode,
} from '@engine/validators/EffectReferenceValidator';

export type ItemContentValidationIssueCode =
  | 'invalidItemStackConfig'
  | EffectReferenceValidationIssueCode;

export interface ItemContentValidationIssue {
  code: ItemContentValidationIssueCode;
  message: string;
  path?: string;
  targetId?: string;
}

export class ItemContentValidator {
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(effectReferenceValidator: EffectReferenceValidator) {
    this.effectReferenceValidator = effectReferenceValidator;
  }

  validate(item: ItemData) {
    const issues: ItemContentValidationIssue[] = [];

    if (!item.stackable && item.maxStack !== undefined && item.maxStack !== 1) {
      issues.push({
        code: 'invalidItemStackConfig',
        message: `Non-stackable item "${item.id}" cannot define maxStack ${item.maxStack}.`,
        path: 'maxStack',
      });
    }

    if (item.stackable && item.maxStack !== undefined && item.maxStack < 1) {
      issues.push({
        code: 'invalidItemStackConfig',
        message: `Stackable item "${item.id}" must define maxStack greater than 0.`,
        path: 'maxStack',
      });
    }

    issues.push(...this.effectReferenceValidator.validateEffects(item.effects, 'effects'));

    return issues;
  }

  assertValid(item: ItemData) {
    const issues = this.validate(item);

    if (issues.length > 0) {
      throw new Error(`Invalid item "${item.id}". ${issues.map((issue) => issue.message).join(' ')}`);
    }
  }
}
