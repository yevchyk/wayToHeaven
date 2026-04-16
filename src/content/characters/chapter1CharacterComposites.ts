import type {
  CharacterCompositeAssetDefinition,
  CharacterCompositeDefinition,
  CharacterCompositeStageDefinition,
} from '@engine/types/characterComposite';
import type { NarrativeCharacterData } from '@engine/types/narrative';

import { chapter1SupportingCastRegistry } from '@content/chapters/chapter-1/npcs/supporting-cast.npc';

function buildChapterCharacterAssetId(characterId: string, layerFolder: string, assetName: string) {
  return `chapter-1/characters/${characterId}/${layerFolder}/${assetName}`;
}

function getChapter1StoryHeroine() {
  const heroine = chapter1SupportingCastRegistry.mirella;

  if (!heroine) {
    throw new Error('Expected Mirella to exist in the Chapter 1 supporting cast registry.');
  }

  return heroine;
}

const chapter1StoryHeroine = getChapter1StoryHeroine();

function buildEmotionHeadDefinitions(
  characterId: string,
  character: NarrativeCharacterData,
): Record<string, CharacterCompositeAssetDefinition> {
  const emotions = Object.keys(character.portraitRefs);
  const fallbackEmotion = character.defaultEmotion ?? emotions[0] ?? 'neutral';
  const emotionKeys = Array.from(new Set([fallbackEmotion, ...emotions]));

  return emotionKeys.reduce<Record<string, CharacterCompositeAssetDefinition>>((result, emotion) => {
    result[emotion] = {
      assetId: buildChapterCharacterAssetId(characterId, 'head', emotion),
      label: `${character.displayName} ${emotion}`,
    };

    return result;
  }, {});
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

export const chapter1HeroineCompositeDefinition: CharacterCompositeDefinition = {
  id: chapter1StoryHeroine.id,
  chapterId: chapter1StoryHeroine.chapterId,
  displayName: chapter1StoryHeroine.displayName,
  kind: 'heroine',
  stage: chapter1CharacterCompositeStage,
  defaultEmotion: chapter1StoryHeroine.defaultEmotion ?? 'neutral',
  defaultWeaponPosePreset: 'pose-2',
  assets: {
    body: {
      assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'body', 'base'),
      label: `${chapter1StoryHeroine.displayName} body`,
    },
    clothes: {
      assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'clothes', 'base'),
      label: `${chapter1StoryHeroine.displayName} clothes`,
    },
    headByEmotion: buildEmotionHeadDefinitions(chapter1StoryHeroine.id, chapter1StoryHeroine),
    hair: {
      assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'hair', 'base'),
      label: `${chapter1StoryHeroine.displayName} hair`,
    },
    hands: {
      left: {
        assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'hands', 'left'),
        label: `${chapter1StoryHeroine.displayName} left hand`,
      },
      right: {
        assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'hands', 'right'),
        label: `${chapter1StoryHeroine.displayName} right hand`,
      },
    },
    weapon: {
      assetId: buildChapterCharacterAssetId(chapter1StoryHeroine.id, 'weapon', 'base'),
      label: `${chapter1StoryHeroine.displayName} weapon`,
    },
  },
  placements: chapter1HeroineBasePlacements,
  weaponPosePresets: chapter1HeroineWeaponPosePresets,
};

export const chapter1CharacterCompositeRegistry: Record<string, CharacterCompositeDefinition> = {
  [chapter1HeroineCompositeDefinition.id]: chapter1HeroineCompositeDefinition,
};
