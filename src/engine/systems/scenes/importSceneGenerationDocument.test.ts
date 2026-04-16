import { chapter1AwakeningSceneGenerationDocument } from '@content/scene-generation';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { importSceneGenerationDocument } from '@engine/systems/scenes/importSceneGenerationDocument';
import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

describe('sceneGeneration import pipeline', () => {
  it('imports the authored document into scene flows', () => {
    const imported = importSceneGenerationDocument(chapter1AwakeningSceneGenerationDocument);

    expect(imported.documentId).toBe('chapter-1/scene-generation/awakening');
    expect(Object.keys(imported.flows)).toEqual([
      'chapter-1/scene/awakening',
      'chapter-1/scene/awakening/road',
    ]);
    expect(imported.flows['chapter-1/scene/awakening']?.source).toEqual({
      type: 'sceneGeneration',
      id: 'chapter-1/scene-generation/awakening',
    });
    expect(imported.flows['chapter-1/scene/awakening']?.replay).toEqual({
      enabled: true,
    });
  });

  it('runs an imported scene-generation scene end-to-end through the dialogue runtime', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/awakening');

    expect(rootStore.dialogue.isActive).toBe(true);
    expect(rootStore.dialogue.currentNodeId).toBe('awakening-1');
    expect(rootStore.dialogue.currentSceneTitle).toBe('Awakening');
    expect(rootStore.dialogue.currentBackgroundId).toBe(
      'chapter-1/backgrounds/ancient-temple-black-river.webp',
    );

    rootStore.dialogue.next();
    rootStore.dialogue.next();

    const steadyChoice = rootStore.dialogue
      .getVisibleChoices()
      .find((choice) => choice.id === 'awakening-3-steady');

    expect(steadyChoice).toBeDefined();

    rootStore.dialogue.chooseChoice('awakening-3-steady');

    expect(rootStore.dialogue.currentNodeId).toBe('awakening-road-1');
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/awakening/road');
    expect(rootStore.flags.getBooleanFlag('chapter1.awakening.steadied')).toBe(true);
    expect(rootStore.stats.getStat('pragmatism')).toBe(1);
  });

  it('imports route-mode authoring into a runtime scene flow with route rules and encounters', () => {
    const routeDocument: SceneGenerationDocument = {
      id: 'route-scene-generation-demo',
      schemaVersion: 1,
      title: 'Route Demo',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'route-scene': {
          id: 'route-scene',
          mode: 'route',
          title: 'Route Scene',
          startNodeId: 'r-start',
          routeRules: {
            rollRange: {
              min: 2,
              max: 4,
            },
            scoutCharges: 2,
            scoutDepth: 3,
            revealNonHiddenAtStart: false,
          },
          nodes: {
            'r-start': {
              id: 'r-start',
              type: 'event',
              title: 'Fork',
              route: {
                x: 10,
                y: 55,
              },
              nextNodeId: 'r-mid',
            },
            'r-mid': {
              id: 'r-mid',
              type: 'event',
              title: 'Cache',
              route: {
                x: 46,
                y: 48,
              },
              encounter: {
                kind: 'loot',
                itemId: 'basic-potion',
                itemQuantity: 1,
              },
              nextNodeId: 'r-exit',
            },
            'r-exit': {
              id: 'r-exit',
              type: 'event',
              title: 'Exit',
              route: {
                x: 84,
                y: 34,
              },
              encounter: {
                kind: 'exit',
                completesFlow: true,
              },
              isEnd: true,
            },
          },
        },
      },
    };

    const imported = importSceneGenerationDocument(routeDocument);
    const flow = imported.flows['route-scene'];

    expect(flow).toMatchObject({
      id: 'route-scene',
      mode: 'route',
      startNodeId: 'r-start',
      routeRules: {
        rollRange: {
          min: 2,
          max: 4,
        },
        scoutCharges: 2,
        scoutDepth: 3,
        revealNonHiddenAtStart: false,
      },
    });
    expect(flow?.nodes['r-start']?.kind).toBe('route');
    expect(flow?.nodes['r-mid']?.encounter).toMatchObject({
      kind: 'loot',
      itemId: 'basic-potion',
      itemQuantity: 1,
    });
    expect(flow?.nodes['r-exit']?.route).toMatchObject({
      x: 84,
      y: 34,
    });
  });
});
