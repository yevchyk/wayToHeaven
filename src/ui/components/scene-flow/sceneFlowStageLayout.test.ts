import { buildSceneFlowStageLayout } from '@ui/components/scene-flow/sceneFlowStageLayout';

describe('sceneFlowStageLayout', () => {
  it('keeps a single portrait centered', () => {
    expect(buildSceneFlowStageLayout(1)).toMatchInlineSnapshot(`
      [
        {
          "height": "100%",
          "left": "50%",
          "width": "34%",
          "zIndex": 3,
        },
      ]
    `);
  });

  it('builds predictable placements for three-character stages', () => {
    expect(buildSceneFlowStageLayout(3)).toMatchInlineSnapshot(`
      [
        {
          "height": "100%",
          "left": "18%",
          "width": "23%",
          "zIndex": 2,
        },
        {
          "height": "100%",
          "left": "50%",
          "width": "24%",
          "zIndex": 4,
        },
        {
          "height": "100%",
          "left": "82%",
          "width": "23%",
          "zIndex": 3,
        },
      ]
    `);
  });

  it('compresses dense stages into smaller evenly distributed placements', () => {
    expect(buildSceneFlowStageLayout(5)).toMatchInlineSnapshot(`
      [
        {
          "height": "100%",
          "left": "12%",
          "width": "15%",
          "zIndex": 1,
        },
        {
          "height": "100%",
          "left": "31%",
          "width": "15%",
          "zIndex": 2,
        },
        {
          "height": "100%",
          "left": "50%",
          "width": "15%",
          "zIndex": 3,
        },
        {
          "height": "100%",
          "left": "69%",
          "width": "15%",
          "zIndex": 4,
        },
        {
          "height": "100%",
          "left": "88%",
          "width": "15%",
          "zIndex": 5,
        },
      ]
    `);
  });
});
