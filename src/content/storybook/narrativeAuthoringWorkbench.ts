import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import { sceneGenerationRegistry } from '@content/registries/sceneGenerationRegistry';
import type { BackgroundWorkbenchEntry } from '@engine/types/authoring';
import type { NarrativeCharacterData } from '@engine/types/narrative';
import type {
  SceneGenerationDocument,
  SceneGenerationNode,
  SceneGenerationScene,
  SceneGenerationStageState,
} from '@engine/types/sceneGeneration';

export interface StorybookSection {
  id: string;
  title: string;
  description: string;
}

export type SceneGenerationBackgroundWorkbenchEntry = BackgroundWorkbenchEntry & {
  sectionId: string;
};

export interface NarrativePortraitWorkbenchEntry {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string;
  description: string;
  portraitId: string | null;
  contentFilePath: string;
  assetFieldPath: string;
  improvementHints: string[];
}

const sceneGenerationSourceFileByDocumentId: Record<string, string> = {
  'chapter-1/scene-generation/intro': 'src/content/chapters/chapter-1/scenes/intro/intro.scene-generation.ts',
  'chapter-1/scene-generation/prison-fall':
    'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.scene-generation.ts',
  'chapter-1/scene-generation/awakening':
    'src/content/chapters/chapter-1/scenes/awakening/awakening.scene-generation.ts',
  'chapter-1/scene-generation/caravan-to-hugen-um':
    'src/content/chapters/chapter-1/scenes/caravan-to-hugen-um/caravan-to-hugen-um.scene-generation.ts',
  'chapter-1/scene-generation/city-gate':
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.scene-generation.ts',
  'chapter-1/scene-generation/city-hubs': 'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  'chapter-1/scene-generation/underground-route':
    'src/content/chapters/chapter-1/travel/underground-route.scene-generation.ts',
};

const characterSourceFileById: Record<string, string> = {
  heroine: 'src/content/chapters/chapter-1/npcs/heroine.npc.ts',
  'gate-guard': 'src/content/chapters/chapter-1/npcs/gate-guard.npc.ts',
  'old-voice': 'src/content/chapters/chapter-1/npcs/old-voice.npc.ts',
};

function escapeKey(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildBracketPath(pathSegments: string[]) {
  return pathSegments
    .map((segment, index) => (index === 0 ? segment : `['${escapeKey(segment)}']`))
    .join('');
}

function summarizeText(text?: string, fallback = 'Narrative beat without extra description.') {
  if (!text) {
    return fallback;
  }

  const compactText = text.replace(/\s+/g, ' ').trim();

  if (compactText.length <= 160) {
    return compactText;
  }

  return `${compactText.slice(0, 157)}...`;
}

function getSceneGenerationSourceFile(documentId: string) {
  return sceneGenerationSourceFileByDocumentId[documentId] ?? 'scene-generation source file not mapped yet';
}

function getCharacterSourceFile(characterId: string) {
  return (
    characterSourceFileById[characterId] ??
    'src/content/chapters/chapter-1/npcs/supporting-cast.npc.ts'
  );
}

function getCharacterDisplayName(characterId: string) {
  return narrativeCharacterRegistry[characterId]?.displayName ?? characterId;
}

function getSceneLabel(scene: SceneGenerationScene) {
  return scene.title ?? scene.locationName ?? scene.id;
}

function getNodeLabel(node: SceneGenerationNode) {
  return node.title ?? node.id;
}

function buildDocumentStoryContext(document: SceneGenerationDocument) {
  return (
    document.meta.notes ??
    `Document-wide fallback for "${document.title}". Use it when one stable environment should hold several beats together.`
  );
}

function buildSceneStoryContext(document: SceneGenerationDocument, scene: SceneGenerationScene) {
  return `Establishing shot for this scene in "${document.title}" before beat-level background changes begin.`;
}

function buildNodeStoryContext(
  document: SceneGenerationDocument,
  scene: SceneGenerationScene,
  node: SceneGenerationNode,
) {
  const nodeSummary = summarizeText(
    node.text,
    `A focused beat inside ${getSceneLabel(scene)}.`,
  );

  return `Focused beat inside ${getSceneLabel(scene)} from "${document.title}". ${nodeSummary}`;
}

function buildBackgroundEntry(params: {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string;
  description: string;
  storyContext: string;
  backgroundId: string;
  contentFilePath: string;
  assetFieldPath: string;
  promptFlavor: SceneGenerationBackgroundWorkbenchEntry['promptFlavor'];
  improvementHints: string[];
}): SceneGenerationBackgroundWorkbenchEntry {
  return {
    ...params,
    backgroundId: params.backgroundId,
  };
}

function buildStagePortraitEntries(params: {
  sectionId: string;
  subtitlePrefix: string;
  descriptionPrefix: string;
  contentFilePath: string;
  assetFieldPrefix: string;
  stage: SceneGenerationStageState | null | undefined;
}): NarrativePortraitWorkbenchEntry[] {
  return (params.stage?.characters ?? []).reduce<NarrativePortraitWorkbenchEntry[]>((entries, character, index) => {
    if (!character.portraitId) {
      return entries;
    }

    const displayName = getCharacterDisplayName(character.speakerId);

    entries.push({
      id: `${params.sectionId}::${params.assetFieldPrefix}.characters[${index}].portraitId`,
      sectionId: params.sectionId,
      title: `${displayName}${character.emotion ? ` · ${character.emotion}` : ''}`,
      subtitle: `${params.subtitlePrefix} · stage character`,
      description: `${params.descriptionPrefix} Explicit stage portrait for ${displayName}.`,
      portraitId: character.portraitId,
      contentFilePath: params.contentFilePath,
      assetFieldPath: `${params.assetFieldPrefix}.characters[${index}].portraitId`,
      improvementHints: [
        'Тримай explicit `portraitId` тільки для одноразового стану сцени або особливого арту.',
        'Якщо це має бути нормальний reusable emotion, краще перенести asset у `portraitRefs` персонажа.',
      ],
    });

    return entries;
  }, []);
}

function collectSceneGenerationBackgroundEntries(document: SceneGenerationDocument) {
  const sectionId = document.id;
  const contentFilePath = getSceneGenerationSourceFile(document.id);
  const entries: SceneGenerationBackgroundWorkbenchEntry[] = [];

  if (document.meta.defaultBackgroundId) {
    entries.push(
      buildBackgroundEntry({
        id: `${document.id}::meta.defaultBackgroundId`,
        sectionId,
        title: `${document.title} · document default`,
        subtitle: 'Document fallback background',
        description:
          document.meta.notes ??
          'Fallback background for authored scenes before scene-level or node-level overrides take over.',
        storyContext: buildDocumentStoryContext(document),
        backgroundId: document.meta.defaultBackgroundId,
        contentFilePath,
        assetFieldPath: 'meta.defaultBackgroundId',
        promptFlavor: 'documentDefault',
        improvementHints: [
          'Прав тут, якщо один і той самий стартовий кадр має бути дефолтом для всього документа.',
          'Для окремого епізоду прав `scene.backgroundId`, а не document-wide fallback.',
        ],
      }),
    );
  }

  Object.values(document.scenes).forEach((scene) => {
    const scenePath = `${buildBracketPath(['scenes', scene.id])}`;
    const sceneLabel = getSceneLabel(scene);

    if (scene.backgroundId) {
      entries.push(
        buildBackgroundEntry({
          id: `${document.id}::${scene.id}::backgroundId`,
          sectionId,
          title: `${sceneLabel} · scene default`,
          subtitle: `Scene ${scene.id}`,
          description:
            scene.description ??
            'Default background for the full scene before node-specific swaps.',
          storyContext: buildSceneStoryContext(document, scene),
          backgroundId: scene.backgroundId,
          contentFilePath,
          assetFieldPath: `${scenePath}.backgroundId`,
          promptFlavor: 'sceneDefault',
          improvementHints: [
            'Це стартовий фон цілої сцени. Якщо змінюється лише один beat, прав node-level background нижче.',
            'Тут же добре тримати “основну кімнату” або “основний простір” сцени.',
          ],
        }),
      );
    }

    Object.values(scene.nodes).forEach((node) => {
      const nodePath = `${scenePath}.nodes['${escapeKey(node.id)}']`;
      const nodeLabel = getNodeLabel(node);
      const nodeDescription = summarizeText(
        node.text,
        scene.description ?? 'Scene node without extra prose yet.',
      );

      if (node.backgroundId) {
        entries.push(
          buildBackgroundEntry({
            id: `${document.id}::${scene.id}::${node.id}::backgroundId`,
            sectionId,
            title: `${sceneLabel} · ${nodeLabel}`,
            subtitle: `Node ${node.id} background swap`,
            description: nodeDescription,
            storyContext: buildNodeStoryContext(document, scene, node),
            backgroundId: node.backgroundId,
            contentFilePath,
            assetFieldPath: `${nodePath}.backgroundId`,
            promptFlavor: 'nodeBeat',
            improvementHints: [
              'Користуйся `node.backgroundId`, коли треба поміняти кадр тільки для конкретного beat-а.',
              'Якщо кадр має йти в пакеті з іншими presentation changes, дивись `sceneChange.background.image`.',
            ],
          }),
        );
      }

      if (node.sceneChange?.background?.image) {
        entries.push(
          buildBackgroundEntry({
            id: `${document.id}::${scene.id}::${node.id}::sceneChange.background.image`,
            sectionId,
            title: `${sceneLabel} · ${nodeLabel}`,
            subtitle: `Node ${node.id} sceneChange background`,
            description: nodeDescription,
            storyContext: buildNodeStoryContext(document, scene, node),
            backgroundId: node.sceneChange.background.image,
            contentFilePath,
            assetFieldPath: `${nodePath}.sceneChange.background.image`,
            promptFlavor: 'nodeBeat',
            improvementHints: [
              'Тут фон змінюється як частина більшого presentation patch.',
              'Якщо вам потрібен просто інший кадр без staging/music patch-а, спрощуйте до `node.backgroundId`.',
            ],
          }),
        );
      }
    });
  });

  return entries;
}

function collectCharacterRegistryPortraitEntries(character: NarrativeCharacterData) {
  const sectionId = 'character-registry';
  const contentFilePath = getCharacterSourceFile(character.id);
  const entries: NarrativePortraitWorkbenchEntry[] = [];
  const portraitRefs = Object.entries(character.portraitRefs).filter(([, portraitId]) => Boolean(portraitId));
  const knownPortraitIds = new Set(portraitRefs.map(([, portraitId]) => portraitId));

  if (character.defaultPortraitId && !knownPortraitIds.has(character.defaultPortraitId)) {
    entries.push({
      id: `${character.id}::defaultPortraitId`,
      sectionId,
      title: `${character.displayName} · default`,
      subtitle: 'Character registry default portrait',
      description: `Fallback portrait for ${character.displayName} when the authored node does not force a more specific emotion portrait.`,
      portraitId: character.defaultPortraitId,
      contentFilePath,
      assetFieldPath: 'defaultPortraitId',
      improvementHints: [
        'Це canonical fallback. Тримай тут базовий портрет, який безпечно показувати без explicit override.',
        'Для нового emotion state додавай `portraitRefs.<emotion>`, а не замінюй default без причини.',
      ],
    });
  }

  portraitRefs.forEach(([emotion, portraitId]) => {
    entries.push({
      id: `${character.id}::portraitRefs.${emotion}`,
      sectionId,
      title: `${character.displayName} · ${emotion}`,
      subtitle: 'Character registry emotion portrait',
      description: `Canonical portrait mapping for ${character.displayName}. Dialogue nodes can reference this state by emotion without hardcoding portrait asset ids.`,
      portraitId: portraitId ?? null,
      contentFilePath,
      assetFieldPath: `portraitRefs.${emotion}`,
      improvementHints: [
        'Додавай новий reusable портрет сюди, якщо це нормальний емоційний стан персонажа.',
        'Explicit `portraitId` в самій сцені лишай тільки для одноразових винятків або сценічних варіацій.',
      ],
    });
  });

  return entries;
}

function collectSceneGenerationPortraitEntries(document: SceneGenerationDocument) {
  const sectionId = `scene-overrides:${document.id}`;
  const contentFilePath = getSceneGenerationSourceFile(document.id);
  const entries: NarrativePortraitWorkbenchEntry[] = [];

  entries.push(
    ...buildStagePortraitEntries({
      sectionId,
      subtitlePrefix: 'Document default stage',
      descriptionPrefix: `${document.title}.`,
      contentFilePath,
      assetFieldPrefix: 'meta.defaultStage',
      stage: document.meta.defaultStage,
    }),
  );

  Object.values(document.scenes).forEach((scene) => {
    const scenePath = buildBracketPath(['scenes', scene.id]);
    const sceneLabel = getSceneLabel(scene);

    entries.push(
      ...buildStagePortraitEntries({
        sectionId,
        subtitlePrefix: `Scene ${scene.id}`,
        descriptionPrefix: `Scene "${sceneLabel}".`,
        contentFilePath,
        assetFieldPrefix: `${scenePath}.stage`,
        stage: scene.stage,
      }),
    );

    Object.values(scene.nodes).forEach((node) => {
      const nodePath = `${scenePath}.nodes['${escapeKey(node.id)}']`;
      const nodeLabel = getNodeLabel(node);
      const speakerId = node.speakerId ?? scene.stage?.focusCharacterId ?? document.meta.defaultStage?.focusCharacterId;
      const speakerName = speakerId ? getCharacterDisplayName(speakerId) : 'Unknown speaker';
      const nodeDescription = summarizeText(node.text, `Scene "${sceneLabel}", node "${nodeLabel}".`);

      if (node.portraitId) {
        entries.push({
          id: `${document.id}::${scene.id}::${node.id}::portraitId`,
          sectionId,
          title: `${speakerName}${node.emotion ? ` · ${node.emotion}` : ''}`,
          subtitle: `${sceneLabel} · node portrait override`,
          description: nodeDescription,
          portraitId: node.portraitId,
          contentFilePath,
          assetFieldPath: `${nodePath}.portraitId`,
          improvementHints: [
            'Якщо цей арт має повторюватися по всьому проєкту, винеси його в registry portraitRefs.',
            'Лишай explicit node portrait тільки там, де beat справді вимагає унікального кадру.',
          ],
        });
      }

      entries.push(
        ...buildStagePortraitEntries({
          sectionId,
          subtitlePrefix: `${sceneLabel} · node stage`,
          descriptionPrefix: `Scene "${sceneLabel}", node "${nodeLabel}".`,
          contentFilePath,
          assetFieldPrefix: `${nodePath}.stage`,
          stage: node.stage,
        }),
      );

      entries.push(
        ...buildStagePortraitEntries({
          sectionId,
          subtitlePrefix: `${sceneLabel} · sceneChange stage`,
          descriptionPrefix: `Scene "${sceneLabel}", node "${nodeLabel}".`,
          contentFilePath,
          assetFieldPrefix: `${nodePath}.sceneChange.stage`,
          stage: node.sceneChange?.stage,
        }),
      );
    });
  });

  return entries;
}

function sortByTitle<T extends { title: string }>(entries: T[]) {
  return [...entries].sort((left, right) => left.title.localeCompare(right.title, 'uk'));
}

const sceneGenerationDocuments = Object.values(sceneGenerationRegistry);

export const storybookBackgroundSections: StorybookSection[] = sceneGenerationDocuments.map((document) => ({
  id: document.id,
  title: document.title,
  description:
    document.meta.notes ??
    'Authored scene-generation backgrounds: document fallback, scene defaults, and node-level swaps.',
}));

export const sceneGenerationBackgroundWorkbenchEntries = sortByTitle(
  sceneGenerationDocuments.flatMap((document) => collectSceneGenerationBackgroundEntries(document)),
);

export const storybookPortraitSections: StorybookSection[] = [
  {
    id: 'character-registry',
    title: 'Character Registry Portraits',
    description:
      'Canonical portraitRefs and defaults. This is where reusable emotions should live so authored scenes can reference them by emotion instead of hardcoding assets.',
  },
  ...sceneGenerationDocuments.map((document) => ({
    id: `scene-overrides:${document.id}`,
    title: `Scene Overrides · ${document.title}`,
    description:
      'Explicit portrait overrides found directly in authored scene-generation data. Keep these sparse and intentional.',
  })),
];

export const narrativePortraitWorkbenchEntries = sortByTitle([
  ...Object.values(narrativeCharacterRegistry).flatMap((character) =>
    collectCharacterRegistryPortraitEntries(character),
  ),
  ...sceneGenerationDocuments.flatMap((document) => collectSceneGenerationPortraitEntries(document)),
]);
