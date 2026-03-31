import { hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import allFeaturesSceneGenerationExample from '../../domain-logic/scene-generation/scene-generation-all-features.example.json';
import sceneGenerationExample from '../../domain-logic/scene-generation/chapter1-prologue.scenes.json';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { SceneGenerationValidator } from '@engine/validators/SceneGenerationValidator';

describe('SceneGenerationValidator', () => {
  it('accepts the all-features canonical scene-generation example', () => {
    const rootStore = new GameRootStore();
    const validator = new SceneGenerationValidator(rootStore.effectReferenceValidator, {
      hasSpeakerId: (speakerId) => speakerId in rootStore.narrativeCharacterRegistry,
      hasAssetOfKind: hasNarrativeAssetOfKind,
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in rootStore.sceneFlowRegistry,
    });

    expect(validator.validate(allFeaturesSceneGenerationExample)).toEqual([]);
  });

  it('accepts the new raw scene-generation example', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasSpeakerId: (speakerId) => speakerId in narrativeCharacterRegistry,
      hasAssetOfKind: () => true,
    });

    expect(validator.validate(sceneGenerationExample)).toEqual([]);
  });

  it('detects the structural problems from the draft scene JSON', () => {
    const validator = new SceneGenerationValidator(undefined, {
      hasSpeakerId: (speakerId) => speakerId === 'mirella',
      hasAssetOfKind: () => false,
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
});
