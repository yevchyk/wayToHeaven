import { sceneGenerationRegistry } from '@content/registries/sceneGenerationRegistry';
import { sceneRegistry } from '@content/registries/sceneRegistry';
import { getSceneGenerationSourceFile, getSceneMetaSourceFile } from '@content/storybook/sceneAuthoringPaths';
import type { SceneAuthoringWorkbenchEntry } from '@engine/types/authoring';
import type { SceneGenerationDocument, SceneGenerationScene } from '@engine/types/sceneGeneration';
import { buildSceneReplayUnlockReferenceIndex } from '@engine/utils/sceneReplayReferences';

export interface SceneAuthoringWorkbenchSection {
  id: string;
  title: string;
  description: string;
}

function summarizeScene(scene: SceneGenerationScene) {
  if (scene.description?.trim()) {
    return scene.description.trim();
  }

  return `Authored ${scene.mode ?? 'sequence'} scene with ${Object.keys(scene.nodes).length} runtime nodes.`;
}

function buildUnlockSourceLabels(
  sceneId: string,
  replayEnabled: boolean,
  unlockOnStart: boolean,
  referenceIndex: Map<string, ReturnType<typeof buildSceneReplayUnlockReferenceIndex> extends Map<string, infer V> ? V : never>,
) {
  if (!replayEnabled) {
    return [];
  }

  if (unlockOnStart) {
    return ['Unlocks on scene start'];
  }

  const references = referenceIndex.get(sceneId) ?? [];

  if (references.length === 0) {
    return [];
  }

  return references.map((reference) =>
    reference.choiceId
      ? `${reference.sourceSceneId} -> ${reference.sourceNodeId} -> choice ${reference.choiceId}`
      : `${reference.sourceSceneId} -> ${reference.sourceNodeId}`,
  );
}

function buildImprovementHints(scene: SceneGenerationScene, replayEnabled: boolean, isReplayScene: boolean) {
  const hints = [
    'Тримай scene.description коротким і production-facing: це допомагає library, replay tab і майбутньому codex.',
    'Сюжетні beats розкладай по node.text і choice text, а не в один велетенський scene summary.',
  ];

  if (scene.mode === 'hub') {
    hints.push('Для hub сцени дивись, щоб кожен transition мав чіткий label, tone і відчутну ціну вибору.');
  }

  if (scene.mode === 'route') {
    hints.push('Route сцени тримай короткими: дорога має давати ритм і ризик, а не перетворюватися на окрему карту заради карти.');
  }

  if (replayEnabled) {
    hints.push('Replay-enabled сцена має бути читабельною і в live, і в preview sandbox без залежності від випадкового глобального стану.');
  }

  if (isReplayScene) {
    hints.push('Replay-only сцени повинні мати або unlockSceneReplay джерело, або unlockOnStart: true, інакше вони не потраплять у архів.');
  }

  return hints;
}

function buildSceneWorkbenchEntry(
  document: SceneGenerationDocument,
  scene: SceneGenerationScene,
  referenceIndex: Map<string, ReturnType<typeof buildSceneReplayUnlockReferenceIndex> extends Map<string, infer V> ? V : never>,
): SceneAuthoringWorkbenchEntry {
  const mode = scene.mode ?? 'sequence';
  const nodeCount = Object.keys(scene.nodes).length;
  const choiceCount = Object.values(scene.nodes).filter((node) => (node.choices?.length ?? 0) > 0).length;
  const replayEnabled = scene.replay?.enabled === true;
  const isReplayScene = scene.id.includes('/replay/');
  const unlockOnStart = scene.replay?.unlockOnStart === true;
  const sceneMeta = Object.values(sceneRegistry).find((entry) => entry.mainSceneFlowId === scene.id);

  return {
    id: `${document.id}::${scene.id}`,
    title: scene.title ?? scene.id,
    subtitle: `${mode.toUpperCase()} · ${document.title}`,
    description: summarizeScene(scene),
    mode,
    startNodeId: scene.startNodeId,
    nodeCount,
    choiceCount,
    replayEnabled,
    isReplayScene,
    unlockSourceLabels: buildUnlockSourceLabels(scene.id, replayEnabled, unlockOnStart, referenceIndex),
    contentFilePath: getSceneGenerationSourceFile(document.id),
    sceneFieldPath: `scenes.${scene.id}`,
    ...(sceneMeta ? { metaFilePath: getSceneMetaSourceFile(sceneMeta.id) } : {}),
    improvementHints: buildImprovementHints(scene, replayEnabled, isReplayScene),
  };
}

function sortByTitle<T extends { title: string }>(entries: T[]) {
  return [...entries].sort((left, right) => left.title.localeCompare(right.title, 'uk'));
}

const sceneGenerationDocuments = Object.values(sceneGenerationRegistry);
const replayUnlockReferenceIndex = buildSceneReplayUnlockReferenceIndex(sceneGenerationDocuments);

export const sceneAuthoringWorkbenchSections: SceneAuthoringWorkbenchSection[] = [
  {
    id: 'main-scenes',
    title: 'Scene Production',
    description: 'Live scenes, hubs, and route scenes authored through scene-generation documents.',
  },
  {
    id: 'replay-scenes',
    title: 'Replay Production',
    description: 'Replay-enabled scenes and replay-only archive scenes with their unlock sources.',
  },
];

export const sceneAuthoringWorkbenchEntries = sortByTitle(
  sceneGenerationDocuments.flatMap((document) =>
    Object.values(document.scenes).map((scene) =>
      buildSceneWorkbenchEntry(document, scene, replayUnlockReferenceIndex),
    ),
  ),
);

export const liveSceneAuthoringWorkbenchEntries = sceneAuthoringWorkbenchEntries.filter(
  (entry) => !entry.isReplayScene,
);

export const replaySceneAuthoringWorkbenchEntries = sceneAuthoringWorkbenchEntries.filter(
  (entry) => entry.replayEnabled || entry.isReplayScene,
);
