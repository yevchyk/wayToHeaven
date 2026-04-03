import { battleContentRegistry } from '@content/battles';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import { hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { locationContentRegistry } from '@content/registries/locationRegistry';
import { sceneGenerationRegistry } from '@content/registries/sceneGenerationRegistry';
import { itemContentRegistry } from '@content/items';
import { questRegistry } from '@content/registries/questRegistry';
import {
  characterInstanceRegistry,
  characterTemplateRegistry,
  defaultPartyInstanceIds,
  enemyTemplateRegistry,
} from '@content/units';
import { importSceneGenerationDocument } from '@engine/systems/scenes/importSceneGenerationDocument';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { SceneGenerationValidator } from '@engine/validators/SceneGenerationValidator';
import { createContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

function createFlowRegistry(flows: readonly SceneFlowData[]) {
  const seenIds = new Set<string>();

  return Object.fromEntries(
    flows.map((sceneFlow) => {
      if (seenIds.has(sceneFlow.id)) {
        throw new Error(`Scene flow registry collision for "${sceneFlow.id}".`);
      }

      seenIds.add(sceneFlow.id);

      return [sceneFlow.id, sceneFlow];
    }),
  );
}

const authoredSceneIds = new Set<string>(
  Object.values(sceneGenerationRegistry).flatMap((document) =>
    Object.values(document.scenes).map((scene) => scene.id),
  ),
);
const effectReferenceValidator = new EffectReferenceValidator(
  createContentReferenceLookup(
    {
      battles: battleContentRegistry,
      cityScenes: {},
      travelBoards: {},
      dialogues: {},
      sceneFlows: {},
      items: itemContentRegistry,
      quests: questRegistry,
      locations: locationContentRegistry,
      characterTemplates: characterTemplateRegistry,
      characterInstances: characterInstanceRegistry,
      enemyTemplates: enemyTemplateRegistry,
      statusDefinitions: {},
      defaultPartyInstanceIds,
    },
    {},
  ),
  {
    hasAssetOfKind: hasNarrativeAssetOfKind,
  },
);
const sceneGenerationValidator = new SceneGenerationValidator(effectReferenceValidator, {
  hasSpeakerId: (speakerId) => speakerId in narrativeCharacterRegistry,
  hasAssetOfKind: hasNarrativeAssetOfKind,
  hasSceneFlowId: (sceneFlowId) => authoredSceneIds.has(sceneFlowId),
  hasItemId: (itemId) => itemId in itemContentRegistry,
});
const sceneGenerationSceneFlows = Object.values(sceneGenerationRegistry).flatMap((document) =>
  Object.values(importSceneGenerationDocument(document, { validator: sceneGenerationValidator }).flows),
);

export const sceneFlowRegistry: Record<string, SceneFlowData> = createFlowRegistry(
  sceneGenerationSceneFlows,
);
