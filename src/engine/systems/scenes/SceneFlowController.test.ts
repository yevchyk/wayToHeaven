import {
  chapter1BackgroundIds,
  chapter1CgIds,
  chapter1MusicIds,
  chapter1OverlayIds,
  chapter1PortraitIds,
  chapter1SfxIds,
} from '@content/chapters/chapter-1/assets';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { importSceneGenerationDocument } from '@engine/systems/scenes/importSceneGenerationDocument';
import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

function registerImportedFlows(rootStore: GameRootStore, document: SceneGenerationDocument) {
  const imported = importSceneGenerationDocument(document);

  Object.assign(rootStore.sceneFlowRegistry, imported.flows);

  return imported;
}

describe('SceneFlowController regressions', () => {
  it('bootstraps scene defaults and applies sceneChange presentation patches at runtime', () => {
    const rootStore = new GameRootStore();

    registerImportedFlows(rootStore, {
      id: 'tests/scene-generation/presentation-regression',
      schemaVersion: 1,
      title: 'Presentation Regression',
      meta: {
        chapterId: 'chapter-1',
        defaultBackgroundId: chapter1BackgroundIds.introRoom,
        defaultBackgroundStyle: 'cold-morning-spill+shadow-veil',
        defaultMusicId: chapter1MusicIds.introTheme,
        defaultCgId: chapter1CgIds.awakeningFlash,
        defaultOverlayId: chapter1OverlayIds.dreamVeil,
        defaultStage: {
          characters: [
            {
              speakerId: 'heroine',
              emotion: 'neutral',
              portraitId: chapter1PortraitIds.heroine.neutral,
            },
          ],
          focusCharacterId: 'heroine',
        },
      },
      scenes: {
        'tests/scene/presentation-regression': {
          id: 'tests/scene/presentation-regression',
          mode: 'sequence',
          startNodeId: 'intro',
          transition: {
            type: 'fade',
            durationMs: 320,
          },
          nodes: {
            intro: {
              id: 'intro',
              type: 'narration',
              text: 'The defaults should already be visible before the first patch.',
              nextNodeId: 'patch',
            },
            patch: {
              id: 'patch',
              type: 'event',
              text: 'Apply a scene change patch.',
              sceneChange: {
                background: {
                  image: chapter1BackgroundIds.cityGate,
                  transition: 'flash',
                  style: 'weathered-night',
                },
                cgId: null,
                overlayId: null,
                sfx: {
                  sfxId: chapter1SfxIds.heartbeat,
                },
                transition: {
                  type: 'dissolve',
                  durationMs: 480,
                },
                stage: {
                  characters: [
                    {
                      speakerId: 'old-voice',
                      emotion: 'warm',
                      portraitId: chapter1PortraitIds.oldVoice.warm,
                    },
                  ],
                  focusCharacterId: 'old-voice',
                },
              },
              isEnd: true,
            },
          },
        },
      },
    });

    rootStore.sceneFlowController.startSceneFlow('tests/scene/presentation-regression');

    expect(rootStore.dialogue.currentBackgroundId).toBe(chapter1BackgroundIds.introRoom);
    expect(rootStore.dialogue.currentMusicId).toBe(chapter1MusicIds.introTheme);
    expect(rootStore.dialogue.currentCgId).toBe(chapter1CgIds.awakeningFlash);
    expect(rootStore.dialogue.currentOverlayId).toBe(chapter1OverlayIds.dreamVeil);
    expect(rootStore.dialogue.currentStage?.focusCharacterId).toBe('heroine');
    expect(rootStore.sceneFlow.currentBackgroundStyle).toBe('cold-morning-spill+shadow-veil');
    expect(rootStore.sceneFlow.activeSession?.presentation.activeTransition).toMatchObject({
      type: 'fade',
      durationMs: 320,
    });

    rootStore.dialogue.next();

    expect(rootStore.dialogue.currentNodeId).toBe('patch');
    expect(rootStore.dialogue.currentBackgroundId).toBe(chapter1BackgroundIds.cityGate);
    expect(rootStore.dialogue.currentMusicId).toBe(chapter1MusicIds.introTheme);
    expect(rootStore.dialogue.currentCgId).toBeNull();
    expect(rootStore.dialogue.currentOverlayId).toBeNull();
    expect(rootStore.dialogue.lastSfxId).toBe(chapter1SfxIds.heartbeat);
    expect(rootStore.dialogue.currentStage?.focusCharacterId).toBe('old-voice');
    expect(rootStore.sceneFlow.activeSession?.presentation.backgroundStyle).toBe('weathered-night');
    expect(rootStore.sceneFlow.activeSession?.presentation.activeTransition).toMatchObject({
      type: 'dissolve',
      durationMs: 480,
    });
  });

  it('resolves blocked start nodes and blocked next nodes through onConditionFail', () => {
    const rootStore = new GameRootStore();

    registerImportedFlows(rootStore, {
      id: 'tests/scene-generation/condition-fallback',
      schemaVersion: 1,
      title: 'Condition Fallbacks',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'tests/scene/condition-fallback': {
          id: 'tests/scene/condition-fallback',
          mode: 'sequence',
          startNodeId: 'blocked-start',
          nodes: {
            'blocked-start': {
              id: 'blocked-start',
              type: 'event',
              text: 'This start node should be skipped.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'tests.allow.blockedStart',
                  value: true,
                },
              ],
              onConditionFail: {
                nextNodeId: 'fallback-start',
              },
              nextNodeId: 'should-not-see-start',
            },
            'fallback-start': {
              id: 'fallback-start',
              type: 'narration',
              text: 'The fallback start node is visible.',
              nextNodeId: 'pre-blocked-next',
            },
            'should-not-see-start': {
              id: 'should-not-see-start',
              type: 'narration',
              text: 'Blocked start conditions should prevent this node from opening.',
              isEnd: true,
            },
            'pre-blocked-next': {
              id: 'pre-blocked-next',
              type: 'narration',
              text: 'The next step attempts a blocked node.',
              nextNodeId: 'blocked-next',
            },
            'blocked-next': {
              id: 'blocked-next',
              type: 'event',
              text: 'This node should also be skipped.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'tests.allow.blockedNext',
                  value: true,
                },
              ],
              onConditionFail: {
                nextNodeId: 'resolved',
              },
              nextNodeId: 'should-not-see-next',
            },
            resolved: {
              id: 'resolved',
              type: 'narration',
              text: 'The fallback for the blocked next node is visible.',
              isEnd: true,
            },
            'should-not-see-next': {
              id: 'should-not-see-next',
              type: 'narration',
              text: 'Blocked node conditions should redirect away from this node.',
              isEnd: true,
            },
          },
        },
      },
    });

    rootStore.sceneFlowController.startSceneFlow('tests/scene/condition-fallback');

    expect(rootStore.dialogue.currentNodeId).toBe('fallback-start');
    expect(rootStore.dialogue.currentText).toBe('The fallback start node is visible.');

    rootStore.dialogue.next();
    expect(rootStore.dialogue.currentNodeId).toBe('pre-blocked-next');

    rootStore.dialogue.next();
    expect(rootStore.dialogue.currentNodeId).toBe('resolved');
    expect(rootStore.dialogue.currentText).toBe('The fallback for the blocked next node is visible.');
  });

  it('can replace an entire follow-up scene when scene conditions read inventory state', () => {
    const rootStore = new GameRootStore();

    registerImportedFlows(rootStore, {
      id: 'tests/scene-generation/inventory-scene-replacement',
      schemaVersion: 1,
      title: 'Inventory Scene Replacement',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'tests/scene/source': {
          id: 'tests/scene/source',
          mode: 'sequence',
          startNodeId: 'source-start',
          nodes: {
            'source-start': {
              id: 'source-start',
              type: 'narration',
              text: 'Move into the gated follow-up scene.',
              nextSceneId: 'tests/scene/gated',
            },
          },
        },
        'tests/scene/gated': {
          id: 'tests/scene/gated',
          mode: 'sequence',
          startNodeId: 'gated-start',
          conditions: [
            {
              type: 'inventory',
              itemId: 'basic-potion',
              operator: 'gte',
              value: 1,
            },
          ],
          onConditionFail: {
            nextSceneId: 'tests/scene/fallback',
          },
          nodes: {
            'gated-start': {
              id: 'gated-start',
              type: 'narration',
              text: 'The item-gated scene is visible.',
              isEnd: true,
            },
          },
        },
        'tests/scene/fallback': {
          id: 'tests/scene/fallback',
          mode: 'sequence',
          startNodeId: 'fallback-start',
          nodes: {
            'fallback-start': {
              id: 'fallback-start',
              type: 'narration',
              text: 'The fallback scene replaced the gated scene.',
              isEnd: true,
            },
          },
        },
      },
    });

    rootStore.sceneFlowController.startSceneFlow('tests/scene/source');
    rootStore.dialogue.next();

    expect(rootStore.dialogue.activeSceneId).toBe('tests/scene/fallback');
    expect(rootStore.dialogue.currentText).toBe('The fallback scene replaced the gated scene.');

    rootStore.dialogue.endDialogue();
    rootStore.inventory.addItem('basic-potion', 1);

    rootStore.sceneFlowController.startSceneFlow('tests/scene/source');
    rootStore.dialogue.next();

    expect(rootStore.dialogue.activeSceneId).toBe('tests/scene/gated');
    expect(rootStore.dialogue.currentText).toBe('The item-gated scene is visible.');
  });

  it('uses scene flow routeRules.rollRange at runtime instead of hardcoded dice limits', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.99,
    });

    registerImportedFlows(rootStore, {
      id: 'tests/scene-generation/route-roll-range',
      schemaVersion: 1,
      title: 'Route Roll Range',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'tests/scene/route-roll-range': {
          id: 'tests/scene/route-roll-range',
          mode: 'route',
          startNodeId: 'route-start',
          routeRules: {
            rollRange: {
              min: 4,
              max: 4,
            },
          },
          nodes: {
            'route-start': {
              id: 'route-start',
              type: 'event',
              title: 'Route Start',
              route: {
                x: 12,
                y: 24,
              },
              nextNodeId: 'route-fork',
            },
            'route-fork': {
              id: 'route-fork',
              type: 'choice',
              title: 'Route Fork',
              text: 'The route splits into two hostile corridors.',
              route: {
                x: 48,
                y: 24,
              },
              choices: [
                {
                  id: 'route-fork-west',
                  text: 'Take the western rise.',
                  nextNodeId: 'route-west',
                },
                {
                  id: 'route-fork-east',
                  text: 'Take the eastern ravine.',
                  nextNodeId: 'route-east',
                },
              ],
            },
            'route-west': {
              id: 'route-west',
              type: 'event',
              title: 'Route West',
              route: {
                x: 84,
                y: 12,
              },
              nextNodeId: 'route-exit',
            },
            'route-east': {
              id: 'route-east',
              type: 'event',
              title: 'Route East',
              route: {
                x: 84,
                y: 36,
              },
              nextNodeId: 'route-exit',
            },
            'route-exit': {
              id: 'route-exit',
              type: 'event',
              title: 'Route Exit',
              route: {
                x: 94,
                y: 24,
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
    });

    rootStore.sceneFlowController.startSceneFlow('tests/scene/route-roll-range');

    expect(rootStore.sceneFlow.isAwaitingRoll).toBe(true);
    expect(rootStore.sceneFlowController.rollDice()).toBe(4);
    expect(rootStore.sceneFlow.currentNodeId).toBe('route-fork');
    expect(rootStore.sceneFlow.isAwaitingDirection).toBe(true);
    expect(rootStore.sceneFlow.lastRoll).toBe(4);
  });

  it('spends time on hub choices and route steps through scene-flow rules', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0,
    });

    registerImportedFlows(rootStore, {
      id: 'tests/scene-generation/time-runtime',
      schemaVersion: 1,
      title: 'Time Runtime',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'tests/scene/hub-time': {
          id: 'tests/scene/hub-time',
          mode: 'hub',
          startNodeId: 'hub',
          cityName: 'Test Ward',
          locationName: 'Test Yard',
          nodes: {
            hub: {
              id: 'hub',
              type: 'choice',
              text: 'Spend time in the yard.',
              choices: [
                {
                  id: 'pray',
                  text: 'Pray at the roadside altar.',
                  timeCost: {
                    hours: 2,
                  },
                  nextSceneId: 'tests/scene/hub-target',
                },
              ],
            },
          },
        },
        'tests/scene/hub-target': {
          id: 'tests/scene/hub-target',
          mode: 'sequence',
          startNodeId: 'line',
          nodes: {
            line: {
              id: 'line',
              type: 'narration',
              text: 'The prayer is complete.',
              isEnd: true,
            },
          },
        },
        'tests/scene/route-time': {
          id: 'tests/scene/route-time',
          mode: 'route',
          startNodeId: 'start',
          routeRules: {
            rollRange: {
              min: 1,
              max: 1,
            },
            stepTimeCost: {
              hours: 6,
            },
          },
          nodes: {
            start: {
              id: 'start',
              type: 'event',
              title: 'Start',
              route: {
                x: 10,
                y: 10,
              },
              nextNodeId: 'mid',
            },
            mid: {
              id: 'mid',
              type: 'event',
              title: 'Mid',
              route: {
                x: 60,
                y: 10,
              },
              encounter: {
                kind: 'none',
              },
              nextNodeId: 'exit',
            },
            exit: {
              id: 'exit',
              type: 'event',
              title: 'Exit',
              route: {
                x: 90,
                y: 10,
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
    });

    rootStore.time.setTime(1, 8);
    rootStore.sceneFlowController.startSceneFlow('tests/scene/hub-time');
    rootStore.sceneFlowController.chooseTransition('pray');

    expect(rootStore.time.day).toBe(1);
    expect(rootStore.time.hour).toBe(10);
    expect(rootStore.dialogue.currentText).toBe('The prayer is complete.');

    rootStore.sceneFlowController.startSceneFlow('tests/scene/route-time');
    rootStore.sceneFlowController.rollDice();

    expect(rootStore.time.day).toBe(1);
    expect(rootStore.time.hour).toBe(16);
    expect(rootStore.sceneFlow.currentNodeId).toBe('mid');
  });
});
