import type {
  CharacterCompositeAssetDefinition,
  CharacterCompositeDefinition,
  CharacterCompositePlacementPatch,
  CharacterCompositeStageDefinition,
} from '@engine/types/characterComposite';
import type { NarrativeCharacterData } from '@engine/types/narrative';

import { heroineNpc } from '@content/chapters/chapter-1/npcs/heroine.npc';
import { gateGuardNpc } from '@content/chapters/chapter-1/npcs/gate-guard.npc';
import { oldVoiceNpc } from '@content/chapters/chapter-1/npcs/old-voice.npc';
import { chapter1SupportingCastRegistry } from '@content/chapters/chapter-1/npcs/supporting-cast.npc';

function buildChapterCharacterAssetId(characterId: string, layerFolder: string, assetName: string) {
  return `chapter-1/characters/${characterId}/${layerFolder}/${assetName}`;
}

function buildEmotionHeadDefinitions(
  characterId: string,
  character: NarrativeCharacterData,
  emotionPlacements?: Partial<Record<string, CharacterCompositePlacementPatch>>,
): Record<string, CharacterCompositeAssetDefinition> {
  const emotions = Object.keys(character.portraitRefs);
  const fallbackEmotion = character.defaultEmotion ?? emotions[0] ?? 'neutral';
  const emotionKeys = Array.from(new Set([fallbackEmotion, ...emotions]));

  return emotionKeys.reduce<Record<string, CharacterCompositeAssetDefinition>>((result, emotion) => {
    result[emotion] = {
      assetId: buildChapterCharacterAssetId(characterId, 'head', emotion),
      label: `${character.displayName} ${emotion}`,
      ...(emotionPlacements?.[emotion] ? { placement: emotionPlacements[emotion] } : {}),
    };

    return result;
  }, {});
}

interface ChapterNpcCompositeTweakSet {
  placements?: CharacterCompositeDefinition['placements'];
  headEmotionPlacements?: Partial<Record<string, CharacterCompositePlacementPatch>>;
}

export const chapter1CharacterCompositeStage: CharacterCompositeStageDefinition = {
  width: 1000,
  height: 1400,
  safeArea: {
    x: 90,
    y: 98,
    width: 820,
    height: 1204,
  },
};

export const chapter1NpcCompositeTweaks: Partial<Record<string, ChapterNpcCompositeTweakSet>> = {};

export const chapter1HeroineBasePlacements: NonNullable<CharacterCompositeDefinition['placements']> = {
  head: {
    anchor: {
      x: 500,
      y: 308,
    },
    size: {
      width: 300,
    },
    assetAnchor: {
      x: 0.5,
      y: 0.82,
    },
  },
  hair: {
    anchor: {
      x: 500,
      y: 248,
    },
    size: {
      width: 360,
    },
    assetAnchor: {
      x: 0.5,
      y: 0.76,
    },
  },
  leftHand: {
    anchor: {
      x: 390,
      y: 840,
    },
    size: {
      width: 180,
    },
    assetAnchor: {
      x: 0.56,
      y: 0.2,
    },
    rotate: -10,
  },
  weapon: {
    anchor: {
      x: 580,
      y: 756,
    },
    size: {
      width: 240,
    },
    assetAnchor: {
      x: 0.34,
      y: 0.8,
    },
    rotate: -8,
  },
  rightHand: {
    anchor: {
      x: 650,
      y: 840,
    },
    size: {
      width: 180,
    },
    assetAnchor: {
      x: 0.46,
      y: 0.2,
    },
    rotate: 12,
  },
};

export const chapter1HeroineWeaponPosePresets: NonNullable<
  CharacterCompositeDefinition['weaponPosePresets']
> = {
  'pose-1': {
    leftHand: {
      anchor: {
        x: 440,
        y: 826,
      },
      rotate: -22,
    },
    weapon: {
      anchor: {
        x: 520,
        y: 672,
      },
      size: {
        width: 240,
      },
      rotate: -14,
    },
    rightHand: {
      anchor: {
        x: 580,
        y: 784,
      },
      rotate: 16,
    },
  },
  'pose-2': {
    leftHand: {
      anchor: {
        x: 340,
        y: 854,
      },
      rotate: -18,
    },
    weapon: {
      anchor: {
        x: 540,
        y: 784,
      },
      size: {
        width: 260,
      },
      rotate: 6,
    },
    rightHand: {
      anchor: {
        x: 690,
        y: 826,
      },
      rotate: 20,
    },
  },
  'pose-3': {
    leftHand: {
      anchor: {
        x: 430,
        y: 798,
      },
      rotate: -28,
    },
    weapon: {
      anchor: {
        x: 660,
        y: 602,
      },
      size: {
        width: 210,
      },
      rotate: 22,
    },
    rightHand: {
      anchor: {
        x: 580,
        y: 812,
      },
      rotate: 10,
    },
  },
};

function createNpcCompositeDefinition(
  character: NarrativeCharacterData,
  tweakSet?: ChapterNpcCompositeTweakSet,
): CharacterCompositeDefinition {
  return {
    id: character.id,
    chapterId: character.chapterId,
    displayName: character.displayName,
    kind: 'npc',
    stage: chapter1CharacterCompositeStage,
    defaultEmotion: character.defaultEmotion ?? Object.keys(character.portraitRefs)[0] ?? 'neutral',
    assets: {
      body: {
        assetId: buildChapterCharacterAssetId(character.id, 'body', 'base'),
        label: `${character.displayName} body`,
      },
      clothes: {
        assetId: buildChapterCharacterAssetId(character.id, 'clothes', 'base'),
        label: `${character.displayName} clothes`,
      },
      headByEmotion: buildEmotionHeadDefinitions(
        character.id,
        character,
        tweakSet?.headEmotionPlacements,
      ),
    },
    placements: {
      head: {
        anchor: {
          x: 500,
          y: 308,
        },
        size: {
          width: 300,
        },
        assetAnchor: {
          x: 0.5,
          y: 0.82,
        },
      },
      ...tweakSet?.placements,
    },
  };
}

const chapter1NpcSourceCharacters: NarrativeCharacterData[] = [
  gateGuardNpc,
  oldVoiceNpc,
  ...Object.values(chapter1SupportingCastRegistry),
];

export const chapter1NpcCompositeDefinitions = chapter1NpcSourceCharacters
  .map((character) => createNpcCompositeDefinition(character, chapter1NpcCompositeTweaks[character.id]))
  .sort((left, right) => left.displayName.localeCompare(right.displayName));

export const chapter1HeroineCompositeDefinition: CharacterCompositeDefinition = {
  id: heroineNpc.id,
  chapterId: heroineNpc.chapterId,
  displayName: heroineNpc.displayName,
  kind: 'heroine',
  stage: chapter1CharacterCompositeStage,
  defaultEmotion: heroineNpc.defaultEmotion ?? 'neutral',
  defaultWeaponPosePreset: 'pose-2',
  assets: {
    body: {
      assetId: buildChapterCharacterAssetId(heroineNpc.id, 'body', 'base'),
      label: `${heroineNpc.displayName} body`,
    },
    clothes: {
      assetId: buildChapterCharacterAssetId(heroineNpc.id, 'clothes', 'base'),
      label: `${heroineNpc.displayName} clothes`,
    },
    headByEmotion: buildEmotionHeadDefinitions(heroineNpc.id, heroineNpc),
    hair: {
      assetId: buildChapterCharacterAssetId(heroineNpc.id, 'hair', 'base'),
      label: `${heroineNpc.displayName} hair`,
    },
    hands: {
      left: {
        assetId: buildChapterCharacterAssetId(heroineNpc.id, 'hands', 'left'),
        label: `${heroineNpc.displayName} left hand`,
      },
      right: {
        assetId: buildChapterCharacterAssetId(heroineNpc.id, 'hands', 'right'),
        label: `${heroineNpc.displayName} right hand`,
      },
    },
    weapon: {
      assetId: buildChapterCharacterAssetId(heroineNpc.id, 'weapon', 'base'),
      label: `${heroineNpc.displayName} weapon`,
    },
  },
  placements: chapter1HeroineBasePlacements,
  weaponPosePresets: chapter1HeroineWeaponPosePresets,
};

export const chapter1CharacterCompositeRegistry: Record<string, CharacterCompositeDefinition> = {
  [chapter1HeroineCompositeDefinition.id]: chapter1HeroineCompositeDefinition,
  ...Object.fromEntries(
    chapter1NpcCompositeDefinitions.map((character) => [character.id, character] as const),
  ),
};
