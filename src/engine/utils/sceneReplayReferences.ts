import type { GameEffect } from '@engine/types/effects';
import type { SceneGenerationChoice, SceneGenerationDocument } from '@engine/types/sceneGeneration';

export interface SceneReplayUnlockReference {
  documentId: string;
  sourceSceneId: string;
  sourceNodeId: string;
  targetSceneId: string;
  path: string;
  choiceId?: string;
}

function collectUnlockEffects(
  effects: readonly GameEffect[] | undefined,
  path: string,
  context: Omit<SceneReplayUnlockReference, 'targetSceneId' | 'path'>,
  references: SceneReplayUnlockReference[],
) {
  (effects ?? []).forEach((effect, index) => {
    if (effect.type !== 'unlockSceneReplay') {
      return;
    }

    references.push({
      ...context,
      targetSceneId: effect.sceneId,
      path: `${path}[${index}]`,
    });
  });
}

function collectChoiceUnlockEffects(
  choices: readonly SceneGenerationChoice[] | undefined,
  basePath: string,
  context: Omit<SceneReplayUnlockReference, 'targetSceneId' | 'path' | 'choiceId'>,
  references: SceneReplayUnlockReference[],
) {
  (choices ?? []).forEach((choice, index) => {
    collectUnlockEffects(
      choice.effects,
      `${basePath}[${index}].effects`,
      {
        ...context,
        choiceId: choice.id,
      },
      references,
    );
  });
}

export function collectSceneReplayUnlockReferences(
  document: SceneGenerationDocument,
): SceneReplayUnlockReference[] {
  const references: SceneReplayUnlockReference[] = [];

  Object.values(document.scenes).forEach((scene) => {
    Object.values(scene.nodes).forEach((node) => {
      const context = {
        documentId: document.id,
        sourceSceneId: scene.id,
        sourceNodeId: node.id,
      };
      const nodePath = `scenes.${scene.id}.nodes.${node.id}`;

      collectUnlockEffects(node.onEnterEffects, `${nodePath}.onEnterEffects`, context, references);
      collectUnlockEffects(node.onExitEffects, `${nodePath}.onExitEffects`, context, references);
      collectChoiceUnlockEffects(node.choices, `${nodePath}.choices`, context, references);
    });
  });

  return references;
}

export function buildSceneReplayUnlockReferenceIndex(
  documents: readonly SceneGenerationDocument[],
) {
  const referenceIndex = new Map<string, SceneReplayUnlockReference[]>();

  documents.forEach((document) => {
    collectSceneReplayUnlockReferences(document).forEach((reference) => {
      const existing = referenceIndex.get(reference.targetSceneId);

      if (existing) {
        existing.push(reference);
        return;
      }

      referenceIndex.set(reference.targetSceneId, [reference]);
    });
  });

  return referenceIndex;
}
