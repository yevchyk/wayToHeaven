import { adaptSceneGenerationToSceneFlow } from '@engine/systems/scenes/adaptSceneGenerationToSceneFlow';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';
import { SceneGenerationValidator } from '@engine/validators/SceneGenerationValidator';

export interface ImportedSceneGenerationDocument {
  documentId: string;
  flows: Record<string, SceneFlowData>;
}

export interface SceneGenerationImportOptions {
  validator?: SceneGenerationValidator;
}

export function importSceneGenerationDocument(
  document: SceneGenerationDocument,
  options: SceneGenerationImportOptions = {},
): ImportedSceneGenerationDocument {
  const validator: SceneGenerationValidator = options.validator ?? new SceneGenerationValidator();

  validator.assertValid(document);

  return {
    documentId: document.id,
    flows: adaptSceneGenerationToSceneFlow(document),
  };
}
