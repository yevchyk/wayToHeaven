import { buildSceneFlowStageLayout } from '@ui/components/scene-flow/sceneFlowStageLayout';

describe('sceneFlowStageLayout', () => {
  it('keeps a single portrait centered while using the wider default stage spread', () => {
    expect(buildSceneFlowStageLayout(1)).toMatchInlineSnapshot(`
      [
        {
          "bottom": "0%",
          "height": "100%",
          "left": "50%",
          "opacity": 1,
          "scale": 1.02,
          "width": "34%",
          "zIndex": 3,
        },
      ]
    `);
  });

  it('builds predictable wide placements for three-character stages', () => {
    expect(buildSceneFlowStageLayout(3)).toMatchInlineSnapshot(`
      [
        {
          "bottom": "0%",
          "height": "100%",
          "left": "6%",
          "opacity": 1,
          "scale": 1,
          "width": "22%",
          "zIndex": 2,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "50%",
          "opacity": 1,
          "scale": 1.03,
          "width": "28%",
          "zIndex": 4,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "94%",
          "opacity": 1,
          "scale": 1,
          "width": "22%",
          "zIndex": 3,
        },
      ]
    `);
  });

  it('compresses dense stages into smaller evenly distributed placements', () => {
    expect(buildSceneFlowStageLayout(5)).toMatchInlineSnapshot(`
      [
        {
          "bottom": "0%",
          "height": "100%",
          "left": "6%",
          "opacity": 1,
          "scale": 1,
          "width": "18%",
          "zIndex": 1,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "28%",
          "opacity": 1,
          "scale": 1,
          "width": "18%",
          "zIndex": 2,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "50%",
          "opacity": 1,
          "scale": 1,
          "width": "18%",
          "zIndex": 3,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "72%",
          "opacity": 1,
          "scale": 1,
          "width": "18%",
          "zIndex": 4,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "94%",
          "opacity": 1,
          "scale": 1,
          "width": "18%",
          "zIndex": 5,
        },
      ]
    `);
  });

  it('honors authored placement overrides from the scene JSON contract', () => {
    expect(
      buildSceneFlowStageLayout([
        {
          placement: {
            x: 14,
            scale: 0.9,
          },
        },
        {
          placement: {
            x: 48,
            y: 6,
            scale: 1.22,
            zIndex: 7,
          },
        },
        {
          placement: {
            x: 86,
            opacity: 0.42,
          },
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "bottom": "0%",
          "height": "100%",
          "left": "14%",
          "opacity": 1,
          "scale": 0.9,
          "width": "22%",
          "zIndex": 2,
        },
        {
          "bottom": "6%",
          "height": "100%",
          "left": "48%",
          "opacity": 1,
          "scale": 1.22,
          "width": "28%",
          "zIndex": 7,
        },
        {
          "bottom": "0%",
          "height": "100%",
          "left": "86%",
          "opacity": 0.42,
          "scale": 1,
          "width": "22%",
          "zIndex": 3,
        },
      ]
    `);
  });
});
