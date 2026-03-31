export interface SceneFlowStagePortraitLayout {
  left: string;
  width: string;
  height: string;
  zIndex: number;
}

function createLayout(left: number, width: number, zIndex: number): SceneFlowStagePortraitLayout {
  return {
    left: `${left}%`,
    width: `${width}%`,
    height: '100%',
    zIndex,
  };
}

export function buildSceneFlowStageLayout(count: number) {
  if (count <= 1) {
    return [createLayout(50, 34, 3)];
  }

  if (count === 2) {
    return [createLayout(28, 27, 2), createLayout(72, 27, 3)];
  }

  if (count === 3) {
    return [createLayout(18, 23, 2), createLayout(50, 24, 4), createLayout(82, 23, 3)];
  }

  if (count === 4) {
    return [
      createLayout(12, 18, 1),
      createLayout(37, 19, 3),
      createLayout(63, 19, 4),
      createLayout(88, 18, 2),
    ];
  }

  const step = 76 / Math.max(1, count - 1);

  return Array.from({ length: count }, (_value, index) =>
    createLayout(12 + step * index, 15, index + 1),
  );
}
