import type { DialogueData } from '@engine/types/dialogue';

import { chapter1BackgroundIds, chapter1PortraitIds } from '../../assets';

export const chapter1CityGateDialogue: DialogueData = {
  id: 'intro-dialogue',
  title: 'Gate Arrival',
  meta: {
    chapterId: 'chapter-1',
    sceneId: 'chapter-1/scene/city-gate',
    sceneTitle: 'Gate Check',
    title: 'City Gate',
    defaultBackgroundId: chapter1BackgroundIds.cityGate,
  },
  startNodeId: 'gate-checkpoint',
  speakerIds: ['gate-guard'],
  nodes: {
    'gate-checkpoint': {
      id: 'gate-checkpoint',
      type: 'choice',
      speakerId: 'gate-guard',
      speakerSide: 'right',
      text: 'Halt. State your business before the city gate.',
      emotion: 'stern',
      portraitId: chapter1PortraitIds.gateGuard.stern,
      backgroundId: chapter1BackgroundIds.cityGate,
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
          text: 'Show the gate pass.',
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
};
