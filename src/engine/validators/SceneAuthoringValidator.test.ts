import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';
import type { SceneMeta } from '@engine/types/narrative';
import { SceneAuthoringValidator } from '@engine/validators/SceneAuthoringValidator';

function createValidBundle() {
  const sceneRegistry: Record<string, SceneMeta> = {
    'scene/live': {
      id: 'scene/live',
      title: 'Live Scene',
      chapterId: 'chapter-1',
      sceneOrder: 1,
      mainSceneFlowId: 'scene/live',
    },
    'scene/replay': {
      id: 'scene/archive/replay',
      title: 'Replay Scene',
      chapterId: 'chapter-1',
      sceneOrder: 2,
      mainSceneFlowId: 'scene/archive/replay',
    },
  };
  const sceneGenerationRegistry: Record<string, SceneGenerationDocument> = {
    'doc/live': {
      id: 'doc/live',
      schemaVersion: 1,
      title: 'Live Doc',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'scene/live': {
          id: 'scene/live',
          mode: 'sequence',
          title: 'Live Scene',
          startNodeId: 'n1',
          nodes: {
            n1: {
              id: 'n1',
              type: 'event',
              onEnterEffects: [
                {
                  type: 'unlockSceneReplay',
                  sceneId: 'scene/archive/replay',
                },
              ],
              isEnd: true,
            },
          },
        },
      },
    },
    'doc/replay': {
      id: 'doc/replay',
      schemaVersion: 1,
      title: 'Replay Doc',
      meta: {
        chapterId: 'chapter-1',
      },
      scenes: {
        'scene/archive/replay': {
          id: 'scene/archive/replay',
          mode: 'sequence',
          title: 'Replay Scene',
          startNodeId: 'r1',
          replay: {
            enabled: true,
            unlockOnStart: false,
          },
          nodes: {
            r1: {
              id: 'r1',
              type: 'narration',
              text: 'Replay beat.',
              isEnd: true,
            },
          },
        },
      },
    },
  };

  return { sceneRegistry, sceneGenerationRegistry };
}

describe('SceneAuthoringValidator', () => {
  it('accepts a valid live + replay scene bundle', () => {
    const { sceneRegistry, sceneGenerationRegistry } = createValidBundle();
    const validator = new SceneAuthoringValidator(sceneRegistry, sceneGenerationRegistry);

    expect(validator.validate()).toEqual([]);
  });

  it('flags replay unlocks that point to non-replay scenes', () => {
    const { sceneRegistry, sceneGenerationRegistry } = createValidBundle();
    const replayScene = sceneGenerationRegistry['doc/replay']?.scenes['scene/archive/replay'];

    if (!replayScene) {
      throw new Error('Replay scene fixture is missing.');
    }

    delete replayScene.replay;
    const validator = new SceneAuthoringValidator(sceneRegistry, sceneGenerationRegistry);

    expect(validator.validate()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'replaySceneNotReplayEnabled',
          sourceId: 'scene/archive/replay',
        }),
        expect.objectContaining({
          code: 'replayUnlockTargetsNonReplayScene',
          sourceId: 'doc/live',
          targetId: 'scene/archive/replay',
        }),
      ]),
    );
  });

  it('flags replay scenes that are never unlocked', () => {
    const { sceneRegistry, sceneGenerationRegistry } = createValidBundle();
    const liveNode = sceneGenerationRegistry['doc/live']?.scenes['scene/live']?.nodes.n1;

    if (!liveNode) {
      throw new Error('Live scene fixture is missing.');
    }

    delete liveNode.onEnterEffects;
    const validator = new SceneAuthoringValidator(sceneRegistry, sceneGenerationRegistry);

    expect(validator.validate()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'orphanReplayScene',
          sourceId: 'scene/archive/replay',
        }),
      ]),
    );
  });
});
