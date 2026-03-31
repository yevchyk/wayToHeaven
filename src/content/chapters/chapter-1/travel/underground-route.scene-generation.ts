import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1UndergroundRouteSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/underground-route',
  schemaVersion: 1,
  title: 'Underground Route',
  meta: {
    chapterId: 'chapter-1',
    defaultBackgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
  },
  scenes: {
    'chapter-1/travel/underground-route': {
      id: 'chapter-1/travel/underground-route',
      mode: 'route',
      title: 'Underground Route',
      description:
        'A broken route from the black river temple toward the outer roads. Roll, choose a branch, and survive what waits at the final stop.',
      startNodeId: 'temple-threshold',
      routeRules: {
        rollRange: {
          min: 1,
          max: 6,
        },
        scoutCharges: 1,
        scoutDepth: 3,
      },
      nodes: {
        'temple-threshold': {
          id: 'temple-threshold',
          type: 'event',
          title: 'Temple Threshold',
          text: 'Cold stone, broken idols, and the first way out.',
          route: {
            x: 10,
            y: 52,
          },
          nextNodeId: 'black-river-ledger',
        },
        'black-river-ledger': {
          id: 'black-river-ledger',
          type: 'event',
          title: 'Black River Ledger',
          text: 'The path narrows before a split in the drowned passage.',
          route: {
            x: 24,
            y: 52,
          },
          nextNodeId: 'forked-passage',
        },
        'forked-passage': {
          id: 'forked-passage',
          type: 'choice',
          title: 'Forked Passage',
          text: 'The walls whisper. One branch smells of iron, the other of dust.',
          encounter: {
            kind: 'script',
            scriptId: 'chapter1.travel.forkedWhisper',
          },
          route: {
            x: 39,
            y: 52,
          },
          choices: [
            {
              id: 'forked-passage__shackled-guard',
              text: 'Верхня гілка',
              nextNodeId: 'shackled-guard',
            },
            {
              id: 'forked-passage__buried-cache',
              text: 'Нижня гілка',
              nextNodeId: 'buried-cache',
            },
          ],
        },
        'shackled-guard': {
          id: 'shackled-guard',
          type: 'event',
          title: 'Shackled Guard',
          text: 'A road guard, half-lost and still violent, blocks the upper route.',
          encounter: {
            kind: 'battle',
            battleTemplateId: 'guard-battle',
          },
          route: {
            x: 57,
            y: 31,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'healing-spring',
        },
        'buried-cache': {
          id: 'buried-cache',
          type: 'event',
          title: 'Buried Cache',
          text: 'Someone hid a satchel under cracked support beams.',
          encounter: {
            kind: 'loot',
            itemId: 'basic-potion',
            itemQuantity: 1,
            effects: [
              {
                type: 'setFlag',
                flagId: 'chapter1.travel.foundCache',
                value: true,
              },
            ],
          },
          route: {
            x: 57,
            y: 72,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'needle-arch',
        },
        'healing-spring': {
          id: 'healing-spring',
          type: 'event',
          title: 'Healing Spring',
          text: 'Warm mineral water pools between ancient machine roots.',
          encounter: {
            kind: 'effects',
            effects: [
              {
                type: 'restoreResource',
                resource: 'hp',
                amount: 18,
                targetScope: 'party',
              },
            ],
          },
          route: {
            x: 73,
            y: 31,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'collapsed-camp',
        },
        'needle-arch': {
          id: 'needle-arch',
          type: 'event',
          title: 'Needle Arch',
          text: 'A lattice of rusted needles snaps from the stonework.',
          encounter: {
            kind: 'effects',
            effects: [
              {
                type: 'changeMeta',
                key: 'morale',
                delta: -1,
              },
              {
                type: 'setFlag',
                flagId: 'chapter1.travel.needleTrapTriggered',
                value: true,
              },
            ],
          },
          route: {
            x: 73,
            y: 72,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'collapsed-camp',
        },
        'collapsed-camp': {
          id: 'collapsed-camp',
          type: 'event',
          title: 'Collapsed Camp',
          text: 'A dry pocket of stone offers a short but precious pause.',
          encounter: {
            kind: 'effects',
            effects: [
              {
                type: 'restoreResource',
                resource: 'hp',
                amount: 10,
                targetScope: 'party',
              },
              {
                type: 'restoreResource',
                resource: 'mana',
                amount: 6,
                targetScope: 'party',
              },
              {
                type: 'changeMeta',
                key: 'morale',
                delta: 1,
              },
            ],
          },
          route: {
            x: 84,
            y: 52,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'whisper-wall',
        },
        'whisper-wall': {
          id: 'whisper-wall',
          type: 'event',
          title: 'Whisper Wall',
          text: 'Old words peel from the masonry as something beneath the river answers.',
          encounter: {
            kind: 'dialogue',
            dialogueId: 'chapter-1/scene/awakening',
          },
          route: {
            x: 93,
            y: 52,
            hidden: true,
            oneTime: true,
          },
          nextNodeId: 'iron-gate',
        },
        'iron-gate': {
          id: 'iron-gate',
          type: 'event',
          title: 'Iron Gate',
          text: 'Beyond the broken gate, the route opens back into the outer world.',
          encounter: {
            kind: 'exit',
            completesFlow: true,
            effects: [
              {
                type: 'setFlag',
                flagId: 'chapter1.travel.undergroundRouteCleared',
                value: true,
              },
              {
                type: 'changeLocation',
                locationId: 'pilgrim-road',
                nodeId: 'city-gate',
              },
            ],
          },
          route: {
            x: 99,
            y: 52,
            hidden: true,
            oneTime: true,
          },
          isEnd: true,
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
