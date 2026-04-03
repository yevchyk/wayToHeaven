import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import { chapter1BackgroundIds, chapter1PortraitIds } from '../../assets';

export const chapter1CityGateSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/city-gate',
  schemaVersion: 1,
  title: 'Gate Arrival Sandbox',
  meta: {
    chapterId: 'chapter-1',
    defaultBackgroundId: chapter1BackgroundIds.cityGate,
  },
  scenes: {
    'chapter-1/scene/city-gate': {
      id: 'chapter-1/scene/city-gate',
      mode: 'sequence',
      title: 'Gate Check Sandbox',
      description: 'Prototype city checkpoint kept for dialogue and gate-state systems coverage.',
      startNodeId: 'gate-approach',
      nodes: {
        'gate-approach': {
          id: 'gate-approach',
          type: 'narration',
          text: 'The wardens at the gate read faces before they read papers.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.city.edranSoldOutAtGate',
              value: false,
            },
          ],
          nextNodeId: 'gate-rumor-check',
        },
        'gate-rumor-check': {
          id: 'gate-rumor-check',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'A courier with soot on his sleeves already described a Thorn girl before you reached the arch. So choose your words carefully.',
          emotion: 'angry',
          portraitId: chapter1PortraitIds.gateGuard.angry,
          conditions: [
            {
              type: 'flag',
              flagId: 'relationship.edran',
              operator: 'lte',
              value: -1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'gate-checkpoint',
          },
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.city.edranSoldOutAtGate',
              value: true,
            },
            {
              type: 'changeMeta',
              key: 'morale',
              delta: -1,
            },
          ],
          nextNodeId: 'gate-checkpoint',
        },
        'gate-checkpoint': {
          id: 'gate-checkpoint',
          type: 'choice',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Halt. State your business before the city gate.',
          emotion: 'stern',
          portraitId: chapter1PortraitIds.gateGuard.stern,
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'morale',
              delta: 1,
            },
          ],
          choices: [
            {
              id: 'greet-politely',
              text: 'Offer a respectful greeting.',
              conditions: [
                {
                  type: 'metaGte',
                  key: 'morale',
                  value: 1,
                },
                {
                  type: 'flagEquals',
                  flagId: 'chapter1.city.edranSoldOutAtGate',
                  value: false,
                },
              ],
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'guardTrust',
                  value: true,
                },
              ],
              nextNodeId: 'guard-softens',
            },
            {
              id: 'show-pass',
              text: 'Show the pilgrim seal.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'hasGatePass',
                  value: true,
                },
              ],
              nextNodeId: 'pass-accepted',
            },
            {
              id: 'invoke-thorn-name',
              text: 'Invoke the Thorn name and stand as if the house still shields you.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'chapter1.aftermath.fatherMask',
                  value: true,
                },
              ],
              nextNodeId: 'thorn-name',
            },
            {
              id: 'stay-silent',
              text: 'Stay silent and wait.',
              nextNodeId: 'guard-dismisses',
            },
          ],
        },
        'guard-softens': {
          id: 'guard-softens',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Manners still matter on this road. I can let you through.',
          emotion: 'warm',
          portraitId: chapter1PortraitIds.gateGuard.warm,
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'reputation',
              delta: 1,
            },
          ],
          nextNodeId: 'farewell',
        },
        'pass-accepted': {
          id: 'pass-accepted',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Your papers are in order. Move on.',
          emotion: 'neutral',
          portraitId: chapter1PortraitIds.gateGuard.neutral,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'usedGatePass',
              value: true,
            },
          ],
          nextNodeId: 'farewell',
        },
        'thorn-name': {
          id: 'thorn-name',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Thorn blood, then. That still opens stone doors, but it also puts your name into the wrong ledgers.',
          emotion: 'stern',
          portraitId: chapter1PortraitIds.gateGuard.stern,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.city.invokedThornName',
              value: true,
            },
            {
              type: 'changeMeta',
              key: 'reputation',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'morale',
              delta: -1,
            },
          ],
          nextNodeId: 'thorn-farewell',
        },
        'guard-dismisses': {
          id: 'guard-dismisses',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Then do not waste my time. Step aside.',
          emotion: 'angry',
          portraitId: chapter1PortraitIds.gateGuard.angry,
          isEnd: true,
        },
        'thorn-farewell': {
          id: 'thorn-farewell',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'You may pass. But the name reached the watch before you did.',
          emotion: 'stern',
          portraitId: chapter1PortraitIds.gateGuard.stern,
          isEnd: true,
        },
        farewell: {
          id: 'farewell',
          type: 'dialogue',
          speakerId: 'gate-guard',
          speakerSide: 'right',
          text: 'Do not cause trouble inside the walls.',
          emotion: 'neutral',
          portraitId: chapter1PortraitIds.gateGuard.neutral,
          isEnd: true,
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
