import type { StageCharacterPlacement } from '@engine/types/dialogue';

export interface SceneFlowStageLayoutInput {
  placement?: StageCharacterPlacement | null;
}

export interface SceneFlowStagePortraitLayout {
  left: string;
  bottom: string;
  width: string;
  height: string;
  zIndex: number;
  scale: number;
  opacity: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createLayout(
  left: number,
  width: number,
  zIndex: number,
  options: { bottom?: number; scale?: number; opacity?: number } = {},
): SceneFlowStagePortraitLayout {
  return {
    left: `${left}%`,
    bottom: `${options.bottom ?? 0}%`,
    width: `${width}%`,
    height: '100%',
    zIndex,
    scale: options.scale ?? 1,
    opacity: options.opacity ?? 1,
  };
}

function buildAutoSceneFlowStageLayout(count: number) {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [createLayout(50, 34, 3, { scale: 1.02 })];
  }

  if (count === 2) {
    return [createLayout(8, 28, 2), createLayout(92, 28, 3)];
  }

  if (count === 3) {
    return [createLayout(6, 22, 2), createLayout(50, 28, 4, { scale: 1.03 }), createLayout(94, 22, 3)];
  }

  if (count === 4) {
    return [
      createLayout(6, 20, 1),
      createLayout(34, 22, 3),
      createLayout(66, 22, 4),
      createLayout(94, 20, 2),
    ];
  }

  const step = 88 / Math.max(1, count - 1);

  return Array.from({ length: count }, (_value, index) =>
    createLayout(6 + step * index, 18, index + 1),
  );
}

function applyAuthoredPlacement(
  layout: SceneFlowStagePortraitLayout,
  placement: StageCharacterPlacement | null | undefined,
): SceneFlowStagePortraitLayout {
  if (!placement) {
    return layout;
  }

  return {
    ...layout,
    left: `${clamp(placement.x, 0, 100)}%`,
    bottom: `${clamp(placement.y ?? 0, -24, 32)}%`,
    scale: clamp(placement.scale ?? layout.scale, 0.45, 1.9),
    zIndex: placement.zIndex ?? layout.zIndex,
    opacity: clamp(placement.opacity ?? layout.opacity, 0.08, 1),
  };
}

export function buildSceneFlowStageLayout(entries: number | readonly SceneFlowStageLayoutInput[]) {
  const count = typeof entries === 'number' ? entries : entries.length;
  const autoLayouts = buildAutoSceneFlowStageLayout(count);

  if (typeof entries === 'number') {
    return autoLayouts;
  }

  return autoLayouts.map((layout, index) => applyAuthoredPlacement(layout, entries[index]?.placement));
}
