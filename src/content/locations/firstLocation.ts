import type { LocationData } from '@engine/types/world';

export const firstLocation: LocationData = {
  id: 'pilgrim-road',
  title: 'Pilgrim Road',
  description: 'A short road outside the city walls with shrines, patrols, and danger.',
  startNodeId: 'road-entry',
  onEnterEffects: [
    {
      type: 'setFlag',
      flagId: 'visitedPilgrimRoad',
      value: true,
    },
  ],
  nodes: {
    'road-entry': {
      id: 'road-entry',
      label: 'Road Entry',
      x: 0,
      y: 0,
      type: 'start',
      description: 'The point where the pilgrim road leaves the wilderness.',
      connectedNodeIds: ['shrine', 'city-gate'],
      interaction: {
        type: 'none',
      },
    },
    shrine: {
      id: 'shrine',
      label: 'Wayside Shrine',
      x: 18,
      y: -6,
      type: 'safe',
      description: 'A weathered shrine where travelers recover their courage.',
      connectedNodeIds: ['road-entry', 'clearing'],
      onEnterEffects: [
        {
          type: 'changeMeta',
          key: 'morale',
          delta: 2,
        },
      ],
      interaction: {
        type: 'none',
      },
    },
    'city-gate': {
      id: 'city-gate',
      label: 'City Gate',
      x: 18,
      y: 8,
      type: 'landmark',
      description: 'The checkpoint where the city guard challenges newcomers.',
      connectedNodeIds: ['road-entry', 'clearing'],
      interaction: {
        type: 'dialogue',
        dialogueId: 'intro-dialogue',
      },
    },
    clearing: {
      id: 'clearing',
      label: 'Dusty Clearing',
      x: 38,
      y: 0,
      type: 'path',
      description: 'A fork in the road where patrol routes and pilgrim paths cross.',
      connectedNodeIds: ['shrine', 'city-gate', 'ambush-site'],
      interaction: {
        type: 'none',
      },
    },
    'ambush-site': {
      id: 'ambush-site',
      label: 'Ambush Site',
      x: 58,
      y: 4,
      type: 'encounter',
      description: 'Broken arrows and fresh tracks mark an unsafe stretch of road.',
      connectedNodeIds: ['clearing'],
      interaction: {
        type: 'battle',
        battleTemplateId: 'guard-battle',
        once: true,
      },
    },
  },
};
