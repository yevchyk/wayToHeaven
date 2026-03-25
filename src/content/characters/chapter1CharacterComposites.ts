import type {
  CharacterCompositeAssetDefinition,
  CharacterCompositeDefinition,
  CharacterCompositeTransform,
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
  emotionTransforms?: Partial<Record<string, CharacterCompositeTransform>>,
): Record<string, CharacterCompositeAssetDefinition> {
  const emotions = Object.keys(character.portraitRefs);
  const fallbackEmotion = character.defaultEmotion ?? emotions[0] ?? 'neutral';
  const emotionKeys = Array.from(new Set([fallbackEmotion, ...emotions]));

  return emotionKeys.reduce<Record<string, CharacterCompositeAssetDefinition>>((result, emotion) => {
    result[emotion] = {
      assetId: buildChapterCharacterAssetId(characterId, 'head', emotion),
      label: `${character.displayName} ${emotion}`,
      ...(emotionTransforms?.[emotion] ? { transform: emotionTransforms[emotion] } : {}),
    };

    return result;
  }, {});
}

interface ChapterNpcCompositeTweakSet {
  transforms?: CharacterCompositeDefinition['transforms'];
  headEmotionTransforms?: Partial<Record<string, CharacterCompositeTransform>>;
}

export const chapter1NpcCompositeTweaks: Partial<Record<string, ChapterNpcCompositeTweakSet>> = {};

export const chapter1HeroineBaseTransforms: NonNullable<CharacterCompositeDefinition['transforms']> = {
  head: {
    x: 50,
    y: 18,
    width: 30,
  },
  hair: {
    x: 50,
    y: 14,
    width: 36,
  },
  leftHand: {
    x: 39,
    y: 60,
    width: 18,
    rotate: -10,
  },
  weapon: {
    x: 58,
    y: 54,
    width: 24,
    rotate: -8,
  },
  rightHand: {
    x: 65,
    y: 60,
    width: 18,
    rotate: 12,
  },
};

export const chapter1HeroineWeaponPosePresets: NonNullable<
  CharacterCompositeDefinition['weaponPosePresets']
> = {
  'pose-1': {
    leftHand: {
      x: 44,
      y: 59,
      rotate: -22,
    },
    weapon: {
      x: 52,
      y: 48,
      width: 24,
      rotate: -14,
    },
    rightHand: {
      x: 58,
      y: 56,
      rotate: 16,
    },
  },
  'pose-2': {
    leftHand: {
      x: 34,
      y: 61,
      rotate: -18,
    },
    weapon: {
      x: 54,
      y: 56,
      width: 26,
      rotate: 6,
    },
    rightHand: {
      x: 69,
      y: 59,
      rotate: 20,
    },
  },
  'pose-3': {
    leftHand: {
      x: 43,
      y: 57,
      rotate: -28,
    },
    weapon: {
      x: 66,
      y: 43,
      width: 21,
      rotate: 22,
    },
    rightHand: {
      x: 58,
      y: 58,
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
        tweakSet?.headEmotionTransforms,
      ),
    },
    transforms: {
      head: {
        x: 50,
        y: 18,
        width: 30,
      },
      ...tweakSet?.transforms,
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
  transforms: chapter1HeroineBaseTransforms,
  weaponPosePresets: chapter1HeroineWeaponPosePresets,
};

export const chapter1CharacterCompositeRegistry: Record<string, CharacterCompositeDefinition> = {
  [chapter1HeroineCompositeDefinition.id]: chapter1HeroineCompositeDefinition,
  ...Object.fromEntries(
    chapter1NpcCompositeDefinitions.map((character) => [character.id, character] as const),
  ),
};
