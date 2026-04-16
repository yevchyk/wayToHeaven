import type { GameEffect } from '@engine/types/effects';
import type { NarrativeAssetKind } from '@engine/types/narrative';
import type { ContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

export type EffectReferenceValidationIssueCode =
  | 'missingSceneReference'
  | 'missingBattleReference'
  | 'missingTravelBoardReference'
  | 'missingItemReference'
  | 'missingQuestReference'
  | 'missingLocationReference'
  | 'missingLocationNodeReference'
  | 'missingScriptReference'
  | 'missingBackgroundReference'
  | 'missingMusicReference'
  | 'missingSfxReference'
  | 'missingCgReference'
  | 'missingOverlayReference';

export interface EffectReferenceValidationIssue {
  code: EffectReferenceValidationIssueCode;
  message: string;
  path: string;
  targetId?: string;
}

interface EffectReferenceValidatorOptions {
  hasAssetOfKind?: (assetId: string, kind: NarrativeAssetKind) => boolean;
  hasSceneId?: (sceneId: string) => boolean;
}

export class EffectReferenceValidator {
  private readonly lookup: ContentReferenceLookup | undefined;
  private readonly hasAssetOfKind: EffectReferenceValidatorOptions['hasAssetOfKind'];
  private readonly hasSceneId: EffectReferenceValidatorOptions['hasSceneId'];

  constructor(lookup?: ContentReferenceLookup, options: EffectReferenceValidatorOptions = {}) {
    this.lookup = lookup;
    this.hasAssetOfKind = options.hasAssetOfKind;
    this.hasSceneId = options.hasSceneId;
  }

  validateEffects(effects: readonly GameEffect[] | undefined, path: string) {
    if (!effects || effects.length === 0) {
      return [];
    }

    return effects.flatMap((effect, index) => this.validateEffect(effect, `${path}[${index}]`));
  }

  validateEffect(effect: GameEffect, path: string): EffectReferenceValidationIssue[] {
    switch (effect.type) {
      case 'giveItem':
      case 'removeItem':
        return this.lookup && !this.lookup.hasItem(effect.itemId)
          ? [
              {
                code: 'missingItemReference',
                message: `Effect references missing item "${effect.itemId}".`,
                path,
                targetId: effect.itemId,
              },
            ]
          : [];
      case 'addQuest':
      case 'advanceQuest':
      case 'completeQuest':
        return this.lookup && !this.lookup.hasQuest(effect.questId)
          ? [
              {
                code: 'missingQuestReference',
                message: `Effect references missing quest "${effect.questId}".`,
                path,
                targetId: effect.questId,
              },
            ]
          : [];
      case 'startBattle':
        return this.lookup && !this.lookup.hasBattle(effect.battleTemplateId)
          ? [
              {
                code: 'missingBattleReference',
                message: `Effect references missing battle template "${effect.battleTemplateId}".`,
                path,
                targetId: effect.battleTemplateId,
              },
            ]
          : [];
      case 'startTravelBoard':
        return this.lookup && !this.lookup.hasTravelBoard(effect.boardId)
          ? [
              {
                code: 'missingTravelBoardReference',
                message: `Effect references missing travel board "${effect.boardId}".`,
                path,
                targetId: effect.boardId,
              },
            ]
          : [];
      case 'changeLocation': {
        if (!this.lookup) {
          return [];
        }

        const issues: EffectReferenceValidationIssue[] = [];

        if (!this.lookup.hasLocation(effect.locationId)) {
          issues.push({
            code: 'missingLocationReference',
            message: `Effect references missing location "${effect.locationId}".`,
            path,
            targetId: effect.locationId,
          });

          return issues;
        }

        if (effect.nodeId && !this.lookup.hasLocationNode(effect.locationId, effect.nodeId)) {
          issues.push({
            code: 'missingLocationNodeReference',
            message: `Effect references missing node "${effect.nodeId}" in location "${effect.locationId}".`,
            path,
            targetId: effect.nodeId,
          });
        }

        return issues;
      }
      case 'runScript':
        return this.lookup && !this.lookup.hasScript(effect.scriptId)
          ? [
              {
                code: 'missingScriptReference',
                message: `Effect references missing script "${effect.scriptId}".`,
                path,
                targetId: effect.scriptId,
              },
            ]
          : [];
      case 'unlockSceneReplay':
        return this.hasSceneId && !this.hasSceneId(effect.sceneId)
          ? [
              {
                code: 'missingSceneReference',
                message: `Effect references missing scene "${effect.sceneId}".`,
                path,
                targetId: effect.sceneId,
              },
            ]
          : [];
      case 'setBackground':
        return this.validateAssetRef(effect.backgroundId, 'background', 'missingBackgroundReference', path);
      case 'playMusic':
        return this.validateAssetRef(effect.musicId, 'music', 'missingMusicReference', path);
      case 'playSfx':
        return this.validateAssetRef(effect.sfxId, 'sfx', 'missingSfxReference', path);
      case 'showCG':
        return this.validateAssetRef(effect.cgId, 'cg', 'missingCgReference', path);
      case 'setOverlay':
        return this.validateAssetRef(effect.overlayId, 'overlay', 'missingOverlayReference', path);
      default:
        return [];
    }
  }

  private validateAssetRef(
    assetId: string,
    kind: NarrativeAssetKind,
    code: Extract<
      EffectReferenceValidationIssueCode,
      | 'missingBackgroundReference'
      | 'missingMusicReference'
      | 'missingSfxReference'
      | 'missingCgReference'
      | 'missingOverlayReference'
    >,
    path: string,
  ) {
    if (!this.hasAssetOfKind) {
      return [];
    }

    return this.hasAssetOfKind(assetId, kind)
      ? []
      : [
          {
            code,
            message: `Effect references missing ${kind} asset "${assetId}".`,
            path,
            targetId: assetId,
          },
        ];
  }
}
