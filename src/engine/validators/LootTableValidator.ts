import type { LootTableData } from '@engine/types/loot';
import type { ContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

export type LootTableValidationIssueCode = 'missingItemReference' | 'invalidRollCount';

export interface LootTableValidationIssue {
  code: LootTableValidationIssueCode;
  message: string;
  path?: string;
  targetId?: string;
}

export class LootTableValidator {
  private readonly lookup: ContentReferenceLookup;

  constructor(lookup: ContentReferenceLookup) {
    this.lookup = lookup;
  }

  validate(table: LootTableData) {
    const issues: LootTableValidationIssue[] = [];

    (table.guaranteed ?? []).forEach((entry, index) => {
      if (!this.lookup.hasItem(entry.itemId)) {
        issues.push({
          code: 'missingItemReference',
          message: `Loot table references missing item "${entry.itemId}".`,
          path: `guaranteed[${index}]`,
          targetId: entry.itemId,
        });
      }
    });

    (table.rollGroups ?? []).forEach((group, groupIndex) => {
      if (group.rolls < 1) {
        issues.push({
          code: 'invalidRollCount',
          message: `Loot table "${table.id}" has roll group ${groupIndex} with rolls < 1.`,
          path: `rollGroups[${groupIndex}].rolls`,
        });
      }

      group.entries.forEach((entry, entryIndex) => {
        if (!this.lookup.hasItem(entry.itemId)) {
          issues.push({
            code: 'missingItemReference',
            message: `Loot table references missing item "${entry.itemId}".`,
            path: `rollGroups[${groupIndex}].entries[${entryIndex}]`,
            targetId: entry.itemId,
          });
        }
      });
    });

    return issues;
  }

  assertValid(table: LootTableData) {
    const issues = this.validate(table);

    if (issues.length > 0) {
      throw new Error(
        `Invalid loot table "${table.id}". ${issues.map((issue) => issue.message).join(' ')}`,
      );
    }
  }
}
