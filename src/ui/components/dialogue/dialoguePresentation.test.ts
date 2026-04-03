import { GameRootStore } from '@engine/stores/GameRootStore';
import { resolveNarrativePortraitVisual, resolvePresentationStagePortraits } from '@ui/components/dialogue/dialoguePresentation';

function createImageResolver(urls: Record<string, string>) {
  return {
    resolveImageUrl: (assetId: string | null) => (assetId ? urls[assetId] ?? null : null),
  };
}

describe('resolveNarrativePortraitVisual', () => {
  it('prefers a layered composite when the legacy portrait id only duplicates the canonical emotion portrait', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'lady-sera',
        emotion: 'soft',
        portraitId: 'chapter-1/portraits/lady-sera/soft.webp',
        outfitId: null,
        fallbackLabel: 'Леді Сера',
      },
      createImageResolver({
        'chapter-1/portraits/lady-sera/soft.webp': '/portraits/lady-sera-soft.webp',
        'chapter-1/characters/lady-sera/body/base': '/characters/lady-sera-body.webp',
        'chapter-1/characters/lady-sera/clothes/base': '/characters/lady-sera-clothes.webp',
        'chapter-1/characters/lady-sera/head/soft': '/characters/lady-sera-head-soft.webp',
      }),
    );

    expect(visual.type).toBe('composite');

    if (visual.type !== 'composite') {
      return;
    }

    expect(visual.selectedEmotion).toBe('soft');
    expect(visual.layers.map((layer) => layer.id)).toEqual(['body', 'clothes', 'head']);
    expect(visual.layers.find((layer) => layer.id === 'head')?.url).toBe(
      '/characters/lady-sera-head-soft.webp',
    );
  });

  it('keeps a bespoke explicit portrait override when that portrait has real art', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'lady-sera',
        emotion: 'soft',
        portraitId: 'chapter-1/portraits/lady-sera/private-audience.webp',
        outfitId: null,
        fallbackLabel: 'Леді Сера',
      },
      createImageResolver({
        'chapter-1/portraits/lady-sera/private-audience.webp': '/portraits/lady-sera-private.webp',
        'chapter-1/characters/lady-sera/body/base': '/characters/lady-sera-body.webp',
        'chapter-1/characters/lady-sera/clothes/base': '/characters/lady-sera-clothes.webp',
        'chapter-1/characters/lady-sera/head/soft': '/characters/lady-sera-head-soft.webp',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/lady-sera/private-audience.webp');
    expect(visual.url).toBe('/portraits/lady-sera-private.webp');
  });

  it('keeps outfit-specific portrait art above the default character composite', () => {
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

  it('falls back to the flat portrait when no composite layers are available yet', () => {
    const rootStore = new GameRootStore();
    const visual = resolveNarrativePortraitVisual(
      rootStore,
      {
        speakerId: 'lady-sera',
        emotion: 'sad',
        portraitId: null,
        outfitId: null,
        fallbackLabel: 'Леді Сера',
      },
      createImageResolver({
        'chapter-1/portraits/lady-sera/sad.webp': '/portraits/lady-sera-sad.webp',
      }),
    );

    expect(visual.type).toBe('asset');

    if (visual.type !== 'asset') {
      return;
    }

    expect(visual.assetId).toBe('chapter-1/portraits/lady-sera/sad.webp');
    expect(visual.url).toBe('/portraits/lady-sera-sad.webp');
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

    expect(portraits.map((portrait) => ({
      speakerId: portrait.speakerId,
      placement: portrait.placement,
      isActive: portrait.isActive,
    }))).toEqual([
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
