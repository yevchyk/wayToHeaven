const sceneGenerationSourceFileByDocumentId: Record<string, string> = {
  'chapter-1/scene-generation/intro': 'src/content/chapters/chapter-1/scenes/intro/intro.scene-generation.ts',
  'chapter-1/scene-generation/intro-two-of-three':
    'src/content/chapters/chapter-1/scenes/intro/two-of-three.scene-generation.ts',
  'chapter-1/scene-generation/ball-and-assault':
    'src/content/chapters/chapter-1/scenes/intro/ball-and-assault.scene-generation.ts',
  'chapter-1/scene-generation/prison-fall':
    'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.scene-generation.ts',
  'chapter-1/scene-generation/awakening':
    'src/content/chapters/chapter-1/scenes/awakening/awakening.scene-generation.ts',
  'chapter-1/scene-generation/caravan-to-hugen-um':
    'src/content/chapters/chapter-1/scenes/caravan-to-hugen-um/caravan-to-hugen-um.scene-generation.ts',
  'chapter-1/scene-generation/city-gate':
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.scene-generation.ts',
  'chapter-1/scene-generation/thorn-departure':
    'src/content/chapters/chapter-1/scenes/thorn-departure/thorn-departure.scene-generation.ts',
  'chapter-1/scene-generation/city-hubs': 'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  'chapter-1/scene-generation/underground-route':
    'src/content/chapters/chapter-1/travel/underground-route.scene-generation.ts',
  'chapter-2/scene-generation/arrival':
    'src/content/chapters/chapter-2/scenes/arrival/arrival.scene-generation.ts',
  'chapter-2/scene-generation/first-deal':
    'src/content/chapters/chapter-2/scenes/first-deal/first-deal.scene-generation.ts',
  'chapter-2/scene-generation/hugen-um-hubs':
    'src/content/chapters/chapter-2/city/hugen-um-hubs.scene-generation.ts',
};

const sceneMetaSourceFileBySceneId: Record<string, string> = {
  'chapter-1/scene/intro': 'src/content/chapters/chapter-1/scenes/intro/intro.meta.ts',
  'chapter-1/scene/intro/two-of-three':
    'src/content/chapters/chapter-1/scenes/intro/two-of-three.meta.ts',
  'chapter-1/scene/intro/ball-and-assault':
    'src/content/chapters/chapter-1/scenes/intro/ball-and-assault.meta.ts',
  'chapter-1/scene/prison-fall': 'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta.ts',
  'chapter-1/scene/awakening': 'src/content/chapters/chapter-1/scenes/awakening/awakening.meta.ts',
  'chapter-1/scene/caravan-to-hugen-um':
    'src/content/chapters/chapter-1/scenes/caravan-to-hugen-um/caravan-to-hugen-um.meta.ts',
  'chapter-1/scene/city-gate': 'src/content/chapters/chapter-1/scenes/city-gate/city-gate.meta.ts',
  'chapter-1/scene/thorn-departure':
    'src/content/chapters/chapter-1/scenes/thorn-departure/thorn-departure.meta.ts',
  'chapter-1/scene/thorn-estate/replay/corset-tie':
    'src/content/chapters/chapter-1/scenes/thorn-departure/replays/corset-tie.replay.meta.ts',
  'chapter-1/scene/thorn-estate/replay/father-betrayal':
    'src/content/chapters/chapter-1/scenes/thorn-departure/replays/father-betrayal.replay.meta.ts',
  'chapter-2/scene/arrival': 'src/content/chapters/chapter-2/scenes/arrival/arrival.meta.ts',
  'chapter-2/scene/first-deal': 'src/content/chapters/chapter-2/scenes/first-deal/first-deal.meta.ts',
};

export function getSceneGenerationSourceFile(documentId: string) {
  return sceneGenerationSourceFileByDocumentId[documentId] ?? 'scene-generation source file not mapped yet';
}

export function getSceneMetaSourceFile(sceneId: string) {
  return sceneMetaSourceFileBySceneId[sceneId] ?? 'scene meta source file not mapped yet';
}
