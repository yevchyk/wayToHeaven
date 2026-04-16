import { hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import { chapter1IntroSceneGenerationDocument } from '@content/scene-generation';
import allFeaturesSceneGenerationExample from '../../domain-logic/scene-generation/scene-generation-all-features.example.json';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { SceneGenerationValidator } from '@engine/validators/SceneGenerationValidator';
import { itemContentRegistry } from '@content/items';

describe('SceneGenerationValidator', () => {
  it('accepts the all-features canonical scene-generation example', () => {
    const rootStore = new GameRootStore();
    const validator = new SceneGenerationValidator(rootStore.effectReferenceValidator, {
      hasSpeakerId: (speakerId) => speakerId in rootStore.narrativeCharacterRegistry,
      hasAssetOfKind: hasNarrativeAssetOfKind,
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in rootStore.sceneFlowRegistry,
      hasItemId: (itemId) => itemId in itemContentRegistry,
    });

    expect(validator.validate(allFeaturesSceneGenerationExample)).toEqual([]);
  });

  it('accepts the new raw scene-generation example', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasSpeakerId: (speakerId) => speakerId in narrativeCharacterRegistry,
      hasAssetOfKind: () => true,
      hasItemId: (itemId) => itemId in itemContentRegistry,
    });

    expect(validator.validate(chapter1IntroSceneGenerationDocument)).toEqual([]);
  });

  it('detects the structural problems from the draft scene JSON', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasSpeakerId: (speakerId) => speakerId === 'mirella',
      hasAssetOfKind: () => false,
      hasSceneFlowId: () => false,
    });

    const invalidDocument = {
      id: 'chapter1_prologue_broken',
      schemaVersion: 1,
      title: 'Broken scene draft',
      meta: {
        chapterId: 'chapter-1',
        defaultCgId: 'missing-cg',
        defaultOverlayId: 'missing-overlay',
      },
      scenes: {
        scene1: {
          id: 'n1',
          type: 'narration',
          cgId: 'missing-cg',
          overlayId: 'missing-overlay',
          nodes: {
            n5: {
              id: 'n5',
              type: 'choice',
              speakerId: 'mirella',
              speakerSide: 'middle',
              emotion: 'unknown',
              cgId: 'missing-cg',
              overlayId: 'missing-overlay',
              sfx: {
                sfxId: 'missing-sfx',
              },
              portraitId: 'missing-portrait',
              text: 'бла бла бла',
              onExitEffects: [
                {
                  type: 'jumpToNode',
                  nodeId: 'missing-jump',
                },
              ],
              choices: [
                {
                  id: 'n5_c1',
                  text: 'Підтримати Рауста про честь.',
                  nextSceneId: 'scene2',
                },
                {
                  id: 'n5_c1',
                  text: 'Підтримати Рауста про честь.',
                  effects: [
                    {
                      type: 'jumpToNode',
                      nodeId: 'missing-choice-jump',
                    },
                  ],
                  nextNodeId: 'n7',
                },
              ],
            },
            n6: {
              id: 'n5',
              type: 'choice',
              speakerId: 'lady-sera',
              nextNodeId: 'scene2',
              sceneChange: {
                background: {
                  image: 'missing-background',
                  transition: 'smuth',
                },
              },
            },
          },
        },
      },
    };

    const issues = validator.validate(invalidDocument);
    const codes = new Set(issues.map((issue) => issue.code));

    expect(codes.has('invalidSceneId')).toBe(true);
    expect(codes.has('missingSceneStartNode')).toBe(true);
    expect(codes.has('unsupportedSpeakerSide')).toBe(true);
    expect(codes.has('unsupportedEmotion')).toBe(true);
    expect(codes.has('missingPortraitReference')).toBe(true);
    expect(codes.has('duplicateChoiceId')).toBe(true);
    expect(codes.has('missingSceneReference')).toBe(true);
    expect(codes.has('duplicateNodeId')).toBe(true);
    expect(codes.has('missingChoiceOptions')).toBe(true);
    expect(codes.has('missingSpeakerReference')).toBe(true);
    expect(codes.has('missingNodeReference')).toBe(true);
    expect(codes.has('missingBackgroundReference')).toBe(true);
    expect(codes.has('missingCgReference')).toBe(true);
    expect(codes.has('missingOverlayReference')).toBe(true);
    expect(codes.has('missingSfxReference')).toBe(true);
    expect(codes.has('missingJumpNodeReference')).toBe(true);
    expect(codes.has('unsupportedTransition')).toBe(true);
  });

  it('rejects inventory conditions that reference missing items', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasItemId: (itemId) => itemId in itemContentRegistry,
    });

    const issues = validator.validate({
      id: 'scene-generation-missing-item-condition',
      schemaVersion: 1,
      title: 'Missing Item Condition',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        gate: {
          id: 'gate',
          startNodeId: 'intro',
          conditions: [
            {
              type: 'inventory',
              itemId: 'missing-comb',
              operator: 'gte',
              value: 1,
            },
          ],
          onConditionFail: {
            end: true,
          },
          nodes: {
            intro: {
              id: 'intro',
              type: 'narration',
              text: 'Blocked by a missing item ref.',
              isEnd: true,
            },
          },
        },
      },
    });

    expect(issues.some((issue) => issue.code === 'missingItemReference')).toBe(true);
  });

  it('validates authored stage placement coordinates and rejects broken placement payloads', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasSpeakerId: (speakerId) => speakerId in narrativeCharacterRegistry,
      hasAssetOfKind: () => true,
    });

    const validIssues = validator.validate({
      id: 'scene-generation-stage-placement-valid',
      schemaVersion: 1,
      title: 'Valid Stage Placement',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        stage: {
          id: 'stage',
          startNodeId: 'intro',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                placement: {
                  x: 12,
                  scale: 0.92,
                },
              },
              {
                speakerId: 'father',
                placement: {
                  x: 86,
                  y: 6,
                  scale: 1.14,
                  zIndex: 5,
                  opacity: 0.74,
                },
              },
            ],
            focusCharacterId: 'father',
          },
          nodes: {
            intro: {
              id: 'intro',
              type: 'dialogue',
              speakerId: 'father',
              text: 'Placement is valid.',
              isEnd: true,
            },
          },
        },
      },
    });

    expect(validIssues).toEqual([]);

    const invalidIssues = validator.validate({
      id: 'scene-generation-stage-placement-invalid',
      schemaVersion: 1,
      title: 'Invalid Stage Placement',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        stage: {
          id: 'stage',
          startNodeId: 'intro',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                placement: {
                  x: 128,
                  scale: 0,
                  zIndex: 1.5,
                  opacity: 2,
                },
              },
            ],
          },
          nodes: {
            intro: {
              id: 'intro',
              type: 'narration',
              text: 'Broken placement.',
              isEnd: true,
            },
          },
        },
      },
    });

    expect(invalidIssues.filter((issue) => issue.code === 'invalidStageCharacter').map((issue) => issue.path)).toEqual(
      expect.arrayContaining([
        'scenes.stage.stage.characters[0].placement.x',
        'scenes.stage.stage.characters[0].placement.scale',
        'scenes.stage.stage.characters[0].placement.zIndex',
        'scenes.stage.stage.characters[0].placement.opacity',
      ]),
    );
  });
});
