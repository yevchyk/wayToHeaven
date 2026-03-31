import type { CitySceneData } from '@engine/types/city';

import { adaptSceneFlowToCitySceneView } from '@engine/systems/scenes/sceneFlowViewAdapters';

import { sceneFlowRegistry } from './sceneFlowRegistry';

export const citySceneRegistry: Record<string, CitySceneData> = Object.fromEntries(
  Object.values(sceneFlowRegistry)
    .filter((sceneFlow) => sceneFlow.mode === 'hub')
    .map((sceneFlow): [string, CitySceneData] => {
      const scene = adaptSceneFlowToCitySceneView(sceneFlow, sceneFlow.startNodeId, {
        resolveDialogueId: (flowId) => (sceneFlowRegistry[flowId]?.mode === 'sequence' ? flowId : null),
        resolveTravelBoardId: (flowId) => (sceneFlowRegistry[flowId]?.mode === 'route' ? flowId : null),
      });

      if (!scene) {
        throw new Error(`Expected hub scene flow "${sceneFlow.id}" to adapt into city scene view.`);
      }

      return [sceneFlow.id, scene];
    }),
);
