import type { TravelBoardData } from '@engine/types/travel';

import { adaptSceneFlowToTravelBoardView } from '@engine/systems/scenes/sceneFlowViewAdapters';

import { sceneFlowRegistry } from './sceneFlowRegistry';

export const travelBoardRegistry: Record<string, TravelBoardData> = Object.fromEntries(
  Object.values(sceneFlowRegistry)
    .filter((sceneFlow) => sceneFlow.mode === 'route')
    .map((sceneFlow): [string, TravelBoardData] => {
      const board = adaptSceneFlowToTravelBoardView(sceneFlow);

      if (!board) {
        throw new Error(`Expected route scene flow "${sceneFlow.id}" to adapt into travel board view.`);
      }

      return [sceneFlow.id, board];
    }),
);
