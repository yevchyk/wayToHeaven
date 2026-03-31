import type { CharacterCompositeDefinition } from '@engine/types/characterComposite';
import {
  buildCharacterCompositeLayers,
  getCharacterCompositeEmotions,
} from '@engine/utils/buildCharacterCompositeLayers';

const testStage = {
  width: 1000,
  height: 1400,
} as const;

function createNpcDefinition(): CharacterCompositeDefinition {
  return {
    id: 'gate-guard',
    chapterId: 'chapter-1',
    displayName: 'Gate Guard',
    kind: 'npc',
    stage: testStage,
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
          placement: {
            anchor: {
              y: 290,
            },
          },
        },
      },
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
    },
  };
}

function createHeroineDefinition(): CharacterCompositeDefinition {
  return {
    id: 'heroine',
    chapterId: 'chapter-1',
    displayName: 'Heroine',
    kind: 'heroine',
    stage: testStage,
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
    placements: {
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
      },
    },
    weaponPosePresets: {
      'pose-2': {
        leftHand: {
          anchor: {
            x: 340,
          },
          rotate: -20,
        },
        weapon: {
          anchor: {
            x: 500,
          },
          rotate: 12,
        },
        rightHand: {
          anchor: {
            x: 700,
          },
          rotate: 18,
        },
      },
    },
  };
}

function createBaseOnlyDefinition(): CharacterCompositeDefinition {
  return {
    id: 'base-only',
    chapterId: 'chapter-1',
    displayName: 'Base Only',
    kind: 'npc',
    stage: testStage,
    assets: {
      body: {
        assetId: 'chapter-1/characters/base-only/body/base',
      },
      clothes: {
        assetId: 'chapter-1/characters/base-only/clothes/base',
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
    expect(result.layers.find((layer) => layer.id === 'head')?.placement.anchor.y).toBe(290);
    expect(result.layers.find((layer) => layer.id === 'head')?.placement.assetAnchor.y).toBe(0.82);
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
    expect(result.layers.find((layer) => layer.id === 'leftHand')?.placement.anchor.x).toBe(340);
    expect(result.layers.find((layer) => layer.id === 'weapon')?.placement.rotate).toBe(12);
    expect(result.layers.find((layer) => layer.id === 'rightHand')?.placement.anchor.x).toBe(700);
  });

  it('normalizes the stage and preserves a safe area when one is not provided', () => {
    const definition = createNpcDefinition();
    const result = buildCharacterCompositeLayers(definition);

    expect(result.stage.width).toBe(1000);
    expect(result.stage.height).toBe(1400);
    expect(result.stage.aspectRatio).toBeCloseTo(1000 / 1400);
    expect(result.stage.safeArea).toEqual({
      x: 90,
      y: 98,
      width: 820,
      height: 1204,
    });
  });

  it('exposes the available emotions without duplicates', () => {
    const definition = createNpcDefinition();

    expect(getCharacterCompositeEmotions(definition)).toEqual(['stern', 'angry']);
  });

  it('allows a full-height body base with no head overlay assets', () => {
    const definition = createBaseOnlyDefinition();
    const result = buildCharacterCompositeLayers(definition, { emotion: 'angry' });

    expect(result.selectedEmotion).toBeNull();
    expect(result.layers.map((layer) => layer.id)).toEqual(['body', 'clothes']);
    expect(result.layers.find((layer) => layer.id === 'body')?.placement.anchor.y).toBe(700);
    expect(result.layers.find((layer) => layer.id === 'body')?.placement.size.width).toBe(840);
    expect(getCharacterCompositeEmotions(definition)).toEqual([]);
  });
});
