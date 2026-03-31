import { hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { sceneGenerationRegistry } from '@content/registries/sceneGenerationRegistry';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { importSceneGenerationDocument } from '@engine/systems/scenes/importSceneGenerationDocument';
import { SceneGenerationValidator } from '@engine/validators/SceneGenerationValidator';

describe('Bundled content smoke', () => {
  it('keeps the bundled content graph valid', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.validateContentGraph()).toEqual([]);
    expect(() => rootStore.assertContentGraphValid()).not.toThrow();
  });

  it('validates and imports every authored scene-generation document into valid scene flows', () => {
    const rootStore = new GameRootStore();
    const validator = new SceneGenerationValidator(rootStore.effectReferenceValidator, {
      hasSpeakerId: (speakerId) => speakerId in rootStore.narrativeCharacterRegistry,
      hasAssetOfKind: hasNarrativeAssetOfKind,
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in rootStore.sceneFlowRegistry,
    });

    expect(Object.keys(sceneGenerationRegistry).length).toBeGreaterThan(0);

    for (const document of Object.values(sceneGenerationRegistry)) {
      expect(validator.validate(document)).toEqual([]);

      const imported = importSceneGenerationDocument(document, { validator });

      expect(imported.documentId).toBe(document.id);
      expect(Object.keys(imported.flows).length).toBeGreaterThan(0);

      for (const flow of Object.values(imported.flows)) {
        expect(rootStore.sceneFlowContentValidator.validate(flow)).toEqual([]);
      }
    }
  });
});
