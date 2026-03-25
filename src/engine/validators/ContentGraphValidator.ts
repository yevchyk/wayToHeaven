import { BattleTemplateValidator } from '@engine/validators/BattleTemplateValidator';
import { CitySceneValidator } from '@engine/validators/CitySceneValidator';
import { DialogueValidator } from '@engine/validators/DialogueValidator';
import { ItemContentValidator } from '@engine/validators/ItemContentValidator';
import { LocationGraphValidator } from '@engine/validators/LocationGraphValidator';
import { TravelBoardValidator } from '@engine/validators/TravelBoardValidator';
import type { ContentRegistrySnapshot } from '@engine/validators/contentReferenceLookup';
import { UnitContentValidator } from '@engine/validators/UnitContentValidator';

export type ContentGraphSourceType =
  | 'battle'
  | 'cityScene'
  | 'dialogue'
  | 'item'
  | 'location'
  | 'travelBoard'
  | 'characterTemplate'
  | 'characterInstance'
  | 'enemyTemplate'
  | 'party';

export interface ContentGraphValidationIssue {
  sourceType: ContentGraphSourceType;
  sourceId: string;
  code: string;
  message: string;
  path?: string;
  targetId?: string;
}

export class ContentGraphValidator {
  private readonly snapshot: ContentRegistrySnapshot;
  private readonly dialogueValidator: DialogueValidator;
  private readonly citySceneValidator: CitySceneValidator;
  private readonly locationGraphValidator: LocationGraphValidator;
  private readonly travelBoardValidator: TravelBoardValidator;
  private readonly battleTemplateValidator: BattleTemplateValidator;
  private readonly itemContentValidator: ItemContentValidator;
  private readonly unitContentValidator: UnitContentValidator;

  constructor(
    snapshot: ContentRegistrySnapshot,
    dialogueValidator: DialogueValidator,
    citySceneValidator: CitySceneValidator,
    locationGraphValidator: LocationGraphValidator,
    travelBoardValidator: TravelBoardValidator,
    battleTemplateValidator: BattleTemplateValidator,
    itemContentValidator: ItemContentValidator,
    unitContentValidator: UnitContentValidator,
  ) {
    this.snapshot = snapshot;
    this.dialogueValidator = dialogueValidator;
    this.citySceneValidator = citySceneValidator;
    this.locationGraphValidator = locationGraphValidator;
    this.travelBoardValidator = travelBoardValidator;
    this.battleTemplateValidator = battleTemplateValidator;
    this.itemContentValidator = itemContentValidator;
    this.unitContentValidator = unitContentValidator;
  }

  validate() {
    const issues: ContentGraphValidationIssue[] = [];

    Object.values(this.snapshot.dialogues).forEach((dialogue) => {
      issues.push(
        ...this.dialogueValidator.validate(dialogue).map((issue) => ({
          sourceType: 'dialogue' as const,
          sourceId: dialogue.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.cityScenes).forEach((cityScene) => {
      issues.push(
        ...this.citySceneValidator.validate(cityScene).map((issue) => ({
          sourceType: 'cityScene' as const,
          sourceId: cityScene.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.locations).forEach((location) => {
      issues.push(
        ...this.locationGraphValidator.validate(location).map((issue) => ({
          sourceType: 'location' as const,
          sourceId: location.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.travelBoards).forEach((board) => {
      issues.push(
        ...this.travelBoardValidator.validate(board).map((issue) => ({
          sourceType: 'travelBoard' as const,
          sourceId: board.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.battles).forEach((battleTemplate) => {
      issues.push(
        ...this.battleTemplateValidator.validate(battleTemplate).map((issue) => ({
          sourceType: 'battle' as const,
          sourceId: battleTemplate.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.items).forEach((item) => {
      issues.push(
        ...this.itemContentValidator.validate(item).map((issue) => ({
          sourceType: 'item' as const,
          sourceId: item.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.characterTemplates).forEach((template) => {
      issues.push(
        ...this.unitContentValidator.validateCharacterTemplate(template).map((issue) => ({
          sourceType: 'characterTemplate' as const,
          sourceId: template.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.characterInstances).forEach((instance) => {
      issues.push(
        ...this.unitContentValidator.validateCharacterInstance(instance).map((issue) => ({
          sourceType: 'characterInstance' as const,
          sourceId: instance.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    Object.values(this.snapshot.enemyTemplates).forEach((template) => {
      issues.push(
        ...this.unitContentValidator.validateEnemyTemplate(template).map((issue) => ({
          sourceType: 'enemyTemplate' as const,
          sourceId: template.id,
          code: issue.code,
          message: issue.message,
          ...(issue.path ? { path: issue.path } : {}),
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    this.snapshot.defaultPartyInstanceIds.forEach((instanceId, index) => {
      if (!(instanceId in this.snapshot.characterInstances)) {
        issues.push({
          sourceType: 'party',
          sourceId: 'default-party',
          code: 'missingCharacterInstanceReference',
          message: `Default party references missing character instance "${instanceId}".`,
          path: `defaultPartyInstanceIds[${index}]`,
          targetId: instanceId,
        });
      }
    });

    return issues;
  }

  assertValid() {
    const issues = this.validate();

    if (issues.length > 0) {
      const summary = issues
        .map((issue) => `[${issue.sourceType}:${issue.sourceId}] ${issue.message}`)
        .join(' ');

      throw new Error(`Invalid content graph. ${summary}`);
    }
  }
}
