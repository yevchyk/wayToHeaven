import type { CharacterCompositeDefinition } from '@engine/types/characterComposite';
import {
  buildCharacterCompositeLayers,
  getCharacterCompositeEmotions,
} from '@engine/utils/buildCharacterCompositeLayers';

function createNpcDefinition(): CharacterCompositeDefinition {
  return {
    id: 'gate-guard',
    chapterId: 'chapter-1',
    displayName: 'Gate Guard',
    kind: 'npc',
    defaultEmotion: 'stern',
    assets: {
      body: {
        assetId: 'chapter-1/characters/gate-guard/body/base',
      },
      clothes: {
        assetId: 'chapter-1/characters/gate-guard/clothes/base',
      },
      headByEmotion: {
        stern: {
          assetId: 'chapter-1/characters/gate-guard/head/stern',
        },
        angry: {
          assetId: 'chapter-1/characters/gate-guard/head/angry',
          transform: {
            y: 16,
          },
        },
      },
    },
  };
}

function createHeroineDefinition(): CharacterCompositeDefinition {
  return {
    id: 'heroine',
    chapterId: 'chapter-1',
    displayName: 'Heroine',
    kind: 'heroine',
    defaultEmotion: 'neutral',
    defaultWeaponPosePreset: 'pose-2',
    assets: {
      body: {
        assetId: 'chapter-1/characters/heroine/body/base',
      },
      clothes: {
        assetId: 'chapter-1/characters/heroine/clothes/base',
      },
      headByEmotion: {
        neutral: {
          assetId: 'chapter-1/characters/heroine/head/neutral',
        },
        afraid: {
          assetId: 'chapter-1/characters/heroine/head/afraid',
        },
      },
      hair: {
        assetId: 'chapter-1/characters/heroine/hair/base',
      },
      hands: {
        left: {
          assetId: 'chapter-1/characters/heroine/hands/left',
        },
        right: {
          assetId: 'chapter-1/characters/heroine/hands/right',
        },
      },
      weapon: {
        assetId: 'chapter-1/characters/heroine/weapon/base',
      },
    },
    weaponPosePresets: {
      'pose-2': {
        leftHand: {
          x: 33,
          rotate: -20,
        },
        weapon: {
          x: 50,
          rotate: 12,
        },
        rightHand: {
          x: 70,
          rotate: 18,
        },
      },
    },
  };
}

describe('buildCharacterCompositeLayers', () => {
  it('keeps NPC layers minimal and replaces the head by emotion', () => {
    const definition = createNpcDefinition();
    const result = buildCharacterCompositeLayers(definition, { emotion: 'angry' });

    expect(result.selectedEmotion).toBe('angry');
    expect(result.layers.map((layer) => layer.id)).toEqual(['body', 'clothes', 'head']);
    expect(result.layers.find((layer) => layer.id === 'head')?.assetId).toBe(
      'chapter-1/characters/gate-guard/head/angry',
    );
    expect(result.layers.find((layer) => layer.id === 'head')?.transform.y).toBe(16);
  });

  it('falls back to the default emotion when the requested one is missing', () => {
    const definition = createNpcDefinition();
    const result = buildCharacterCompositeLayers(definition, { emotion: 'warm' });

    expect(result.selectedEmotion).toBe('stern');
    expect(result.layers.find((layer) => layer.id === 'head')?.assetId).toBe(
      'chapter-1/characters/gate-guard/head/stern',
    );
  });

  it('builds heroine hands and weapon layers with the selected pose preset', () => {
    const definition = createHeroineDefinition();
    const result = buildCharacterCompositeLayers(definition, { weaponPosePreset: 'pose-2' });

    expect(result.selectedWeaponPosePreset).toBe('pose-2');
    expect(result.layers.map((layer) => layer.id)).toEqual([
      'body',
      'clothes',
      'head',
      'hair',
      'leftHand',
      'weapon',
      'rightHand',
    ]);
    expect(result.layers.find((layer) => layer.id === 'leftHand')?.transform.x).toBe(33);
    expect(result.layers.find((layer) => layer.id === 'weapon')?.transform.rotate).toBe(12);
    expect(result.layers.find((layer) => layer.id === 'rightHand')?.transform.x).toBe(70);
  });

  it('exposes the available emotions without duplicates', () => {
    const definition = createNpcDefinition();

    expect(getCharacterCompositeEmotions(definition)).toEqual(['stern', 'angry']);
  });
});
