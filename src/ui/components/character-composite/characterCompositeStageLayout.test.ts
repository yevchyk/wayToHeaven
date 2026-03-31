import type {
  NormalizedCharacterCompositePlacement,
  NormalizedCharacterCompositeStage,
} from '@engine/types/characterComposite';
import {
  buildCharacterCompositeLayerSx,
  buildCharacterCompositeRectSx,
} from '@ui/components/character-composite/characterCompositeStageLayout';

const stage: NormalizedCharacterCompositeStage = {
  width: 1000,
  height: 1400,
  safeArea: {
    x: 90,
    y: 98,
    width: 820,
    height: 1204,
  },
  aspectRatio: 1000 / 1400,
};

describe('characterCompositeStageLayout', () => {
  it('maps stage rectangles into percentage-based CSS coordinates', () => {
    expect(
      buildCharacterCompositeRectSx(stage, {
        x: 100,
        y: 140,
        width: 400,
        height: 700,
      }),
    ).toEqual({
      left: '10%',
      top: '10%',
      width: '40%',
      height: '50%',
    });
  });

  it('aligns the rendered asset box around its semantic asset anchor', () => {
    const placement: NormalizedCharacterCompositePlacement = {
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
      scale: 1,
      rotate: 0,
      opacity: 1,
      z: 30,
    };

    expect(buildCharacterCompositeLayerSx(stage, placement)).toEqual({
      position: 'absolute',
      left: '50%',
      top: '22%',
      width: '30%',
      transform: 'translate(-50%, -82%) scale(1) rotate(0deg)',
      transformOrigin: '50% 82%',
      opacity: 1,
      zIndex: 30,
      pointerEvents: 'none',
    });
  });
});
