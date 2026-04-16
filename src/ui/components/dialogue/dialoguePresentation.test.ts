import { GameRootStore } from '@engine/stores/GameRootStore';
import {
  resolveNarrativePortraitVisual,
  resolvePresentationStagePortraits,
} from '@ui/components/dialogue/dialoguePresentation';

function createImageResolver(urls: Record<string, string>) {
  return {
    resolveImageUrl: (assetId: string | null, sourcePath?: string) => {
      if (assetId && urls[assetId]) {
        return urls[assetId] ?? null;
      }

      return sourcePath ? urls[sourcePath] ?? null : null;
    },
  };
}

describe('resolveNarrativePortraitVisual', () => {
  it('keeps NPCs on flat emotion portraits by default', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'lady-sera',
        emotion: 'soft',
        portraitId: null,
        outfitId: null,
        fallbackLabel: 'Леді Сера',
      },
      createImageResolver({
        'chapter-1/portraits/lady-sera/composed.png': '/portraits/lady-sera-composed.png',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/lady-sera/composed.png');
    expect(visual.url).toBe('/portraits/lady-sera-composed.png');
  });

  it('falls back to the character default portrait when an emotion-specific asset is still missing', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'lady-sera',
        emotion: 'calm',
        portraitId: null,
        outfitId: null,
        fallbackLabel: 'Р›РµРґС– РЎРµСЂР°',
      },
      createImageResolver({
        'chapter-1/portraits/lady-sera/composed.png': '/portraits/lady-sera-composed.png',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/lady-sera/composed.png');
    expect(visual.url).toBe('/portraits/lady-sera-composed.png');
  });

  it('uses the placeholder bundle when a character has no authored portrait art yet', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'sir-raust',
        emotion: 'stern',
        portraitId: null,
        outfitId: null,
        fallbackLabel: 'РЎС–СЂ Р Р°СѓСЃС‚',
      },
      createImageResolver({
        'src/content/shared/placeholders/portraits/noble-man.jpg': '/placeholders/noble-man.jpg',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBeNull();
    expect(visual.url).toBe('/placeholders/noble-man.jpg');
    expect(visual.isPlaceholder).toBe(false);
  });

  it('prefers the layered heroine composite for canonical dialogue beats', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'mirella',
        emotion: 'soft',
        portraitId: 'chapter-1/portraits/mirella/soft.webp',
        outfitId: null,
        fallbackLabel: 'Мірелла',
      },
      createImageResolver({
        'chapter-1/portraits/mirella/soft.webp': '/portraits/mirella-soft.webp',
        'chapter-1/characters/mirella/body/base': '/characters/mirella-body.webp',
        'chapter-1/characters/mirella/clothes/base': '/characters/mirella-clothes.webp',
        'chapter-1/characters/mirella/head/soft': '/characters/mirella-head-soft.webp',
        'chapter-1/characters/mirella/hair/base': '/characters/mirella-hair.webp',
        'chapter-1/characters/mirella/hands/left': '/characters/mirella-hand-left.webp',
        'chapter-1/characters/mirella/hands/right': '/characters/mirella-hand-right.webp',
        'chapter-1/characters/mirella/weapon/base': '/characters/mirella-weapon.webp',
      }),
    );

    expect(visual.type).toBe('composite');

    if (visual.type !== 'composite') {
      return;
    }

    expect(visual.selectedEmotion).toBe('soft');
    expect(visual.layers.map((layer) => layer.id)).toEqual([
      'body',
      'clothes',
      'head',
      'hair',
      'leftHand',
      'weapon',
      'rightHand',
    ]);
    expect(visual.layers.find((layer) => layer.id === 'head')?.url).toBe(
      '/characters/mirella-head-soft.webp',
    );
  });

  it('keeps a bespoke explicit heroine portrait override when that portrait has real art', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'mirella',
        emotion: 'soft',
        portraitId: 'chapter-1/portraits/mirella/private-audience.webp',
        outfitId: null,
        fallbackLabel: 'Мірелла',
      },
      createImageResolver({
        'chapter-1/portraits/mirella/private-audience.webp': '/portraits/mirella-private.webp',
        'chapter-1/characters/mirella/body/base': '/characters/mirella-body.webp',
        'chapter-1/characters/mirella/clothes/base': '/characters/mirella-clothes.webp',
        'chapter-1/characters/mirella/head/soft': '/characters/mirella-head-soft.webp',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/mirella/private-audience.webp');
    expect(visual.url).toBe('/portraits/mirella-private.webp');
  });

  it('keeps outfit-specific portrait art above the heroine composite', () => {
    const rootStore = new GameRootStore();
    const mirella = rootStore.narrativeCharacterRegistry.mirella;

    if (!mirella) {
      throw new Error('Expected Mirella character to exist.');
    }

    if (!mirella.outfits?.['dress-pristine']) {
      throw new Error('Expected Mirella pristine dress outfit to exist.');
    }

    mirella.outfits['dress-pristine'] = {
      ...mirella.outfits['dress-pristine'],
      defaultPortraitId: 'chapter-1/portraits/mirella/dress-pristine.webp',
    };

    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'mirella',
        emotion: 'soft',
        portraitId: null,
        outfitId: 'dress-pristine',
        fallbackLabel: 'Мірелла',
      },
      createImageResolver({
        'chapter-1/portraits/mirella/dress-pristine.webp': '/portraits/mirella-dress-pristine.webp',
        'chapter-1/characters/mirella/body/base': '/characters/mirella-body.webp',
        'chapter-1/characters/mirella/clothes/base': '/characters/mirella-clothes.webp',
        'chapter-1/characters/mirella/head/soft': '/characters/mirella-head-soft.webp',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/mirella/dress-pristine.webp');
  });

  it('falls back to the heroine flat portrait when composite layers are still missing', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'mirella',
        emotion: 'soft',
        portraitId: null,
        outfitId: null,
        fallbackLabel: 'Мірелла',
      },
      createImageResolver({
        'chapter-1/portraits/mirella/soft.webp': '/portraits/mirella-soft.webp',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/mirella/soft.webp');
    expect(visual.url).toBe('/portraits/mirella-soft.webp');
  });

  it('preserves authored stage placements so the shell can animate across the full stage width', () => {
    const rootStore = new GameRootStore();
    const portraits = resolvePresentationStagePortraits(rootStore, {
      currentBackgroundId: null,
      currentCgId: null,
      currentEmotion: 'cool',
      currentOverlayId: null,
      currentPortraitId: null,
      currentSceneTitle: 'Placement Preview',
      currentSpeakerId: 'mirella',
      currentSpeakerSide: null,
      currentStage: {
        characters: [
          {
            speakerId: 'father',
            emotion: 'cold',
            placement: {
              x: 12,
              scale: 0.92,
            },
          },
          {
            speakerId: 'mirella',
            emotion: 'cool',
            placement: {
              x: 78,
              y: 4,
              scale: 1.18,
            },
          },
        ],
        focusCharacterId: 'mirella',
      },
    });

    expect(
      portraits.map((portrait) => ({
        speakerId: portrait.speakerId,
        placement: portrait.placement,
        isActive: portrait.isActive,
      })),
    ).toEqual([
      {
        speakerId: 'father',
        placement: {
          x: 12,
          scale: 0.92,
        },
        isActive: false,
      },
      {
        speakerId: 'mirella',
        placement: {
          x: 78,
          y: 4,
          scale: 1.18,
        },
        isActive: true,
      },
    ]);
  });
});
